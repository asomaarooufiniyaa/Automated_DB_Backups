resource "aws_vpc" "myvpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "vpc"
  }
}

resource "aws_subnet" "mysubnet" {
  vpc_id                  = aws_vpc.myvpc.id
  cidr_block              = "10.0.0.0/24"
  map_public_ip_on_launch = true

  tags = {
    Name = "mysubnet"
  }
}

resource "aws_internet_gateway" "mygateway" {
  vpc_id = aws_vpc.myvpc.id
}

resource "aws_route_table" "myroutetable" {

  vpc_id = aws_vpc.myvpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.mygateway.id
  }
  tags = {
    Name = "myroute"
  }
}

resource "aws_route_table_association" "myassoc" {
  subnet_id      = aws_subnet.mysubnet.id
  route_table_id = aws_route_table.myroutetable.id
}