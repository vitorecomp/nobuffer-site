
data "google_project" "current" {}

# Create the GCS Bucket for static website hosting
resource "google_storage_bucket" "website_bucket" {
  name          = var.bucket_name
  location      = "US"
  force_destroy = true

  uniform_bucket_level_access = true
  public_access_prevention    = "inherited"

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}

# Make the bucket public for static website hosting
resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.website_bucket.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Reserve a static external IP address
resource "google_compute_global_address" "nobuffer_site_ip" {
  name = "nobuffer-site-ip"
}

# Create a Backend Bucket with CDN enabled
resource "google_compute_backend_bucket" "nobuffer_site_backend" {
  name        = "nobuffer-site-backend"
  bucket_name = google_storage_bucket.website_bucket.name
  enable_cdn  = true

  cdn_policy {
    cache_mode        = "CACHE_ALL_STATIC"
    client_ttl        = 3600
    default_ttl       = 3600
    max_ttl           = 86400
    negative_caching  = true
    serve_while_stale = 86400
  }
}

# Create a URL Map to route requests to the backend bucket
resource "google_compute_url_map" "nobuffer_site_url_map" {
  name            = "nobuffer-site-url-map"
  default_service = google_compute_backend_bucket.nobuffer_site_backend.id
}

# Create a Managed SSL Certificate
resource "google_compute_managed_ssl_certificate" "nobuffer_site_cert" {
  name = "nobuffer-site-cert-v2"
  managed {
    domains = var.domain
  }
  lifecycle {
    create_before_destroy = true
  }
}

# Create a Target HTTPS Proxy
resource "google_compute_target_https_proxy" "nobuffer_site_https_proxy" {
  name             = "nobuffer-site-https-proxy"
  url_map          = google_compute_url_map.nobuffer_site_url_map.id
  ssl_certificates = [google_compute_managed_ssl_certificate.nobuffer_site_cert.id]
}

# Create a Global Forwarding Rule for HTTPS
resource "google_compute_global_forwarding_rule" "nobuffer_site_forwarding_rule_https" {
  name                  = "nobuffer-site-forwarding-rule-https-v2"
  target                = google_compute_target_https_proxy.nobuffer_site_https_proxy.id
  port_range            = "443"
  ip_address            = google_compute_global_address.nobuffer_site_ip.address
  load_balancing_scheme = "EXTERNAL_MANAGED"
}

# Create a URL Map for HTTP to HTTPS redirect
resource "google_compute_url_map" "nobuffer_site_redirect_map" {
  name = "nobuffer-site-redirect-map"
  default_url_redirect {
    https_redirect = true
    strip_query    = false
  }
}

# Create a Target HTTP Proxy for redirect
resource "google_compute_target_http_proxy" "nobuffer_site_http_proxy" {
  name    = "nobuffer-site-http-proxy"
  url_map = google_compute_url_map.nobuffer_site_redirect_map.id
}

# Create a Global Forwarding Rule for HTTP (redirect)
resource "google_compute_global_forwarding_rule" "nobuffer_site_forwarding_rule" {
  name                  = "nobuffer-site-forwarding-rule-v2"
  target                = google_compute_target_http_proxy.nobuffer_site_http_proxy.id
  port_range            = "80"
  ip_address            = google_compute_global_address.nobuffer_site_ip.address
  load_balancing_scheme = "EXTERNAL_MANAGED"
}

output "load_balancer_ip" {
  value = google_compute_global_address.nobuffer_site_ip.address
}
