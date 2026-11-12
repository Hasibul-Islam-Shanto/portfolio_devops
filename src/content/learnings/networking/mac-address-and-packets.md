---
title: "MAC Address & Packets"
description: "How MAC addresses work at the data link layer, and how data is broken into packets for transmission."
order: 2
topic: "networking"
---

## MAC Address & Data Link Layer

**MAC (Media Access Control)** address is the addressing mechanism used when a message is traveling **inside a LAN** (Local Area Network).

- It is a **hardware address** burned into the network interface card (NIC).
- Written as 6 pairs of hex digits: `00:1A:2B:3C:4D:5E`
- The first 3 pairs identify the manufacturer; the last 3 identify the device.

**IP vs. MAC:**

| Feature | IP Address        | MAC Address         |
| ------- | ----------------- | ------------------- |
| Scope   | Global / Internet | Local network only  |
| Changes | Can change        | Fixed to hardware   |
| Layer   | Network (Layer 3) | Data Link (Layer 2) |

When data moves across a local network, the binary representation of the IP address is prefixed to the data as a **header** — this is how routers know where to send it next.

**ARP (Address Resolution Protocol):** When a device knows the IP address of a target but needs the MAC address to send a frame on the local network, it broadcasts an ARP request: _"Who has IP 192.168.1.5?"_ The device with that IP replies with its MAC address.

---

## Packets & How Data Travels

**Packets** are the collection of bits that travel across a network. Every packet contains:

- A **header** (IP address of source and destination, packet number, etc.)
- A **payload** (the actual data being sent)

Large messages are broken into multiple packets and reassembled at the destination.

```
        Original Message
   ┌──────────────────────────┐
   │         Data             │
   └──────────────────────────┘
              │
    Split into packets
              │
   ┌──────────┬──────────┬──────────┐
   │ Packet 1 │ Packet 2 │ Packet 3 │
   │IP add│Data│IP add│Data│IP add│Data│
   └──────────┴──────────┴──────────┘
              │
   Travel independently across the network
              │
   Reassembled at destination
```

Each packet may take a **different route** across the internet. This is by design — it makes the internet resilient. If one router fails, packets reroute automatically.
