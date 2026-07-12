param(
    [Parameter(Mandatory = $true)] [string]$BackendUrl,
    [Parameter(Mandatory = $true)] [string]$FrontendUrl
)

$ErrorActionPreference = "Stop"
$BackendUrl = $BackendUrl.TrimEnd("/")
$FrontendUrl = $FrontendUrl.TrimEnd("/")

$health = Invoke-RestMethod "$BackendUrl/health"
$ready = Invoke-RestMethod "$BackendUrl/ready"
$version = Invoke-RestMethod "$BackendUrl/version"
$below = Invoke-RestMethod "$BackendUrl/api/services/wagon-leasing/evaluate" -Method Post -ContentType "application/json" -Body '{"requested_amount":500000000}'
$above = Invoke-RestMethod "$BackendUrl/api/services/wagon-leasing/evaluate" -Method Post -ContentType "application/json" -Body '{"requested_amount":500000001}'

$belowRequiresTeo = $below.required_documents -contains "feasibility_study"
$aboveRequiresTeo = $above.required_documents -contains "feasibility_study"
if ($belowRequiresTeo -or -not $aboveRequiresTeo) { throw "Critical threshold rule failed" }

$frontend = Invoke-WebRequest $FrontendUrl -UseBasicParsing
$catalog = Invoke-WebRequest "$BackendUrl/api/services" -Headers @{ Origin = $FrontendUrl } -UseBasicParsing
if ($frontend.StatusCode -ne 200 -or $catalog.StatusCode -ne 200) { throw "Frontend or API is unavailable" }

[PSCustomObject]@{
    BackendHealth = $health.status
    DatabaseReady = $ready.ready
    Version = $version.version
    FrontendStatus = $frontend.StatusCode
    CorsOrigin = $catalog.Headers["Access-Control-Allow-Origin"]
    At500MRequiresTeo = $belowRequiresTeo
    Above500MRequiresTeo = $aboveRequiresTeo
} | Format-List

Write-Host "Production smoke test PASS" -ForegroundColor Green
