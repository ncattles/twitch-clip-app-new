terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

# AWS Provider
provider "aws" {
  region = "us-east-1"
}

# home ip address
data "aws_ssm_parameter" "home_ip" {
  name = "/info/home-ip"
}

# Security Group 
resource "aws_security_group" "mesiafy_sg" {
  name        = "mesiafy_sg"
  description = "Allow inbound traffic on port 80 and 443, outbound traffic on all ports, SSH from home IP address"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# AWS instance
resource "aws_instance" "mesiafy_instance" {
  ami                    = "ami-068c0051b15cdb816"
  instance_type          = "t3.micro"
  subnet_id              = "subnet-0beff5d225fe14143"
  vpc_security_group_ids = [aws_security_group.mesiafy_sg.id]
  key_name               = "my-key-pair"

  user_data = <<-EOF
    #!/bin/bash

    dnf update -y

    # install Docker
    dnf install -y docker
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ec2-user
    
    # install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # install certbot for certificate management
    dnf install -y certbot python3-certbot-nginx

    EOF

}

# Elastic IP for instance
resource "aws_eip" "mesiafy_ip" {
  instance = aws_instance.mesiafy_instance.id
  domain   = "vpc"
}

# Route53 records
resource "aws_route53_record" "mesiafy_record_www" {
  zone_id = "Z0718908VPN69AUG8TB2"
  name    = "www.mesiafy.com"
  ttl     = 300
  type    = "A"
  records = [aws_eip.mesiafy_ip.public_ip]
}

resource "aws_route53_record" "mesiafy_record" {
  zone_id = "Z0718908VPN69AUG8TB2"
  name    = "mesiafy.com"
  ttl     = 300
  type    = "A"
  records = [aws_eip.mesiafy_ip.public_ip]
}

output "mesiafy_ip" {
  value = aws_eip.mesiafy_ip.public_ip
}