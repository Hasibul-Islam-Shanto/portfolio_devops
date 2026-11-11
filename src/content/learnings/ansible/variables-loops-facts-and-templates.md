---
title: "Variables, Loops, Facts, and Templates"
description: "Reuse values, repeat tasks, and render host-specific configuration with Jinja2 and gathered facts."
order: 4
topic: "ansible"
---

## Play Variables

Variables keep changing values separate from task logic. The package loop in the lab starts with a YAML list:

```yaml
vars:
  packages_to_install:
    - zip
    - unzip
    - jq
    - wget
    - apache2
```

Use Jinja2 expressions to read variables:

```yaml
- name: Install each package
  ansible.builtin.apt:
    name: "{{ item }}"
    state: present
  loop: "{{ packages_to_install }}"
```

During each iteration, `item` contains the current list value.

## When a Loop Is Not Needed

The APT module accepts a list directly, so one package transaction is simpler and more efficient:

```yaml
- name: Install required packages
  ansible.builtin.apt:
    name: "{{ packages_to_install }}"
    state: present
    update_cache: true
```

Loops remain useful when every item needs separate arguments or when a module accepts only one value at a time.

## Ansible Facts

Ansible gathers system information at the beginning of a play by default. Common facts include:

- `ansible_hostname`
- `ansible_default_ipv4.address`
- `ansible_distribution`
- `ansible_distribution_version`
- `ansible_architecture`

The special `inventory_hostname` variable contains the alias from the inventory, such as `worker-node-1`.

You can inspect facts with:

```bash
ansible servers \
  -i hosts.ini \
  -m ansible.builtin.setup
```

Filter the result when you need one area:

```bash
ansible servers \
  -i hosts.ini \
  -m ansible.builtin.setup \
  -a 'filter=ansible_distribution*'
```

## Rendering a Jinja2 Template

A single template can create different output for every managed host:

```html
<h1>{{ inventory_hostname }}</h1>

<dl>
  <dt>Hostname</dt>
  <dd>{{ ansible_hostname }}</dd>

  <dt>IP address</dt>
  <dd>{{ ansible_default_ipv4.address }}</dd>

  <dt>Operating system</dt>
  <dd>{{ ansible_distribution }} {{ ansible_distribution_version }}</dd>

  <dt>Architecture</dt>
  <dd>{{ ansible_architecture }}</dd>
</dl>
```

The template task renders those values on each server:

```yaml
- name: Deploy host information page
  ansible.builtin.template:
    src: index.html.j2
    dest: /var/www/html/index.html
    owner: root
    group: root
    mode: "0644"
```

If a play sets `gather_facts: false`, gathered fact variables are unavailable unless another task collects or defines them.

## Where Variables Belong

As an automation project grows, variables can move to locations based on their scope:

```text
inventory/
├── group_vars/
│   └── servers.yml
└── host_vars/
    ├── worker-node-1.yml
    └── worker-node-2.yml
```

- Use group variables for settings shared by a group.
- Use host variables only for values unique to one machine.
- Use role defaults for values callers should be able to override.
- Protect sensitive variables with Ansible Vault or an external secret manager.

> **Key takeaway**
> Variables make automation reusable, loops remove repeated task definitions, and facts allow one template to adapt itself to every managed server.
