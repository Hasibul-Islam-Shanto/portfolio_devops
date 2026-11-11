---
title: "Inventory and SSH Connectivity"
description: "Define managed hosts, connection settings, inventory groups, and safe connectivity checks."
order: 2
topic: "ansible"
---

## What an Inventory Does

An inventory tells Ansible which machines it can manage. The Ansible lab uses an INI inventory named `hosts.ini` with a group called `servers`.

```ini
[servers]
worker-node-1 ansible_host=203.0.113.10 ansible_user=ubuntu
worker-node-2 ansible_host=203.0.113.11 ansible_user=ubuntu

[all:vars]
ansible_ssh_private_key_file=/home/ubuntu/.ssh/ansible-key
ansible_python_interpreter=/usr/bin/python3
```

The example addresses use the documentation-only `203.0.113.0/24` range. Replace them with real private addresses, public addresses, or DNS names for your environment.

## Understanding the Inventory Values

- `[servers]` creates a group that a playbook can target with `hosts: servers`.
- `worker-node-1` is a friendly inventory alias.
- `ansible_host` is the real IP address or DNS name used for SSH.
- `ansible_user` is the remote operating-system user.
- `[all:vars]` applies its variables to every inventory host.
- `ansible_ssh_private_key_file` selects the SSH private key.
- `ansible_python_interpreter` selects Python on each managed node.

Keep private keys outside the repository. Only the path belongs in configuration, never the key content.

## Inspecting the Inventory

Before changing a server, check how Ansible understands the inventory:

```bash
ansible-inventory -i hosts.ini --graph
ansible-inventory -i hosts.ini --list
```

The graph view makes group membership easy to verify:

```text
@all:
  |--@ungrouped:
  |--@servers:
  |  |--worker-node-1
  |  |--worker-node-2
```

## Testing Connectivity

The Ansible ping module checks whether Ansible can connect, authenticate, find Python, and execute a small module:

```bash
ansible servers \
  -i hosts.ini \
  -m ansible.builtin.ping
```

A successful response looks similar to:

```text
worker-node-1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

This is not an ICMP network ping. It is an Ansible module executed over the normal SSH connection.

## Troubleshooting a Failed Connection

Check the connection in this order:

1. Confirm the host address and SSH user.
2. Confirm the private key exists and has restrictive permissions.
3. Test SSH directly.
4. Confirm Python 3 exists on the managed node.
5. Retry Ansible with verbose output.

```bash
chmod 600 ~/.ssh/ansible-key
ssh -i ~/.ssh/ansible-key ubuntu@203.0.113.10
ansible servers -i hosts.ini -m ansible.builtin.ping -vvv
```

If direct SSH fails, fix that first. Ansible cannot work until its underlying SSH path works.

> **Key takeaway**
> Use aliases to keep playbooks readable, keep environment-specific addresses in inventory, and verify connectivity before running configuration changes.
