provider "google" {
  project = var.project_id
  region  = var.region
}

# Create the GCS Bucket for static website hosting
resource "google_storage_bucket" "default" {
  name          = var.bucket_name
  location      = "US"
  force_destroy = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}

# Make the bucket public
resource "google_storage_bucket_iam_member" "public_rule" {
  bucket = google_storage_bucket.default.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

module "load_balancer" {
  source      = "../../modules/load-balancer"
  bucket_name = google_storage_bucket.default.name
}

# Output the Load Balancer IP
output "load_balancer_ip" {
  value = module.load_balancer.load_balancer_ip
}
