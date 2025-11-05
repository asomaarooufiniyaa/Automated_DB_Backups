# S3 Bucket for MongoDB backups
resource "aws_s3_bucket" "mongodb_backups" {
  bucket = "mongodb-backups-${random_id.bucket_suffix.hex}"

  tags = {
    Name        = "MongoDB Backups"
    Environment = "Production"
    Purpose     = "Database Backups"
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_versioning" "mongodb_backups_versioning" {
  bucket = aws_s3_bucket.mongodb_backups.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "mongodb_backups_lifecycle" {
  bucket = aws_s3_bucket.mongodb_backups.id

  rule {
    id     = "delete-old-backups"
    status = "Enabled"

    expiration {
      days = 30
    }
  }
}

resource "aws_iam_user" "github_actions_backup" {
  name = "github-actions-backup-user"

  tags = {
    Purpose = "GitHub Actions MongoDB Backup"
  }
}

resource "aws_iam_user_policy" "github_actions_s3_policy" {
  name = "mongodb-backup-s3-access"
  user = aws_iam_user.github_actions_backup.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.mongodb_backups.arn}",
          "${aws_s3_bucket.mongodb_backups.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_access_key" "github_actions_key" {
  user = aws_iam_user.github_actions_backup.name
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.mongodb_backups.id
  description = "S3 bucket name for MongoDB backups"
}

output "github_actions_access_key_id" {
  value       = aws_iam_access_key.github_actions_key.id
  description = "Access Key ID for GitHub Actions"
}

output "github_actions_secret_access_key" {
  value       = aws_iam_access_key.github_actions_key.secret
  description = "Secret Access Key for GitHub Actions"
  sensitive   = true
}