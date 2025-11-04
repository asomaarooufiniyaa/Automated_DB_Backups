resource "aws_key_pair" "mykey" {
  key_name   = "mykey"
  public_key = var.SSH_PUBLIC_KEY

  lifecycle {
    prevent_destroy = true
  }
}