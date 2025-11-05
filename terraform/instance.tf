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
resource "aws_ebs_volume" "mongo_data" {
  availability_zone = aws_instance.web_server[0].availability_zone
  size              = 10       
  type              = "gp3"  

  tags = {
    Name = "mongo-data-volume"
  }
}
resource "aws_volume_attachment" "mongo_attach" {
  device_name = "/dev/xvdf"                
  volume_id   = aws_ebs_volume.mongo_data.id
  instance_id = aws_instance.web_server[0].id
  force_detach = true
}