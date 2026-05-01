
# Reserve a static external IP address
resource "google_compute_global_address" "nobuffer_site_ip" {
  name = "nobuffer-site-ip"
}

# Create a Backend Bucket with CDN enabled
resource "google_compute_backend_bucket" "nobuffer_site_backend" {
  name        = "nobuffer-site-backend"
  bucket_name = var.bucket_name
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

# Create a Target HTTP Proxy
resource "google_compute_target_http_proxy" "nobuffer_site_http_proxy" {
  name    = "nobuffer-site-http-proxy"
  url_map = google_compute_url_map.nobuffer_site_url_map.id
}

# Create a Global Forwarding Rule
resource "google_compute_global_forwarding_rule" "nobuffer_site_forwarding_rule" {
  name       = "nobuffer-site-forwarding-rule"
  target     = google_compute_target_http_proxy.nobuffer_site_http_proxy.id
  port_range = "80"
  ip_address = google_compute_global_address.nobuffer_site_ip.address
}

output "load_balancer_ip" {
  value = google_compute_global_address.nobuffer_site_ip.address
}
