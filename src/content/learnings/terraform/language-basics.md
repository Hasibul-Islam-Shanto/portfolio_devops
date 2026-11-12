---
title: "Terraform Language Basics"
description: "Blocks, arguments, and attributes — the building blocks of every Terraform configuration file."
order: 1
topic: "terraform"
---

## Basics of Terraform Language

Every Terraform configuration is built from a simple pattern: a **block** contains **arguments**, and you reference **attributes** from resources you've created. Understanding these three concepts is the foundation for reading and writing any `.tf` file.

```text
<block_type> "<parameters>" {
  <arguments>
}
```

When building infrastructure, the block type tells Terraform what kind of thing you're defining — `resource` to create infrastructure, `output` to expose values, `variable` to accept inputs.

1. A block is a container that groups related Terraform configuration.

```hcl
resource "aws_instance" "web" {
  ami           = "ami-123456"
  instance_type = "t3.micro"
}
```

```hcl
resource "aws_instance" "web"
   │          │          │
   │          │          └── Local resource name
   │          └───────────── Resource type
   └──────────────────────── Block type
```

2. An argument assigns a value to a name inside a block.

```hcl
resource "aws_instance" "web" {
  ami           = "ami-123456"
  instance_type = "t3.micro"
}
```

```hcl
ami           = "ami-123456"
instance_type = "t3.micro"
```

3. In practical Terraform usage, attribute often refers to a piece of data belonging to an object/resource, especially values you can read/reference.

```hcl
resource "aws_instance" "web" {
  ami           = "ami-123456"
  instance_type = "t3.micro"
}

output "server_ip" {
  value = aws_instance.web.public_ip
}
```

Here :

```text
aws_instance.web.public_ip
      │        │       │
      │        │       └── Attribute
      │        └────────── Resource name
      └─────────────────── Resource type
```

Putting them together:

```hcl
resource "aws_instance" "backend" {
  ami           = "ami-123456"
  instance_type = "t3.micro"

  tags = {
    Name = "backend-server"
  }
}

output "backend_ip" {
  value = aws_instance.backend.public_ip
}
```

```hcl
resource "aws_instance" "backend" {      ← BLOCK

    ami = "ami-123456"                   ← ARGUMENT

    instance_type = "t3.micro"           ← ARGUMENT

    tags = {                             ← ARGUMENT
        Name = "backend-server"
    }
}

output "backend_ip" {                    ← BLOCK

    value = aws_instance.backend.public_ip
            │            │        │
            resource     name     attribute
}
```
