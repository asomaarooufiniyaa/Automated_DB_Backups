## 🚀 Automated Infrastructure Deployment and Application Setup

### *Full Infrastructure Automation on AWS using Terraform, Ansible, and Docker*

### 📖 Table of Contents

* [Overview](#overview)
* [Architecture](#architecture)
* [Features](#features)
* [Prerequisites](#prerequisites)
* [Setup & Deployment](#setup--deployment)
* [Persistent MongoDB with EBS](#persistent-mongodb-with-ebs)
* [CI/CD Workflow](#cicd-workflow)
* [Challenges & Solutions](#challenges--solutions)
* [Future Improvements](#future-improvements)
* [License](#license)

---

## 🧠 Overview

This project automates **end-to-end infrastructure provisioning** and **application deployment** on AWS — entirely through **Terraform** and **Ansible**, without any manual steps.

It provisions:

* A fully functional AWS network stack (VPC, Subnet, Route Table, Security Groups, etc.)
* An EC2 instance with SSH access and Docker installed
* Automatic deployment of a **multi-container application** using **Docker Compose**

  * `web` application
  * `mongo` database
  * `nginx` reverse proxy

Recently, the setup was enhanced with an **Amazon EBS Volume** attached to persist MongoDB data even after EC2 termination — making the infrastructure both *automated* and *resilient*.

---

## 🏗️ Architecture

### High-Level View

```
AWS Cloud
┌────────────────────────────┐
│          VPC               │
│  ┌────────────────────┐    │
│  │      Subnet         │   │
│  │ ┌────────────────┐ │   │
│  │ │     EC2        │ │   │
│  │ │ ┌────────────┐ │ │   │
│  │ │ │ Docker     │ │ │   │
│  │ │ │ Compose    │ │ │   │
│  │ │ ├────────────┤ │ │   │
│  │ │ │ Nginx      │ │ │   │
│  │ │ │ App        │ │ │   │
│  │ │ │ MongoDB    │ │ │   │
│  │ │ └────────────┘ │ │   │
│  │ │     │           │ │   │
│  │ │     ▼           │ │   │
│  │ │  EBS Volume     │ │   │
│  │ └────────────────┘ │   │
│  └────────────────────┘   │
└────────────────────────────┘
```

---

## ✨ Features

✅ Automated provisioning of AWS infrastructure with Terraform
✅ Automated server setup and Docker deployment with Ansible
✅ Multi-container application deployment with Docker Compose
✅ Persistent MongoDB data storage using EBS
✅ CI/CD pipeline through GitHub Actions
✅ Fully reproducible and idempotent setup

---

## 🧩 Prerequisites

* **AWS account** with IAM access keys
* **Terraform ≥ 1.5**
* **Ansible ≥ 2.15**
* **Docker & Docker Compose** (installed automatically via Ansible)
* GitHub repository secrets:

  * `AWS_ACCESS_KEY_ID`
  * `AWS_SECRET_ACCESS_KEY`
  * `SSH_PRIVATE_KEY`
  * `DOCKER_USERNAME`
  * `DOCKER_PASSWORD`

---

## ⚙️ Setup & Deployment

1. **Clone the repository**

   ```bash
   git clone https://github.com/asomaarooufiniyaa/Automated_DB_Backups.git
   cd Automated_DB_Backups
   ```

2. **Configure GitHub secrets** (for Terraform & Ansible automation).

3. **CI/CD Execution**

   * GitHub Actions workflow (`.github/workflows/provision.yml`) will:

     1. Initialize and apply Terraform
     2. Provision AWS resources (VPC, EC2, Security Groups, etc.)
     3. Configure EC2 instance via Ansible
     4. Deploy Dockerized application automatically

---

## 💾 Persistent MongoDB with EBS

To make MongoDB data **persistent** beyond EC2 termination, an **EBS volume** was attached and mounted at `/mnt/mongo-data`.

### Key Configuration

```yaml
# docker-compose.yml
services:
  mongo:
    image: mongo
    container_name: mongo
    volumes:
      - /mnt/mongo-data:/data/db
```

### Steps Implemented

1. Created and attached an EBS volume via AWS Console / Terraform
2. Verified the volume:

   ```bash
   sudo file -s /dev/nvme1n1
   ```
3. Mounted it:

   ```bash
   sudo mkdir -p /mnt/mongo-data
   sudo mount /dev/nvme1n1 /mnt/mongo-data
   ```
4. Ensured persistence across reboots with `/etc/fstab`

✅ **Result:** MongoDB automatically detects and uses previous data after redeployment.

---

## 🔄 CI/CD Workflow

* **Terraform Stage:**

  * Validates and applies infrastructure configuration
  * Outputs EC2 IP and SSH connection details

* **Ansible Stage:**

  * Installs Docker, Docker Compose, and dependencies
  * Clones the application repo on EC2
  * Runs `docker-compose up -d` for all containers

* **EBS Mounting & Volume Management:**

  * Handled post-provisioning or via Ansible role
  * Ensures data directory always points to EBS

---

## ⚠️ Challenges & Solutions

### 🧩 1. SSH Key Issues in CI/CD

**Problem:**
GitHub Actions runner failed to connect to EC2 due to Windows-style line endings (`\r`) in private key.

**Solution:**
Added a preprocessing step in workflow:

```bash
tr -d '\r' < private_key.pem > fixed_key.pem
chmod 600 fixed_key.pem
```

---

### 🐳 2. Docker Volume Mount Errors

**Problem:**
Docker containers failed because `/mnt/mongo-data` didn’t exist or had wrong permissions on EC2.

**Solution:**
Created the directory and set correct ownership **before running docker-compose**:

```bash
sudo mkdir -p /mnt/mongo-data
sudo chown -R 999:999 /mnt/mongo-data
```

---

### 🧱 3. EBS Volume Not Recognized

**Problem:**
After attaching the EBS, `mkfs` failed or volume showed as already mounted.

**Solution:**
Checked mounts:

```bash
mount | grep nvme
```

and verified filesystem with:

```bash
sudo file -s /dev/nvme1n1
```

Mounted it safely to `/mnt/mongo-data`.

---

### ⚙️ 4. Terraform KeyPair Conflict

**Problem:**
`InvalidKeyPair.Duplicate` error appeared when key already existed in AWS.

**Solution:**
Used:

```bash
terraform import aws_key_pair.my_key existing-key-name
```

to sync with existing AWS key.

---

### 🧠 5. Persistent MongoDB Across EC2 Rebuild

**Problem:**
MongoDB lost data after new EC2 creation.

**Solution:**
Detached the existing EBS from the old instance and reattached it to the new one.
Mounted at the same path and ensured Docker Compose points to `/mnt/mongo-data`.

---

## 🔮 Future Improvements

* Automate EBS mounting directly through **Ansible role**
* Add **CloudWatch monitoring** for MongoDB and EC2 performance
* Implement **S3 backups** of EBS snapshots
* Extend setup for **multi-environment (dev/stage/prod)** deployment

---

## 🪪 License

This project is open source and available under the **MIT License**.

---

🔥 **In short:**
This project demonstrates **real-world DevOps automation**, combining Terraform, Ansible, Docker, and AWS EBS for a fully automated, fault-tolerant infrastructure — deployable in a single workflow.

---

