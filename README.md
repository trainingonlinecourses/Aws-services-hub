
# Terraform Learning Platform

A comprehensive web application for mastering Terraform from basic concepts to advanced enterprise-level infrastructure management. This platform provides interactive tools, converters, and generators to help you understand and work with Terraform effectively.

## 🚀 Features

### 📚 Learning Modules
- **Basic Concepts**: Understand Terraform syntax, variables, outputs, and providers
- **State Management**: Learn about state files, remote state, and state import
- **Modules**: Master root modules, child modules, and module registries
- **Lifecycle**: Understand init, plan, apply, and destroy operations
- **Enterprise Features**: Workspaces, Sentinel policies, and cost estimation
- **Advanced Concepts**: Provisioners, data sources, and custom functions

### 🛠️ Interactive Tools

#### HCL to YAML Converter
- Parse Terraform HCL code
- Generate platform-specific model.yaml files
- Create deployment.yaml configurations
- Map resource dependencies and properties

#### Architecture Generator
- **3-Tier Architecture**: Web, Application, and Database tiers
- **Microservices**: ECS-based containerized services
- **Serverless**: Lambda functions with API Gateway
- **Hybrid**: Combination of multiple architecture patterns

#### Migration Tools
- Analyze existing Terraform repositories
- Generate migration plans for enterprise platforms
- Convert HCL to platform-specific YAML
- Step-by-step migration execution

#### HCL Parser & Analyzer
- Parse .tf, .tfvars, and .tfstate files
- Extract resource definitions and dependencies
- Validate syntax and structure
- Generate resource inventory

## 🏗️ Architecture Types

### 3-Tier Web Application
- **Web Tier**: Application Load Balancer + Auto Scaling Group
- **Application Tier**: EC2 instances in private subnets
- **Data Tier**: RDS database with backup and monitoring

### Microservices Architecture
- **ECS Cluster**: Container orchestration
- **Load Balancer**: Application Load Balancer with target groups
- **Services**: Individual microservice deployments
- **Monitoring**: CloudWatch integration

### Serverless Architecture
- **API Gateway**: RESTful API endpoints
- **Lambda Functions**: Event-driven compute
- **DynamoDB**: NoSQL database
- **S3**: Static asset storage

### Hybrid Architecture
- **Combination**: Mix of serverless and traditional components
- **Flexibility**: Best of both worlds
- **Scalability**: Optimized resource utilization

## 🔄 Migration Process

### 1. Repository Analysis
- Scan Terraform files and modules
- Identify resources and dependencies
- Analyze variables and outputs
- Generate resource inventory

### 2. Migration Planning
- Create step-by-step migration plan
- Assess risk and complexity
- Define rollback procedures
- Estimate time and resources

### 3. YAML Generation
- Generate model.yaml (high-level architecture)
- Create deployment.yaml (detailed specifications)
- Map Terraform properties to platform format
- Validate configuration completeness

### 4. Deployment
- Use enterprise platform CLI
- Authenticate with AWS accounts
- Download required providers
- Deploy infrastructure components

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── convert/      # HCL to YAML conversion API
│   │   ├── architecture/ # Architecture generator API
│   │   └── migration/    # Migration tools API
│   ├── page.tsx          # Main application component
│   ├── layout.tsx        # App layout
│   └── globals.css       # Global styles
└── components/
    └── ui/               # shadcn/ui components
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Icons**: Lucide React
- **Backend**: Next.js API Routes
- **Parsing**: Custom HCL parser implementation

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create local environment file**
   Copy `.env.example` to `.env` and keep the default local values unless you need a different setup.

3. **Prepare Prisma (optional for local DB features)**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

6. **Create a production build**
   ```bash
   npm run build
   npm run start
   ```

## 📖 Usage Guide

### Converting HCL to YAML

1. Navigate to the **HCL to YAML** tab
2. Paste your Terraform code in the input area
3. Click **Convert to YAML**
4. Review the generated model.yaml and deployment.yaml files

### Generating Architecture

1. Go to the **Architecture** tab
2. Select your desired architecture type
3. Click **Generate Terraform Code**
4. Download the generated files

### Migration Planning

1. Access the **Migration** tab
2. Configure migration settings
3. Click **Generate Migration Plan**
4. Follow the step-by-step migration process

## 🎯 Learning Path

### Beginner
1. Start with **Concepts** tab
2. Learn basic syntax and file types
3. Understand variables and outputs
4. Practice with simple examples

### Intermediate
1. Explore modules and state management
2. Use the HCL converter tool
3. Generate 3-tier architectures
4. Understand resource dependencies

### Advanced
1. Work with migration tools
2. Convert complex Terraform repositories
3. Implement enterprise features
4. Optimize and troubleshoot deployments

## 🔧 API Endpoints

### POST /api/convert
Convert Terraform HCL to platform YAML
```json
{
  "terraformCode": "resource \"aws_vpc\" \"main\" { ... }",
  "options": {
    "format": "yaml",
    "includeModel": true,
    "includeDeployment": true
  }
}
```

### POST /api/architecture
Generate infrastructure architecture
```json
{
  "type": "3tier",
  "region": "us-east-1",
  "environment": "dev",
  "projectName": "my-app"
}
```

### POST /api/migration
Create migration plan
```json
{
  "sourcePath": "/path/to/terraform/repo",
  "targetPlatform": "Enterprise Platform v2.0",
  "migrationMode": "incremental",
  "workspace": "dev"
}
```

## 🎨 UI Components

The platform uses shadcn/ui components for a consistent, modern interface:
- **Cards**: Information display and tool containers
- **Tabs**: Navigation between different sections
- **Buttons**: Interactive actions and navigation
- **Forms**: Input fields and configuration
- **Alerts**: Notifications and feedback
- **Badges**: Status indicators and labels

## 📊 Supported Resources

### AWS Resources
- **Network**: VPC, Subnets, Route Tables, Internet Gateway
- **Compute**: EC2 Instances, Auto Scaling Groups, Lambda Functions
- **Storage**: S3 Buckets, EBS Volumes
- **Database**: RDS Instances, DynamoDB Tables
- **Security**: Security Groups, IAM Roles
- **Load Balancing**: Application Load Balancer, Target Groups

### Platform Resources
- **Model Components**: High-level infrastructure definitions
- **Deployment Specs**: Detailed resource configurations
- **Dependencies**: Resource relationships and ordering
- **Variables**: Input parameters and environment values

## 🔄 Conversion Process

### HCL Parsing
1. **Syntax Analysis**: Parse Terraform language syntax
2. **Resource Extraction**: Identify all resource blocks
3. **Dependency Mapping**: Analyze resource references
4. **Property Collection**: Extract all configuration values

### YAML Generation
1. **Model Creation**: Generate high-level architecture model
2. **Deployment Spec**: Create detailed deployment configuration
3. **Property Mapping**: Convert HCL properties to YAML format
4. **Validation**: Ensure completeness and correctness

## 🚨 Error Handling

The platform includes comprehensive error handling:
- **Input Validation**: Check for required parameters
- **Syntax Errors**: Handle malformed HCL code
- **API Errors**: Graceful handling of backend failures
- **User Feedback**: Clear error messages and guidance

## 🔒 Security Considerations

- **No External Dependencies**: All parsing happens client-side or on your own server
- **Input Sanitization**: Validate all user inputs
- **Error Boundaries**: Prevent crashes from unexpected errors
- **Secure Defaults**: Safe default configurations

## 📈 Performance

- **Lazy Loading**: Components load as needed
- **Optimized Parsing**: Efficient HCL parsing algorithms
- **Caching**: Cache parsed results for better performance
- **Responsive Design**: Works on all device sizes

## 🤝 Contributing

This platform is designed to be a comprehensive learning tool for Terraform. Feel free to:
- Report bugs and issues
- Suggest new features
- Improve documentation
- Add new architecture patterns

## 📝 License

This project is open source and available under the MIT License.

---

**Happy Terraforming!** 🚀

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS.
