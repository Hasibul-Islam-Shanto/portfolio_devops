---
title: "Network Models"
description: "The OSI 7-layer model and the TCP/IP 4-layer model — how data flows through the network stack."
order: 4
topic: "networking"
---

## OSI Model

The **OSI (Open Systems Interconnection)** model is a conceptual framework that standardizes network communication into **7 layers**. Each layer serves the layer above it and is served by the layer below it.

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 7 - Application    │ HTTP, FTP, DNS, SMTP, gRPC          │
├─────────────────────────────────────────────────────────────────┤
│  Layer 6 - Presentation   │ Encoding, Serialization, Encryption  │
├─────────────────────────────────────────────────────────────────┤
│  Layer 5 - Session        │ TLS handshake, Connection mgmt       │
├─────────────────────────────────────────────────────────────────┤
│  Layer 4 - Transport      │ TCP, UDP (ports, segments)           │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3 - Network        │ IP, Routing, ICMP                    │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2 - Data Link      │ Ethernet, MAC address, ARP, Frames   │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1 - Physical       │ Cables, fiber optics, radio waves    │
└─────────────────────────────────────────────────────────────────┘
```

### How Data Flows (Encapsulation)

When you send an HTTP request, it travels **down** the stack on the sender and **up** the stack on the receiver, with each layer adding/removing its own header:

```
Sender side:
Application  →  HTTP data
Transport    →  TCP segment (adds port numbers)
Network      →  IP packet (adds IP addresses)
Data Link    →  Ethernet frame (adds MAC addresses)
Physical     →  Bits over the wire

Receiver side (reverse):
Physical     →  Receive bits
Data Link    →  Strip Ethernet header
Network      →  Strip IP header
Transport    →  Strip TCP header, reorder packets
Application  →  Read HTTP data
```

---

## TCP/IP Model

The **TCP/IP model** is the practical model that the internet actually uses. It collapses OSI's 7 layers into 4:

| TCP/IP Layer     | Equivalent OSI Layers              | Protocols                  |
| ---------------- | ---------------------------------- | -------------------------- |
| ④ Application    | Application, Presentation, Session | HTTP, HTTPS, DNS, SSH, FTP |
| ③ Transport      | Transport                          | TCP, UDP                   |
| ② Internet       | Network                            | IP, ICMP, ARP              |
| ① Network Access | Data Link + Physical               | Ethernet, Wi-Fi, MAC       |

**Modern world's most used architecture:** Star topology using the TCP/IP model.
