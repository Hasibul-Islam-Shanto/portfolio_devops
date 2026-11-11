---
title: "Internet & IP Addressing"
description: "What the internet is, how IP addressing works (IPv4/IPv6), and subnetting with CIDR notation."
order: 1
topic: "networking"
---

## What is the Internet?

The **Internet** is an interconnected network of billions of devices, with a collection of protocols that define a consistent communication format for devices to send and receive data to and from one another.

Think of it as a giant highway system where every car (data packet) follows the same traffic rules (protocols) regardless of where it came from or where it is going.

**Key idea:** No single company owns the internet. It is a cooperative system of networks run by ISPs, governments, universities, and private companies — all agreeing to use the same protocols.

---

## IP Addressing

Every device on a network has an **IP (Internet Protocol) address** — a unique identifier that allows data to be routed to the right destination.

### IPv4

The most common format. Written as four groups of numbers separated by dots:

```
192.168.1.10
```

Each group is a number from **0 to 255** (8 bits), making the full address **32 bits** long. This allows for ~4.3 billion unique addresses.

### IPv6

Because IPv4 addresses are running out, IPv6 was introduced. It uses **128 bits** and is written in hexadecimal:

```
2001:0db8:85a3:0000:0000:8a2e:0370:7334
```

### Public vs. Private IP Addresses

| Type    | Range                                     | Use                        |
| ------- | ----------------------------------------- | -------------------------- |
| Private | 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 | Internal networks (LAN)    |
| Public  | Everything else                           | Accessible on the internet |

**IP Address = Network portion + Host portion**

The network portion identifies which network the device is on. The host portion identifies the specific device within that network.

---

## Subnetting & CIDR

### CIDR — Classless Inter-Domain Routing

CIDR is a method for efficiently allocating IP addresses. Instead of rigid class-based blocks, CIDR uses a **prefix length** (subnet mask) to define how many bits are the network portion.

```
192.168.1.0/24
```

The `/24` means the first **24 bits** are the network part. The remaining **8 bits** are for hosts.

```
Network:  192.168.1   (24 bits)
Hosts:              .0 → .255  (8 bits = 256 addresses, 254 usable)
```

### Common Subnet Sizes

| CIDR | Subnet Mask     | Hosts (usable) | Common Use                   |
| ---- | --------------- | -------------- | ---------------------------- |
| /8   | 255.0.0.0       | 16,777,214     | Large ISP networks           |
| /16  | 255.255.0.0     | 65,534         | Large company network        |
| /24  | 255.255.255.0   | 254            | Typical office/home network  |
| /28  | 255.255.255.240 | 14             | Small server subnet          |
| /30  | 255.255.255.252 | 2              | Point-to-point links         |
| /32  | 255.255.255.255 | 1              | Single host (used in routes) |

### Why DevOps Engineers Need Subnetting

In cloud environments (AWS, GCP, Azure), you design your own network. You need to:

- Create a **VPC** with a CIDR block (e.g., `10.0.0.0/16`)
- Divide it into **subnets** (public: `10.0.1.0/24`, private: `10.0.2.0/24`)
- Ensure subnets don't overlap
