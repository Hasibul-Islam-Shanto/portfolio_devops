---
title: "Docker Debugging and Troubleshooting"
description: "Read exit codes, use the right debug commands, and fix the problems you'll hit most often."
order: 9
topic: "docker"
---

## Container Exit Codes and States

| Code / state     | Meaning                                | What to do                                     |
| ---------------- | -------------------------------------- | ---------------------------------------------- |
| **Exited (0)**   | Process finished normally              | Expected for one-off jobs                      |
| **Exited (1)**   | General error — app crashed            | Check logs, then `docker exec` in              |
| **Exited (126)** | Command not executable                 | Verify CMD path and permissions                |
| **Exited (127)** | Command not found in image             | Check CMD spelling and install path            |
| **Restarting**   | Crash loop — process exits immediately | Read logs for bad config or missing dependency |
| **Unhealthy**    | Healthcheck failing                    | Run the healthcheck command manually inside    |

## Key Debugging Commands

| Command                                                      | What it tells you                         | When to use it                             |
| ------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------ |
| `docker ps -a`                                               | All containers with status and exit codes | First look at what's running or stopped    |
| `docker logs -f <container>`                                 | Live stdout/stderr                        | Crashes, errors, unexpected behaviour      |
| `docker exec -it <container> sh`                             | Shell inside a running container          | Reproduce errors, inspect files            |
| `docker inspect <container>`                                 | Full config — env, mounts, network, ports | Misconfiguration with no obvious log error |
| `docker inspect --format '{{json .State}}' <container>`      | State block only — exit code, OOM         | Quick state check                          |
| `docker stats`                                               | Live CPU, memory, network usage           | Resource starvation under load             |
| `docker compose logs -f <service>`                           | Logs for a Compose service                | Multi-container stacks                     |
| `docker network inspect <network>`                           | Containers on a network and their IPs     | Services cannot reach each other           |
| `docker build --no-cache --progress=plain .`                 | Full rebuild output, no cache             | Suspect a stale cached layer               |
| `docker inspect <container> --format='{{.State.OOMKilled}}'` | Whether killed for out-of-memory          | Container dies silently under load         |
| `docker exec -it <container> nc -zv <host> <port>`           | TCP connectivity test                     | Network or DNS issues between services     |
| `docker ps -q \| wc -l`                                      | Count of running containers               | Quick sanity check                         |

## If This, Then That

- **Container keeps restarting** → `docker logs -f <container>`, then check env vars with `docker inspect`.
- **App unreachable from browser** → confirm port mapping in `docker ps`, test from inside with `nc -zv localhost <port>`.
- **Service cannot reach database** → `docker network inspect <network>`, then `nc -zv database 5432` by service name.
- **Build fails in CI but works locally** → `docker build --no-cache --progress=plain .`
- **Container dies under load** → `docker stats`, then check `OOMKilled` via inspect.
- **Healthcheck shows Unhealthy** → read logs, exec in, run the healthcheck command manually.

> **Key Takeaway**
> Start with `docker ps -a` and `docker logs` — most problems show up in the output. Reach for `inspect`, `exec`, and `stats` when logs are not enough.
