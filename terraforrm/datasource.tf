data "aws_ami" "server_ami" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu*"]
  }

  owners = ["099720109477"]
}