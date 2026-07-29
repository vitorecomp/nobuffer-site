terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

module "load_balancer" {
  source      = "../../modules/load-balancer"
  bucket_name = var.bucket_name
  domain      = var.domain
}
