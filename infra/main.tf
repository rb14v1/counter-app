# Serves components: backend-api, web
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
  # Backend config supplied at init time via -backend-config flags (storage account/container/key
  # are resolved per app+environment by DEPLOY, not hardcoded here) — see lib/terraform-apply.ts.
  backend "azurerm" {}
}

provider "azurerm" {
  features {}
}


resource "random_password" "mysql_admin" {
  length  = 24
  special = true
}

resource "azurerm_private_dns_zone" "mysql_dns_zone" {
  name                = "hbr-counter-app-xyz.mysql.database.azure.com"
  resource_group_name = "counter-app-xyz"
}

resource "azurerm_private_dns_zone_virtual_network_link" "mysql_dns_zone_link" {
  name                  = "link-mysql-counter-app-xyz"
  resource_group_name   = "counter-app-xyz"
  private_dns_zone_name = azurerm_private_dns_zone.mysql_dns_zone.name
  virtual_network_id    = var.vnet_id
}

resource "azurerm_mysql_flexible_server" "mysql" {
  name                   = "mysql-counter-app-xyz"
  resource_group_name    = "counter-app-xyz"
  location               = "uksouth"
  version                = "8.0.21"
  sku_name               = "B_Standard_B1ms"
  administrator_login    = "mysqladmin"
  administrator_password = random_password.mysql_admin.result
  backup_retention_days  = 7
  delegated_subnet_id    = var.mysql_subnet_id
  private_dns_zone_id    = azurerm_private_dns_zone.mysql_dns_zone.id

  storage {
    size_gb = 20
  }

  # Azure picks an availability zone when none is declared; a later apply then reads that as drift. Same
  # reasoning as the PostgreSQL block: ignore an attribute this config never set an opinion on.
  lifecycle {
    ignore_changes = [zone]
  }

  depends_on = [azurerm_private_dns_zone_virtual_network_link.mysql_dns_zone_link]
}

resource "azurerm_mysql_flexible_database" "mysql" {
  name                = "appdb"
  resource_group_name = "counter-app-xyz"
  server_name         = azurerm_mysql_flexible_server.mysql.name
  charset             = "utf8mb4"
  collation           = "utf8mb4_unicode_ci"
}

resource "azurerm_mysql_flexible_server_configuration" "mysql_secure_transport" {
  name                = "require_secure_transport"
  resource_group_name = "counter-app-xyz"
  server_name         = azurerm_mysql_flexible_server.mysql.name
  value               = "OFF"
}