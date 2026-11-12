---
title: "Terraform State"
description: "How Terraform tracks infrastructure, state commands, locking, and remote backends."
order: 6
topic: "terraform"
---

## Terraform State

Terraform State is how Terraform **keeps track of the infrastructure it manages**.

By default, Terraform stores state in:

```text
terraform.tfstate
```

---

### 1. Why Does Terraform Need State?

Suppose we write:

```hcl
resource "aws_instance" "backend" {
  ami           = "ami-123456"
  instance_type = "t3.micro"
}
```

Then run:

```bash
terraform apply
```

AWS creates:

```text
EC2 Instance
ID: i-0123456789
```

Terraform needs to remember:

```text
aws_instance.backend
        │
        │ maps to
        ▼
i-0123456789
```

That mapping is stored in the **state file**.

```text
Terraform Code
      │
      ▼
Terraform State
      │
      ▼
Actual AWS Resource

aws_instance.backend
      │
      ▼
i-0123456789
```

---

### 2. How Terraform Uses State

Suppose the current configuration is:

```hcl
instance_type = "t3.micro"
```

And the state knows the existing EC2 instance.

Now we change:

```hcl
instance_type = "t3.small"
```

When we run:

```bash
terraform plan
```

Terraform compares:

```text
Desired Configuration
        │
        │
        ▼
   Terraform State
        │
        │
        ▼
Actual Infrastructure
```

Then Terraform determines:

```text
Current:
t3.micro

Desired:
t3.small

      ↓

Update required
```

This is how Terraform knows **what needs to be created, updated, or deleted**.

---

### 3. Important State Commands

View the current state:

```bash
terraform show
```

List resources tracked by Terraform:

```bash
terraform state list
```

Example:

```text
aws_vpc.main
aws_subnet.public
aws_instance.backend
aws_s3_bucket.uploads
```

Inspect one resource:

```bash
terraform state show aws_instance.backend
```

---

### 4. Don't Manually Edit `terraform.tfstate`

Avoid opening the state file and manually changing values.

Use Terraform commands instead.

```text
❌ Manually modify terraform.tfstate

✅ Use Terraform commands
```

The state contains important mappings between Terraform resources and real infrastructure.

---

### 5. State Locking

Two developers should not modify the same state simultaneously.

Without locking:

```text
Developer A ──┐
              ├──→ Same State
Developer B ──┘

       ⚠ Conflict
```

State locking prevents concurrent Terraform operations from corrupting or conflicting with state.

Conceptually:

```text
Developer A
     │
     ▼
Acquire Lock
     │
     ▼
terraform apply
     │
     ▼
Update State
     │
     ▼
Release Lock
```

Modern Terraform S3 backends can support S3-based locking with:

```hcl
use_lockfile = true
```

Example:

```hcl
terraform {
  backend "s3" {
    bucket       = "taskify-terraform-state"
    key          = "production/terraform.tfstate"
    region       = "ap-south-1"
    use_lockfile = true
  }
}
```
