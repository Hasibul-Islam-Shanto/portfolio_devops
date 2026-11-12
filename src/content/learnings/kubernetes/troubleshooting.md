---
title: "Troubleshooting"
description: "Move from pod status to Events, then to logs, port-forward, and a shell inside the container."
order: 11
topic: "kubernetes"
---

## The debugging loop

Do not change code or manifests at random. Work from the **outside (Kubernetes) to the inside (your app)**:

| Step              | Command                       | Asks                                            | Look for                                                                                                                                                       |
| ----------------- | ----------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Overview       | `kubectl get pods`            | Which Pod is unhappy?                           | `STATUS` and `RESTARTS`. Red flags: `ImagePullBackOff`, `CrashLoopBackOff`, `Pending`, `Error`, and climbing restarts. `Running` with `0` restarts is healthy. |
| 2. Cluster report | `kubectl describe pod <name>` | What did Kubernetes try, and where did it fail? | The **Events** section at the bottom (`Warning` or `Failed`): failed pulls, missing Secrets or ConfigMaps, and insufficient CPU or memory.                     |
| 3. App logs       | `kubectl logs <name>`         | Why did the code crash?                         | Stack traces, database connection errors, and unhandled exceptions.                                                                                            |

From `kubectl get pods`, follow the status:

| Status                               | Next check                                                               |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `ImagePullBackOff` or `ErrImagePull` | `describe`, then read Events and fix the image name, tag, or pull secret |
| `CrashLoopBackOff`                   | `describe` for the Last State exit code, then `logs --previous`          |
| `Pending`                            | `describe` for `FailedScheduling`: requests, `nodeSelector`, or taints   |
| `Running` but misbehaving            | `port-forward`, then logs, then `exec`                                   |
| `Running` with 0 restarts            | Healthy                                                                  |

| Command            | Focus                     | Example problem found                                        |
| ------------------ | ------------------------- | ------------------------------------------------------------ |
| `kubectl get`      | High-level status         | A Pod stuck in `Pending`                                     |
| `kubectl describe` | Kubernetes infrastructure | `Failed to pull image "nginx:invalid-tag"`                   |
| `kubectl logs`     | Inside the application    | `Fatal error: Could not connect to the database at 10.0.0.5` |

## Events

**Events** are Kubernetes' internal log of what the cluster does: scheduling a Pod, pulling an image, mounting storage, or failing. A failed event usually contains the exact reason.

| Scenario                                        | Command                                       | Why                                                                                                                                                   |
| ----------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| You know which Pod is failing                   | `kubectl describe pod <name>`                 | Only that Pod's events, with no noise. A healthy order is `Scheduled → Pulling → Pulled → Created → Started`. A failing Pod stops at the broken step. |
| Several things break, or the culprit is unknown | `kubectl get events --sort-by=.lastTimestamp` | A timeline across the whole namespace, with the newest events at the bottom.                                                                          |

Columns of `kubectl get events` are `TYPE` (`Normal` or `Warning`), `REASON` (`Scheduled`, `Pulled`, `Failed`, `BackOff`, and similar), and `MESSAGE`.

> Kubernetes deletes events after about **one hour**. For older crashes, switch to `kubectl logs`.

## Common failure states

| Status                                        | Meaning                                                                                                    | Typical causes                                                                                                                                 | Diagnose                                                                                                                                                  | Fix                                                               |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **`ImagePullBackOff`** (after `ErrImagePull`) | Image download failed, and Kubernetes waits before retrying                                                | A typo in the name or tag (`nginx:alpne`), a tag that does not exist (`nginx:99.99`), or a private registry without a pull secret              | `get`, then `describe` Events (`Failed to pull image … manifest unknown`). **There are no logs** because the container never started.                     | `kubectl set image deployment/<name> <container>=<correct-image>` |
| **`CrashLoopBackOff`**                        | The image was pulled and the container started, but the app **crashed or exited**. The restart delay grows | The process exits immediately (a bare `echo`), missing env, config, or database settings, an app bug, a failing liveness probe, or `OOMKilled` | `get` (high `RESTARTS`), then `describe`, then **Last State** exit code (`1` is an app error, `137` is an OOM kill), then `kubectl logs <pod> --previous` | Fix the app or config. Raise the memory limit if it was OOM       |
| **`Pending`**                                 | Accepted, but **no node can run it**                                                                       | A request larger than any node's free capacity (the most common cause), an unsatisfiable `nodeSelector`, or taints with no toleration          | `describe`, then Events: `FailedScheduling … 0/1 nodes are available: 1 Insufficient memory.` **Logs will not work** because nothing started.             | Lower requests, fix selector labels, or add node capacity         |

**Why `--previous` matters:** Kubernetes keeps restarting the crashed container, so plain `kubectl logs` may attach to a brand-new container that has not printed the crash yet. `--previous` fetches the logs of the **last crashed instance**.

| Command                             | Description                               |
| ----------------------------------- | ----------------------------------------- |
| `kubectl logs <pod>`                | Current container's logs                  |
| `kubectl logs <pod> --previous`     | Logs of the previously crashed instance   |
| `kubectl logs <pod> -c <container>` | Pick a container in a multi-container Pod |

## Pod is Running but the app misbehaves

If `describe` shows no errors but the app does not respond correctly, move from cluster-level checks to inspection inside the Pod.

**Step 1: isolate the network with `port-forward`.** Is the problem the app, or the routing layer (Service, Ingress, or selectors)? Tunnel straight to the Pod, bypassing Services and Ingress:

```bash
# Terminal 1
kubectl port-forward pod/web 8080:80
# Terminal 2
curl http://localhost:8080
```

- **Success** means the Pod and app are healthy. Look at the Service: wrong `selector` labels or the wrong target port.
- **Failure or a hang** means the problem is inside the app. Go to Step 2.

**Step 2: read the output.**

```bash
kubectl logs web
kubectl logs web -c web-container
kubectl logs web --previous
```

The first command reads the active container. `-c` selects one container in a multi-container Pod. `--previous` reads a crashed or restarted instance.

**Step 3: inspect inside the container.**

```bash
kubectl exec -it web -- sh
env | grep DB_HOST
cat /etc/app/config.json
nc -zv database-service 5432
exit
```

Check whether the expected environment variables are present, whether the config file is where the app expects it, and whether the Pod can reach downstream services.

| Tool           | Question                                    | Command                                                   | Use                                                          |
| -------------- | ------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| `port-forward` | Is it the app or the Service and network?   | `kubectl port-forward pod/<name> <local-port>:<pod-port>` | Direct test that isolates the Pod from the Service layer     |
| `logs`         | What did the app say?                       | `kubectl logs <name> [--previous]`                        | Read STDOUT and STDERR for crashes and errors                |
| `exec`         | What is physically true inside the Pod now? | `kubectl exec -it <name> -- sh`                           | Check environment variables, config files, and network paths |
