---
title: "Docker Networking"
description: "Default networks, custom bridges, and how containers find each other by name."
order: 6
topic: "docker"
---

## The Three Default Networks

When you install Docker, three **networks** are created automatically. A network defines how containers connect — who can talk to whom, and whether traffic stays isolated or shares the host.

| Network type | Behavior                                                                                                                | When to use                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **bridge**   | Default network. Containers on it can reach each other; you publish ports with `-p` to expose services to your machine. | Single containers or quick local tests — no extra setup needed.                            |
| **host**     | Removes network isolation. The container uses the host's network stack directly — no separate IP, no port mapping.      | When you need bare-metal performance or the container must bind directly to host ports.    |
| **none**     | The container gets no network at all — completely isolated.                                                             | Batch jobs, security-sensitive workloads, or anything that should never touch the network. |

If you do not specify a network at run time, Docker attaches your container to **bridge** by default.

## Custom Bridge Networks

For multi-container apps — an API plus a database, a web front end plus a cache — the default bridge gets awkward fast. IP addresses change every restart, and service discovery is painful.

A **custom bridge network** is a named network you create yourself. Containers you attach to it can communicate privately, and Docker gives each one a stable internal DNS name. Create one with:

```bash
docker network create my-app-net
```

Then start containers on it:

```bash
docker run -d --name backend --network my-app-net my-api:v1
docker run -d --name database --network my-app-net postgres:16
```

## Talk by Name, Not by IP

On a custom bridge network, Docker runs an internal **DNS server**. Containers resolve each other by container name — no hardcoded IPs required. Your backend connects to `database:5432` instead of hunting for `172.18.0.3` after every restart.

```
┌─────────────────────────────────────────────────┐
│           custom bridge: my-app-net             │
│                                                 │
│   ┌──────────────┐         ┌──────────────┐    │
│   │   backend    │ ──────► │   database   │    │
│   │  (my-api)    │  DNS:   │  (postgres)  │    │
│   │              │ database:5432           │    │
│   └──────────────┘         └──────────────┘    │
│                                                 │
│   Docker DNS resolves "database" → container IP │
└─────────────────────────────────────────────────┘
```

The backend calls `postgres://database:5432/mydb`. Docker's DNS resolves `database` to the correct container IP automatically — even if that IP changes between restarts.

> **Key Takeaway**
> Use the default bridge for simple single-container runs. For multi-service apps, create a custom bridge network so containers talk to each other by name through Docker's built-in DNS — no fragile IP addresses in your config.
