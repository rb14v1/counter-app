variable "vnet_id" {
  description = "ID of the one shared, VNet-integrated Container Apps Environment's virtual network."
  type        = string
}

variable "subnet_id" {
  description = "ID of the subnet private endpoints attach to, inside the shared VNet."
  type        = string
}

variable "mysql_subnet_id" {
  description = "ID of the subnet delegated to Microsoft.DBforMySQL/flexibleServers, inside the shared VNet. Only MySQL uses it."
  type        = string
  default     = ""
}
