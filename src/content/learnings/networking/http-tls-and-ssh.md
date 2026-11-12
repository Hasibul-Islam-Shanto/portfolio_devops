---
title: "HTTP, TLS & SSH"
description: "Application-layer protocols — HTTP/HTTPS for the web, TLS for encryption, and SSH for secure remote access."
order: 6
topic: "networking"
---

## HTTP & HTTPS

**HTTP (HyperText Transfer Protocol)** is the protocol used to transfer data between a client (browser) and a web server. It runs over TCP on port **80**.

**HTTPS** is HTTP with encryption (TLS). Runs on port **443**.

### HTTP Request Structure

```
GET /index.html HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Accept: text/html
```

### HTTP Response Structure

```
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1234

<html>...</html>
```

### Common HTTP Methods

| Method | Purpose                         |
| ------ | ------------------------------- |
| GET    | Retrieve a resource             |
| POST   | Submit data / create a resource |
| PUT    | Replace a resource              |
| PATCH  | Partially update a resource     |
| DELETE | Delete a resource               |

### HTTP Status Codes

| Code Range | Category      | Examples                                                            |
| ---------- | ------------- | ------------------------------------------------------------------- |
| 1xx        | Informational | 100 Continue                                                        |
| 2xx        | Success       | 200 OK, 201 Created, 204 No Content                                 |
| 3xx        | Redirect      | 301 Moved Permanently, 302 Found                                    |
| 4xx        | Client Error  | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found     |
| 5xx        | Server Error  | 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable |

### HTTP/1.1 vs HTTP/2 vs HTTP/3

| Version  | Key Feature                                        |
| -------- | -------------------------------------------------- |
| HTTP/1.1 | One request per connection (keep-alive helps)      |
| HTTP/2   | Multiplexing — multiple requests over one TCP conn |
| HTTP/3   | Uses QUIC (UDP-based), faster connection setup     |

---

## TLS/SSL — Securing the Connection

**TLS (Transport Layer Security)** is the cryptographic protocol that makes HTTPS secure. SSL is its older, deprecated predecessor — the terms are often used interchangeably.

### What TLS Provides

- **Encryption** — Data is encrypted; eavesdroppers can't read it.
- **Authentication** — Server proves its identity via a certificate.
- **Integrity** — Data cannot be tampered with in transit (via message authentication codes).

### TLS Handshake (Simplified)

```
Client                              Server
  │                                   │
  │──── ClientHello (TLS version, ──→ │
  │     supported ciphers)            │
  │                                   │
  │ ←── ServerHello + Certificate ─── │
  │     (public key inside)           │
  │                                   │
  │  Client verifies certificate      │
  │  against trusted CA               │
  │                                   │
  │──── Key exchange ───────────────→ │
  │                                   │
  │ ←──── Encrypted data ───────────→ │
```

### Certificates and CA

- A **certificate** contains the server's public key and is signed by a **Certificate Authority (CA)** (e.g., Let's Encrypt, DigiCert).
- Your OS/browser has a list of trusted CAs. If the server's cert is signed by one of them, the connection is trusted.
- In DevOps: use **Let's Encrypt** (free) with **Certbot** to auto-provision and renew TLS certificates.

---

## SSH — Secure Shell

**SSH** is the protocol DevOps engineers use to securely connect to remote servers. It runs over TCP on port **22**.

### How SSH Authentication Works

**Password authentication:** Simple but less secure. Brute-force attacks are a risk.

**Key-based authentication (recommended):**

```
Your machine                        Remote Server
 ┌─────────────────┐                ┌───────────────────────┐
 │ Private Key     │                │ ~/.ssh/authorized_keys │
 │ (kept secret)   │                │ (your public key)      │
 └─────────────────┘                └───────────────────────┘
         │                                      │
         └──── SSH handshake proves you ────────┘
               hold the private key
               (without sending it)
```

### Common SSH Commands

```bash
# Connect to a server
ssh user@server-ip

# Connect with a specific private key
ssh -i ~/.ssh/my-key.pem ubuntu@server-ip

# Copy files to/from server (SCP)
scp file.txt user@server:/home/user/
scp user@server:/path/to/file.txt ./local/

# Generate an SSH key pair
ssh-keygen -t ed25519 -C "your-email@example.com"

# SSH tunneling (port forwarding)
# Forward local port 8080 to remote port 80
ssh -L 8080:localhost:80 user@server-ip
```

### SSH Config File (`~/.ssh/config`)

Avoid typing long commands by saving settings:

```
Host my-server
    HostName 34.100.200.50
    User ubuntu
    IdentityFile ~/.ssh/my-key.pem
```

Now just type: `ssh my-server`
