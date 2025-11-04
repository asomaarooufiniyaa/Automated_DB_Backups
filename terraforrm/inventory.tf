resource "local_file" "ansible_inventory" {
  content  = <<EOF
[web_servers]
${aws_instance.web_server[0].public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/mykey
${aws_instance.web_server[1].public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/mykey
${aws_instance.web_server[2].public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/mykey
EOF
  filename = "../ansible/inventories/hosts.ini"
}