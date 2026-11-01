import json
from pathlib import Path
import subprocess
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import deploy


def example(name="app"):
    return json.loads((ROOT / (name + ".example.json")).read_text())


class DeploymentTests(unittest.TestCase):
    def setUp(self):
        self.calls = []
        self.existing = ""
        self.node_count = 3
        self.fail_validation = False
        self.saved_secret = ""

    def fake(self, executable, context, namespace, args, payload=None, capture=False):
        self.assertEqual(context, "test-cluster")
        self.calls.append((args, json.loads(payload) if payload else None))
        if args[:2] == ["get", "deployment"]:
            return self.existing
        if args[:2] == ["get", "nodes"]:
            return json.dumps({"items": [{"metadata": {"labels": {"kubernetes.io/hostname": "n" + str(i)}}, "status": {"conditions": [{"type": "Ready", "status": "True"}]}} for i in range(self.node_count)]})
        if args[:2] == ["get", "pods"]:
            return json.dumps({"items": [{"spec": {"nodeName": "n" + str(i)}, "status": {"conditions": [{"type": "Ready", "status": "True"}]}} for i in range(2)]})
        if args[:2] == ["get", "secret"] and capture:
            return self.saved_secret
        if "--dry-run=server" in args and self.fail_validation:
            raise subprocess.CalledProcessError(1, args)
        return ""

    def action(self, config, action="deploy"):
        with patch.object(deploy, "invoke", side_effect=self.fake):
            deploy.cluster_action(config, deploy.build(config), action, "test-cluster", "kubectl")

    def test_http_routing_and_health(self):
        config = example()
        config["port"] = 9000
        objects = deploy.build(config)["items"]
        container = objects[0]["spec"]["template"]["spec"]["containers"][0]
        self.assertEqual(container["ports"][0]["containerPort"], 9000)
        self.assertEqual(objects[-1]["spec"]["selector"], objects[0]["spec"]["selector"]["matchLabels"])
        self.assertEqual(container["readinessProbe"]["httpGet"]["path"], "/readyz")
        self.assertEqual(objects[0]["spec"]["template"]["spec"]["topologySpreadConstraints"][0]["minDomains"], 2)

    def test_worker_concurrency_is_explicit(self):
        config = example("worker")
        self.assertEqual([o["kind"] for o in deploy.build(config)["items"]], ["Deployment", "PodDisruptionBudget"])
        config["parallelSafe"] = False
        with self.assertRaises(ValueError): deploy.build(config)

    def test_invalid_configs(self):
        for key, value in [("replicas", 1), ("replicas", True), ("image", "app:latest"), ("image", "registry:5000/app"), ("port", 70000), ("name", "../bad"), ("typo", 1)]:
            with self.subTest(key=key, value=value):
                config = example()
                config[key] = value
                with self.assertRaises(ValueError): deploy.build(config)

    def test_postgres_profile(self):
        items = deploy.build(example("postgres"))["items"]
        cluster = items[0]
        self.assertEqual(cluster["spec"]["instances"], 3)
        self.assertEqual(cluster["spec"]["postgresql"]["synchronous"]["dataDurability"], "required")
        self.assertEqual(cluster["spec"]["affinity"]["podAntiAffinityType"], "required")
        env = items[1]["spec"]["template"]["spec"]["containers"][0]["env"]
        self.assertTrue(any(e["name"] == "DB_PASSWORD" and "valueFrom" in e for e in env))

    def test_tidb_profile(self):
        items = deploy.build(example("tidb"))["items"]
        self.assertEqual(items[0]["kind"], "TidbInitializer")
        self.assertEqual([items[1]["spec"][x]["replicas"] for x in ["pd", "tikv", "tidb"]], [3, 3, 2])
        self.assertNotIn("stringData", json.dumps(items))

    def test_no_apply_after_validation_failure(self):
        self.fail_validation = True
        with self.assertRaises(subprocess.CalledProcessError): self.action(example("tidb"))
        self.assertFalse(any(args[0] == "create" or (args[0] == "apply" and "--dry-run=server" not in args) for args, _ in self.calls))

    def test_check_has_no_mutations(self):
        self.action(example("postgres"), "check")
        self.assertFalse(any(args[0] == "create" or (args[0] == "apply" and "--dry-run=server" not in args) for args, _ in self.calls))

    def test_tidb_database_is_ready_before_application(self):
        self.action(example("tidb"))
        mutations = [(args, data) for args, data in self.calls if args[0] in ("create", "apply") and "--dry-run=server" not in args]
        self.assertEqual(mutations[0][1]["kind"], "Secret")
        self.assertEqual(set(mutations[0][1]["stringData"]), {"root", "app"})
        self.assertNotEqual(mutations[0][1]["stringData"]["root"], mutations[0][1]["stringData"]["app"])
        self.assertEqual(mutations[1][1]["items"][0]["kind"], "TidbInitializer")
        self.assertEqual(mutations[2][1]["items"][0]["kind"], "Deployment")
        init_wait = next(i for i, (args, _) in enumerate(self.calls) if args[0] == "wait" and args[1].startswith("tidbinitializer"))
        app_apply = next(i for i, (args, data) in enumerate(self.calls) if args[:2] == ["apply", "-f"] and data["items"][0]["kind"] == "Deployment")
        self.assertLess(init_wait, app_apply)

    def test_existing_credentials_are_not_rotated(self):
        self.saved_secret = json.dumps({"data": {"root": "encoded", "app": "encoded"}})
        self.action(example("tidb"))
        self.assertFalse(any(args[0] == "create" for args, _ in self.calls))

    def test_database_needs_three_nodes(self):
        self.node_count = 2
        with self.assertRaises(ValueError): self.action(example("postgres"))
        self.assertFalse(any(args[0] == "apply" for args, _ in self.calls))

    def test_engine_switch_is_rejected(self):
        self.existing = json.dumps({"metadata": {"labels": {"app.kubernetes.io/managed-by": "component-deploy"}, "annotations": {"component-deploy/database-mode": "postgres-ha"}}})
        with self.assertRaises(ValueError): self.action(example("tidb"))
        self.assertFalse(any(args[0] == "apply" for args, _ in self.calls))

    def test_reserved_database_environment(self):
        config = example("postgres")
        config["env"] = {"DB_HOST": "wrong"}
        with self.assertRaises(ValueError): deploy.build(config)

    def test_namespace_and_context_are_explicit(self):
        with patch.object(deploy.subprocess, "run") as run:
            deploy.invoke("kubectl", "chosen", "app-space", ["wait", "cluster/test", "--timeout=1200s"])
        args = run.call_args.args[0]
        self.assertEqual(args[:5], ["kubectl", "--context", "chosen", "--namespace", "app-space"])
        self.assertIn("--request-timeout=0", args)
        self.assertNotIn("shell", run.call_args.kwargs)

    def test_no_context_never_contacts_cluster(self):
        with patch.object(deploy, "invoke") as invoke:
            with self.assertRaises(ValueError):
                deploy.cluster_action(example(), deploy.build(example()), "deploy", None, "kubectl")
            invoke.assert_not_called()


if __name__ == "__main__":
    unittest.main()
