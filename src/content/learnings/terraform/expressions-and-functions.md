---
title: "Expressions & Functions"
description: "References, string interpolation, conditionals, and the most useful built-in functions."
order: 4
topic: "terraform"
---

## Terraform Expressions & Functions

An **expression** is something Terraform evaluates to produce a value.

Example:

```hcl
instance_type = var.instance_type
```

Here:

```hcl
var.instance_type
```

is an expression.

---

### 1. References

References are used to access values from variables, resources, locals, data sources, etc.

```hcl
# Variable
var.instance_type

# Local
local.project_name

# Resource attribute
aws_instance.backend.public_ip

# Data source
data.aws_ami.ubuntu.id

# Module output
module.vpc.vpc_id
```

Example:

```hcl
resource "aws_subnet" "public" {
  vpc_id = aws_vpc.main.id
}
```

Here:

```text
aws_vpc.main.id
   │      │   │
   │      │   └── Attribute
   │      └────── Resource name
   └───────────── Resource type
```

---

### 2. String Interpolation

Used to combine variables/values with strings.

Syntax:

```hcl
"${expression}"
```

Example:

```hcl
locals {
  project = "taskify"
}

variable "environment" {
  default = "production"
}

resource "aws_s3_bucket" "uploads" {
  bucket = "${local.project}-${var.environment}-uploads"
}
```

Result:

```text
taskify-production-uploads
```

Very commonly used for **resource names and tags**.

```hcl
tags = {
  Name = "${var.environment}-backend"
}
```

---

### 3. Conditional Expression

Terraform supports ternary-style conditions.

Syntax:

```text
condition ? true_value : false_value
```

Example:

```hcl
instance_type = var.environment == "production"
  ? "t3.medium"
  : "t3.micro"
```

Meaning:

```text
environment == production?
          │
     ┌────┴────┐
     │         │
    YES        NO
     │         │
     ▼         ▼
t3.medium   t3.micro
```

This is useful for environment-based configurations.

---

### Most Useful Functions

You don't need to memorize Terraform functions. These few are enough to start.

### 4. `length()`

Returns the number of items.

```hcl
variable "zones" {
  default = [
    "ap-south-1a",
    "ap-south-1b"
  ]
}
```

```hcl
length(var.zones)
```

Returns:

```text
2
```

Common usage:

```hcl
count = length(var.zones)
```

---

### 5. `contains()`

Checks whether a value exists in a collection.

```hcl
contains(
  ["development", "staging", "production"],
  var.environment
)
```

Returns:

```text
true / false
```

Commonly used for validation.

---

### 6. `merge()`

Combines maps.

Very useful for AWS tags.

```hcl
locals {
  common_tags = {
    Project     = "taskify"
    Environment = "production"
  }
}
```

Then:

```hcl
tags = merge(
  local.common_tags,
  {
    Name = "backend"
  }
)
```

Result:

```hcl
{
  Project     = "taskify"
  Environment = "production"
  Name        = "backend"
}
```

---

### 7. `file()`

Reads content from a file.

For example:

```text
terraform/
├── main.tf
└── scripts/
    └── startup.sh
```

Use:

```hcl
resource "aws_instance" "backend" {
  ami           = "ami-123456"
  instance_type = "t3.micro"

  user_data = file("${path.module}/scripts/startup.sh")
}
```
