---
title: "Working with kubectl"
description: "Survey cluster resources, inspect one object, and use output formats, namespaces, and short names."
order: 2
topic: "kubernetes"
---

## Survey vs investigate

- **`get`** surveys resources: what exists, whether it is running, and how many there are.
- **`describe`** is for after you have narrowed the search to one resource and need detail or troubleshooting information.

### The Events section

At the bottom of almost any `describe` output is **Events**: where the resource was scheduled, whether the image was pulled, and whether it failed to start or restarted. **When something goes wrong, Events is the first place to look.** A quiet, healthy node may show `Events: <none>`. The [troubleshooting lesson](/learnings/kubernetes/troubleshooting) covers how to read failure events and why they disappear after about an hour.

## Commands

| Command                                    | Purpose                                                               |
| ------------------------------------------ | --------------------------------------------------------------------- |
| `kubectl get <resource>`                   | List resources of a kind (`kubectl get pods`, `kubectl get services`) |
| `kubectl get all`                          | List common workload resources in the current namespace               |
| `kubectl describe <resource> <name>`       | Detailed, human-readable info including Events                        |
| `kubectl get <resource> -o wide`           | List with extra columns (for example, node and IP)                    |
| `kubectl get <resource> <name> -o yaml`    | Full definition as YAML                                               |
| `kubectl get <resource> <name> -o json`    | Full definition as JSON                                               |
| `kubectl get <resource> -o jsonpath='...'` | Print one specific field                                              |
| `kubectl explain <resource>`               | Built-in docs for a resource type                                     |
| `kubectl explain <resource>.<field>`       | Drill into a field, for example `kubectl explain pod.spec`            |
| `kubectl get <resource> -n <namespace>`    | Run against one namespace instead of `default`                        |
| `kubectl get <resource> -A`                | Run across **all** namespaces (long form `--all-namespaces`)          |

## Short names

| Resource     | Short    | Resource                 | Short |
| ------------ | -------- | ------------------------ | ----- |
| pods         | `po`     | namespaces               | `ns`  |
| services     | `svc`    | configmaps               | `cm`  |
| deployments  | `deploy` | persistentvolumeclaims   | `pvc` |
| replicasets  | `rs`     | persistentvolumes        | `pv`  |
| daemonsets   | `ds`     | horizontalpodautoscalers | `hpa` |
| statefulsets | `sts`    | ingresses                | `ing` |
