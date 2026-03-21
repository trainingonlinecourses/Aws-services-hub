import { NextRequest, NextResponse } from 'next/server'
import { awsServices, categories, catalogSummary, getProjectById, getServiceById, realWorldProjects } from '@/lib/aws-catalog'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const serviceId = searchParams.get('service')
    const projectId = searchParams.get('project')

    if (serviceId) {
      const service = getServiceById(serviceId)
      if (!service) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, service })
    }

    if (projectId) {
      const project = getProjectById(projectId)
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, project })
    }

    if (category) {
      const filteredServices = awsServices.filter((service) => service.category.toLowerCase() === category.toLowerCase())
      return NextResponse.json({
        success: true,
        services: filteredServices,
        category,
      })
    }

    return NextResponse.json({
      success: true,
      services: awsServices,
      projects: realWorldProjects,
      categories,
      summary: catalogSummary,
    })
  } catch (error) {
    console.error('AWS services API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch AWS services',
        details: error instanceof Error ? error.message : 'Unknown error',
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
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

function generateInfraModel(serviceId: string, config: any = {}) {
  const service = getServiceById(serviceId)
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
      generated_at: new Date().toISOString(),
    },
    spec: {
      service: {
        id: service.id,
        name: service.name,
        category: service.category,
        subcategory: service.subcategory,
      },
      dependencies: service.dependencies.map((dependency) => ({
        service_id: dependency.toLowerCase(),
        required: true,
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
            tags: config.tags || {},
          },
        },
      ],
      compliance: {
        standards: service.compliance_features,
        required: ['encryption', 'monitoring', 'backup'],
      },
    },
  }

  return NextResponse.json({
    success: true,
    model: infraModel,
    service,
  })
}

function generateDeploymentFile(serviceId: string, config: any = {}) {
  const service = getServiceById(serviceId)
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
      generated_at: new Date().toISOString(),
    },
    spec: {
      service: {
        id: service.id,
        name: service.name,
        terraform_resource: service.terraform_resource,
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
              ...config.tags,
            },
          },
        },
      ],
      monitoring: {
        enabled: true,
        metrics: ['cpu_utilization', 'memory_utilization', 'network_throughput'],
        alerts: ['high_cpu', 'high_memory', 'disk_full'],
      },
      security: {
        encryption: true,
        access_logging: true,
        compliance_checks: service.compliance_features,
      },
    },
  }

  return NextResponse.json({
    success: true,
    deployment,
    service,
  })
}

function getProjectDetails(projectId: string) {
  const project = getProjectById(projectId)
  if (!project) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    project,
    related_services: project.services
      .map((serviceId) => awsServices.find((service) => service.id.toLowerCase() === serviceId.toLowerCase()))
      .filter(Boolean),
  })
}
