output "load_balancer_ip" {
  value = google_compute_global_address.nobuffer_site_ip.address
}
