"""Database profiles. Operators manage replication; this module does not reimplement consensus."""
import re


def database_plan(config):
    db = config.get("database")
    if db is None:
        return None
    def need(condition, message):
        if not condition:
            raise ValueError(message)
    need(isinstance(db, dict), "database must be an object")
    allowed = {"mode", "storageClass", "storageSize", "image", "version", "initializerImage"}
    need(not set(db) - allowed, "Unknown database options")
    mode = db.get("mode")
    need(mode in ("postgres-ha", "tidb-distributed"), "database.mode must be postgres-ha or tidb-distributed")
    storage = db.get("storageClass")
    need(isinstance(storage, str) and bool(re.fullmatch(r"[a-z0-9][a-z0-9.-]*", storage)), "database.storageClass is required")
    size = db.get("storageSize", "20Gi")
    need(isinstance(size, str) and bool(re.fullmatch(r"[1-9][0-9]*(Gi|Ti)", size)), "database.storageSize must be a positive Gi/Ti quantity")
    name = config["name"] + "-db"
    need(len(name) <= 50, "Application name must be <= 47 characters when using a database")
    namespace = config.get("namespace", "default")
    meta = {"name": name, "namespace": namespace, "labels": {"app.kubernetes.io/managed-by": "component-deploy"}}
    if mode == "postgres-ha":
        image = db.get("image")
        need(isinstance(image, str) and ("@sha256:" in image or ":" in image.rsplit("/", 1)[-1]) and not image.endswith(":latest"), "postgres-ha requires a pinned CloudNativePG-compatible database.image")
        resource = {"apiVersion": "postgresql.cnpg.io/v1", "kind": "Cluster", "metadata": meta, "spec": {
            "instances": 3, "imageName": image,
            "bootstrap": {"initdb": {"database": "app", "owner": "app"}},
            "storage": {"storageClass": storage, "size": size},
            "affinity": {"enablePodAntiAffinity": True, "podAntiAffinityType": "required", "topologyKey": "kubernetes.io/hostname"},
            "postgresql": {"synchronous": {"method": "any", "number": 1, "dataDurability": "required"}},
            "resources": {"requests": {"cpu": "500m", "memory": "512Mi"}, "limits": {"cpu": "2", "memory": "2Gi"}},
        }}
        resources = [resource]
        host, port, driver = name + "-rw", "5432", "postgresql"
        secret, key = name + "-app", "password"
        crds = ["clusters.postgresql.cnpg.io"]
        ready_resource = "cluster.postgresql.cnpg.io/" + name
    else:
        version = db.get("version")
        init_image = db.get("initializerImage")
        need(isinstance(version, str) and re.fullmatch(r"v[0-9]+\.[0-9]+\.[0-9]+", version), "tidb-distributed requires database.version, such as v8.5.7")
        need(isinstance(init_image, str) and bool(init_image), "tidb-distributed requires database.initializerImage")
        def component(part, replicas, cpu, memory):
            item = {"baseImage": "pingcap/" + part, "replicas": replicas,
                    "requests": {"cpu": cpu, "memory": memory}, "limits": {"cpu": cpu, "memory": memory},
                    "affinity": {"podAntiAffinity": {"requiredDuringSchedulingIgnoredDuringExecution": [{
                        "topologyKey": "kubernetes.io/hostname",
                        "labelSelector": {"matchLabels": {"app.kubernetes.io/instance": name, "app.kubernetes.io/component": part}},
                    }]}}, "config": {}}
            if part in ("pd", "tikv"):
                item["storageClassName"] = storage
                item["requests"]["storage"] = size
            return item
        secret, key = name + "-users", "app"
        initializer = {"apiVersion": "pingcap.com/v1alpha1", "kind": "TidbInitializer", "metadata": meta, "spec": {
            "image": init_image, "cluster": {"name": name, "namespace": namespace},
            "passwordSecret": secret,
            "initSql": "CREATE DATABASE IF NOT EXISTS app; GRANT ALL PRIVILEGES ON app.* TO 'app'@'%';",
        }}
        cluster = {"apiVersion": "pingcap.com/v1alpha1", "kind": "TidbCluster", "metadata": meta, "spec": {
            "version": version, "timezone": "UTC", "pvReclaimPolicy": "Retain",
            "enableDynamicConfiguration": True, "configUpdateStrategy": "RollingUpdate", "discovery": {},
            "pd": component("pd", 3, "1", "2Gi"),
            "tikv": component("tikv", 3, "2", "4Gi"),
            "tidb": {**component("tidb", 2, "1", "2Gi"), "service": {"type": "ClusterIP"}},
        }}
        resources = [initializer, cluster]
        host, port, driver = name + "-tidb", "4000", "mysql"
        crds = ["tidbclusters.pingcap.com", "tidbinitializers.pingcap.com"]
        ready_resource = "tidbcluster.pingcap.com/" + name
    env = [{"name": k, "value": v} for k, v in {
        "DB_DRIVER": driver, "DB_HOST": host, "DB_PORT": port, "DB_NAME": "app", "DB_USER": "app",
    }.items()]
    env.append({"name": "DB_PASSWORD", "valueFrom": {"secretKeyRef": {"name": secret, "key": key}}})
    return {"mode": mode, "name": name, "namespace": namespace, "storageClass": storage,
            "resources": resources, "env": env, "secret": secret, "crds": crds, "readyResource": ready_resource}
