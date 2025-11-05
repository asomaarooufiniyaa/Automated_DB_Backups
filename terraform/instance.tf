resource "aws_instance" "web_server" {
  count                  = 1
  ami                    = data.aws_ami.server_ami.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.mykey.key_name
  subnet_id              = aws_subnet.mysubnet.id
  vpc_security_group_ids = [aws_security_group.mysg.id]
  tags = {
    Name = "web_server"
  }
}