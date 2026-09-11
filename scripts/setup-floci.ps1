# setup-floci.ps1
# Complete Script to run Floci locally and provision all Beyon AWS & AI Cloud resources

$endpoint = "http://localhost:4566"
$env:AWS_ACCESS_KEY_ID = "test"
$env:AWS_SECRET_ACCESS_KEY = "test"
$env:AWS_DEFAULT_REGION = "us-east-1"
$env:AWS_ENDPOINT_URL = $endpoint

Write-Host "🔍 Checking if Floci container is running on $endpoint..." -ForegroundColor Cyan

# Check if Floci container is running
$flociRunning = docker ps --filter "name=^/floci$" --filter "status=running" --format "{{.Names}}"
if (-not $flociRunning) {
    $existing = docker ps -a --filter "name=^/floci$" --format "{{.Names}}"
    if ($existing) {
        Write-Host "🔄 Starting existing Floci container..." -ForegroundColor Yellow
        docker start floci | Out-Null
    } else {
        Write-Host "📦 Starting new Floci container..." -ForegroundColor Yellow
        docker run -d --name floci `
            -p 4566:4566 `
            -v /var/run/docker.sock:/var/run/docker.sock `
            -v "${PWD}/floci-data:/app/data" `
            floci/floci:latest | Out-Null
    }
    Start-Sleep -Seconds 3
} else {
    Write-Host "✅ Floci is already running." -ForegroundColor Green
}

Write-Host "`n🚀 Provisioning Beyon AWS & AI resources in Floci..." -ForegroundColor Cyan

# 1. S3 Storage Buckets
Write-Host "`n📁 [1/6] S3 Buckets..." -ForegroundColor Magenta
$buckets = @(
    "beyon-documents",
    "beyon-resumes",
    "beyon-certificates",
    "beyon-evidence",
    "beyon-proctoring-frames",
    "beyon-audio-recordings",
    "beyon-exports",
    "beyon-ai-models"
)
foreach ($b in $buckets) {
    Write-Host "  ✓ S3 Bucket: $b"
    aws s3 mb "s3://$b" --endpoint-url $endpoint 2>$null | Out-Null
}

# 2. SQS Queues & DLQs
Write-Host "`n📬 [2/6] SQS Queues & DLQs..." -ForegroundColor Magenta
$queues = @(
    "beyon-recommendation-queue",
    "beyon-recommendation-dlq",
    "beyon-assessment-events",
    "beyon-assessment-dlq",
    "beyon-proctoring-queue",
    "beyon-proctoring-dlq",
    "beyon-notification-queue",
    "beyon-telemetry-queue"
)
foreach ($q in $queues) {
    Write-Host "  ✓ SQS Queue: $q"
    aws sqs create-queue --queue-name $q --endpoint-url $endpoint 2>$null | Out-Null
}

# 3. SNS Topics & Subscription
Write-Host "`n📢 [3/6] SNS Topics..." -ForegroundColor Magenta
$topics = @(
    "beyon-notifications",
    "beyon-proctoring-alerts",
    "beyon-placement-broadcasts"
)
foreach ($t in $topics) {
    Write-Host "  ✓ SNS Topic: $t"
    aws sns create-topic --name $t --endpoint-url $endpoint 2>$null | Out-Null
}
aws sns subscribe --topic-arn "arn:aws:sns:us-east-1:000000000000:beyon-notifications" --protocol sqs --notification-endpoint "arn:aws:sqs:us-east-1:000000000000:beyon-notification-queue" --endpoint-url $endpoint 2>$null | Out-Null
Write-Host "  ✓ SNS Subscription: beyon-notifications -> beyon-notification-queue"

# 4. EventBridge Bus & Rules
Write-Host "`n⚡ [4/6] EventBridge..." -ForegroundColor Magenta
aws events create-event-bus --name beyon.events --endpoint-url $endpoint 2>$null | Out-Null
Write-Host "  ✓ EventBridge Bus: beyon.events"

# 5. DynamoDB Tables
Write-Host "`n🗄️  [5/6] DynamoDB Tables..." -ForegroundColor Magenta
aws dynamodb create-table --table-name BeyonProctorIncidents --attribute-definitions AttributeName=sessionId,AttributeType=S AttributeName=timestamp,AttributeType=N --key-schema AttributeName=sessionId,KeyType=HASH AttributeName=timestamp,KeyType=RANGE --billing-mode PAY_PER_REQUEST --endpoint-url $endpoint 2>$null | Out-Null
Write-Host "  ✓ DynamoDB: BeyonProctorIncidents"

aws dynamodb create-table --table-name BeyonProctorSessions --attribute-definitions AttributeName=sessionId,AttributeType=S --key-schema AttributeName=sessionId,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url $endpoint 2>$null | Out-Null
Write-Host "  ✓ DynamoDB: BeyonProctorSessions"

aws dynamodb create-table --table-name BeyonTelemetry --attribute-definitions AttributeName=sessionId,AttributeType=S AttributeName=timestamp,AttributeType=N --key-schema AttributeName=sessionId,KeyType=HASH AttributeName=timestamp,KeyType=RANGE --billing-mode PAY_PER_REQUEST --endpoint-url $endpoint 2>$null | Out-Null
Write-Host "  ✓ DynamoDB: BeyonTelemetry"

aws dynamodb create-table --table-name BeyonAssessmentCache --attribute-definitions AttributeName=cacheKey,AttributeType=S --key-schema AttributeName=cacheKey,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url $endpoint 2>$null | Out-Null
Write-Host "  ✓ DynamoDB: BeyonAssessmentCache"

# 6. KMS & SSM
Write-Host "`n🔑 [6/6] KMS & SSM Parameters..." -ForegroundColor Magenta
aws kms create-key --description "Beyon Default Master Encryption Key" --endpoint-url $endpoint 2>$null | Out-Null
aws kms create-alias --alias-name "alias/beyon-default-key" --target-key-id "alias/beyon-default-key" --endpoint-url $endpoint 2>$null | Out-Null
Write-Host "  ✓ KMS Key: alias/beyon-default-key"

aws ssm put-parameter --name "/beyon/dev/jwt-secret" --value "beyon-dev-secret-key" --type "String" --overwrite --endpoint-url $endpoint 2>$null | Out-Null
aws ssm put-parameter --name "/beyon/dev/ai-service-url" --value "http://localhost:8000" --type "String" --overwrite --endpoint-url $endpoint 2>$null | Out-Null
aws ssm put-parameter --name "/beyon/dev/floci-endpoint" --value "http://localhost:4566" --type "String" --overwrite --endpoint-url $endpoint 2>$null | Out-Null
Write-Host "  ✓ SSM Parameters provisioned"

Write-Host "`n======================================================" -ForegroundColor Green
Write-Host "🎉 ALL BEYON FLOCI AWS SERVICES PROVISIONED" -ForegroundColor Green
Write-Host "Endpoint: $endpoint" -ForegroundColor Green
Write-Host "Region:   us-east-1" -ForegroundColor Green
Write-Host "======================================================`n" -ForegroundColor Green
