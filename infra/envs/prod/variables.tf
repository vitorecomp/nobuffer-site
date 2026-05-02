variable "project_id" {
  description = "The GCP Project ID"
  type        = string
}

variable "region" {
  description = "The region for resources"
  type        = string
  default     = "us-central1"
}

variable "bucket_name" {
  description = "The name of the bucket to create"
  type        = string
}

variable "domain" {
  description = "The domain names for the SSL certificate"
  type        = list(string)
}
