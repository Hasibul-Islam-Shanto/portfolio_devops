---
title: "Variables, Data Types & tfvars"
description: "Make configurations dynamic with variables, data types, tfvars files, locals, and project structure."
order: 3
topic: "terraform"
---

## Variables

### 1. Variables

Variables are used to make Terraform configurations **dynamic and reusable** instead of hardcoding values.

Without variable:

```hcl
resource "aws_instance" "backend" {
  ami           = "ami-123456"
  instance_type = "t3.micro"
}
```

With variable:

```hcl
variable "instance_type" {
  type    = string
  default = "t3.micro"
}

resource "aws_instance" "backend" {
  ami           = "ami-123456"
  instance_type = var.instance_type
}
```

Here:

```text
variable "instance_type"
             │
             └── Variable name

var.instance_type
 │       │
 │       └── Variable name
 └────────── Variable reference
```

So instead of hardcoding:

```hcl
instance_type = "t3.micro"
```

we can use:

```hcl
instance_type = var.instance_type
```

---

### 2. Variable Structure

A variable can contain `type`, `default`, and `description`.

```hcl
variable "instance_type" {
  type        = string
  default     = "t3.micro"
  description = "EC2 instance type"
}
```

Here:

```text
variable "instance_type" {

  type        = string        ← Expected data type

  default     = "t3.micro"    ← Default value

  description = "..."         ← Description of variable
}
```

If `default` is not provided:

```hcl
variable "instance_type" {
  type = string
}
```

Terraform expects the value to come from somewhere else, such as a `.tfvars` file, CLI argument, or environment variable.

---

### Common Terraform Data Types

The most commonly used Terraform data types are:

```text
string
number
bool
list
map
object
```

### String

Used for text values.

```hcl
variable "region" {
  type    = string
  default = "ap-south-1"
}
```

Reference:

```hcl
var.region
```

---

### Number

Used for numeric values.

```hcl
variable "instance_count" {
  type    = number
  default = 2
}
```

Reference:

```hcl
var.instance_count
```

---

### Boolean

Used for `true` / `false` configuration.

```hcl
variable "enable_monitoring" {
  type    = bool
  default = true
}
```

Reference:

```hcl
var.enable_monitoring
```

---

### List

A list stores multiple ordered values of the same type.

```hcl
variable "availability_zones" {
  type = list(string)

  default = [
    "ap-south-1a",
    "ap-south-1b"
  ]
}
```

Access values using an index:

```hcl
var.availability_zones[0]
```

Here:

```text
var.availability_zones[0]
 │          │          │
 │          │          └── Index
 │          └───────────── Variable name
 └──────────────────────── Variable reference
```

Returns:

```text
ap-south-1a
```

---

### Map

A map stores values as **key-value pairs**.

```hcl
variable "instance_types" {
  type = map(string)

  default = {
    development = "t3.micro"
    staging     = "t3.small"
    production  = "t3.medium"
  }
}
```

Access a value:

```hcl
var.instance_types["production"]
```

Here:

```text
var.instance_types["production"]
 │         │              │
 │         │              └── Key
 │         └───────────────── Variable name
 └─────────────────────────── Variable reference
```

Returns:

```text
t3.medium
```

Maps are useful for environment-specific configurations.

---

### Object

An object groups related configuration together.

```hcl
variable "server" {
  type = object({
    name          = string
    instance_type = string
    monitoring    = bool
  })

  default = {
    name          = "backend"
    instance_type = "t3.micro"
    monitoring    = true
  }
}
```

Access individual values:

```hcl
var.server.name
var.server.instance_type
var.server.monitoring
```

Think of an object like a structured configuration:

```text
server
│
├── name          → backend
├── instance_type → t3.micro
└── monitoring    → true
```

---

### terraform.tfvars

Instead of putting actual values inside `variables.tf`, we can keep variable declarations and variable values separate.

`variables.tf`:

```hcl
variable "region" {
  type = string
}

variable "instance_type" {
  type = string
}

variable "environment" {
  type = string
}
```

`terraform.tfvars`:

```hcl
region        = "ap-south-1"
instance_type = "t3.micro"
environment   = "development"
```

Terraform automatically loads:

```text
terraform.tfvars
```

The flow becomes:

```text
variables.tf
     │
     │ Defines variables
     ▼
terraform.tfvars
     │
     │ Provides values
     ▼
   var.xxx
     │
     ▼
Resources
```

Example:

```hcl
resource "aws_instance" "backend" {
  ami           = "ami-123456"
  instance_type = var.instance_type

  tags = {
    Environment = var.environment
  }
}
```

### Variables vs Locals

Variables are **inputs from outside the configuration**.

```hcl
variable "environment" {
  type = string
}
```

Reference:

```hcl
var.environment
```

Locals are **internal reusable values calculated/defined inside Terraform**.

```hcl
locals {
  project_name = "taskify"
}
```

Reference:

```hcl
local.project_name
```

Simple difference:

```text
Variable
   │
   └── Input from outside
       terraform.tfvars / CLI / environment

Local
   │
   └── Internal value used inside Terraform
```

Example:

```hcl
variable "environment" {
  type = string
}

locals {
  app_name = "taskify-${var.environment}"
}

resource "aws_s3_bucket" "uploads" {
  bucket = "${local.app_name}-uploads"
}
```

If:

```hcl
environment = "production"
```

then:

```text
var.environment
       │
       ▼
  "production"
       │
       ▼
local.app_name
       │
       ▼
"taskify-production"
       │
       ▼
"taskify-production-uploads"
```

---

### Practical Project Structure

A common small Terraform project can be organized like:

```text
terraform/
│
├── main.tf
├── providers.tf
├── variables.tf
├── outputs.tf
└── terraform.tfvars
```

Purpose:

```text
providers.tf
     │
     └── Provider configuration

variables.tf
     │
     └── Input variable declarations

terraform.tfvars
     │
     └── Actual variable values

main.tf
     │
     └── Resources

outputs.tf
     │
     └── Values Terraform should return
```

Example flow:

```text
terraform.tfvars
       │
       ▼
variables.tf
       │
       ▼
    var.xxx
       │
       ▼
    main.tf
       │
       ▼
 AWS Resources
       │
       ▼
  outputs.tf
```
