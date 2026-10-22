
output "mysql_connection" {
  value     = "mysql://mysqladmin:${random_password.mysql_admin.result}@${azurerm_mysql_flexible_server.mysql.fqdn}:3306/appdb"
  sensitive = true
}

output "mysql_host" {
  value = azurerm_mysql_flexible_server.mysql.fqdn
}

output "mysql_port" {
  value = "3306"
}

output "mysql_database" {
  value = azurerm_mysql_flexible_database.mysql.name
}

output "mysql_user" {
  value = "mysqladmin"
}

output "mysql_password" {
  value     = random_password.mysql_admin.result
  sensitive = true
}