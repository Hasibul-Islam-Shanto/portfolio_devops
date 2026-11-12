---
title: "Terraform Workflow"
description: "init, fmt, validate, plan, apply, and destroy — the commands you run every day."
order: 7
topic: "terraform"
---

## Terraform Workflow

The common Terraform workflow is:

```text
Write Configuration
        │
        ▼
terraform init
        │
        ▼
terraform fmt
        │
        ▼
terraform validate
        │
        ▼
terraform plan
        │
        ▼
terraform apply
```

And when infrastructure is no longer needed:

```text
terraform destroy
```

---

### 1. `terraform init`

Initializes the Terraform project.

```bash
terraform init
```

It mainly:

- Downloads required providers
- Initializes the backend
- Downloads modules

For example, if we use:

```hcl
provider "aws" {
  region = "ap-south-1"
}
```

`terraform init` downloads the required AWS provider.

Usually run it when:

```text
New Terraform project
        ↓
terraform init
```

Or after changing providers, modules, or backend configuration.

---

### 2. `terraform fmt`

Formats Terraform files into the standard Terraform style.

```bash
terraform fmt
```

For example:

```hcl
resource "aws_instance" "backend" {
ami="ami-123456"
instance_type="t3.micro"
}
```

Becomes:

```hcl
resource "aws_instance" "backend" {
  ami           = "ami-123456"
  instance_type = "t3.micro"
}
```

Think:

```text
terraform fmt
      ↓
Format Terraform code
```

---

### 3. `terraform validate`

Checks whether the Terraform configuration is syntactically and internally valid.

```bash
terraform validate
```

Successful result:

```text
Success! The configuration is valid.
```

Think:

```text
terraform validate
        ↓
"Is my Terraform configuration valid?"
```

---

### 4. `terraform plan`

Shows what Terraform **plans to change** before actually changing infrastructure.

```bash
terraform plan
```

Terraform may show:

```text
+ create
~ update
- destroy
```

Example:

```text
+ aws_instance.backend
```

means Terraform plans to create the resource.

The important idea:

```text
Terraform Code
      │
      ▼
terraform plan
      │
      ▼
Preview Changes
      │
      ├── Create
      ├── Update
      └── Destroy
```

Always review the plan before applying important infrastructure changes.

---

### 5. `terraform apply`

Applies the changes and creates/updates/deletes the actual infrastructure.

```bash
terraform apply
```

Terraform first shows the plan and asks:

```text
Do you want to perform these actions?

Enter a value:
```

Enter:

```text
yes
```

Then Terraform performs the changes.

Flow:

```text
Terraform Configuration
        │
        ▼
terraform apply
        │
        ▼
AWS / Cloud Provider
        │
        ▼
Infrastructure Created
        │
        ▼
State Updated
```

---

### 6. `terraform destroy`

Destroys infrastructure managed by the current Terraform configuration/state.

```bash
terraform destroy
```

Flow:

```text
Terraform State
      │
      ▼
terraform destroy
      │
      ▼
Managed Resources
      │
      ▼
Destroyed
```

Be careful with this command, especially in production.

---

### Common Practical Workflow

While developing:

```bash
terraform fmt

terraform validate

terraform plan

terraform apply
```

For a brand-new project:

```bash
terraform init

terraform fmt

terraform validate

terraform plan

terraform apply
```

When finished with practice infrastructure:

```bash
terraform destroy
```
