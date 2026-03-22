import type { AWSService, Project } from './aws-types'

// Basic AWS Services Catalog (core services only)
const catalogServices: AWSService[] = [
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
        terraform_code: 'resource "aws_instance" "web" {\n  ami           = data.aws_ami.amazon_linux.id\n  instance_type = "t3.micro"\n  subnet_id     = aws_subnet.public.id\n  vpc_security_group_ids = [aws_security_group.web.id]\n  \n  tags = {\n    Name = "web-server"\n    Environment = var.environment\n  }\n}'
      }
    ],
    pricing_model: 'Pay-as-you-go',
    compliance_features: ['VPC Isolation', 'IAM Integration', 'Encryption at Rest', 'CloudTrail Logging'],
    documentationUrl: 'https://docs.aws.amazon.com/ec2/',
    pricingUrl: 'https://aws.amazon.com/ec2/pricing/'
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
        name: 'Simple Function',
        description: 'Basic Lambda function configuration',
        terraform_code: 'resource "aws_lambda_function" "example" {\n  function_name = "example"\n  handler       = "index.handler"\n  runtime       = "nodejs20.x"\n  \n  filename         = "lambda_function_payload.zip"\n  source_code_hash = filebase64sha256("lambda_function_payload.zip")\n  \n  role = aws_iam_role.lambda_exec.arn\n  \n  environment {\n    variables = {\n      FUNCTION_NAME = "example"\n    }\n  }\n}'
      }
    ],
    pricing_model: 'Pay-per-request',
    compliance_features: ['VPC Support', 'Encryption', 'IAM Integration'],
    documentationUrl: 'https://docs.aws.amazon.com/lambda/',
    pricingUrl: 'https://aws.amazon.com/lambda/pricing/'
  },
  {
    id: 's3',
    name: 'Amazon S3',
    category: 'Storage',
    subcategory: 'Object Storage',
    description: 'Object storage built to store and retrieve any amount of data from anywhere',
    use_cases: ['Data lakes', 'Backup and restore', 'Archive', 'Web hosting', 'Content distribution'],
    dependencies: ['IAM Role', 'VPC'],
    related_services: ['CloudFront', 'Glacier', 'Lambda', 'ECS', 'EKS'],
    terraform_resource: 'aws_s3_bucket',
    common_configurations: [
      {
        name: 'Static Website',
        description: 'S3 bucket for static website hosting',
        terraform_code: 'resource "aws_s3_bucket" "example" {\n  bucket = "my-bucket-name"\n  acl    = "public-read"\n  \n  website {\n    index_document = "index.html"\n    error_document = "error.html"\n  }\n  \n  tags = {\n    Environment = var.environment\n    Project     = "aws-services-hub"\n  }\n}'
      }
    ],
    pricing_model: 'Pay-as-you-go',
    compliance_features: ['Encryption', 'Versioning', 'IAM Integration'],
    documentationUrl: 'https://docs.aws.amazon.com/s3/',
    pricingUrl: 'https://aws.amazon.com/s3/pricing/'
  }
]

const projects: Project[] = [
  {
    id: 'web-app',
    name: 'Web Application',
    description: 'Complete web application with frontend, backend, and database',
    services: ['EC2', 'RDS', 'S3', 'CloudFront', 'Route 53'],
    complexity: 'Medium',
    estimated_cost: '$200-500/month',
    terraform_example: 'module "web_app" {\n  source = "./modules/web-app"\n  \n  instance_type = "t3.medium"\n  db_instance_class = "db.t3.micro"\n  \n  tags = {\n    Environment = "production"\n    Project = "web-app"\n  }\n}'
  }
]

export const awsServices: AWSService[] = catalogServices
export const realWorldProjects = projects
export const categories = [...new Set(awsServices.map((service) => service.category))]

export const catalogSummary = {
  total_services: awsServices.length,
  total_projects: realWorldProjects.length,
  total_categories: categories.length,
}

export function getServiceById(serviceId: string) {
  return awsServices.find((service) => service.id === serviceId)
}

export function getProjectById(projectId: string) {
  return realWorldProjects.find((project) => project.id === projectId)
}