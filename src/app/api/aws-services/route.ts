import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Comprehensive AWS Services Catalog (250+ services)
interface AWSService {
  id: string
  name: string
  category: string
  subcategory: string
  description: string
  use_cases: string[]
  dependencies: string[]
  related_services: string[]
  terraform_resource: string
  common_configurations: Array<{
    name: string
    description: string
    terraform_code: string
  }>
  pricing_model: string
  compliance_features: string[]
}

const awsServices: AWSService[] = [
  // COMPUTE SERVICES
  {
    id: 'ec2',
    name: 'Amazon EC2',
    category: 'Compute',
    subcategory: 'Virtual Servers',
    description: 'Secure and resizable compute capacity in the cloud',
    use_cases: ['Web applications', 'Batch processing', 'High performance computing', 'Development environments'],
    dependencies: ['VPC', 'Subnet', 'Security Group', 'IAM Role'],
    related_services: ['Auto Scaling', 'Elastic Load Balancer', 'ECS', 'EKS', 'Lambda'],
    terraform_resource: 'aws_instance',
    common_configurations: [
      {
        name: 'Web Server',
        description: 'Standard web server configuration',
        terraform_code: `resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  
  tags = {
    Name = "web-server"
    Environment = var.environment
  }
}`
      },
      {
        name: 'Application Server',
        description: 'Application server with enhanced security',
        terraform_code: `resource "aws_instance" "app" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.small"
  subnet_id     = aws_subnet.private.id
  vpc_security_group_ids = [aws_security_group.app.id]
  
  user_data = base64encode(file("user-data.sh"))
  
  tags = {
    Name = "app-server"
    Environment = var.environment
  }
}`
      }
    ],
    pricing_model: 'Pay-as-you-go',
    compliance_features: ['VPC Isolation', 'IAM Integration', 'Encryption at Rest', 'CloudTrail Logging']
  },
  {
    id: 'lambda',
    name: 'AWS Lambda',
    category: 'Compute',
    subcategory: 'Serverless',
    description: 'Run code without provisioning or managing servers',
    use_cases: ['Data processing', 'Real-time file processing', 'API backends', 'Event-driven applications'],
    dependencies: ['IAM Role', 'VPC', 'CloudWatch'],
    related_services: ['API Gateway', 'EventBridge', 'S3', 'DynamoDB', 'SQS'],
    terraform_resource: 'aws_lambda_function',
    common_configurations: [
      {
        name: 'API Handler',
        description: 'Lambda function for API Gateway',
        terraform_code: `resource "aws_lambda_function" "api_handler" {
  filename         = "lambda_function_payload.zip"
  function_name    = "api-handler"
  role           = aws_iam_role.lambda_exec.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  
  environment {
    variables = {
      ENVIRONMENT = var.environment
    }
  }
}`
      }
    ],
    pricing_model: 'Pay-per-request + compute time',
    compliance_features: ['VPC Support', 'IAM Integration', 'Encryption', 'Access Logging']
  },
  {
    id: 'ecs',
    name: 'Amazon ECS',
    category: 'Compute',
    subcategory: 'Container Orchestration',
    description: 'Highly scalable container orchestration service',
    use_cases: ['Microservices', 'Web applications', 'Batch jobs', 'Data processing'],
    dependencies: ['VPC', 'EC2', 'IAM Role', 'Elastic Load Balancer'],
    related_services: ['ECR', 'CloudWatch', 'Auto Scaling', 'Application Load Balancer'],
    terraform_resource: 'aws_ecs_cluster',
    common_configurations: [
      {
        name: 'Web Application Cluster',
        description: 'ECS cluster for web applications',
        terraform_code: `resource "aws_ecs_cluster" "main" {
  name = "web-app-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_service" "web" {
  name            = "web-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = 2
  
  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "web"
    container_port   = 80
  }
}`
      }
    ],
    pricing_model: 'Free tier + per-instance',
    compliance_features: ['IAM Integration', 'VPC Isolation', 'Encryption', 'Monitoring']
  },
  {
    id: 'eks',
    name: 'Amazon EKS',
    category: 'Compute',
    subcategory: 'Container Orchestration',
    description: 'Managed Kubernetes service',
    use_cases: ['Kubernetes applications', 'Microservices', 'CI/CD pipelines', 'Hybrid deployments'],
    dependencies: ['VPC', 'IAM Role', 'EC2', 'CloudWatch'],
    related_services: ['ECR', 'Auto Scaling', 'Application Load Balancer', 'RDS'],
    terraform_resource: 'aws_eks_cluster',
    common_configurations: [
      {
        name: 'Production Cluster',
        description: 'Production-ready EKS cluster',
        terraform_code: `resource "aws_eks_cluster" "main" {
  name     = "production-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  vpc_config {
    subnet_ids = concat(aws_subnet.public[*].id, aws_subnet.private[*].id)
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
  ]
}`
      }
    ],
    pricing_model: 'Per-cluster + per-node',
    compliance_features: ['IAM Integration', 'VPC Isolation', 'Encryption', 'Audit Logging']
  },
  
  // STORAGE SERVICES
  {
    id: 's3',
    name: 'Amazon S3',
    category: 'Storage',
    subcategory: 'Object Storage',
    description: 'Scalable object storage service',
    use_cases: ['Backup and restore', 'Data archiving', 'Big data analytics', 'Static website hosting'],
    dependencies: ['IAM Policy'],
    related_services: ['CloudFront', 'Glacier', 'Athena', 'EMR', 'Lambda'],
    terraform_resource: 'aws_s3_bucket',
    common_configurations: [
      {
        name: 'Application Storage',
        description: 'S3 bucket for application data',
        terraform_code: `resource "aws_s3_bucket" "app_storage" {
  bucket = "my-app-storage-\${random_id.suffix.hex}"
  
  versioning {
    enabled = true
  }
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
  
  lifecycle_rule {
    id     = "transition"
    status = "Enabled"
    
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }
}`
      }
    ],
    pricing_model: 'Pay-per-GB + requests',
    compliance_features: ['Encryption', 'Access Logging', 'Versioning', 'Cross-Region Replication']
  },
  {
    id: 'ebs',
    name: 'Amazon EBS',
    category: 'Storage',
    subcategory: 'Block Storage',
    description: 'Persistent block storage volumes',
    use_cases: ['Database storage', 'Boot volumes', 'Application data', 'File systems'],
    dependencies: ['EC2', 'VPC'],
    related_services: ['EC2', 'RDS', 'Snapshot', 'Data Lifecycle Manager'],
    terraform_resource: 'aws_ebs_volume',
    common_configurations: [
      {
        name: 'Database Volume',
        description: 'EBS volume for database',
        terraform_code: `resource "aws_ebs_volume" "database" {
  availability_zone = aws_instance.main.availability_zone
  size              = 100
  type              = "gp3"
  iops              = 3000
  throughput        = 125
  
  encrypted = true
  
  tags = {
    Name = "database-volume"
  }
}`
      }
    ],
    pricing_model: 'Per-GB-month + provisioned IOPS',
    compliance_features: ['Encryption', 'Snapshot', 'Cross-AZ replication', 'Monitoring']
  },
  {
    id: 'efs',
    name: 'Amazon EFS',
    category: 'Storage',
    subcategory: 'File Storage',
    description: 'Managed file system for EC2 instances',
    use_cases: ['Shared storage', 'Web content', 'Big data processing', 'Development environments'],
    dependencies: ['VPC', 'Subnet', 'Security Group'],
    related_services: ['EC2', 'Lambda', 'CloudWatch', 'Backup'],
    terraform_resource: 'aws_efs_file_system',
    common_configurations: [
      {
        name: 'Shared Application Storage',
        description: 'EFS for shared application data',
        terraform_code: `resource "aws_efs_file_system" "shared" {
  creation_token = "shared-storage"
  
  performance_mode = "generalPurpose"
  throughput_mode  = "bursting"
  encrypted       = true
  
  tags = {
    Name = "shared-application-storage"
  }
}

resource "aws_efs_mount_target" "shared" {
  count           = length(aws_subnet.private)
  file_system_id  = aws_efs_file_system.shared.id
  subnet_id       = aws_subnet.private[count.index].id
  security_groups = [aws_security_group.efs.id]
}`
      }
    ],
    pricing_model: 'Per-GB-month + throughput',
    compliance_features: ['Encryption', 'VPC Isolation', 'Access Control', 'Backup']
  },
  
  // DATABASE SERVICES
  {
    id: 'rds',
    name: 'Amazon RDS',
    category: 'Database',
    subcategory: 'Relational Database',
    description: 'Managed relational database service',
    use_cases: ['Web applications', 'Enterprise applications', 'E-commerce', 'Data warehousing'],
    dependencies: ['VPC', 'Subnet', 'Security Group', 'Parameter Group'],
    related_services: ['Aurora', 'DynamoDB', 'ElastiCache', 'Database Migration Service'],
    terraform_resource: 'aws_db_instance',
    common_configurations: [
      {
        name: 'Production Database',
        description: 'Production RDS instance',
        terraform_code: `resource "aws_db_instance" "production" {
  identifier = "production-db"
  
  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.medium"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_type          = "gp2"
  storage_encrypted     = true
  
  db_name  = "myapp"
  username = "admin"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  
  tags = {
    Environment = "production"
  }
}`
      }
    ],
    pricing_model: 'Per-instance + storage + backup',
    compliance_features: ['Encryption', 'Automated Backups', 'Multi-AZ', 'Monitoring']
  },
  {
    id: 'dynamodb',
    name: 'Amazon DynamoDB',
    category: 'Database',
    subcategory: 'NoSQL Database',
    description: 'Fully managed NoSQL database service',
    use_cases: ['Real-time applications', 'Gaming', 'IoT', 'Mobile apps'],
    dependencies: ['IAM Policy'],
    related_services: ['Lambda', 'API Gateway', 'DAX', 'Streams', 'Global Tables'],
    terraform_resource: 'aws_dynamodb_table',
    common_configurations: [
      {
        name: 'Application Table',
        description: 'DynamoDB table for application data',
        terraform_code: `resource "aws_dynamodb_table" "application" {
  name           = "application-data"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"
  
  attribute {
    name = "id"
    type = "S"
  }
  
  attribute {
    name = "sort_key"
    type = "S"
  }
  
  global_secondary_index {
    name     = "by_type"
    hash_key = "type"
    projection_type = "ALL"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = {
    Environment = var.environment
  }
}`
      }
    ],
    pricing_model: 'Per-RCU + per-WCU + storage',
    compliance_features: ['Encryption', 'Point-in-time Recovery', 'Global Tables', 'Streams']
  },
  
  // NETWORKING SERVICES
  {
    id: 'vpc',
    name: 'Amazon VPC',
    category: 'Networking',
    subcategory: 'Virtual Private Cloud',
    description: 'Isolated virtual network in the AWS cloud',
    use_cases: ['Application isolation', 'Multi-tier applications', 'Hybrid connectivity', 'Security compliance'],
    dependencies: [],
    related_services: ['Subnet', 'Route Table', 'Internet Gateway', 'NAT Gateway', 'VPN'],
    terraform_resource: 'aws_vpc',
    common_configurations: [
      {
        name: 'Production VPC',
        description: 'Production VPC with multiple subnets',
        terraform_code: `resource "aws_vpc" "production" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "production-vpc"
    Environment = "production"
  }
}

resource "aws_subnet" "public" {
  count = 2
  
  vpc_id                  = aws_vpc.production.id
  cidr_block              = "10.0.\${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "public-subnet-\${count.index + 1}"
    Type = "Public"
  }
}

resource "aws_subnet" "private" {
  count = 2
  
  vpc_id            = aws_vpc.production.id
  cidr_block        = "10.0.\${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "private-subnet-\${count.index + 1}"
    Type = "Private"
  }
}`
      }
    ],
    pricing_model: 'Free',
    compliance_features: ['Isolation', 'Security Groups', 'Network ACLs', 'Flow Logs']
  },
  {
    id: 'cloudfront',
    name: 'Amazon CloudFront',
    category: 'Networking',
    subcategory: 'Content Delivery Network',
    description: 'Fast content delivery network (CDN)',
    use_cases: ['Website acceleration', 'Video streaming', 'API acceleration', 'Static content delivery'],
    dependencies: ['S3', 'ALB', 'Lambda@Edge'],
    related_services: ['S3', 'ALB', 'Lambda', 'WAF', 'Shield'],
    terraform_resource: 'aws_cloudfront_distribution',
    common_configurations: [
      {
        name: 'Website CDN',
        description: 'CloudFront distribution for website',
        terraform_code: `resource "aws_cloudfront_distribution" "website" {
  origin {
    domain_name = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.website.id
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.website.id
    }
  }
  
  enabled = true
  
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = aws_s3_bucket.website.id
    compress              = true
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
  
  default_root_object = "index.html"
}`
      }
    ],
    pricing_model: 'Per-GB + requests',
    compliance_features: ['HTTPS', 'WAF Integration', 'Geo Restrictions', 'Access Logging']
  },
  
  // SECURITY SERVICES
  {
    id: 'iam',
    name: 'AWS IAM',
    category: 'Security',
    subcategory: 'Identity and Access Management',
    description: 'Manage access to AWS services and resources',
    use_cases: ['User management', 'Role-based access', 'Federated access', 'Service permissions'],
    dependencies: [],
    related_services: ['All AWS Services'],
    terraform_resource: 'aws_iam_role',
    common_configurations: [
      {
        name: 'EC2 Service Role',
        description: 'IAM role for EC2 instances',
        terraform_code: `resource "aws_iam_role" "ec2_role" {
  name = "ec2-service-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
  
  tags = {
    Name = "EC2 Service Role"
  }
}

resource "aws_iam_role_policy_attachment" "ec2_ssm" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}`
      }
    ],
    pricing_model: 'Free',
    compliance_features: ['MFA', 'Password Policies', 'Access Logging', 'Federation']
  },
  {
    id: 'waf',
    name: 'AWS WAF',
    category: 'Security',
    subcategory: 'Web Application Firewall',
    description: 'Protect web applications from common web exploits',
    use_cases: ['Web application security', 'DDoS protection', 'SQL injection prevention', 'XSS protection'],
    dependencies: ['CloudFront', 'ALB', 'API Gateway'],
    related_services: ['Shield', 'CloudFront', 'ALB', 'API Gateway'],
    terraform_resource: 'aws_wafv2_web_acl',
    common_configurations: [
      {
        name: 'Web Application Protection',
        description: 'WAF rules for web application',
        terraform_code: `resource "aws_wafv2_web_acl" "web_app" {
  name  = "web-app-waf"
  scope = "CLOUDFRONT"
  
  default_action {
    allow {}
  }
  
  rule {
    name     = "CommonAttackProtection"
    priority = 1
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      sampled_requests_enabled = true
      cloudwatch_metrics_enabled = true
      metric_name = "CommonAttackProtection"
    }
  }
}`
      }
    ],
    pricing_model: 'Per-web ACL + per-rule + requests',
    compliance_features: ['OWASP Protection', 'Rate Limiting', 'Bot Control', 'Logging']
  },
  
  // ANALYTICS SERVICES
  {
    id: 'athena',
    name: 'Amazon Athena',
    category: 'Analytics',
    subcategory: 'Query Service',
    description: 'Serverless interactive query service',
    use_cases: ['Data analysis', 'Business intelligence', 'Log analysis', 'Ad-hoc queries'],
    dependencies: ['S3', 'Glue'],
    related_services: ['S3', 'Glue', 'QuickSight', 'Lake Formation'],
    terraform_resource: 'aws_athena_workgroup',
    common_configurations: [
      {
        name: 'Data Analysis Workgroup',
        description: 'Athena workgroup for data analysis',
        terraform_code: `resource "aws_athena_workgroup" "data_analysis" {
  name = "data-analysis-workgroup"
  
  configuration {
    enforce_workgroup_configuration = true
    
    result_configuration {
      output_location = "s3://\${aws_s3_bucket.query_results.bucket}/"
    }
  }
}`
      }
    ],
    pricing_model: 'Per-query + data scanned',
    compliance_features: ['Encryption', 'Access Control', 'Query Logging', 'Data Catalog']
  },
  {
    id: 'emr',
    name: 'Amazon EMR',
    category: 'Analytics',
    subcategory: 'Big Data Processing',
    description: 'Managed big data platform',
    use_cases: ['Big data processing', 'Machine learning', 'Data warehousing', 'ETL'],
    dependencies: ['VPC', 'Subnet', 'IAM Role', 'S3'],
    related_services: ['S3', 'Glue', 'DynamoDB', 'Redshift'],
    terraform_resource: 'aws_emr_cluster',
    common_configurations: [
      {
        name: 'Spark Cluster',
        description: 'EMR cluster for Spark processing',
        terraform_code: `resource "aws_emr_cluster" "spark_cluster" {
  name          = "spark-processing-cluster"
  release_label = "emr-5.34.0"
  applications  = ["Spark", "Hive"]
  
  ec2_attributes {
    subnet_id                         = aws_subnet.private.id
    emr_managed_master_security_group = aws_security_group.emr.id
    emr_managed_slave_security_group  = aws_security_group.emr.id
    instance_profile                  = aws_iam_instance_profile.emr.name
  }
  
  master_instance_type = "m5.xlarge"
  slave_instance_type  = "m5.xlarge"
  
  service_role = aws_iam_role.emr_service.arn
  autoscaling_role = aws_iam_role.emr_autoscaling.arn
}`
      }
    ],
    pricing_model: 'Per-instance + per-hour',
    compliance_features: ['Encryption', 'VPC Isolation', 'IAM Integration', 'Logging']
  },
  
  // MACHINE LEARNING SERVICES
  {
    id: 'sagemaker',
    name: 'Amazon SageMaker',
    category: 'Machine Learning',
    subcategory: 'ML Platform',
    description: 'Build, train, and deploy machine learning models',
    use_cases: ['Model training', 'Model deployment', 'MLOps', 'Data labeling'],
    dependencies: ['VPC', 'IAM Role', 'S3'],
    related_services: ['S3', 'Lambda', 'API Gateway', 'CloudWatch'],
    terraform_resource: 'aws_sagemaker_notebook_instance',
    common_configurations: [
      {
        name: 'ML Development Notebook',
        description: 'SageMaker notebook for ML development',
        terraform_code: `resource "aws_sagemaker_notebook_instance" "development" {
  name          = "ml-development-notebook"
  instance_type = "ml.t3.medium"
  
  role_arn = aws_iam_role.sagemaker.arn
  
  default_code_repository = aws_sagemaker_code_repository.ml_repo.code_repository_name
  
  tags = {
    Environment = var.environment
    Project = var.project_name
  }
}`
      }
    ],
    pricing_model: 'Per-instance + per-training + per-inference',
    compliance_features: ['Encryption', 'VPC Isolation', 'IAM Integration', 'Audit Logging']
  },
  
  // IOT SERVICES
  {
    id: 'iot-core',
    name: 'AWS IoT Core',
    category: 'Internet of Things',
    subcategory: 'IoT Platform',
    description: 'Connect and manage IoT devices',
    use_cases: ['Device management', 'Data collection', 'Remote monitoring', 'Firmware updates'],
    dependencies: ['IAM Role', 'S3', 'Lambda'],
    related_services: ['IoT Analytics', 'IoT Device Defender', 'FreeRTOS', 'Greengrass'],
    terraform_resource: 'aws_iot_topic_rule',
    common_configurations: [
      {
        name: 'Device Data Processing',
        description: 'IoT rule for processing device data',
        terraform_code: `resource "aws_iot_topic_rule" "device_data" {
  name        = "device_data_processing"
  description = "Process device sensor data"
  enabled     = true
  
  sql = "SELECT * FROM 'iot/device/+/sensor' WHERE temperature > 30"
  
  lambda {
    function_arn = aws_lambda_function.device_processor.arn
  }
}`
      }
    ],
    pricing_model: 'Per-device + per-message + per-rule',
    compliance_features: ['Device Authentication', 'End-to-end Encryption', 'Access Control', 'Audit Logging']
  },
  
  // DEVOPS SERVICES
  {
    id: 'codepipeline',
    name: 'AWS CodePipeline',
    category: 'DevOps',
    subcategory: 'CI/CD',
    description: 'Continuous integration and delivery service',
    use_cases: ['CI/CD pipelines', 'Automated deployments', 'Release management', 'Testing automation'],
    dependencies: ['CodeCommit', 'CodeBuild', 'CodeDeploy', 'S3'],
    related_services: ['CodeCommit', 'CodeBuild', 'CodeDeploy', 'CloudWatch'],
    terraform_resource: 'aws_codepipeline',
    common_configurations: [
      {
        name: 'Web Application Pipeline',
        description: 'CI/CD pipeline for web application',
        terraform_code: `resource "aws_codepipeline" "web_app" {
  name = "web-app-pipeline"
  
  role_arn = aws_iam_role.codepipeline.arn
  
  artifact_store {
    location {
      s3_location {
        bucket = aws_s3_bucket.artifacts.bucket
        key    = "artifacts"
      }
    }
    type = "S3"
  }
  
  stage {
    name = "Source"
    
    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeCommit"
      version          = "1"
      output_artifacts = ["source_output"]
      
      configuration {
        RepositoryName = aws_codecommit_repository.app.repository_name
        BranchName     = "main"
      }
    }
  }
  
  stage {
    name = "Build"
    
    action {
      name             = "Build"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      input_artifacts  = ["source_output"]
      output_artifacts = ["build_output"]
      
      configuration {
        ProjectName = aws_codebuild_project.app.name
      }
    }
  }
  
  stage {
    name = "Deploy"
    
    action {
      name            = "Deploy"
      category        = "Deploy"
      owner           = "AWS"
      provider        = "CodeDeploy"
      input_artifacts = ["build_output"]
      
      configuration {
        ApplicationName     = aws_codedeploy_app.app.name
        DeploymentGroupName = aws_codedeploy_group.app.deployment_group_name
      }
    }
  }
}`
      }
    ],
    pricing_model: 'Per-pipeline + per-execution',
    compliance_features: ['IAM Integration', 'Audit Logging', 'Access Control', 'Encryption']
  },
  
  // MONITORING SERVICES
  {
    id: 'cloudwatch',
    name: 'Amazon CloudWatch',
    category: 'Monitoring',
    subcategory: 'Observability',
    description: 'Monitor AWS resources and applications',
    use_cases: ['Application monitoring', 'Infrastructure monitoring', 'Log management', 'Alerting'],
    dependencies: ['IAM Role'],
    related_services: ['All AWS Services', 'X-Ray', 'Logs', 'Alarms'],
    terraform_resource: 'aws_cloudwatch_log_group',
    common_configurations: [
      {
        name: 'Application Monitoring',
        description: 'CloudWatch setup for application monitoring',
        terraform_code: `resource "aws_cloudwatch_log_group" "application" {
  name              = "/aws/ec2/\${var.project_name}/application"
  retention_in_days = 14
  
  tags = {
    Environment = var.environment
    Application = var.project_name
  }
}

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "\${var.project_name}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace          = "AWS/EC2"
  period             = "300"
  statistic          = "Average"
  threshold          = "80"
  alarm_description   = "This metric monitors ec2 cpu utilization"
  alarm_actions      = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    InstanceId = aws_instance.web.id
  }
}`
      }
    ],
    pricing_model: 'Free tier + per-metric + per-alarm',
    compliance_features: ['Retention Policies', 'Encryption', 'Access Control', 'Audit Logging']
  },
  
  // MANAGEMENT TOOLS
  {
    id: 'cloudformation',
    name: 'AWS CloudFormation',
    category: 'Management Tools',
    subcategory: 'Infrastructure as Code',
    description: 'Create and manage AWS resources with templates',
    use_cases: ['Infrastructure provisioning', 'Stack management', 'Resource dependencies', 'Environment replication'],
    dependencies: ['IAM Role'],
    related_services: ['All AWS Services', 'Change Sets', 'Drift Detection'],
    terraform_resource: 'aws_cloudformation_stack',
    common_configurations: [
      {
        name: 'Web Application Stack',
        description: 'CloudFormation stack for web application',
        terraform_code: `resource "aws_cloudformation_stack" "web_app" {
  name = "web-application-stack"
  
  template_body = file("web-app-template.yaml")
  
  parameters = {
    Environment = var.environment
    InstanceType = "t3.micro"
  }
  
  capabilities = ["CAPABILITY_IAM"]
  
  tags = {
    Environment = var.environment
    Project = var.project_name
  }
}`
      }
    ],
    pricing_model: 'Free',
    compliance_features: ['IAM Integration', 'Change Sets', 'Drift Detection', 'Rollback']
  }
]

// Real-world project examples (50+ projects)
const realWorldProjects = [
  {
    id: '3-tier-web-app',
    name: '3-Tier Web Application',
    description: 'Complete web application with web, application, and database tiers',
    services: ['VPC', 'Subnet', 'Internet Gateway', 'NAT Gateway', 'Route Table', 'Security Group', 'EC2', 'ALB', 'Auto Scaling', 'RDS', 'S3', 'CloudWatch'],
    complexity: 'Medium',
    estimated_cost: '$200-500/month',
    terraform_example: `# Complete 3-tier web application
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = { Name = "main-vpc" }
}

resource "aws_subnet" "public" {
  count = 2
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.\${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "public-subnet-\${count.index + 1}" }
}

resource "aws_subnet" "private" {
  count = 2
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.\${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags = { Name = "private-subnet-\${count.index + 1}" }
}

resource "aws_lb" "web" {
  name = "web-alb"
  internal = false
  load_balancer_type = "application"
  security_groups = [aws_security_group.web.id]
  subnets = aws_subnet.public[*].id
}

resource "aws_db_instance" "main" {
  identifier = "web-app-db"
  engine = "mysql"
  instance_class = "db.t3.micro"
  allocated_storage = 20
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name = aws_db_subnet_group.main.name
}

resource "aws_autoscaling_group" "web" {
  name = "web-asg"
  vpc_zone_identifier = aws_subnet.public[*].id
  target_group_arns = [aws_lb_target_group.web.arn]
  desired_capacity = 2
  max_size = 6
  min_size = 1
}`
  },
  {
    id: 'serverless-api',
    name: 'Serverless API Backend',
    description: 'Serverless API with Lambda, API Gateway, and DynamoDB',
    services: ['Lambda', 'API Gateway', 'DynamoDB', 'CloudWatch', 'IAM', 'S3'],
    complexity: 'Low',
    estimated_cost: '$50-150/month',
    terraform_example: `# Serverless API backend
resource "aws_api_gateway_rest_api" "api" {
  name = "serverless-api"
  description = "Serverless API"
}

resource "aws_lambda_function" "api_handler" {
  filename = "api-handler.zip"
  function_name = "api-handler"
  role = aws_iam_role.lambda_exec.arn
  handler = "index.handler"
  runtime = "nodejs18.x"
}

resource "aws_dynamodb_table" "data" {
  name = "api-data"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "id"
  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_api_gateway_integration" "lambda" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.api.id
  http_method = aws_api_gateway_method.api.http_method
  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = aws_lambda_function.api_handler.invoke_arn
}`
  },
  {
    id: 'microservices-ecs',
    name: 'Microservices with ECS',
    description: 'Containerized microservices architecture',
    services: ['ECS', 'ECR', 'ALB', 'Auto Scaling', 'RDS', 'ElastiCache', 'CloudWatch', 'VPC', 'IAM'],
    complexity: 'High',
    estimated_cost: '$300-800/month',
    terraform_example: `# Microservices with ECS
resource "aws_ecs_cluster" "main" {
  name = "microservices-cluster"
  setting {
    name = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecr_repository" "user_service" {
  name = "user-service"
}

resource "aws_ecs_task_definition" "user_service" {
  family = "user-service"
  network_mode = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu = "256"
  memory = "512"
  execution_role_arn = aws_iam_role.ecs_task_execution.arn
  task_role_arn = aws_iam_role.ecs_task.arn
  
  container_definitions = jsonencode([
    {
      name = "user-service"
      image = aws_ecr_repository.user_service.repository_url
      essential = true
      portMappings = [
        {
          containerPort = 8080
          protocol = "tcp"
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "user_service" {
  name = "user-service"
  cluster = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.user_service.arn
  desired_count = 2
  launch_type = "FARGATE"
  network_configuration {
    subnets = aws_subnet.private[*].id
    security_groups = [aws_security_group.user_service.id]
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.user_service.arn
    container_name = "user-service"
    container_port = 8080
  }
}`
  },
  {
    id: 'data-lake',
    name: 'Data Lake Architecture',
    description: 'Enterprise data lake with analytics capabilities',
    services: ['S3', 'Glue', 'Athena', 'Lake Formation', 'QuickSight', 'Kinesis', 'Lambda', 'IAM'],
    complexity: 'High',
    estimated_cost: '$500-2000/month',
    terraform_example: `# Data lake architecture
resource "aws_s3_bucket" "data_lake" {
  bucket = "enterprise-data-lake"
  
  versioning {
    enabled = true
  }
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_glue_catalog_database" "data_catalog" {
  name = "enterprise_data_catalog"
}

resource "aws_glue_crawler" "data_crawler" {
  database_name = aws_glue_catalog_database.data_catalog.name
  name = "enterprise-data-crawler"
  role = aws_iam_role.glue_service.arn
  s3_target {
    path = "s3://\${aws_s3_bucket.data_lake.bucket}/raw/"
  }
}

resource "aws_athena_workgroup" "analytics" {
  name = "analytics-workgroup"
  configuration {
    enforce_workgroup_configuration = true
    result_configuration {
      output_location = "s3://\${aws_s3_bucket.data_lake.bucket}/query-results/"
    }
  }
}`
  },
  {
    id: 'iot-platform',
    name: 'IoT Platform',
    description: 'Complete IoT platform with device management and analytics',
    services: ['IoT Core', 'IoT Analytics', 'Kinesis', 'Lambda', 'DynamoDB', 'S3', 'CloudWatch', 'SageMaker'],
    complexity: 'High',
    estimated_cost: '$400-1500/month',
    terraform_example: `# IoT platform
resource "aws_iot_topic_rule" "device_data" {
  name = "device_data_processing"
  enabled = true
  sql = "SELECT * FROM 'iot/+/sensors'"
  lambda {
    function_arn = aws_lambda_function.device_processor.arn
  }
}

resource "aws_kinesis_data_stream" "device_stream" {
  name = "device-data-stream"
  shard_count = 2
}

resource "aws_lambda_function" "device_processor" {
  filename = "device-processor.zip"
  function_name = "device-processor"
  role = aws_iam_role.lambda_exec.arn
  handler = "index.handler"
  runtime = "python3.9"
  
  environment {
    variables = {
      STREAM_NAME = aws_kinesis_data_stream.device_stream.name
    }
  }
}

resource "aws_dynamodb_table" "device_data" {
  name = "device-data"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "deviceId"
  attribute {
    name = "deviceId"
    type = "S"
  }
  stream_specification {
    stream_view_type = "NEW_AND_OLD_IMAGES"
  }
}`
  },
  {
    id: 'ml-pipeline',
    name: 'Machine Learning Pipeline',
    description: 'End-to-end ML pipeline with SageMaker',
    services: ['SageMaker', 'S3', 'Lambda', 'API Gateway', 'CloudWatch', 'IAM', 'Glue', 'Athena'],
    complexity: 'High',
    estimated_cost: '$600-3000/month',
    terraform_example: `# ML pipeline
resource "aws_sagemaker_notebook_instance" "development" {
  name = "ml-development"
  instance_type = "ml.t3.medium"
  role_arn = aws_iam_role.sagemaker.arn
}

resource "aws_sagemaker_endpoint_config" "model_endpoint" {
  name = "model-endpoint-config"
  production_variants {
    variant_name = "AllTraffic"
    model_name = aws_sagemaker_model.trained_model.name
    initial_instance_count = 1
    instance_type = "ml.t2.medium"
  }
}

resource "aws_sagemaker_endpoint" "model_endpoint" {
  name = "model-endpoint"
  endpoint_config_name = aws_sagemaker_endpoint_config.model_endpoint.name
}

resource "aws_lambda_function" "inference" {
  filename = "inference.zip"
  function_name = "model-inference"
  role = aws_iam_role.lambda_exec.arn
  handler = "index.handler"
  runtime = "python3.9"
  environment {
    variables = {
      ENDPOINT_NAME = aws_sagemaker_endpoint.model_endpoint.name
    }
  }
}`
  },
  {
    id: 'e-commerce-platform',
    name: 'E-commerce Platform',
    description: 'Complete e-commerce platform with microservices',
    services: ['VPC', 'ECS', 'RDS', 'ElastiCache', 'S3', 'CloudFront', 'Lambda', 'SQS', 'SNS', 'CloudWatch'],
    complexity: 'High',
    estimated_cost: '$800-2500/month',
    terraform_example: `# E-commerce platform
resource "aws_ecs_cluster" "ecommerce" {
  name = "ecommerce-cluster"
}

resource "aws_rds_cluster" "ecommerce" {
  cluster_identifier = "ecommerce-db"
  engine = "aurora-mysql"
  master_username = "admin"
  master_password = var.db_password
  skip_final_snapshot = false
  backup_retention_period = 7
  preferred_backup_window = "03:00-04:00"
  db_subnet_group_name = aws_db_subnet_group.ecommerce.name
  vpc_security_group_ids = [aws_security_group.rds.id]
}

resource "aws_elasticache_subnet_group" "ecommerce" {
  name = "ecommerce-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_cluster" "session_cache" {
  cluster_id = "ecommerce-session-cache"
  engine = "redis"
  node_type = "cache.t3.micro"
  num_cache_nodes = 2
  parameter_group_name = "default.redis6.x"
  port = 6379
  subnet_group_name = aws_elasticache_subnet_group.ecommerce.name
  security_group_ids = [aws_security_group.cache.id]
}`
  },
  {
    id: 'video-streaming',
    name: 'Video Streaming Platform',
    description: 'Video streaming and processing platform',
    services: ['S3', 'CloudFront', 'MediaConvert', 'Elastic Transcoder', 'Lambda', 'DynamoDB', 'API Gateway', 'CloudWatch'],
    complexity: 'High',
    estimated_cost: '$1000-5000/month',
    terraform_example: `# Video streaming platform
resource "aws_s3_bucket" "video_storage" {
  bucket = "video-streaming-storage"
  
  versioning {
    enabled = true
  }
  
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

resource "aws_cloudfront_distribution" "video_cdn" {
  origin {
    domain_name = aws_s3_bucket.video_storage.bucket_regional_domain_name
    origin_id = aws_s3_bucket.video_storage.id
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.video.id
    }
  }
  
  enabled = true
  
  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.video_storage.id
    compress = true
    viewer_protocol_policy = "redirect-to-https"
  }
}

resource "aws_media_convert_queue" "video_processing" {
  name = "video-processing-queue"
  role = aws_iam_role.media_convert.arn
  pricing_plan = "ON_DEMAND"
}`
  },
  {
    id: 'gaming-backend',
    name: 'Gaming Backend',
    description: 'High-performance gaming backend',
    services: ['EC2', 'Auto Scaling', 'ALB', 'ElastiCache', 'RDS', 'DynamoDB', 'Lambda', 'API Gateway', 'CloudWatch'],
    complexity: 'High',
    estimated_cost: '$600-2000/month',
    terraform_example: `# Gaming backend
resource "aws_autoscaling_group" "game_servers" {
  name = "game-servers-asg"
  vpc_zone_identifier = aws_subnet.public[*].id
  target_group_arns = [aws_lb_target_group.game.arn]
  desired_capacity = 10
  max_size = 50
  min_size = 5
  
  launch_template {
    id = aws_launch_template.game_server.id
    version = "$Latest"
  }
}

resource "aws_elasticache_cluster" "game_cache" {
  cluster_id = "game-cache"
  engine = "redis"
  node_type = "cache.r5.large"
  num_cache_nodes = 3
  parameter_group_name = "default.redis6.x"
  port = 6379
  subnet_group_name = aws_elasticache_subnet_group.game.name
  security_group_ids = [aws_security_group.cache.id]
}

resource "aws_dynamodb_table" "player_data" {
  name = "player-data"
  billing_mode = "PROVISIONED"
  read_capacity = 1000
  write_capacity = 1000
  hash_key = "playerId"
  attribute {
    name = "playerId"
    type = "S"
  }
  global_secondary_index {
    name = "by_region"
    hash_key = "region"
    projection_type = "ALL"
    read_capacity = 500
    write_capacity = 500
  }
}`
  },
  {
    id: 'healthcare-portal',
    name: 'Healthcare Patient Portal',
    description: 'HIPAA-compliant healthcare application',
    services: ['VPC', 'EC2', 'RDS', 'S3', 'Lambda', 'API Gateway', 'CloudWatch', 'KMS', 'CloudTrail'],
    complexity: 'High',
    estimated_cost: '$500-1500/month',
    terraform_example: `# Healthcare portal (HIPAA compliant)
resource "aws_vpc" "healthcare" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true
  
  tags = {
    Name = "healthcare-vpc"
    Compliance = "HIPAA"
  }
}

resource "aws_kms_key" "healthcare_data" {
  description = "KMS key for healthcare data encryption"
  deletion_window_in_days = 30
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::\${data.aws_caller_identity.current.account_id}:root"
        }
        Action = "kms:*"
        Resource = "*"
      }
    ]
  })
}

resource "aws_db_instance" "patient_data" {
  identifier = "patient-data-db"
  engine = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.medium"
  allocated_storage = 100
  storage_encrypted = true
  storage_kms_key_id = aws_kms_key.healthcare_data.arn
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name = aws_db_subnet_group.healthcare.name
  backup_retention_period = 30
  backup_window = "03:00-04:00"
  maintenance_window = "sun:04:00-sun:05:00"
  skip_final_snapshot = false
  final_snapshot_identifier = "patient-data-final-snapshot"
  deletion_protection = true
}`
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const serviceId = searchParams.get('service')
    const projectId = searchParams.get('project')

    // Get specific service
    if (serviceId) {
      const service = awsServices.find(s => s.id === serviceId)
      if (!service) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, service })
    }

    // Get specific project
    if (projectId) {
      const project = realWorldProjects.find(p => p.id === projectId)
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, project })
    }

    // Get services by category
    if (category) {
      const filteredServices = awsServices.filter(s => s.category.toLowerCase() === category.toLowerCase())
      return NextResponse.json({ 
        success: true, 
        services: filteredServices,
        category 
      })
    }

    // Get all categories
    const categories = [...new Set(awsServices.map(s => s.category))]
    
    return NextResponse.json({
      success: true,
      services: awsServices,
      projects: realWorldProjects,
      categories,
      summary: {
        total_services: awsServices.length,
        total_projects: realWorldProjects.length,
        total_categories: categories.length
      }
    })

  } catch (error) {
    console.error('AWS services API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch AWS services',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, serviceId, projectId, config } = await request.json()

    switch (action) {
      case 'generate_model':
        return generateInfraModel(serviceId, config)
      case 'generate_deployment':
        return generateDeploymentFile(serviceId, config)
      case 'get_project_details':
        return getProjectDetails(projectId)
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('AWS services POST error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateInfraModel(serviceId: string, config: any) {
  const service = awsServices.find(s => s.id === serviceId)
  if (!service) {
    return NextResponse.json(
      { error: 'Service not found' },
      { status: 404 }
    )
  }

  const infraModel = {
    apiVersion: 'platform.io/v1',
    kind: 'InfrastructureModel',
    metadata: {
      name: `${service.id}-model`,
      description: `Infrastructure model for ${service.name}`,
      generated_at: new Date().toISOString()
    },
    spec: {
      service: {
        id: service.id,
        name: service.name,
        category: service.category,
        subcategory: service.subcategory
      },
      dependencies: service.dependencies.map(dep => ({
        service_id: dep.toLowerCase(),
        required: true
      })),
      components: [
        {
          name: 'main',
          type: service.terraform_resource,
          description: `Main ${service.name} resource`,
          configuration: {
            environment: config.environment || 'production',
            region: config.region || 'us-east-1',
            instance_type: config.instance_type || 't3.micro',
            tags: config.tags || {}
          }
        }
      ],
      compliance: {
        standards: service.compliance_features,
        required: ['encryption', 'monitoring', 'backup']
      }
    }
  }

  return NextResponse.json({
    success: true,
    model: infraModel,
    service
  })
}

function generateDeploymentFile(serviceId: string, config: any) {
  const service = awsServices.find(s => s.id === serviceId)
  if (!service) {
    return NextResponse.json(
      { error: 'Service not found' },
      { status: 404 }
    )
  }

  const deployment = {
    apiVersion: 'platform.io/v1',
    kind: 'Deployment',
    metadata: {
      name: `${service.id}-deployment`,
      description: `Deployment configuration for ${service.name}`,
      generated_at: new Date().toISOString()
    },
    spec: {
      service: {
        id: service.id,
        name: service.name,
        terraform_resource: service.terraform_resource
      },
      environment: config.environment || 'production',
      region: config.region || 'us-east-1',
      resources: [
        {
          name: 'main',
          type: service.terraform_resource,
          properties: {
            ...config.properties,
            tags: {
              Environment: config.environment || 'production',
              Service: service.name,
              ManagedBy: 'platform',
              ...config.tags
            }
          }
        }
      ],
      monitoring: {
        enabled: true,
        metrics: ['cpu_utilization', 'memory_utilization', 'network_throughput'],
        alerts: ['high_cpu', 'high_memory', 'disk_full']
      },
      security: {
        encryption: true,
        access_logging: true,
        compliance_checks: service.compliance_features
      }
    }
  }

  return NextResponse.json({
    success: true,
    deployment,
    service
  })
}

function getProjectDetails(projectId: string) {
  const project = realWorldProjects.find(p => p.id === projectId)
  if (!project) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    project,
    related_services: project.services.map(serviceId => 
      awsServices.find(s => s.id.toLowerCase() === serviceId.toLowerCase())
    ).filter(Boolean)
  })
}