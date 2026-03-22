'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { AWSService, CatalogSummary, Project } from '@/lib/aws-types'
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Box,
  CheckCircle,
  Cloud,
  Code,
  Cpu,
  Database,
  Download,
  Eye,
  FileText,
  Globe,
  HardDrive,
  Info,
  Layers,
  Lock,
  Monitor,
  Network,
  Package,
  Play,
  Rocket,
  Search,
  Server,
  Settings,
  Shield,
  Sparkles,
  Terminal,
  Zap,
  Home,
} from 'lucide-react'

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

const DETAIL_PANEL_BREAKPOINT = 1024

const connectionExamples = [
  {
    title: 'Web Application',
    color: 'border-blue-200',
    items: ['VPC', 'Subnet', 'EC2', 'ALB'],
  },
  {
    title: 'Serverless API',
    color: 'border-green-200',
    items: ['API Gateway', 'Lambda', 'DynamoDB'],
  },
  {
    title: 'Data Processing',
    color: 'border-purple-200',
    items: ['Kinesis', 'Lambda', 'S3'],
  },
  {
    title: 'Container Platform',
    color: 'border-orange-200',
    items: ['ECS', 'ECR', 'ALB'],
  },
  {
    title: 'Machine Learning',
    color: 'border-red-200',
    items: ['SageMaker', 'S3', 'Lambda'],
  },
  {
    title: 'IoT Platform',
    color: 'border-indigo-200',
    items: ['IoT Core', 'Kinesis', 'Lambda'],
  },
]

export default function AWSInfrastructurePlatform() {
  const [activeTab, setActiveTab] = useState('home')
  const [services, setServices] = useState<AWSService[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [summary, setSummary] = useState<CatalogSummary>({
    total_services: 0,
    total_projects: 0,
    total_categories: 0,
  })
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [cliCommands, setCliCommands] = useState<CLICommand[]>([])
  const [cliOutput, setCliOutput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cliCommand, setCliCommand] = useState('')
  const [cliArgs, setCliArgs] = useState('')
  const [generatedModel, setGeneratedModel] = useState('')
  const [generatedDeployment, setGeneratedDeployment] = useState('')
  const [isDesktop, setIsDesktop] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= DETAIL_PANEL_BREAKPOINT)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const servicesResponse = await fetch('/api/aws-services')
      const servicesData = await servicesResponse.json()
      if (servicesData.success) {
        setServices(servicesData.services)
        setProjects(servicesData.projects)
        setCategories(servicesData.categories)
        setSummary(servicesData.summary)
      }

      const cliResponse = await fetch('/api/cli')
      const cliData = await cliResponse.json()
      if (cliData.success) {
        setCliCommands(cliData.commands)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const parseCLIArgs = (argsString: string) => {
    const args: Record<string, string | boolean> = {}
    const parts = argsString.split(' ').filter(Boolean)

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (part.startsWith('-')) {
        const key = part.replace(/^-+/, '')
        if (i + 1 < parts.length && !parts[i + 1].startsWith('-')) {
          args[key] = parts[i + 1]
          i += 1
        } else {
          args[key] = true
        }
      }
    }

    return args
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
          args: parseCLIArgs(cliArgs),
        }),
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
            region: 'us-east-1',
          },
        }),
      })

      const result = await response.json()
      if (result.success) {
        setGeneratedModel(JSON.stringify(result.model, null, 2))
        setActiveTab('generator')
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
            region: 'us-east-1',
          },
        }),
      })

      const result = await response.json()
      if (result.success) {
        setGeneratedDeployment(JSON.stringify(result.deployment, null, 2))
        setActiveTab('generator')
      }
    } catch (error) {
      console.error('Failed to generate deployment:', error)
    }
  }

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const normalizedSearch = searchTerm.toLowerCase()
      const matchesSearch =
        !searchTerm ||
        service.name.toLowerCase().includes(normalizedSearch) ||
        service.description.toLowerCase().includes(normalizedSearch) ||
        service.category.toLowerCase().includes(normalizedSearch) ||
        service.use_cases.some((useCase) => useCase.toLowerCase().includes(normalizedSearch))

      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory, services])

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [selectedServiceId, services]
  )

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  )

  const featuredServices = useMemo(() => {
    const featuredIds = ['ec2', 'lambda', 's3', 'rds', 'dynamodb', 'api-gateway', 'eventbridge', 'ecr']
    return featuredIds
      .map((id) => services.find((service) => service.id === id))
      .filter(Boolean) as AWSService[]
  }, [services])

  const topProjects = useMemo(() => projects.slice(0, 4), [projects])

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, JSX.Element> = {
      Compute: <Cpu className="h-5 w-5" />,
      Storage: <HardDrive className="h-5 w-5" />,
      Database: <Database className="h-5 w-5" />,
      Networking: <Network className="h-5 w-5" />,
      Security: <Shield className="h-5 w-5" />,
      Analytics: <BarChart3 className="h-5 w-5" />,
      'Machine Learning': <Zap className="h-5 w-5" />,
      'Internet of Things': <Globe className="h-5 w-5" />,
      DevOps: <Terminal className="h-5 w-5" />,
      Monitoring: <Monitor className="h-5 w-5" />,
      'Management Tools': <Settings className="h-5 w-5" />,
      'Application Integration': <Sparkles className="h-5 w-5" />,
    }

    return iconMap[category] || <Box className="h-5 w-5" />
  }

  const getComplexityColor = (complexity: string) => {
    const colorMap: Record<string, string> = {
      Low: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      High: 'bg-red-100 text-red-800',
    }

    return colorMap[complexity] || 'bg-slate-100 text-slate-800'
  }

  const downloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const closeServiceDetails = () => setSelectedServiceId(null)
  const closeProjectDetails = () => setSelectedProjectId(null)

  const ServiceDetailBody = selectedService ? (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-orange-500/20 p-2 text-orange-300">
            {getCategoryIcon(selectedService.category)}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold text-white">{selectedService.name}</h3>
              <Badge variant="secondary">{selectedService.category}</Badge>
              <Badge variant="outline">{selectedService.subcategory}</Badge>
            </div>
            <p className="text-sm text-slate-300">{selectedService.description}</p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-180px)] px-6 pb-6">
        <div className="space-y-6 py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={() => generateModel(selectedService.id)}>
              <FileText className="mr-2 h-4 w-4" />
              Generate model
            </Button>
            <Button variant="outline" onClick={() => generateDeployment(selectedService.id)}>
              <Rocket className="mr-2 h-4 w-4" />
              Generate deployment
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              <TabsTrigger value="configurations">Configs</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Common use cases</CardTitle>
                  <CardDescription>Where teams usually start with this service.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedService.use_cases.map((useCase) => (
                    <div key={useCase} className="flex items-start gap-2 text-sm text-slate-200">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-400" />
                      <span>{useCase}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Related services</CardTitle>
                  <CardDescription>Helpful companions for a real architecture.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {selectedService.related_services.map((service) => (
                    <Badge key={service} variant="outline">
                      {service}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dependencies" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dependencies</CardTitle>
                  <CardDescription>Infrastructure pieces often required alongside this service.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {selectedService.dependencies.map((dependency) => (
                    <Badge key={dependency} variant="secondary">
                      {dependency}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configurations" className="space-y-4">
              {selectedService.common_configurations.map((config) => (
                <Card key={config.name}>
                  <CardHeader>
                    <CardTitle className="text-base">{config.name}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
                      {config.terraform_code}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Compliance and operations</CardTitle>
                  <CardDescription>Security and audit capabilities already associated with this service.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {selectedService.compliance_features.map((feature) => (
                    <Badge key={feature} variant="outline" className="border-green-400/40 text-green-300">
                      <Lock className="mr-1 h-3 w-3" />
                      {feature}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  ) : null

  return (
    <div className="galaxy-bg min-h-screen text-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="glass-strong overflow-hidden rounded-3xl shadow-2xl glow-purple">
          <div className="border-b border-white/10 px-6 py-12 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="space-y-6">
                <Badge className="bg-orange-500/15 text-orange-200 hover:bg-orange-500/15">
                  AWS platform explorer
                </Badge>
                <div className="space-y-4">
                  <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
                    Explore AWS services, architectures, and deployment patterns without the friction.
                  </h1>
                  <p className="max-w-3xl text-lg text-slate-300">
                    Browse core AWS services, inspect infrastructure details instantly, explore real project patterns,
                    and generate model or deployment files from one cleaner landing experience.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setActiveTab('services')}
                    disabled={isLoading || summary.total_services === 0}
                    className="bg-orange-600 hover:bg-orange-500"
                  >
                    Browse services
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('projects')}
                    disabled={isLoading || summary.total_projects === 0}
                  >
                    Explore projects
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <Card className="glass rounded-2xl text-white glow-orange">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-slate-300">Services</CardDescription>
                    <CardTitle className="text-3xl">{summary.total_services}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-300">Curated core cloud services with dependencies, configs, and compliance notes.</CardContent>
                </Card>
                <Card className="glass rounded-2xl text-white">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-slate-300">Projects</CardDescription>
                    <CardTitle className="text-3xl">{summary.total_projects}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-300">Real architecture examples that connect multiple AWS services into deployable patterns.</CardContent>
                </Card>
                <Card className="glass rounded-2xl text-white">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-slate-300">Categories</CardDescription>
                    <CardTitle className="text-3xl">{summary.total_categories}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-300">Searchable by platform area so navigation stays easy as the catalog grows.</CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-6 py-6 lg:px-10">
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Featured services</h2>
                  <p className="text-sm text-slate-300">Jump straight into the services most teams reach for first.</p>
                </div>
                <Button variant="ghost" className="text-slate-200" onClick={() => setActiveTab('services')}>
                  Full catalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {featuredServices.map((service) => (
                  <Card key={service.id} className="glass rounded-2xl text-white transition hover:-translate-y-1 hover:shadow-xl glow-orange">
                    <CardHeader>
                      <div className="flex items-center gap-2 text-orange-300">
                        {getCategoryIcon(service.category)}
                        <span className="text-sm font-medium">{service.category}</span>
                      </div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription className="text-slate-300">{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" onClick={() => {
                        setActiveTab('services')
                        setSelectedServiceId(service.id)
                      }}>
                        View details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Featured solution paths</h2>
                <p className="text-sm text-slate-300">Start from complete architectures when you want a guided entry point.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {topProjects.map((project) => (
                  <Card key={project.id} className="border-white/10 bg-white/5 text-white">
                    <CardHeader>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getComplexityColor(project.complexity)}>{project.complexity}</Badge>
                        <Badge variant="outline">{project.estimated_cost}</Badge>
                      </div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="text-slate-300">{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" onClick={() => {
                        setActiveTab('projects')
                        setSelectedProjectId(project.id)
                      }}>
                        View project
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl glass p-2 md:grid-cols-6">
                <TabsTrigger value="home" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Projects
                </TabsTrigger>
                <TabsTrigger value="cli" className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  CLI
                </TabsTrigger>
                <TabsTrigger value="generator" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Generator
                </TabsTrigger>
                <TabsTrigger value="connections" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Connections
                </TabsTrigger>
              </TabsList>

              <TabsContent value="home" className="space-y-6">
                <div className="space-y-6 px-6 py-6 lg:px-10">
                  <section className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-white">Featured services</h2>
                        <p className="text-sm text-slate-300">Jump straight into the services most teams reach for first.</p>
                      </div>
                      <Button variant="ghost" className="text-slate-200" onClick={() => setActiveTab('services')}>
                        Full catalog
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {featuredServices.map((service) => (
                        <Card key={service.id} className="glass rounded-2xl text-white transition hover:-translate-y-1 hover:shadow-xl glow-orange">
                          <CardHeader>
                            <div className="flex items-center gap-2 text-orange-300">
                              {getCategoryIcon(service.category)}
                              <span className="text-sm font-medium">{service.category}</span>
                            </div>
                            <CardTitle className="text-lg">{service.name}</CardTitle>
                            <CardDescription className="text-slate-300">{service.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex flex-wrap gap-1">
                              {service.dependencies.slice(0, 3).map((dep) => (
                                <Badge key={dep} variant="secondary" className="text-xs">
                                  {dep}
                                </Badge>
                              ))}
                              {service.dependencies.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{service.dependencies.length - 3} more
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="secondary" onClick={() => setSelectedServiceId(service.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Details
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => generateModel(service.id)}>
                                <Code className="mr-2 h-4 w-4" />
                                Generate Model
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Recent projects</h2>
                      <p className="text-sm text-slate-300">Architecture patterns and real-world examples.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {topProjects.map((project) => (
                        <Card key={project.id} className="glass rounded-2xl text-white">
                          <CardHeader>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={getComplexityColor(project.complexity)}>{project.complexity}</Badge>
                              <Badge variant="outline">{project.estimated_cost}</Badge>
                            </div>
                            <CardTitle className="text-lg">{project.name}</CardTitle>
                            <CardDescription className="text-slate-300">{project.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {project.services.slice(0, 6).map((service) => (
                                <Badge key={service} variant="secondary">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                            <Button className="mt-4 w-full" onClick={() => {
                              setActiveTab('projects')
                              setSelectedProjectId(project.id)
                            }}>
                              View project
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <Card className="glass-strong rounded-2xl text-white">
                  <CardHeader className="space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <Server className="h-5 w-5 text-orange-300" />
                          Services explorer
                        </CardTitle>
                        <CardDescription className="text-slate-300">
                          Search by service name, use case, or category and open details instantly.
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Search className="h-4 w-4" />
                        {filteredServices.length} services visible
                      </div>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                      <Input
                        placeholder="Search services, use cases, and categories..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        disabled={isLoading || categories.length === 0}
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 backdrop-blur-sm"
                      />
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                        disabled={isLoading || categories.length === 0}
                      >
                        <SelectTrigger className="border-white/10 bg-white/5 text-white backdrop-blur-sm">
                          <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
                        <span className="ml-3 text-slate-300">Loading services...</span>
                      </div>
                    ) : filteredServices.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 glass-subtle p-10 text-center">
                        <p className="text-lg font-medium text-white">No services match this search yet.</p>
                        <p className="mt-2 text-sm text-slate-400">Try a different category or search by architecture use case.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredServices.map((service) => (
                          <Card key={service.id} className="glass rounded-2xl text-white transition hover:-translate-y-0.5 hover:border-orange-400/40 hover:shadow-xl">
                            <CardHeader className="space-y-3 pb-3">
                              <div className="flex items-center gap-2 text-orange-300">
                                {getCategoryIcon(service.category)}
                                <span className="text-sm">{service.category}</span>
                              </div>
                              <div>
                                <CardTitle className="text-lg">{service.name}</CardTitle>
                                <CardDescription className="text-slate-300">{service.subcategory}</CardDescription>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-sm text-slate-300">{service.description}</p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">{service.pricing_model}</Badge>
                                {service.use_cases.slice(0, 2).map((useCase) => (
                                  <Badge key={useCase} variant="outline">{useCase}</Badge>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" onClick={() => setSelectedServiceId(service.id)}>
                                  <Info className="mr-2 h-4 w-4" />
                                  Details
                                </Button>
                                <Button size="sm" onClick={() => generateModel(service.id)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Model
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => generateDeployment(service.id)}>
                                  <Rocket className="mr-2 h-4 w-4" />
                                  Deploy
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-6">
                <Card className="glass-strong rounded-2xl text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Package className="h-5 w-5 text-orange-300" />
                      Project blueprints
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Explore real-world architecture patterns and inspect the services they combine.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
                        <span className="ml-3 text-slate-300">Loading projects...</span>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {projects.map((project) => (
                          <Card key={project.id} className="glass rounded-2xl text-white">
                            <CardHeader>
                              <div className="flex flex-wrap gap-2">
                                <Badge className={getComplexityColor(project.complexity)}>{project.complexity}</Badge>
                                <Badge variant="outline">{project.estimated_cost}</Badge>
                              </div>
                              <CardTitle className="text-lg">{project.name}</CardTitle>
                              <CardDescription className="text-slate-300">{project.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex flex-wrap gap-2">
                                {project.services.slice(0, 6).map((service) => (
                                  <Badge key={service} variant="secondary">
                                    {service}
                                  </Badge>
                                ))}
                              </div>
                              <Button className="w-full" onClick={() => setSelectedProjectId(project.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View blueprint
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cli" className="space-y-6">
                <Card className="glass-strong rounded-2xl text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Terminal className="h-5 w-5 text-orange-300" />
                      npx mac CLI
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Simulate common infrastructure management commands and workflows. Use with npx mac for real-world CLI experience.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
                        <span className="ml-3 text-slate-300">Loading CLI...</span>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="cli-command">Command</Label>
                          <Select value={cliCommand} onValueChange={setCliCommand}>
                            <SelectTrigger className="border-white/10 bg-white/5 text-white backdrop-blur-sm">
                              <SelectValue placeholder="Select command" />
                            </SelectTrigger>
                            <SelectContent>
                              {cliCommands.map((command) => (
                                <SelectItem key={command.command} value={command.command}>
                                  {command.command} - {command.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cli-args">Arguments</Label>
                          <Input
                            id="cli-args"
                            placeholder="e.g. -o basemodel.yaml -t model -service ec2"
                            value={cliArgs}
                            onChange={(event) => setCliArgs(event.target.value)}
                            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 backdrop-blur-sm"
                          />
                        </div>

                        <Button onClick={executeCLICommand} className="w-full bg-orange-600 hover:bg-orange-500">
                          <Play className="mr-2 h-4 w-4" />
                          Execute command
                        </Button>

                        {cliOutput && (
                          <div className="space-y-2">
                            <Label>Output</Label>
                            <pre className="overflow-x-auto rounded-xl bg-slate-950/80 p-4 font-mono text-sm text-green-300">
                              {cliOutput}
                            </pre>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="generator" className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-2">
                  <Card className="glass-strong rounded-2xl text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <FileText className="h-5 w-5 text-orange-300" />
                        Infrastructure model generator
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        Generate a structured infrastructure model for any service in the catalog. Outputs both platform YAML and Terraform HCL.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="model-service">Select service</Label>
                        <Select onValueChange={generateModel}>
                          <SelectTrigger className="border-white/10 bg-white/5 text-white backdrop-blur-sm">
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
                          <Label>Generated model</Label>
                          <Textarea value={generatedModel} readOnly className="min-h-[320px] bg-white/5 font-mono text-sm text-white backdrop-blur-sm" />
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => downloadText(generatedModel, 'infrastructure-model.yaml')}>
                              <Download className="mr-2 h-4 w-4" />
                              Download YAML
                            </Button>
                            <Button variant="outline" onClick={() => downloadText(generatedModel, 'infrastructure-model.tf')}>
                              <Download className="mr-2 h-4 w-4" />
                              Download Terraform
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="glass-strong rounded-2xl text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Rocket className="h-5 w-5 text-orange-300" />
                        Deployment generator
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        Generate deployment configuration output for the selected service. Outputs both platform YAML and Terraform HCL.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deployment-service">Select service</Label>
                        <Select onValueChange={generateDeployment}>
                          <SelectTrigger className="border-white/10 bg-white/5 text-white backdrop-blur-sm">
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
                          <Label>Generated deployment</Label>
                          <Textarea value={generatedDeployment} readOnly className="min-h-[320px] bg-white/5 font-mono text-sm text-white backdrop-blur-sm" />
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => downloadText(generatedDeployment, 'deployment.yaml')}>
                              <Download className="mr-2 h-4 w-4" />
                              Download YAML
                            </Button>
                            <Button variant="outline" onClick={() => downloadText(generatedDeployment, 'deployment.tf')}>
                              <Download className="mr-2 h-4 w-4" />
                              Download Terraform
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {(generatedModel || generatedDeployment) && (
                  <Alert className="border-green-700/40 bg-green-500/10 text-green-100">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your generated files are ready. Download YAML for platform import or Terraform for direct AWS deployment using npx mac.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="connections" className="space-y-6">
                <Card className="glass-strong rounded-2xl text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Network className="h-5 w-5 text-orange-300" />
                      Connection patterns
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Understand how services combine in common AWS architectures.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {connectionExamples.map((example) => (
                        <Card key={example.title} className={`border ${example.color} glass rounded-2xl text-white`}>
                          <CardHeader>
                            <CardTitle className="text-lg">{example.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm text-slate-300">
                            {example.items.map((item, index) => (
                              <div key={item} className="flex items-center gap-2">
                                {index > 0 && <ArrowRight className="h-4 w-4 text-orange-300" />}
                                <span>{item}</span>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Sheet open={Boolean(selectedService && isDesktop)} onOpenChange={(open) => !open && closeServiceDetails()}>
        <SheetContent className="w-full border-white/10 bg-slate-950/95 backdrop-blur-xl p-0 text-white sm:max-w-2xl">
          <SheetHeader className="sr-only">
            <SheetTitle>{selectedService?.name ?? 'Service details'}</SheetTitle>
            <SheetDescription>{selectedService?.description ?? 'Inspect service details and configurations.'}</SheetDescription>
          </SheetHeader>
          {ServiceDetailBody}
        </SheetContent>
      </Sheet>

      <Drawer open={Boolean(selectedService && !isDesktop)} onOpenChange={(open) => !open && closeServiceDetails()}>
        <DrawerContent className="max-h-[88vh] bg-slate-950/95 backdrop-blur-xl text-white">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{selectedService?.name ?? 'Service details'}</DrawerTitle>
            <DrawerDescription>{selectedService?.description ?? 'Inspect service details and configurations.'}</DrawerDescription>
          </DrawerHeader>
          {ServiceDetailBody}
        </DrawerContent>
      </Drawer>

      <Sheet open={Boolean(selectedProject)} onOpenChange={(open) => !open && closeProjectDetails()}>
        <SheetContent className="w-full border-white/10 bg-slate-950/95 backdrop-blur-xl p-0 text-white sm:max-w-2xl">
          <SheetHeader className="border-b border-white/10 px-6 py-4">
            <SheetTitle>{selectedProject?.name ?? 'Project details'}</SheetTitle>
            <SheetDescription>{selectedProject?.description ?? 'Inspect the selected architecture blueprint.'}</SheetDescription>
          </SheetHeader>
          {selectedProject && (
            <ScrollArea className="h-[calc(100vh-120px)] px-6 pb-6">
              <div className="space-y-6 py-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Services</CardDescription>
                      <CardTitle>{selectedProject.services.length}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Complexity</CardDescription>
                      <CardTitle>{selectedProject.complexity}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Estimated cost</CardDescription>
                      <CardTitle>{selectedProject.estimated_cost}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Included services</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {selectedProject.services.map((service) => (
                      <Badge key={service} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Terraform example</CardTitle>
                    <CardDescription>Reference blueprint for the selected architecture.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
                      {selectedProject.terraform_example}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
