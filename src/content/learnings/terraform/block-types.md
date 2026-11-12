---
title: "Types of Blocks in Terraform"
description: "terraform, provider, resource, data, variable, locals, output, and module blocks explained."
order: 2
topic: "terraform"
---

Every Terraform file is made up of **blocks**. Each block type serves a different purpose — here are the eight you'll use most often.

<div class="tf-block">
  <div class="tf-block-head">
    <span class="tf-block-num">01</span>
    <code class="tf-block-name">terraform</code>
  </div>
  <p>Configures Terraform itself, such as the Terraform version and required providers.</p>
</div>

```hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}
```

<div class="tf-block">
  <div class="tf-block-head">
    <span class="tf-block-num">02</span>
    <code class="tf-block-name">provider</code>
  </div>
  <p>Configures the infrastructure provider.</p>
</div>

```hcl
provider "aws" {
  region = "ap-south-1"
}
```

Terraform supports these providers:

```hcl
provider "aws" {}
provider "google" {}
provider "azurerm" {}
provider "kubernetes" {}
```

<div class="tf-block">
  <div class="tf-block-head">
    <span class="tf-block-num">03</span>
    <code class="tf-block-name">resource</code>
  </div>
  <p>Tells Terraform to create or manage infrastructure.</p>
</div>

```hcl
resource "aws_instance" "backend" {
  ami           = "ami-123456"
  instance_type = "t3.micro"
}
```

```text
resource "aws_instance" "my_instance"
    │          │            │
    │          │            └── Local name (you can give it any name of your choice)
    │          └─────────────── Resource type
    └────────────────────────── Block type
```

<div class="tf-block">
  <div class="tf-block-head">
    <span class="tf-block-num">04</span>
    <code class="tf-block-name">data</code>
  </div>
  <p>Reads information from existing infrastructure instead of creating it.</p>
</div>

```hcl
data "aws_availability_zones" "available" {
  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}
```

<div class="tf-block">
  <div class="tf-block-head">
    <span class="tf-block-num">05</span>
    <code class="tf-block-name">variable</code>
  </div>
  <p>Defines values that users can provide to their Terraform configuration.</p>
</div>

```hcl
variable "instance_type" {
  type        = string
  default     = "t3.micro"
  description = "EC2 instance type"
}

resource "aws_instance" "backend" {
  instance_type = var.instance_type
}
```

<div class="tf-block">
  <div class="tf-block-head">
    <span class="tf-block-num">06</span>
    <code class="tf-block-name">locals</code>
  </div>
  <p>Creates reusable values inside a Terraform configuration.</p>
</div>

```hcl
locals {
  project_name = "taskify"
  environment  = "production"
}

resource "aws_s3_bucket" "uploads" {
  bucket = "${local.project_name}-uploads"
}
```

Syntax difference between `variable` and `locals`:

```text
variable → var.instance_type
local    → local.project_name
```

<div class="tf-block">
  <div class="tf-block-head">
    <span class="tf-block-num">07</span>
    <code class="tf-block-name">output</code>
  </div>
  <p>Returns information you want to print after infrastructure is created.</p>
</div>

```hcl
output "instance_public_ip" {
  value = aws_instance.backend.public_ip
}
```

<div class="tf-block">
  <div class="tf-block-head">
    <span class="tf-block-num">08</span>
    <code class="tf-block-name">module</code>
  </div>
  <p>Lets you reuse existing configuration.</p>
</div>

```hcl
module "vpc" {
  source = "./modules/vpc"

  vpc_cidr = "10.0.0.0/16"
}
```

A module can come from a local path or a public registry.

**Local:**

```hcl
module "vpc" {
  source = "./modules/vpc"

  vpc_cidr = "10.0.0.0/16"
}
```

**Public registry:**

```hcl
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 21.0"

  name               = "example"
  kubernetes_version = "1.33"

  tags = {
    Environment = "dev"
    Terraform   = "true"
  }
}
```
