---
title: "Ports & DNS"
description: "How port numbers route traffic to the right application, and how DNS translates domain names to IPs."
order: 3
topic: "networking"
---

## Ports

A **port number** is an addressing mechanism that identifies which **application or service** on a host machine should receive the data. IP gets data to the right machine; port gets it to the right program.

### Types of Ports

| Type                | Range         | Description                             |
| ------------------- | ------------- | --------------------------------------- |
| Well-known Ports    | 0 – 1023      | Reserved for standard services          |
| Registered Ports    | 1024 – 49151  | Assigned to applications                |
| Ephemeral / Private | 49152 – 65535 | Dynamically assigned to client sessions |

### Common Port Numbers DevOps Engineers Must Know

| Port | Protocol | Service                   |
| ---- | -------- | ------------------------- |
| 22   | TCP      | SSH                       |
| 25   | TCP      | SMTP (email)              |
| 53   | UDP/TCP  | DNS                       |
| 80   | TCP      | HTTP                      |
| 443  | TCP      | HTTPS                     |
| 3306 | TCP      | MySQL                     |
| 5432 | TCP      | PostgreSQL                |
| 6379 | TCP      | Redis                     |
| 8080 | TCP      | Common app/proxy port     |
| 2379 | TCP      | etcd (used by Kubernetes) |
| 6443 | TCP      | Kubernetes API server     |

---

## DNS — Domain Name System

The **DNS** is a massive, distributed database that maps **human-readable domain names** to **IP addresses**.

Without DNS, you would need to type `142.250.191.46` instead of `google.com`.

### DNS Resolution Flow

```
You type: google.com
    │
    ▼
Browser checks local cache
    │ (not found)
    ▼
OS checks /etc/hosts file
    │ (not found)
    ▼
Query sent to Recursive Resolver (your ISP or 8.8.8.8)
    │
    ▼
Recursive Resolver checks its cache
    │ (not found)
    ▼
Query to Root DNS Server (knows where .com lives)
    │
    ▼
Query to TLD Server (.com nameserver)
    │
    ▼
Query to Authoritative DNS Server (knows google.com)
    │
    ▼
Returns IP address → Browser connects
```

### DNS Record Types

| Record | Purpose                                     | Example                       |
| ------ | ------------------------------------------- | ----------------------------- |
| A      | Maps domain to IPv4 address                 | `google.com → 142.250.191.46` |
| AAAA   | Maps domain to IPv6 address                 | `google.com → 2607:f8b0:...`  |
| CNAME  | Alias — one domain points to another        | `www → google.com`            |
| MX     | Mail server for the domain                  | `mail.google.com`             |
| TXT    | Arbitrary text (used for verification, SPF) | `"v=spf1 include:..."`        |
| NS     | Nameservers responsible for the domain      | `ns1.google.com`              |
| PTR    | Reverse DNS — IP to domain name             | `142.250.191.46 → google.com` |

### TTL (Time to Live)

Each DNS record has a TTL — how long (in seconds) resolvers should cache it. Lower TTL = faster propagation during changes (useful during deployments), but more DNS queries.
