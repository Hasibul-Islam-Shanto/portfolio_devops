---
title: "Health Checks and Probes"
description: "Tell Kubernetes when an app has booted, when it is stuck, and when it can receive traffic."
order: 7
topic: "kubernetes"
---

## The problem

By default Kubernetes only checks that a container's main process is running. That leaves two blind spots:

1. **Deadlocks and hangs.** The app is frozen inside, but the process still runs, so Kubernetes thinks it is fine.
2. **Slow starts.** The container starts instantly, but the app needs about 30 seconds to load caches or connect to a database. Traffic sent too early gets errors.

A **probe** is an automated, repeated health check Kubernetes runs against a container. There are three kinds:

| Probe         | Question                              | On failure                                                                                          | Runs           |
| ------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------- |
| **Startup**   | Has the slow app finished booting?    | Container is **killed** if boot takes too long. While it runs, it **blocks** liveness and readiness | Boot time only |
| **Liveness**  | Is the app deadlocked or stuck?       | **Restarts** the container                                                                          | Whole life     |
| **Readiness** | Can the app handle traffic right now? | **Removes** the Pod from Service endpoints, with no restart                                         | Whole life     |

When a container starts, a startup probe runs only if one is configured. Once it passes, liveness and readiness run for the rest of the Pod's life. If the startup probe fails for too long, the container is killed and restarted.

**Rule of thumb:** use liveness and readiness for normal apps. Add a startup probe **only** if the app takes a long time to boot.

## Liveness probe

A hung container is a silent failure. If the check fails several times in a row, Kubernetes kills and restarts the container.

```yaml
spec:
  containers:
    - name: web
      image: nginx:alpine
      livenessProbe:
        httpGet:
          path: /
          port: 80
```

| Timing setting        | Meaning                                            |
| --------------------- | -------------------------------------------------- |
| `initialDelaySeconds` | Wait after container start before the first check  |
| `periodSeconds`       | How often to probe (for example, every 10 seconds) |
| `failureThreshold`    | Consecutive failures before acting (default 3)     |

## Readiness probe

A container can be healthy but not ready, for example while it warms caches, loads files, or connects to a database.

- **Passes:** the Pod is `Ready` and the Service forwards traffic to it.
- **Fails:** the Pod is `Not Ready` and is removed from Endpoints. **There is no restart.**

```yaml
readinessProbe:
  httpGet:
    path: /
    port: 80
```

## Startup probe

Without a startup probe, a heavy app that needs 60 seconds to boot can be declared dead by the liveness probe after a few seconds, restarted, and killed again. That is a **startup death loop**. A startup probe **disables liveness and readiness checks until the app finishes booting**.

```yaml
startupProbe:
  httpGet:
    path: /
    port: 80
  failureThreshold: 30 # 30 retries...
  periodSeconds: 10 # ...every 10 s = up to 300 s to boot
```

## Purpose vs mechanism

_Purpose_ is **what** you check: startup, liveness, or readiness. _Mechanism_ is **how** you check it. Any purpose can use any mechanism.

| Mechanism   | How it works                                               | Pass condition         | Best for                                                  |
| ----------- | ---------------------------------------------------------- | ---------------------- | --------------------------------------------------------- |
| `httpGet`   | HTTP GET to a path and port                                | Status `200–399`       | Web apps, APIs, and microservices                         |
| `tcpSocket` | Tries to open a TCP connection to a port and sends no data | Connection established | Databases (PostgreSQL, MySQL), Redis, and message brokers |
| `exec`      | Runs a command inside the container                        | Exit code `0`          | Apps with no open ports, and file or script checks        |
