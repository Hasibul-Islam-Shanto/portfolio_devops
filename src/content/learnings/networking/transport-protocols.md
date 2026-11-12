---
title: "Transport Protocols"
description: "UDP and TCP — the two main transport layer protocols, their features, and when to use each."
order: 5
topic: "networking"
---

## UDP — User Datagram Protocol

UDP is a **transport layer protocol** that operates on top of IP.

### Structure of a UDP Packet

```
┌──────────┬────────────────────┬──────────────┐
│ IP Head  │  Port + Checksum   │ Data Payload │
│          │   (UDP header)     │              │
└──────────┴────────────────────┴──────────────┘
```

### Two Main Features UDP Adds to IP

**1. Port Numbers** — Identify which application/program the packet is intended for on the destination device.

**2. Checksum** — Detects data corruption:

- Sender runs a checksum algorithm on the data payload and inserts the result into the UDP header.
- Receiver runs the same algorithm and compares. If they match → data is intact. If not → data is corrupt.

### What UDP Does NOT Have

- No acknowledgement that data arrived
- No re-sending of lost packets
- No guaranteed ordering

### When to Use UDP

UDP is used when **speed matters more than reliability**:

| Use Case        | Why UDP?                                     |
| --------------- | -------------------------------------------- |
| Video streaming | A dropped frame is better than a pause       |
| Online gaming   | Low latency is critical                      |
| DNS queries     | Short request/response, fast enough          |
| VoIP calls      | Real-time, occasional packet loss acceptable |

---

## TCP — Transmission Control Protocol

TCP solves the problems UDP ignores. It adds **reliability** on top of IP.

### Why TCP Exists

Because the internet routes packets independently:

- Packets can arrive **out of order**
- Packets can be **lost** or **corrupted**
- UDP has no way to handle these situations

### Two Major Features of TCP

**1. Acknowledgement (ACK)**

- When a TCP packet arrives at the destination, the receiver sends back an **ACK** (acknowledgement) to the sender.
- If the sender doesn't receive an ACK within a timeout window, it **re-sends** the packet.
- This guarantees delivery and fixes lost/corrupted packets.

**2. Sequential Ordering**

- Every TCP packet has a **sequence number**.
- Even if packets arrive out of order, the receiver reassembles them in the correct order using sequence numbers.

### TCP 3-Way Handshake (Connection Setup)

Before any data is sent, TCP establishes a connection:

```
   Client                     Server
     │                           │
     │──────── SYN ────────────→ │  "I want to connect"
     │                           │
     │ ←──── SYN + ACK ──────── │  "OK, I'm ready"
     │                           │
     │──────── ACK ────────────→ │  "Great, let's go"
     │                           │
     │   ←── Data flows ──→      │
```

### TCP 4-Way Handshake (Connection Teardown)

```
   Client                     Server
     │──────── FIN ────────────→ │
     │ ←──────── ACK ─────────── │
     │ ←──────── FIN ─────────── │
     │──────── ACK ────────────→ │
```

### TCP vs. UDP Comparison

| Feature     | TCP              | UDP              |
| ----------- | ---------------- | ---------------- |
| Connection  | Connection-based | Connectionless   |
| Reliability | Guaranteed       | Not guaranteed   |
| Ordering    | Guaranteed       | Not guaranteed   |
| Speed       | Slower           | Faster           |
| Use cases   | HTTP, SSH, email | DNS, video, VoIP |
