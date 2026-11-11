---
title: "Docker Compose"
description: "Define multi-container apps in one YAML file — services, networks, volumes, and everyday commands."
order: 8
topic: "docker"
---

## What Problem Compose Solves

Running a multi-container app with plain `docker run` means long commands, manual networking, and easy-to-forget flags. Start the database first, create a network, attach a volume, then run the API with the right `-e` flags and port maps — one missed step and nothing talks to anything.

**Docker Compose** replaces all of that with a single `compose.yaml` file and one command — `docker compose up` — to start every service, wire up networks, and attach volumes. The file is your source of truth; teammates get the same stack with zero guesswork.

Install Compose v2 alongside Docker on Ubuntu:

```bash
sudo apt install -y docker.io docker-compose-v2
```

## Services

**Services** define the containers that make up your app — which image to use, ports to publish, and how each service starts. Each service name becomes a DNS hostname other services can reach:

```yaml
services:
  web:
    build: .
    ports:
      - "8080:80"
  database:
    image: postgres:16
```

## Networks

**Networks** control which services can talk to each other. By default Compose creates one network and attaches every service to it, but you can split traffic across named networks for isolation:

```yaml
services:
  api:
    networks: [backend]
  database:
    networks: [backend]

networks:
  backend:
```

On a shared network, `api` connects to `database:5432` — no IP addresses in your config.

## Volumes

**Volumes** declare storage that survives container removal. Without them, a database container loses every row the moment you run `docker compose down`:

```yaml
services:
  database:
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## Environment Variables

**Environment variables** inject per-service config without rebuilding images. Database credentials, API keys, and feature flags belong here — not hardcoded in your Dockerfile:

```yaml
services:
  database:
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
```

## Common Commands

| Command                      | What it does                                                           |
| ---------------------------- | ---------------------------------------------------------------------- |
| `docker compose up`          | Start all services (builds images if needed)                           |
| `docker compose up -d`       | Start in detached (background) mode                                    |
| `docker compose down`        | Stop and remove containers, networks, and volumes declared in the file |
| `docker compose logs -f web` | Stream logs for the `web` service                                      |
| `docker compose exec web sh` | Open a shell inside a running `web` container                          |

> **Key Takeaway**
> Compose turns a pile of `docker run` commands into a declarative YAML file. Define your services, networks, volumes, and environment once — then bring the whole stack up or down with a single command.
