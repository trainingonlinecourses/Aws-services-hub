import { NextRequest, NextResponse } from 'next/server'

interface CLICommand {
  command: string
  description: string
  usage: string
  arguments: Array<{
    name: string
    description: string
    required: boolean
    type: 'string' | 'number' | 'boolean' | 'array'
    default?: any
  }>
  examples: string[]
}

interface CLIResponse {
  success: boolean
  output?: string
  error?: string
  data?: any
}

async function getAwsServicesData(query?: { service?: string; project?: string }) {
  const params = new URLSearchParams()

  if (query?.service) {
    params.set('service', query.service)
  }

  if (query?.project) {
    params.set('project', query.project)
  }

  const suffix = params.toString()
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/aws-services${suffix ? `?${suffix}` : ''}`)
  const result = await response.json()

  if (!response.ok) {
    return { success: false, error: result.error || 'Failed to fetch AWS services data' }
  }

  return result
}

const cliCommands: CLICommand[] = [
  {
    command: 'generate',
    description: 'Generate infrastructure model or deployment files',
    usage: 'mac generate [options]',
    arguments: [
      {
        name: 'c',
        description: 'Open code in editor',
        required: false,
        type: 'boolean',
        default: false
      },
      {
        name: 'o',
        description: 'Output file path',
        required: true,
        type: 'string'
      },
      {
        name: 'service',
        description: 'AWS service ID',
        required: false,
        type: 'string'
      },
      {
        name: 'project',
        description: 'Project template ID',
        required: false,
        type: 'string'
      },
      {
        name: 'type',
        description: 'Output type (model/deployment)',
        required: true,
        type: 'string'
      },
      {
        name: 'environment',
        description: 'Environment (dev/staging/prod)',
        required: false,
        type: 'string',
        default: 'dev'
      },
      {
        name: 'region',
        description: 'AWS region',
        required: false,
        type: 'string',
        default: 'us-east-1'
      }
    ],
    examples: [
      'mac generate -c -o basemodel.yaml -t model -service ec2',
      'mac generate -o deployment.yaml -t deployment -project 3-tier-web-app',
      'mac generate -c -o infra-model.yaml -t model -service rds -environment prod'
    ]
  },
  {
    command: 'list',
    description: 'List available services or projects',
    usage: 'mac list [options]',
    arguments: [
      {
        name: 'type',
        description: 'List type (services/projects/categories)',
        required: true,
        type: 'string'
      },
      {
        name: 'category',
        description: 'Filter by category',
        required: false,
        type: 'string'
      },
      {
        name: 'search',
        description: 'Search term',
        required: false,
        type: 'string'
      }
    ],
    examples: [
      'mac list services',
      'mac list projects',
      'mac list services -category compute',
      'mac list services -search database'
    ]
  },
  {
    command: 'info',
    description: 'Get detailed information about a service or project',
    usage: 'mac info <id>',
    arguments: [
      {
        name: 'id',
        description: 'Service or project ID',
        required: true,
        type: 'string'
      }
    ],
    examples: [
      'mac info ec2',
      'mac info lambda',
      'mac info 3-tier-web-app'
    ]
  },
  {
    command: 'validate',
    description: 'Validate generated files',
    usage: 'mac validate <file>',
    arguments: [
      {
        name: 'file',
        description: 'File to validate',
        required: true,
        type: 'string'
      }
    ],
    examples: [
      'mac validate basemodel.yaml',
      'mac validate deployment.yaml'
    ]
  },
  {
    command: 'deploy',
    description: 'Deploy infrastructure using generated files',
    usage: 'mac deploy [options]',
    arguments: [
      {
        name: 'model',
        description: 'Infrastructure model file',
        required: true,
        type: 'string'
      },
      {
        name: 'deployment',
        description: 'Deployment configuration file',
        required: true,
        type: 'string'
      },
      {
        name: 'dry-run',
        description: 'Preview deployment without executing',
        required: false,
        type: 'boolean',
        default: false
      }
    ],
    examples: [
      'mac deploy -model basemodel.yaml -deployment deployment.yaml',
      'mac deploy -model basemodel.yaml -deployment deployment.yaml -dry-run'
    ]
  },
  {
    command: 'status',
    description: 'Check deployment status',
    usage: 'mac status [options]',
    arguments: [
      {
        name: 'deployment-id',
        description: 'Deployment ID',
        required: false,
        type: 'string'
      },
      {
        name: 'service',
        description: 'Filter by service',
        required: false,
        type: 'string'
      }
    ],
    examples: [
      'mac status',
      'mac status -deployment-id deploy-12345',
      'mac status -service ec2'
    ]
  },
  {
    command: 'destroy',
    description: 'Destroy deployed infrastructure',
    usage: 'mac destroy [options]',
    arguments: [
      {
        name: 'deployment-id',
        description: 'Deployment ID',
        required: true,
        type: 'string'
      },
      {
        name: 'force',
        description: 'Skip confirmation',
        required: false,
        type: 'boolean',
        default: false
      }
    ],
    examples: [
      'mac destroy -deployment-id deploy-12345',
      'mac destroy -deployment-id deploy-12345 -force'
    ]
  },
  {
    command: 'version',
    description: 'Show CLI version',
    usage: 'mac version',
    arguments: [],
    examples: [
      'mac version'
    ]
  },
  {
    command: 'help',
    description: 'Show help information',
    usage: 'mac help [command]',
    arguments: [
      {
        name: 'command',
        description: 'Command to get help for',
        required: false,
        type: 'string'
      }
    ],
    examples: [
      'mac help',
      'mac help generate',
      'mac help list'
    ]
  }
]

// Simulate CLI execution
async function executeCLICommand(command: string, args: any): Promise<CLIResponse> {
  try {
    switch (command) {
      case 'generate':
        return await handleGenerate(args)
      case 'list':
        return await handleList(args)
      case 'info':
        return await handleInfo(args)
      case 'validate':
        return await handleValidate(args)
      case 'deploy':
        return await handleDeploy(args)
      case 'status':
        return await handleStatus(args)
      case 'destroy':
        return await handleDestroy(args)
      case 'version':
        return { success: true, output: 'MAC CLI v1.0.0' }
      case 'help':
        return await handleHelp(args)
      default:
        return { success: false, error: `Unknown command: ${command}` }
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

async function handleGenerate(args: any): Promise<CLIResponse> {
  const { o: output, type, service, project, c: openInEditor, environment, region } = args
  
  if (!output) {
    return { success: false, error: 'Output file path is required (-o)' }
  }
  
  if (!type || !['model', 'deployment'].includes(type)) {
    return { success: false, error: 'Type must be "model" or "deployment"' }
  }
  
  // Fetch service or project data
  let data: any
  if (service) {
    const result = await getAwsServicesData({ service })
    if (!result.success) {
      return { success: false, error: result.error || 'Service not found' }
    }
    data = result.service
  } else if (project) {
    const result = await getAwsServicesData({ project })
    if (!result.success) {
      return { success: false, error: result.error || 'Project not found' }
    }
    data = result.project
  } else {
    return { success: false, error: 'Either service or project must be specified' }
  }
  
  // Generate content based on type
  let content: string
  if (type === 'model') {
    content = generateModelContent(data, environment, region)
  } else {
    content = generateDeploymentContent(data, environment, region)
  }
  
  // Simulate file writing and editor opening
  const fileInfo = {
    filename: output,
    content,
    size: content.length,
    lines: content.split('\n').length,
    created_at: new Date().toISOString()
  }
  
  let outputMessage = `Generated ${type} file: ${output}\n`
  outputMessage += `Size: ${fileInfo.size} bytes\n`
  outputMessage += `Lines: ${fileInfo.lines}\n`
  
  if (openInEditor) {
    outputMessage += `Opening ${output} in editor...`
  }
  
  return { 
    success: true, 
    output: outputMessage,
    data: fileInfo
  }
}

async function handleList(args: any): Promise<CLIResponse> {
  const { type, category, search } = args
  
  if (!type || !['services', 'projects', 'categories'].includes(type)) {
    return { success: false, error: 'Type must be "services", "projects", or "categories"' }
  }
  
  const result = await getAwsServicesData()
  if (!result.success) {
    return { success: false, error: result.error || 'Failed to fetch items' }
  }
  
  let items: any[]
  let title: string
  
  switch (type) {
    case 'services':
      items = result.services
      title = 'AWS Services'
      if (category) {
        items = items.filter((s: any) => s.category.toLowerCase() === category.toLowerCase())
      }
      if (search) {
        items = items.filter((s: any) => 
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.description.toLowerCase().includes(search.toLowerCase())
        )
      }
      break
    case 'projects':
      items = result.projects
      title = 'Projects'
      if (search) {
        items = items.filter((p: any) => 
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
        )
      }
      break
    case 'categories':
      items = result.categories.map((cat: string) => ({ name: cat }))
      title = 'Categories'
      break
  }
  
  let output = `${title}:\n`
  items.forEach((item: any, index: number) => {
    output += `  ${index + 1}. ${item.name}\n`
    if (item.description) {
      output += `     ${item.description}\n`
    }
    if (item.category) {
      output += `     Category: ${item.category}\n`
    }
    output += '\n'
  })
  
  output += `Total: ${items.length} items\n`
  
  return { 
    success: true, 
    output,
    data: { items, total: items.length }
  }
}

async function handleInfo(args: any): Promise<CLIResponse> {
  const { id } = args
  
  if (!id) {
    return { success: false, error: 'ID is required' }
  }
  
  // Try to get as service first
  let result = await getAwsServicesData({ service: id })

  if (!result.success) {
    // Try to get as project
    result = await getAwsServicesData({ project: id })
  }
  
  if (!result.success) {
    return { success: false, error: 'Service or project not found' }
  }
  
  const item = result.service || result.project
  let output = `${item.name}\n`
  output += `${'='.repeat(item.name.length)}\n`
  output += `Description: ${item.description}\n`
  
  if (item.category) {
    output += `Category: ${item.category}\n`
    output += `Subcategory: ${item.subcategory}\n`
  }
  
  if (item.use_cases) {
    output += `Use Cases:\n`
    item.use_cases.forEach((useCase: string) => {
      output += `  - ${useCase}\n`
    })
  }
  
  if (item.dependencies) {
    output += `Dependencies:\n`
    item.dependencies.forEach((dep: string) => {
      output += `  - ${dep}\n`
    })
  }
  
  if (item.services) {
    output += `Services:\n`
    item.services.forEach((service: string) => {
      output += `  - ${service}\n`
    })
  }
  
  if (item.complexity) {
    output += `Complexity: ${item.complexity}\n`
  }
  
  if (item.estimated_cost) {
    output += `Estimated Cost: ${item.estimated_cost}\n`
  }
  
  return { 
    success: true, 
    output,
    data: item
  }
}

async function handleValidate(args: any): Promise<CLIResponse> {
  const { file } = args
  
  if (!file) {
    return { success: false, error: 'File path is required' }
  }
  
  // Simulate file validation
  const validationResults = {
    file,
    valid: true,
    errors: [],
    warnings: [],
    validated_at: new Date().toISOString()
  }
  
  let output = `Validating ${file}...\n`
  output += `Status: ${validationResults.valid ? '✓ Valid' : '✗ Invalid'}\n`
  
  if (validationResults.errors.length > 0) {
    output += `Errors:\n`
    validationResults.errors.forEach((error: string) => {
      output += `  ✗ ${error}\n`
    })
  }
  
  if (validationResults.warnings.length > 0) {
    output += `Warnings:\n`
    validationResults.warnings.forEach((warning: string) => {
      output += `  ⚠ ${warning}\n`
    })
  }
  
  output += `Validated at: ${validationResults.validated_at}\n`
  
  return { 
    success: validationResults.valid, 
    output,
    data: validationResults
  }
}

async function handleDeploy(args: any): Promise<CLIResponse> {
  const { model, deployment, 'dry-run': dryRun } = args
  
  if (!model || !deployment) {
    return { success: false, error: 'Both model and deployment files are required' }
  }
  
  const deploymentId = `deploy-${Date.now()}`
  
  let output = `Starting deployment...\n`
  output += `Deployment ID: ${deploymentId}\n`
  output += `Model file: ${model}\n`
  output += `Deployment file: ${deployment}\n`
  
  if (dryRun) {
    output += `Mode: DRY RUN (no actual deployment)\n`
  } else {
    output += `Mode: DEPLOY\n`
    output += `Initializing deployment...\n`
    output += `Validating configuration...\n`
    output += `Provisioning resources...\n`
    output += `Applying configuration...\n`
    output += `✓ Deployment completed successfully\n`
  }
  
  return { 
    success: true, 
    output,
    data: { deploymentId, dryRun, model, deployment }
  }
}

async function handleStatus(args: any): Promise<CLIResponse> {
  const { 'deployment-id': deploymentId, service } = args
  
  let output = `Deployment Status:\n`
  output += `${'='.repeat(20)}\n`
  
  if (deploymentId) {
    output += `Deployment ID: ${deploymentId}\n`
    output += `Status: RUNNING\n`
    output += `Progress: 75%\n`
    output += `Started: ${new Date(Date.now() - 3600000).toISOString()}\n`
    output += `Estimated completion: ${new Date(Date.now() + 1800000).toISOString()}\n`
  } else {
    output += `Active Deployments:\n`
    output += `  deploy-12345: RUNNING (75%)\n`
    output += `  deploy-12346: COMPLETED\n`
    output += `  deploy-12347: FAILED\n`
  }
  
  if (service) {
    output += `\nService Status: ${service}\n`
    output += `EC2 Instances: 2 running\n`
    output += `RDS Instances: 1 available\n`
    output += `Load Balancers: 1 active\n`
  }
  
  return { 
    success: true, 
    output
  }
}

async function handleDestroy(args: any): Promise<CLIResponse> {
  const { 'deployment-id': deploymentId, force } = args
  
  if (!deploymentId) {
    return { success: false, error: 'Deployment ID is required' }
  }
  
  let output = `Destroying deployment: ${deploymentId}\n`
  
  if (!force) {
    output += `⚠ This action cannot be undone!\n`
    output += `Are you sure you want to continue? (y/N)\n`
    output += `User confirmed: y\n`
  }
  
  output += `Destroying resources...\n`
  output += `  - Removing EC2 instances...\n`
  output += `  - Removing RDS instances...\n`
  output += `  - Removing load balancers...\n`
  output += `  - Removing security groups...\n`
  output += `✓ Deployment destroyed successfully\n`
  
  return { 
    success: true, 
    output,
    data: { deploymentId, destroyed: true }
  }
}

async function handleHelp(args: any): Promise<CLIResponse> {
  const { command: helpCommand } = args
  
  if (helpCommand) {
    const command = cliCommands.find(cmd => cmd.command === helpCommand)
    if (!command) {
      return { success: false, error: `Unknown command: ${helpCommand}` }
    }
    
    let output = `${command.command} - ${command.description}\n`
    output += `Usage: ${command.usage}\n`
    output += `Arguments:\n`
    
    command.arguments.forEach(arg => {
      const required = arg.required ? 'required' : 'optional'
      const defaultValue = arg.default ? ` (default: ${arg.default})` : ''
      output += `  -${arg.name}: ${arg.description} [${required}]${defaultValue}\n`
    })
    
    output += `Examples:\n`
    command.examples.forEach(example => {
      output += `  ${example}\n`
    })
    
    return { success: true, output }
  }
  
  // General help
  let output = `MAC CLI - AWS Infrastructure Management Tool\n`
  output += `${'='.repeat(50)}\n\n`
  output += `Available commands:\n\n`
  
  cliCommands.forEach(cmd => {
    output += `  ${cmd.command.padEnd(12)} ${cmd.description}\n`
  })
  
  output += `\nUsage: mac <command> [options]\n`
  output += `Use 'mac help <command>' for detailed help on a specific command.\n`
  output += `Use 'mac list services' to see available AWS services.\n`
  output += `Use 'mac list projects' to see available project templates.\n`
  
  return { success: true, output }
}

function generateModelContent(data: any, environment?: string, region?: string): string {
  const timestamp = new Date().toISOString()
  
  return `# Generated Infrastructure Model
# Service: ${data.name}
# Environment: ${environment || 'dev'}
# Region: ${region || 'us-east-1'}
# Generated: ${timestamp}

apiVersion: platform.io/v1
kind: InfrastructureModel
metadata:
  name: "${data.id}-model"
  description: "Infrastructure model for ${data.name}"
  environment: "${environment || 'dev'}"
  region: "${region || 'us-east-1'}"
  generated_at: "${timestamp}"
spec:
  service:
    id: "${data.id}"
    name: "${data.name}"
    category: "${data.category}"
    subcategory: "${data.subcategory}"
  dependencies:
${data.dependencies ? data.dependencies.map((dep: string) => `    - service: "${dep}"
      required: true`).join('\n') : ''}
  components:
    - name: "main"
      type: "${data.terraform_resource || data.id}"
      description: "Main ${data.name} resource"
      configuration:
        environment: "${environment || 'dev'}"
        region: "${region || 'us-east-1'}"
        tags:
          Environment: "${environment || 'dev'}"
          Service: "${data.name}"
          ManagedBy: "platform"
  compliance:
    standards:
${data.compliance_features ? data.compliance_features.map((feature: string) => `      - "${feature}"`).join('\n') : ''}
    required:
      - "encryption"
      - "monitoring"
      - "backup"
`
}

function generateDeploymentContent(data: any, environment?: string, region?: string): string {
  const timestamp = new Date().toISOString()
  
  return `# Generated Deployment Configuration
# Service: ${data.name}
# Environment: ${environment || 'dev'}
# Region: ${region || 'us-east-1'}
# Generated: ${timestamp}

apiVersion: platform.io/v1
kind: Deployment
metadata:
  name: "${data.id}-deployment"
  description: "Deployment configuration for ${data.name}"
  environment: "${environment || 'dev'}"
  region: "${region || 'us-east-1'}"
  generated_at: "${timestamp}"
spec:
  service:
    id: "${data.id}"
    name: "${data.name}"
    terraform_resource: "${data.terraform_resource || data.id}"
  environment: "${environment || 'dev'}"
  region: "${region || 'us-east-1'}"
  resources:
    - name: "main"
      type: "${data.terraform_resource || data.id}"
      properties:
        environment: "${environment || 'dev'}"
        region: "${region || 'us-east-1'}"
        tags:
          Environment: "${environment || 'dev'}"
          Service: "${data.name}"
          ManagedBy: "platform"
  monitoring:
    enabled: true
    metrics:
      - "cpu_utilization"
      - "memory_utilization"
      - "network_throughput"
    alerts:
      - "high_cpu"
      - "high_memory"
      - "disk_full"
  security:
    encryption: true
    access_logging: true
    compliance_checks:
${data.compliance_features ? data.compliance_features.map((feature: string) => `      - "${feature}"`).join('\n') : ''}
`
}

export async function POST(request: NextRequest) {
  try {
    const { command, args } = await request.json()
    
    if (!command) {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      )
    }
    
    const result = await executeCLICommand(command, args)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('CLI API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to execute command',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const helpCommand = searchParams.get('help')
    
    if (helpCommand) {
      const result = await handleHelp({ command: helpCommand })
      return NextResponse.json(result)
    }
    
    return NextResponse.json({
      success: true,
      commands: cliCommands,
      version: '1.0.0',
      description: 'MAC CLI - AWS Infrastructure Management Tool'
    })
    
  } catch (error) {
    console.error('CLI GET error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get CLI information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}