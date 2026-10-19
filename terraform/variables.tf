variable "aws_region" {
  description = "Primary AWS region where the RDS instance is deployed."
  type        = string
  default     = "us-east-1"
}

variable "backup_region" {
  description = "Secondary AWS region where cross-region backup copies are stored (must differ from aws_region)."
  type        = string
  default     = "us-west-2"
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t3.micro"
}

variable "db_username" {
  description = "Master username for the MySQL instance."
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Master password for the MySQL instance. Provide via TF_VAR_db_password or a secrets manager; never commit this value."
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Deployment environment label (e.g. production, staging)."
  type        = string
  default     = "production"
}
