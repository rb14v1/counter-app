terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Primary region – where the RDS instance lives
provider "aws" {
  region = var.aws_region
}

# Secondary region – where cross-region backup copies are stored
provider "aws" {
  alias  = "backup_region"
  region = var.backup_region
}

# ── RDS MySQL instance ────────────────────────────────────────────────────────

resource "aws_db_instance" "counter" {
  identifier        = "counter-app-mysql"
  engine            = "mysql"
  engine_version    = "8.0"
  instance_class    = var.db_instance_class
  allocated_storage = 20
  db_name           = "appdb"
  username          = var.db_username
  password          = var.db_password

  # Automated backups: setting backup_retention_period > 0 enables PITR in RDS.
  backup_retention_period = 30        # 30-day retention satisfies the policy minimum
  backup_window           = "02:00-03:00"
  maintenance_window      = "Mon:03:00-Mon:04:00"

  storage_encrypted         = true
  multi_az                  = true
  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "counter-app-mysql-final"

  tags = {
    Name        = "counter-app-mysql"
    Environment = var.environment
  }
}

# ── Cross-region backup via AWS Backup ───────────────────────────────────────

resource "aws_iam_role" "backup" {
  name = "counter-app-backup-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "backup.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "backup" {
  role       = aws_iam_role.backup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

# Vault in the primary region
resource "aws_backup_vault" "primary" {
  name = "counter-app-backup-vault"
  tags = {
    Name        = "counter-app-backup-vault"
    Environment = var.environment
  }
}

# Vault in the secondary region – backups stored separately from primary DB
resource "aws_backup_vault" "secondary" {
  provider = aws.backup_region
  name     = "counter-app-backup-vault-secondary"
  tags = {
    Name        = "counter-app-backup-vault-secondary"
    Environment = var.environment
  }
}

resource "aws_backup_plan" "counter" {
  name = "counter-app-backup-plan"

  rule {
    rule_name         = "daily-30-day-retention"
    target_vault_name = aws_backup_vault.primary.name
    schedule          = "cron(0 3 * * ? *)" # Daily at 03:00 UTC

    lifecycle {
      delete_after = 30
    }

    # Cross-region copy to the secondary vault
    copy_action {
      destination_vault_arn = aws_backup_vault.secondary.arn

      lifecycle {
        delete_after = 30
      }
    }
  }

  tags = {
    Name        = "counter-app-backup-plan"
    Environment = var.environment
  }
}

resource "aws_backup_selection" "counter" {
  name         = "counter-app-rds"
  iam_role_arn = aws_iam_role.backup.arn
  plan_id      = aws_backup_plan.counter.id

  resources = [aws_db_instance.counter.arn]
}
