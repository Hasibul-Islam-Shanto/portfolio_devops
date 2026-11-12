---
title: "Load Balancing & Reverse Proxy"
description: "How load balancers distribute traffic across servers, and how reverse proxies handle SSL, caching, and routing."
order: 7
topic: "networking"
---

## Load Balancing

A **load balancer** distributes incoming network traffic across multiple servers to ensure no single server is overwhelmed.

```
                  Internet
                     │
              ┌──────┴──────┐
              │ Load Balancer│
              └──┬───┬───┬──┘
                 │   │   │
              Server Server Server
                1     2     3
```

### Load Balancing Algorithms

| Algorithm            | How it works                                        |
| -------------------- | --------------------------------------------------- |
| Round Robin          | Requests go to each server in rotation              |
| Least Connections    | New request goes to server with fewest active conns |
| IP Hash              | Client IP always maps to same server (sticky)       |
| Weighted Round Robin | Servers with more capacity get more traffic         |

### Layer 4 vs Layer 7 Load Balancing

**L4 Load Balancer (Transport layer):** Routes based on IP and TCP/UDP port. Fast, doesn't look at application content.

**L7 Load Balancer (Application layer):** Routes based on HTTP content — URL paths, headers, cookies. More intelligent.

```
Example — L7 routing:
/api/users    →  User Service servers
/api/products →  Product Service servers
/static/*     →  CDN / Storage servers
```

### Health Checks

Load balancers continuously ping servers. If a server doesn't respond, it's removed from the pool. When it recovers, it's added back. This enables **zero-downtime deployments**.

---

## Reverse Proxy

A **reverse proxy** sits in front of backend servers and forwards client requests to them. From the client's perspective, it's talking directly to the server.

```
Client → Reverse Proxy (Nginx) → Backend Server(s)
```

**Uses:**

- SSL termination (HTTPS handled at proxy, HTTP to backends)
- Load balancing
- Caching static content
- Rate limiting
- Hiding backend server details

**Common reverse proxies:** Nginx, HAProxy, Traefik, Caddy, AWS ALB/NLB.

**Nginx reverse proxy config example:**

```nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
