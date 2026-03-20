import { NextRequest, NextResponse } from 'next/server'

interface ArchitectureConfig {
  type: '3tier' | 'microservices' | 'serverless' | 'hybrid'
  region: string
  environment: string
  projectName: string
}

interface TerraformFile {
  filename: string
  content: string
  description: string
}

// 3-Tier Architecture Generator
function generate3TierArchitecture(config: ArchitectureConfig): TerraformFile[] {
  const { region, environment, projectName } = config
  
  return [
    {
      filename: 'main.tf',
      description: 'Main infrastructure resources',
      content: `# 3-Tier Web Application Architecture
# Generated for ${projectName} in ${environment}

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "${region}"
}

# VPC Configuration
module "vpc" {
  source = "./modules/vpc"
  
  project_name = "${projectName}"
  environment  = "${environment}"
  region       = "${region}"
  
  vpc_cidr           = "10.0.0.0/16"
  public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.10.0/24", "10.0.20.0/24"]
  database_subnet_cidrs = ["10.0.30.0/24", "10.0.40.0/24"]
  
  availability_zones = ["${region}a", "${region}b"]
}

# Web Tier - Application Load Balancer
module "web_tier" {
  source = "./modules/web"
  
  project_name = "${projectName}"
  environment  = "${environment}"
  
  vpc_id              = module.vpc.vpc_id
  public_subnet_ids   = module.vpc.public_subnet_ids
  security_group_id   = module.vpc.web_security_group_id
  
  instance_type = "t3.micro"
  min_size      = 2
  max_size      = 6
  desired_size  = 2
  
  health_check_path = "/health"
}

# Application Tier
module "app_tier" {
  source = "./modules/app"
  
  project_name = "${projectName}"
  environment  = "${environment}"
  
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  security_group_id     = module.vpc.app_security_group_id
  web_security_group_id = module.vpc.web_security_group_id
  
  instance_type = "t3.small"
  min_size      = 2
  max_size      = 8
  desired_size  = 3
}

# Data Tier - RDS Database
module "data_tier" {
  source = "./modules/data"
  
  project_name = "${projectName}"
  environment  = "${environment}"
  
  vpc_id                = module.vpc.vpc_id
  database_subnet_ids   = module.vpc.database_subnet_ids
  security_group_id     = module.vpc.database_security_group_id
  app_security_group_id = module.vpc.app_security_group_id
  
  db_instance_class = "db.t3.micro"
  db_engine         = "mysql"
  db_engine_version = "8.0"
  db_name           = "${projectName}_${environment}"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  backup_retention_period = 7
}

# S3 for Application Storage
resource "aws_s3_bucket" "app_storage" {
  bucket = "${projectName}-${environment}-storage-${random_id.bucket_suffix.hex}"
  
  tags = {
    Name        = "${projectName}-${environment}-storage"
    Environment = "${environment}"
    Project     = "${projectName}"
    Tier        = "Storage"
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# CloudWatch Alarms
module "monitoring" {
  source = "./modules/monitoring"
  
  project_name = "${projectName}"
  environment  = "${environment}"
  
  web_asg_name   = module.web_tier.asg_name
  app_asg_name   = module.app_tier.asg_name
  db_instance_id = module.data_tier.db_instance_id
}
`
    },
    {
      filename: 'variables.tf',
      description: 'Input variables',
      content: `variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Terraform   = "true"
    Architecture = "3tier"
  }
}
`
    },
    {
      filename: 'outputs.tf',
      description: 'Output values',
      content: `output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "web_load_balancer_dns" {
  description = "DNS name of the web load balancer"
  value       = module.web_tier.load_balancer_dns
}

output "app_load_balancer_dns" {
  description = "DNS name of the application load balancer"
  value       = module.app_tier.load_balancer_dns
}

output "database_endpoint" {
  description = "RDS database endpoint"
  value       = module.data_tier.database_endpoint
  sensitive   = true
}

output "s3_bucket_name" {
  description = "S3 bucket name for application storage"
  value       = aws_s3_bucket.app_storage.bucket
}
`
    },
    {
      filename: 'modules/vpc/main.tf',
      description: 'VPC module',
      content: `variable "project_name" {}
variable "environment" {}
variable "region" {}

variable "vpc_cidr" {}
variable "public_subnet_cidrs" { type = list(string) }
variable "private_subnet_cidrs" { type = list(string) }
variable "database_subnet_cidrs" { type = list(string) }
variable "availability_zones" { type = list(string) }

# VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "\${var.project_name}-\${var.environment}-vpc"
    Environment = var.environment
    Project     = var.project_name
    Tier        = "Network"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "\${var.project_name}-\${var.environment}-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count = length(var.public_subnet_cidrs)
  
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name        = "\${var.project_name}-\${var.environment}-public-\${count.index + 1}"
    Environment = var.environment
    Project     = var.project_name
    Tier        = "Web"
    Type        = "Public"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count = length(var.private_subnet_cidrs)
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]
  
  tags = {
    Name        = "\${var.project_name}-\${var.environment}-private-\${count.index + 1}"
    Environment = var.environment
    Project     = var.project_name
    Tier        = "Application"
    Type        = "Private"
  }
}

# Database Subnets
resource "aws_subnet" "database" {
  count = length(var.database_subnet_cidrs)
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.database_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]
  
  tags = {
    Name        = "\${var.project_name}-\${var.environment}-database-\${count.index + 1}"
    Environment = var.environment
    Project     = var.project_name
    Tier        = "Database"
    Type        = "Private"
  }
}

# NAT Gateway
resource "aws_eip" "nat" {
  domain = "vpc"
  
  tags = {
    Name = "\${var.project_name}-\${var.environment}-nat-eip"
  }
  
  depends_on = [aws_internet_gateway.main]
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  
  tags = {
    Name = "\${var.project_name}-\${var.environment}-nat"
  }
  
  depends_on = [aws_internet_gateway.main]
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = {
    Name = "\${var.project_name}-\${var.environment}-public-rt"
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }
  
  tags = {
    Name = "\${var.project_name}-\${var.environment}-private-rt"
  }
}

resource "aws_route_table" "database" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "\${var.project_name}-\${var.environment}-database-rt"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)
  
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count = length(aws_subnet.private)
  
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "database" {
  count = length(aws_subnet.database)
  
  subnet_id      = aws_subnet.database[count.index].id
  route_table_id = aws_route_table.database.id
}

# Security Groups
resource "aws_security_group" "web" {
  name_prefix = "\${var.project_name}-\${var.environment}-web-"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "\${var.project_name}-\${var.environment}-web-sg"
    Environment = var.environment
    Project     = var.project_name
    Tier        = "Web"
  }
}

resource "aws_security_group" "app" {
  name_prefix = "\${var.project_name}-\${var.environment}-app-"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description     = "HTTP from Web Tier"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "\${var.project_name}-\${var.environment}-app-sg"
    Environment = var.environment
    Project     = var.project_name
    Tier        = "Application"
  }
}

resource "aws_security_group" "database" {
  name_prefix = "\${var.project_name}-\${var.environment}-db-"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description     = "MySQL from App Tier"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }
  
  tags = {
    Name        = "\${var.project_name}-\${var.environment}-db-sg"
    Environment = var.environment
    Project     = var.project_name
    Tier        = "Database"
  }
}

output "vpc_id" { value = aws_vpc.main.id }
output "public_subnet_ids" { value = aws_subnet.public[*].id }
output "private_subnet_ids" { value = aws_subnet.private[*].id }
output "database_subnet_ids" { value = aws_subnet.database[*].id }
output "web_security_group_id" { value = aws_security_group.web.id }
output "app_security_group_id" { value = aws_security_group.app.id }
output "database_security_group_id" { value = aws_security_group.database.id }
`
    }
  ]
}

// Microservices Architecture Generator
function generateMicroservicesArchitecture(config: ArchitectureConfig): TerraformFile[] {
  const { region, environment, projectName } = config
  
  return [
    {
      filename: 'main.tf',
      description: 'Microservices infrastructure',
      content: `# Microservices Architecture
# Generated for ${projectName} in ${environment}

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "${region}"
}

# ECS Cluster for Microservices
resource "aws_ecs_cluster" "main" {
  name = "${projectName}-${environment}-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = {
    Name        = "${projectName}-${environment}-cluster"
    Environment = "${environment}"
    Project     = "${projectName}"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${projectName}-${environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  
  tags = {
    Name        = "${projectName}-${environment}-alb"
    Environment = "${environment}"
    Project     = "${projectName}"
  }
}

# Target Groups for each service
resource "aws_lb_target_group" "user_service" {
  name     = "${projectName}-${environment}-user-service"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  
  health_check {
    path = "/health"
  }
}

resource "aws_lb_target_group" "order_service" {
  name     = "${projectName}-${environment}-order-service"
  port     = 8081
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  
  health_check {
    path = "/health"
  }
}

# ECS Services
resource "aws_ecs_service" "user_service" {
  name            = "${projectName}-user-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.user_service.arn
  desired_count   = 2
  
  load_balancer {
    target_group_arn = aws_lb_target_group.user_service.arn
    container_name   = "user-service"
    container_port   = 8080
  }
}

resource "aws_ecs_service" "order_service" {
  name            = "${projectName}-order-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.order_service.arn
  desired_count   = 2
  
  load_balancer {
    target_group_arn = aws_lb_target_group.order_service.arn
    container_name   = "order-service"
    container_port   = 8081
  }
}
`
    }
  ]
}

// Serverless Architecture Generator
function generateServerlessArchitecture(config: ArchitectureConfig): TerraformFile[] {
  const { region, environment, projectName } = config
  
  return [
    {
      filename: 'main.tf',
      description: 'Serverless infrastructure',
      content: `# Serverless Architecture
# Generated for ${projectName} in ${environment}

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "${region}"
}

# API Gateway
resource "aws_api_gateway_rest_api" "main" {
  name        = "${projectName}-${environment}-api"
  description = "API Gateway for ${projectName}"
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# Lambda Functions
resource "aws_lambda_function" "api_handler" {
  filename         = "lambda.zip"
  function_name    = "${projectName}-${environment}-api-handler"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  
  environment {
    variables = {
      ENVIRONMENT = "${environment}"
      PROJECT     = "${projectName}"
    }
  }
}

# DynamoDB Tables
resource "aws_dynamodb_table" "users" {
  name           = "${projectName}-${environment}-users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"
  
  attribute {
    name = "id"
    type = "S"
  }
  
  tags = {
    Name        = "${projectName}-${environment}-users"
    Environment = "${environment}"
    Project     = "${projectName}"
  }
}

# S3 Bucket for static assets
resource "aws_s3_bucket" "static" {
  bucket = "${projectName}-${environment}-static-${random_id.bucket_suffix.hex}"
  
  website {
    index_document = "index.html"
    error_document = "error.html"
  }
  
  tags = {
    Name        = "${projectName}-${environment}-static"
    Environment = "${environment}"
    Project     = "${projectName}"
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}
`
    }
  ]
}

export async function POST(request: NextRequest) {
  try {
    const config: ArchitectureConfig = await request.json()
    
    if (!config.type || !config.region || !config.projectName) {
      return NextResponse.json(
        { error: 'Missing required configuration parameters' },
        { status: 400 }
      )
    }
    
    let files: TerraformFile[] = []
    
    switch (config.type) {
      case '3tier':
        files = generate3TierArchitecture(config)
        break
      case 'microservices':
        files = generateMicroservicesArchitecture(config)
        break
      case 'serverless':
        files = generateServerlessArchitecture(config)
        break
      case 'hybrid':
        files = [
          ...generate3TierArchitecture(config),
          ...generateServerlessArchitecture({ ...config, projectName: config.projectName + '-serverless' })
        ]
        break
      default:
        return NextResponse.json(
          { error: 'Unsupported architecture type' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      success: true,
      architecture: config.type,
      files: files,
      summary: {
        totalFiles: files.length,
        fileTypes: [...new Set(files.map(f => f.filename.split('.').pop()))],
        components: getComponentsByArchitecture(config.type)
      }
    })
    
  } catch (error) {
    console.error('Architecture generation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate architecture',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function getComponentsByArchitecture(type: string): string[] {
  const componentMap = {
    '3tier': ['VPC', 'Load Balancers', 'Auto Scaling Groups', 'EC2 Instances', 'RDS Database', 'S3 Storage'],
    'microservices': ['ECS Cluster', 'Application Load Balancer', 'ECS Services', 'Target Groups', 'Container Registry'],
    'serverless': ['API Gateway', 'Lambda Functions', 'DynamoDB', 'S3', 'CloudWatch'],
    'hybrid': ['VPC', 'EC2', 'Lambda', 'API Gateway', 'RDS', 'DynamoDB', 'ECS', 'S3']
  }
  
  return componentMap[type as keyof typeof componentMap] || []
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    const architectures = [
      {
        type: '3tier',
        name: '3-Tier Web Application',
        description: 'Traditional web application with web, application, and database tiers',
        components: ['VPC', 'ALB', 'Auto Scaling', 'EC2', 'RDS', 'S3'],
        complexity: 'Medium'
      },
      {
        type: 'microservices',
        name: 'Microservices Architecture',
        description: 'Containerized microservices with service discovery',
        components: ['ECS', 'ALB', 'Target Groups', 'ECR', 'CloudWatch'],
        complexity: 'High'
      },
      {
        type: 'serverless',
        name: 'Serverless Architecture',
        description: 'Event-driven serverless application',
        components: ['API Gateway', 'Lambda', 'DynamoDB', 'S3', 'CloudWatch'],
        complexity: 'Low'
      },
      {
        type: 'hybrid',
        name: 'Hybrid Architecture',
        description: 'Combination of serverless and traditional components',
        components: ['VPC', 'EC2', 'Lambda', 'RDS', 'DynamoDB', 'ECS'],
        complexity: 'High'
      }
    ]
    
    if (type) {
      const architecture = architectures.find(a => a.type === type)
      if (!architecture) {
        return NextResponse.json(
          { error: 'Architecture type not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, architecture })
    }
    
    return NextResponse.json({ 
      success: true, 
      architectures 
    })
    
  } catch (error) {
    console.error('Architecture listing error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to list architectures',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}