provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

module "load_balancer" {
  source      = "../../modules/load-balancer"
  bucket_name = var.bucket_name
  domain      = var.domain
}

# Output the Load Balancer IP
output "load_balancer_ip" {
  value = module.load_balancer.load_balancer_ip
}
