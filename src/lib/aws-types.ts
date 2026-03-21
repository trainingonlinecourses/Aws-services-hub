export interface AWSService {
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

export interface Project {
  id: string
  name: string
  description: string
  services: string[]
  complexity: string
  estimated_cost: string
  terraform_example: string
}

export interface CatalogSummary {
  total_services: number
  total_projects: number
  total_categories: number
}
