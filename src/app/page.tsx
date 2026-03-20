'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Cloud, 
  Server, 
  Database, 
  Network, 
  Shield, 
  BarChart3, 
  Cpu, 
  HardDrive, 
  Globe, 
  Terminal, 
  Code, 
  Layers, 
  GitBranch, 
  Wrench, 
  Search, 
  Play, 
  Download,
  Info,
  CheckCircle,
  AlertCircle,
  Zap,
  Box,
  Package,
  Building,
  Rocket,
  Settings,
  FileText,
  Monitor,
  Lock,
  Eye,
  ArrowRight
} from 'lucide-react'

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

interface Project {
  id: string
  name: string
  description: string
  services: string[]
  complexity: string
  estimated_cost: string
  terraform_example: string
}

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

export default function AWSInfrastructurePlatform() {
  const [activeTab, setActiveTab] = useState('services')
  const [services, setServices] = useState<AWSService[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedService, setSelectedService] = useState<AWSService | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [cliCommands, setCliCommands] = useState<CLICommand[]>([])
  const [cliOutput, setCliOutput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [cliCommand, setCliCommand] = useState('')
  const [cliArgs, setCliArgs] = useState('')
  const [generatedModel, setGeneratedModel] = useState('')
  const [generatedDeployment, setGeneratedDeployment] = useState('')

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load services
      const servicesResponse = await fetch('/api/aws-services')
      const servicesData = await servicesResponse.json()
      if (servicesData.success) {
        setServices(servicesData.services)
        setProjects(servicesData.projects)
        setCategories(servicesData.categories)
      }

      // Load CLI commands
      const cliResponse = await fetch('/api/cli')
      const cliData = await cliResponse.json()
      if (cliData.success) {
        setCliCommands(cliData.commands)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const executeCLICommand = async () => {
    if (!cliCommand.trim()) {
      setCliOutput('Error: Command is required')
      return
    }

    try {
      const response = await fetch('/api/cli', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: cliCommand,
          args: parseCLIArgs(cliArgs)
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setCliOutput(`$ ${cliCommand} ${cliArgs}\n${result.output}`)
      } else {
        setCliOutput(`$ ${cliCommand} ${cliArgs}\nError: ${result.error}`)
      }
    } catch (error) {
      setCliOutput(`$ ${cliCommand} ${cliArgs}\nError: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const parseCLIArgs = (argsString: string) => {
    const args: any = {}
    const parts = argsString.split(' ')
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (part.startsWith('-')) {
        const key = part.replace('-', '')
        if (i + 1 < parts.length && !parts[i + 1].startsWith('-')) {
          args[key] = parts[i + 1]
          i++ // Skip next part as it's the value
        } else {
          args[key] = true
        }
      }
    }
    
    return args
  }

  const generateModel = async (serviceId: string) => {
    try {
      const response = await fetch('/api/aws-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_model',
          serviceId,
          config: {
            environment: 'production',
            region: 'us-east-1'
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        const yamlString = JSON.stringify(result.model, null, 2)
        setGeneratedModel(yamlString)
      }
    } catch (error) {
      console.error('Failed to generate model:', error)
    }
  }

  const generateDeployment = async (serviceId: string) => {
    try {
      const response = await fetch('/api/aws-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_deployment',
          serviceId,
          config: {
            environment: 'production',
            region: 'us-east-1'
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        const yamlString = JSON.stringify(result.deployment, null, 2)
        setGeneratedDeployment(yamlString)
      }
    } catch (error) {
      console.error('Failed to generate deployment:', error)
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = !searchTerm || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || service.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Compute': <Cpu className="h-5 w-5" />,
      'Storage': <HardDrive className="h-5 w-5" />,
      'Database': <Database className="h-5 w-5" />,
      'Networking': <Network className="h-5 w-5" />,
      'Security': <Shield className="h-5 w-5" />,
      'Analytics': <BarChart3 className="h-5 w-5" />,
      'Machine Learning': <Zap className="h-5 w-5" />,
      'Internet of Things': <Globe className="h-5 w-5" />,
      'DevOps': <Terminal className="h-5 w-5" />,
      'Monitoring': <Monitor className="h-5 w-5" />,
      'Management Tools': <Settings className="h-5 w-5" />
    }
    return iconMap[category] || <Box className="h-5 w-5" />
  }

  const getComplexityColor = (complexity: string) => {
    const colorMap: Record<string, string> = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800'
    }
    return colorMap[complexity] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-orange-600 rounded-lg">
              <Cloud className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">AWS Infrastructure Platform</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Complete AWS infrastructure management with 250+ services, 50+ real-world projects, and powerful CLI tools.
            Generate infrastructure models and deployment files for any AWS service.
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="cli" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span className="hidden sm:inline">CLI</span>
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Generator</span>
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">Connections</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  AWS Services Catalog (250+ Services)
                </CardTitle>
                <CardDescription>
                  Browse and explore all AWS services with detailed configurations and examples
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Services Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredServices.map((service) => (
                    <Card key={service.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getCategoryIcon(service.category)}
                          {service.name}
                        </CardTitle>
                        <CardDescription>{service.subcategory}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 mb-3">{service.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{service.category}</Badge>
                            <Badge variant="outline">{service.pricing_model}</Badge>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedService(service)}
                            >
                              <Info className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => generateModel(service.id)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Model
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => generateDeployment(service.id)}
                            >
                              <Rocket className="h-4 w-4 mr-1" />
                              Deploy
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Service Details Modal */}
            {selectedService && (
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {getCategoryIcon(selectedService.category)}
                      {selectedService.name}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedService(null)}
                    >
                      Close
                    </Button>
                  </CardTitle>
                  <CardDescription>{selectedService.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2">Use Cases</h4>
                      <ul className="text-sm space-y-1">
                        {selectedService.use_cases.map((useCase, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {useCase}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Dependencies</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedService.dependencies.map((dep, index) => (
                          <Badge key={index} variant="secondary">{dep}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Compliance Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.compliance_features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-green-700 border-green-700">
                          <Lock className="h-3 w-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Common Configurations</h4>
                    <div className="space-y-3">
                      {selectedService.common_configurations.map((config, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <h5 className="font-medium">{config.name}</h5>
                          <p className="text-sm text-slate-600 mb-2">{config.description}</p>
                          <pre className="text-xs bg-slate-100 p-2 rounded overflow-x-auto">
                            {config.terraform_code}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Real-World Projects (50+ Projects)
                </CardTitle>
                <CardDescription>
                  Complete infrastructure projects with real-world AWS service integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {projects.map((project) => (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge className={getComplexityColor(project.complexity)}>
                              {project.complexity}
                            </Badge>
                            <Badge variant="outline">{project.estimated_cost}</Badge>
                          </div>
                          
                          <div>
                            <h5 className="font-medium mb-2">Services Used:</h5>
                            <div className="flex flex-wrap gap-1">
                              {project.services.map((service, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <Button
                            className="w-full"
                            onClick={() => setSelectedProject(project)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Details Modal */}
            {selectedProject && (
              <Card className="border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {selectedProject.name}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProject(null)}
                    >
                      Close
                    </Button>
                  </CardTitle>
                  <CardDescription>{selectedProject.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedProject.services.length}
                      </div>
                      <div className="text-sm text-slate-600">Services</div>
                    </div>
                    <div className="text-center">
                      <Badge className={getComplexityColor(selectedProject.complexity)}>
                        {selectedProject.complexity}
                      </Badge>
                      <div className="text-sm text-slate-600 mt-1">Complexity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {selectedProject.estimated_cost}
                      </div>
                      <div className="text-sm text-slate-600">Est. Cost</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Terraform Example</h4>
                    <pre className="text-xs bg-slate-100 p-4 rounded overflow-x-auto max-h-96">
                      {selectedProject.terraform_example}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cli" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  MAC CLI - Infrastructure Management
                </CardTitle>
                <CardDescription>
                  Command-line interface for generating models, deployments, and managing infrastructure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* CLI Command Input */}
                <div className="space-y-2">
                  <Label htmlFor="cli-command">Command</Label>
                  <Select value={cliCommand} onValueChange={setCliCommand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select command" />
                    </SelectTrigger>
                    <SelectContent>
                      {cliCommands.map((cmd) => (
                        <SelectItem key={cmd.command} value={cmd.command}>
                          {cmd.command} - {cmd.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cli-args">Arguments</Label>
                  <Input
                    id="cli-args"
                    placeholder="e.g., -o basemodel.yaml -t model -service ec2"
                    value={cliArgs}
                    onChange={(e) => setCliArgs(e.target.value)}
                  />
                </div>
                
                <Button onClick={executeCLICommand} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Execute Command
                </Button>
                
                {/* CLI Output */}
                {cliOutput && (
                  <div className="space-y-2">
                    <Label>Output</Label>
                    <pre className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
                      {cliOutput}
                    </pre>
                  </div>
                )}
                
                {/* Command Examples */}
                <div className="space-y-2">
                  <Label>Command Examples:</Label>
                  <div className="space-y-1">
                    <div className="bg-slate-100 p-2 rounded font-mono text-sm">
                      mac generate -c -o basemodel.yaml -t model -service ec2
                    </div>
                    <div className="bg-slate-100 p-2 rounded font-mono text-sm">
                      mac generate -o deployment.yaml -t deployment -project 3-tier-web-app
                    </div>
                    <div className="bg-slate-100 p-2 rounded font-mono text-sm">
                      mac list services -category compute
                    </div>
                    <div className="bg-slate-100 p-2 rounded font-mono text-sm">
                      mac deploy -model basemodel.yaml -deployment deployment.yaml
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generator" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Model Generator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Infrastructure Model Generator
                  </CardTitle>
                  <CardDescription>
                    Generate high-level infrastructure model files
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model-service">Select Service</Label>
                    <Select onValueChange={(value) => generateModel(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {generatedModel && (
                    <div className="space-y-2">
                      <Label>Generated Model</Label>
                      <Textarea
                        value={generatedModel}
                        readOnly
                        className="min-h-[300px] font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const blob = new Blob([generatedModel], { type: 'text/yaml' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = 'infrastructure-model.yaml'
                          a.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Model
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Deployment Generator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5" />
                    Deployment Generator
                  </CardTitle>
                  <CardDescription>
                    Generate detailed deployment configuration files
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deployment-service">Select Service</Label>
                    <Select onValueChange={(value) => generateDeployment(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {generatedDeployment && (
                    <div className="space-y-2">
                      <Label>Generated Deployment</Label>
                      <Textarea
                        value={generatedDeployment}
                        readOnly
                        className="min-h-[300px] font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const blob = new Blob([generatedDeployment], { type: 'text/yaml' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = 'deployment.yaml'
                          a.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Deployment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Generated Files Display */}
            {(generatedModel || generatedDeployment) && (
              <Card className="border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Generated Files Ready
                  </CardTitle>
                  <CardDescription>
                    Your infrastructure files have been generated successfully
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You can now use these files with the MAC CLI to deploy your infrastructure.
                      Use the CLI tab to execute deployment commands.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="connections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  AWS Service Connections
                </CardTitle>
                <CardDescription>
                  Visualize how AWS services connect in real-world architectures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Connection Examples */}
                  <Card className="border-2 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Web Application</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">VPC</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Subnet</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="text-sm">EC2</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-sm">ALB</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Serverless API</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm">API Gateway</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm">Lambda</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                          <span className="text-sm">DynamoDB</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Data Processing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                          <span className="text-sm">Kinesis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                          <span className="text-sm">Lambda</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                          <span className="text-sm">S3</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-orange-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Container Architecture</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-sm">ECS</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">ECR</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">ALB</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-red-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Machine Learning</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm">SageMaker</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="text-sm">S3</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm">Lambda</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-indigo-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">IoT Platform</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                          <span className="text-sm">IoT Core</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Kinesis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4" />
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">Lambda</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert className="mt-6">
                  <AlertDescription>
                    These connection diagrams show how AWS services integrate in real-world architectures.
                    Each service has dependencies and related services that work together to build complete solutions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}