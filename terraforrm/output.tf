output "servers_ip" {
    value = [for instance in aws_instance.web_server : instance.public_ip]
}