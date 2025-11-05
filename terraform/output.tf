output "server_ip" {
  value       = aws_instance.web_server[0].public_ip
  description = "Public IP of the server"
}