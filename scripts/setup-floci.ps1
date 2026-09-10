# setup-floci.ps1
# Script to run Floci locally and provision AWS resources

$endpoint = "http://localhost:4566"
$env:AWS_ACCESS_KEY_ID = "test"
$env:AWS_SECRET_ACCESS_KEY = "test"
$env:AWS_DEFAULT_REGION = "us-east-1"
$env:AWS_ENDPOINT_URL = $endpoint

Write-Host "Checking if Floci container is running on $endpoint..." -ForegroundColor Cyan

# Check if Floci container is running
$flociRunning = docker ps --filter "name=floci" --format "{{.Names}}"
if (-not $flociRunning) {
    Write-Host "Starting Floci container..." -ForegroundColor Yellow
    docker run -d --name floci `
        -p 4566:4566 `
        -v /var/run/docker.sock:/var/run/docker.sock `
        -v "${PWD}/floci-data:/app/data" `
        floci/floci:latest
    Start-Sleep -Seconds 3
} else {
    Write-Host "Floci is already running." -ForegroundColor Green
}

Write-Host "Provisioning AWS resources in Floci..." -ForegroundColor Cyan

# S3 Buckets
$buckets = @("beyon-documents", "beyon-resumes", "beyon-certificates", "beyon-evidence")
foreach ($b in $buckets) {
    Write-Host "Creating S3 bucket: $b"
    aws s3 mb "s3://$b" --endpoint-url $endpoint 2>$null
}

# SQS Queues
$queues = @("beyon-recommendation-queue", "beyon-assessment-events")
foreach ($q in $queues) {
    Write-Host "Creating SQS queue: $q"
    aws sqs create-queue --queue-name $q --endpoint-url $endpoint 2>$null
}

# SNS Topics
Write-Host "Creating SNS topic: beyon-notifications"
aws sns create-topic --name beyon-notifications --endpoint-url $endpoint 2>$null

# EventBridge Bus
Write-Host "Creating EventBridge bus: beyon.events"
aws events create-event-bus --name beyon.events --endpoint-url $endpoint 2>$null

Write-Host "`nAll Floci AWS resources provisioned successfully!" -ForegroundColor Green
Write-Host "Endpoint: $endpoint"
