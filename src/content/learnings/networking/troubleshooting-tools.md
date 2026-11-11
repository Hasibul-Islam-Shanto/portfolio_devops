---
title: "Troubleshooting Tools"
description: "Essential network debugging commands — ping, traceroute, dig, curl, ss, tcpdump, iptables, and more."
order: 8
topic: "networking"
---

## Network Troubleshooting Tools

Every DevOps engineer must be comfortable debugging network issues from the command line.

### `ping` — Test Reachability

```bash
ping google.com
# Sends ICMP echo requests; measures round-trip time
# If it fails: DNS problem or server unreachable
```

### `traceroute` / `tracepath` — Trace the Route

```bash
traceroute google.com
# Shows every hop (router) the packet takes
# Identifies where packets are being dropped or slowed
```

### `nslookup` / `dig` — DNS Lookup

```bash
# Basic DNS lookup
nslookup google.com

# Detailed DNS lookup with dig
dig google.com A
dig google.com MX
dig @8.8.8.8 google.com    # Use specific DNS server

# Reverse lookup
dig -x 142.250.191.46
```

### `curl` — Test HTTP/HTTPS

```bash
# GET request
curl https://api.example.com/health

# POST request with JSON
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Shanto"}'

# Show response headers
curl -I https://example.com

# Follow redirects, verbose output
curl -Lv https://example.com
```

### `netstat` / `ss` — Network Connections & Listening Ports

```bash
# Show all listening ports
ss -tlnp

# Show established connections
ss -tnp state established

# Legacy alternative
netstat -tulnp
```

### `telnet` / `nc` — Test Port Connectivity

```bash
# Test if port 443 is open on a server
telnet example.com 443

# Using netcat
nc -zv example.com 443
nc -zv example.com 22
```

### `tcpdump` — Capture Network Traffic

```bash
# Capture all traffic on interface eth0
tcpdump -i eth0

# Capture traffic on port 80
tcpdump -i eth0 port 80

# Save capture to file for analysis in Wireshark
tcpdump -i eth0 -w capture.pcap
```

### `iptables` — Linux Firewall Rules

```bash
# List current rules
iptables -L -n -v

# Allow incoming SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Block a specific IP
iptables -A INPUT -s 192.168.1.100 -j DROP
```

### `ip` — Network Interface Management

```bash
# Show all interfaces and IPs
ip addr show

# Show routing table
ip route show

# Show ARP table (MAC address mappings)
ip neigh show
```
