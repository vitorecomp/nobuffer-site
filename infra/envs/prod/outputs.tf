# Output the Load Balancer IP
output "load_balancer_ip" {
  value = module.load_balancer.load_balancer_ip
}
