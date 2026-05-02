variable "bucket_name" {
  description = "The name of the GCS bucket"
  type        = string
}

variable "domain" {
  description = "The domain names for the SSL certificate"
  type        = list(string)
}
