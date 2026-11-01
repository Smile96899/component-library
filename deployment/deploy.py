#!/usr/bin/env python3
"""Cross-stack deployment CLI. Python standard library; application language is unrestricted."""
import argparse
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import secrets
try:
    from .databases import database_plan
except ImportError:
    from databases import database_plan


def require(condition, message):
    if not condition:
        raise ValueError(message)


def dns_name(value):
    return isinstance(value, str) and len(value) <= 63 and bool(re.fullmatch(r"[a-z][a-z0-9]*(?:-[a-z0-9]+)*", value))


def build(config):
    require(isinstance(config, dict), "Config must be a JSON object")
    allowed = {"name", "namespace", "image", "replicas", "mode", "port", "serviceType", "healthPath", "readyPath", "env", "secretName", "imagePullSecret", "resources", "parallelSafe", "command", "args", "database"}
    require(not set(config) - allowed, "Unknown config keys: " + ", ".join(sorted(set(config) - allowed)))
    name = config.get("name")
    namespace = config.get("namespace", "default")
    require(dns_name(name) and dns_name(namespace), "name/namespace must be lowercase DNS names (max 63 characters)")
    image = config.get("image", "")
    require(isinstance(image, str) and image and not re.search(r"\s", image), "image is required")
    require("@sha256:" in image or (":" in image.rsplit("/", 1)[-1] and not image.endswith(":latest")), "Use a versioned image tag or digest, not latest/unversioned")
    replicas = config.get("replicas", 2)
    require(type(replicas) is int and replicas >= 2, "replicas must be an integer >= 2")
    mode = config.get("mode", "http")
    require(mode in ("http", "worker"), "mode must be http or worker")
    require(mode != "worker" or config.get("parallelSafe") is True, "Workers require parallelSafe:true after verifying concurrent processing and idempotency")
    labels = {"app.kubernetes.io/name": name, "app.kubernetes.io/managed-by": "component-deploy"}
    meta = {"name": name, "namespace": namespace, "labels": labels}
    env = config.get("env", {})
    require(isinstance(env, dict) and all(re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", k) and isinstance(v, str) for k, v in env.items()), "env must contain string values and valid environment variable names")
    container = {
        "name": "app", "image": image, "imagePullPolicy": "IfNotPresent",
        "env": [{"name": k, "value": v} for k, v in env.items()],
        "resources": config.get("resources", {"requests": {"cpu": "100m", "memory": "128Mi"}, "limits": {"cpu": "1000m", "memory": "512Mi"}}),
    }
    for field in ("command", "args"):
        if field in config:
            require(isinstance(config[field], list) and all(isinstance(x, str) for x in config[field]), field + " must be a string array")
            container[field] = config[field]
    if config.get("secretName"):
        require(dns_name(config["secretName"]), "Invalid secretName")
        container["envFrom"] = [{"secretRef": {"name": config["secretName"]}}]
    pod = {
        "automountServiceAccountToken": False,
        "terminationGracePeriodSeconds": 30,
        "containers": [container],
        "topologySpreadConstraints": [{
            "maxSkew": 1, "minDomains": 2, "topologyKey": "kubernetes.io/hostname",
            "whenUnsatisfiable": "DoNotSchedule", "labelSelector": {"matchLabels": labels},
        }],
    }
    if config.get("imagePullSecret"):
        require(dns_name(config["imagePullSecret"]), "Invalid imagePullSecret")
        pod["imagePullSecrets"] = [{"name": config["imagePullSecret"]}]
    deployment = {
        "apiVersion": "apps/v1", "kind": "Deployment", "metadata": meta,
        "spec": {
            "replicas": replicas, "revisionHistoryLimit": 5, "minReadySeconds": 5,
            "progressDeadlineSeconds": 600,
            "strategy": {"type": "RollingUpdate", "rollingUpdate": {"maxSurge": 1, "maxUnavailable": 0}},
            "selector": {"matchLabels": labels},
            "template": {"metadata": {"labels": labels}, "spec": pod},
        },
    }
    items = [deployment, {
        "apiVersion": "policy/v1", "kind": "PodDisruptionBudget", "metadata": meta,
        "spec": {"maxUnavailable": 1, "selector": {"matchLabels": labels}},
    }]
    if mode == "http":
        port = config.get("port", 8080)
        require(type(port) is int and 1 <= port <= 65535, "port must be 1..65535")
        health = config.get("healthPath", "/healthz")
        ready = config.get("readyPath", "/readyz")
        require(all(isinstance(x, str) and x.startswith("/") for x in (health, ready)), "Health paths must start with /")
        container["ports"] = [{"name": "http", "containerPort": port}]
        # PORT is a convention; the app must actually listen on the configured port.
        if "PORT" not in env:
            container["env"].append({"name": "PORT", "value": str(port)})
        container["startupProbe"] = {"httpGet": {"path": health, "port": "http"}, "periodSeconds": 5, "timeoutSeconds": 2, "failureThreshold": 60}
        container["livenessProbe"] = {"httpGet": {"path": health, "port": "http"}, "periodSeconds": 10, "timeoutSeconds": 2, "failureThreshold": 3}
        container["readinessProbe"] = {"httpGet": {"path": ready, "port": "http"}, "periodSeconds": 5, "timeoutSeconds": 2, "failureThreshold": 2}
        service_type = config.get("serviceType", "ClusterIP")
        require(service_type in ("ClusterIP", "LoadBalancer"), "serviceType must be ClusterIP or LoadBalancer")
        items.append({
            "apiVersion": "v1", "kind": "Service", "metadata": meta,
            "spec": {"type": service_type, "selector": labels, "ports": [{"name": "http", "port": 80, "targetPort": "http"}]},
        })
    db = database_plan(config)
    deployment["metadata"] = {**meta, "annotations": {"component-deploy/database-mode": db["mode"] if db else "none"}}
    if db:
        require(not any(key.startswith("DB_") for key in env), "DB_* environment variables are reserved when database is configured")
        container["env"].extend(db["env"])
        items = db["resources"] + items
    return {"apiVersion": "v1", "kind": "List", "items": items}


def invoke(kubectl, context, namespace, arguments, payload=None, capture=False):
    request_timeout = "0" if arguments[0] in ("wait", "rollout") else "60s"
    result = subprocess.run(
        [kubectl, "--context", context, "--namespace", namespace, "--request-timeout=" + request_timeout, *arguments],
        input=payload, text=True, encoding="utf-8", capture_output=capture, check=True,
    )
    return result.stdout if capture else None


def cluster_action(config, manifest, action, context, kubectl):
    require(bool(context), "--context is required for cluster operations")
    namespace = config.get("namespace", "default")
    name = config["name"]
    db = database_plan(config)
    def run(args, **kwargs):
        return invoke(kubectl, context, namespace, args, **kwargs)
    if action == "status":
        run(["get", "deployment,pods,service,pdb", "-l", "app.kubernetes.io/name=" + name, "-o", "wide"])
        if db:
            run(["get", db["readyResource"], "-o", "wide"])
        return
    run(["get", "namespace", namespace])
    existing = run(["get", "deployment", name, "--ignore-not-found", "-o", "json"], capture=True)
    if existing and existing.strip():
        metadata = json.loads(existing)["metadata"]
        require(metadata.get("labels", {}).get("app.kubernetes.io/managed-by") == "component-deploy", "An existing deployment with this name is not managed by this tool")
        old_mode = metadata.get("annotations", {}).get("component-deploy/database-mode", "none")
        require(old_mode == (db["mode"] if db else "none"), "Changing database mode requires a new application name and an explicit data migration")
    nodes = json.loads(run(["get", "nodes", "-o", "json"], capture=True))
    hosts = set()
    for node in nodes.get("items", []):
        spec = node.get("spec", {})
        ready = any(c.get("type") == "Ready" and c.get("status") == "True" for c in node.get("status", {}).get("conditions", []))
        tainted = any(t.get("effect") in ("NoSchedule", "NoExecute") for t in spec.get("taints", []))
        hostname = node.get("metadata", {}).get("labels", {}).get("kubernetes.io/hostname")
        if ready and hostname and not spec.get("unschedulable") and not tainted:
            hosts.add(hostname)
    required_nodes = 3 if db else 2
    require(len(hosts) >= required_nodes, f"At least {required_nodes} Ready, schedulable nodes with different hostname labels are required")
    if db:
        for crd in db["crds"]:
            run(["get", "crd", crd, "-o", "name"])
        run(["get", "storageclass", db["storageClass"], "-o", "name"])
        for obj in db["resources"]:
            resource = obj["kind"].lower() + "." + obj["apiVersion"].split("/")[0]
            saved = run(["get", resource, db["name"], "--ignore-not-found", "-o", "json"], capture=True)
            if saved and saved.strip():
                require(json.loads(saved)["metadata"].get("labels", {}).get("app.kubernetes.io/managed-by") == "component-deploy", "An existing database resource with this name is not managed by this tool")
    payload = json.dumps(manifest, ensure_ascii=False)
    run(["apply", "--dry-run=server", "-f", "-"], payload=payload)
    if action == "check":
        print("Server validation passed; no deployment changes applied.")
        return
    if db:
        if db["mode"] == "tidb-distributed":
            # Generate credentials once. Never print secret contents or store them in source files.
            saved = run(["get", "secret", db["secret"], "--ignore-not-found", "-o", "json"], capture=True)
            if saved and saved.strip():
                data = json.loads(saved).get("data", {})
                require(all(data.get(k) for k in ("root", "app")), "Existing TiDB credential Secret must contain nonempty root and app keys")
            else:
                secret = {"apiVersion": "v1", "kind": "Secret", "metadata": {"name": db["secret"], "namespace": namespace}, "type": "Opaque",
                          "stringData": {"root": secrets.token_urlsafe(32), "app": secrets.token_urlsafe(32)}}
                run(["create", "-f", "-"], payload=json.dumps(secret))
        database_payload = json.dumps({"apiVersion": "v1", "kind": "List", "items": db["resources"]})
        run(["apply", "-f", "-"], payload=database_payload)
        run(["wait", db["readyResource"], "--for=condition=Ready", "--timeout=1200s"])
        if db["mode"] == "tidb-distributed":
            run(["wait", "tidbinitializer.pingcap.com/" + db["name"], "--for=jsonpath={.status.phase}=Completed", "--timeout=1200s"])
        run(["get", "secret", db["secret"], "-o", "name"])
    app_items = [item for item in manifest["items"] if item["kind"] in ("Deployment", "Service", "PodDisruptionBudget")]
    run(["apply", "-f", "-"], payload=json.dumps({"apiVersion": "v1", "kind": "List", "items": app_items}))
    run(["rollout", "status", "deployment/" + name, "--timeout=600s"])
    # A rollout can succeed on one node after an existing cluster's topology changes.
    # Verify the resulting ready replicas really span at least two nodes.
    pods = json.loads(run(["get", "pods", "-l", "app.kubernetes.io/name=" + name, "-o", "json"], capture=True))
    ready_nodes = {
        p.get("spec", {}).get("nodeName") for p in pods.get("items", [])
        if not p.get("metadata", {}).get("deletionTimestamp")
        and any(c.get("type") == "Ready" and c.get("status") == "True" for c in p.get("status", {}).get("conditions", []))
    }
    ready_nodes.discard(None)
    require(len(ready_nodes) >= 2, "Deployment applied, but ready replicas do not span two nodes; inspect pods before declaring success")
    print("Deployment ready across multiple nodes. Use status to inspect endpoints.")


def main(argv=None):
    parser = argparse.ArgumentParser(description="Reusable cross-stack Kubernetes deployment tool")
    parser.add_argument("action", choices=["render", "check", "deploy", "status"])
    parser.add_argument("--config", required=True, type=Path)
    parser.add_argument("--context", help="Explicit kubeconfig context; required for cluster operations")
    parser.add_argument("--output", type=Path, help="render output only")
    args = parser.parse_args(argv)
    try:
        config = json.loads(args.config.read_text(encoding="utf-8-sig"))
        manifest = build(config)
        if args.action == "render":
            output = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
            if args.output:
                args.output.parent.mkdir(parents=True, exist_ok=True)
                args.output.write_text(output, encoding="utf-8")
            else:
                print(output, end="")
        else:
            require(args.output is None, "--output only applies to render")
            kubectl = shutil.which("kubectl")
            require(kubectl is not None, "Install kubectl before using check/deploy/status")
            cluster_action(config, manifest, args.action, args.context, kubectl)
        return 0
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        print("Deployment error: " + str(error), file=sys.stderr)
        print("If apply already ran, changes may remain. Inspect status; no automatic rollback was attempted.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
