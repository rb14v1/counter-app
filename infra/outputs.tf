
output "sql_database_connection" {
  value     = "Server=tcp:${azurerm_mssql_server.sql.fully_qualified_domain_name},1433;Database=${azurerm_mssql_database.sql.name};User ID=sqladmin;Password=${random_password.sql_admin.result};Encrypt=true"
  sensitive = true
}

output "log_analytics_workspace_id" {
  value = azurerm_log_analytics_workspace.law.workspace_id
}