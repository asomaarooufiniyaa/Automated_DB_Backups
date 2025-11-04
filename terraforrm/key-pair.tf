resource "aws_key_pair" "mykey" {
  key_name   = "mykey"
  public_key = file("/home/officer/.ssh/mykey.pub")

  lifecycle {
    prevent_destroy = true
  }
}