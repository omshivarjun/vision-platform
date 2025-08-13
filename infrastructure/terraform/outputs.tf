output "application_url" {
  description = "URL of the deployed application"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "http://${aws_lb.main.dns_name}"
}

output "api_url" {
  description = "URL of the API service"
  value       = var.domain_name != "" ? "https://api.${var.domain_name}" : "http://${aws_lb.main.dns_name}/api"
}

output "infrastructure_details" {
  description = "Infrastructure deployment details"
  value = {
    vpc_id                = aws_vpc.main.id
    public_subnet_ids     = aws_subnet.public[*].id
    private_subnet_ids    = aws_subnet.private[*].id
    alb_dns_name         = aws_lb.main.dns_name
    ecs_cluster_name     = aws_ecs_cluster.main.name
    docdb_endpoint       = aws_docdb_cluster.main.endpoint
    redis_endpoint       = aws_elasticache_replication_group.main.primary_endpoint_address
    s3_bucket_name       = aws_s3_bucket.main.id
  }
}

output "connection_strings" {
  description = "Database and service connection strings"
  value = {
    mongodb_uri = "mongodb://${aws_docdb_cluster.main.master_username}:${random_password.docdb_password.result}@${aws_docdb_cluster.main.endpoint}:27017/vision?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false"
    redis_url   = "redis://${aws_elasticache_replication_group.main.primary_endpoint_address}:6379"
  }
  sensitive = true
}

output "deployment_commands" {
  description = "Commands to deploy the application"
  value = {
    docker_build = "docker build -t ${var.project_name}-api ./services/api && docker build -t ${var.project_name}-ai ./services/ai && docker build -t ${var.project_name}-web ./apps/web"
    docker_push  = "docker tag ${var.project_name}-api:latest ${aws_ecr_repository.api.repository_url}:latest && docker push ${aws_ecr_repository.api.repository_url}:latest"
    ecs_deploy   = "aws ecs update-service --cluster ${aws_ecs_cluster.main.name} --service ${var.project_name}-api --force-new-deployment"
  }
}

output "monitoring_urls" {
  description = "Monitoring and logging URLs"
  value = {
    cloudwatch_logs = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#logsV2:log-groups"
    ecs_console     = "https://console.aws.amazon.com/ecs/home?region=${var.aws_region}#/clusters/${aws_ecs_cluster.main.name}"
    rds_console     = "https://console.aws.amazon.com/docdb/home?region=${var.aws_region}#clusters"
  }
}

output "security_groups" {
  description = "Security group IDs"
  value = {
    alb_security_group   = aws_security_group.alb.id
    ecs_security_group   = aws_security_group.ecs.id
    docdb_security_group = aws_security_group.docdb.id
    redis_security_group = aws_security_group.redis.id
  }
}

output "iam_roles" {
  description = "IAM role ARNs"
  value = {
    ecs_task_execution_role = aws_iam_role.ecs_task_execution_role.arn
    ecs_task_role          = aws_iam_role.ecs_task_role.arn
  }
}