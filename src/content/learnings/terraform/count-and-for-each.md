---
title: "count & for_each"
description: "Create multiple resources from a single block using count or for_each meta-arguments."
order: 5
topic: "terraform"
---

## count & for_each

`count` and `for_each` are used to **create multiple instances of a resource from a single resource block**.

---

### 1. `count`

Use `count` when you want to create **multiple similar resources based on a number**.

Without `count`:

```hcl
resource "aws_instance" "server1" {
  ami           = "ami-123456"
  instance_type = "t3.micro"
}

resource "aws_instance" "server2" {
  ami           = "ami-123456"
  instance_type = "t3.micro"
}
```

With `count`:

```hcl
resource "aws_instance" "server" {
  count = 2

  ami           = "ami-123456"
  instance_type = "t3.micro"
}
```

Terraform creates:

```text
aws_instance.server[0]
aws_instance.server[1]
```

---

### 2. `count.index`

`count.index` gives the index of the current resource.

It starts from `0`.

```hcl
resource "aws_instance" "server" {
  count = 3

  ami           = "ami-123456"
  instance_type = "t3.micro"

  tags = {
    Name = "server-${count.index}"
  }
}
```

Terraform creates:

```text
server-0
server-1
server-2
```

You can also make it start visually from `1`:

```hcl
Name = "server-${count.index + 1}"
```

Result:

```text
server-1
server-2
server-3
```

---

### 3. `count` with a List

`count` is often combined with `length()`.

```hcl
variable "subnet_cidrs" {
  default = [
    "10.0.1.0/24",
    "10.0.2.0/24"
  ]
}
```

Then:

```hcl
resource "aws_subnet" "public" {
  count = length(var.subnet_cidrs)

  vpc_id     = aws_vpc.main.id
  cidr_block = var.subnet_cidrs[count.index]
}
```

Flow:

```text
var.subnet_cidrs
       │
       ├── [0] → 10.0.1.0/24
       └── [1] → 10.0.2.0/24
                 │
                 ▼
          Terraform creates
                 │
          ┌──────┴──────┐
          ▼             ▼
      Subnet[0]      Subnet[1]
```

---

### for_each

Use `for_each` when resources have **meaningful unique names/keys**.

Example:

```hcl
variable "buckets" {
  default = [
    "uploads",
    "backups",
    "logs"
  ]
}
```

Convert the list to a set:

```hcl
resource "aws_s3_bucket" "bucket" {
  for_each = toset(var.buckets)

  bucket = "taskify-${each.value}"
}
```

Terraform creates resources identified by their values:

```text
aws_s3_bucket.bucket["uploads"]
aws_s3_bucket.bucket["backups"]
aws_s3_bucket.bucket["logs"]
```

---

### 5. `each.key` and `each.value`

When using `for_each`, Terraform provides:

```text
each.key
each.value
```

This becomes especially useful with a map.

```hcl
variable "servers" {
  default = {
    frontend = "t3.micro"
    backend  = "t3.small"
  }
}
```

Use:

```hcl
resource "aws_instance" "server" {
  for_each = var.servers

  ami           = "ami-123456"
  instance_type = each.value

  tags = {
    Name = each.key
  }
}
```

Here:

```text
servers
│
├── frontend = t3.micro
│      │           │
│      │           └── each.value
│      └────────────── each.key
│
└── backend = t3.small
       │          │
       │          └── each.value
       └───────────── each.key
```

Terraform creates:

```text
aws_instance.server["frontend"]
    instance_type = "t3.micro"

aws_instance.server["backend"]
    instance_type = "t3.small"
```
