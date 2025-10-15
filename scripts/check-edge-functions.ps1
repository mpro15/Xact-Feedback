# Simple Edge Functions Deployment Checker
# Tests all 12 Supabase Edge Functions for deployment status

Write-Host "Edge Functions Deployment Status Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$supabaseUrl = "https://jeyrciyahbkgjoqikapw.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpleXJjaXlhaGJrZ2pvcWlrYXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI2MjEsImV4cCI6MjA2ODA4ODYyMX0.UIOc3GRhpGLlvj-K44y5uhrh6QTjhnaId3VlqVKt75w"

$functions = @(
    "generate_feedback",
    "send_feedback", 
    "send-feedback-email",
    "track_open",
    "track_click",
    "track-email-open",
    "track-link-click",
    "generate-feedback-pdf",
    "process-email-retry-queue",
    "create-order",
    "verify-payment",
    "razorpay-webhook"
)

$deployedCount = 0
$results = @()

foreach ($func in $functions) {
    $url = "$supabaseUrl/functions/v1/$func"
    Write-Host "Testing: $func" -ForegroundColor Yellow
    
    try {
        $headers = @{
            "Authorization" = "Bearer $anonKey"
            "apikey" = $anonKey
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri $url -Method OPTIONS -Headers $headers -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  SUCCESS - Function is deployed (200)" -ForegroundColor Green
            $deployedCount++
            $results += @{Function=$func; Status="Deployed"; Code=200}
        } else {
            Write-Host "  WARNING - Unexpected status: $($response.StatusCode)" -ForegroundColor Yellow
            $deployedCount++
            $results += @{Function=$func; Status="Deployed"; Code=$response.StatusCode}
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode
        if ($statusCode -eq 404) {
            Write-Host "  ERROR - Function not deployed (404)" -ForegroundColor Red
            $results += @{Function=$func; Status="Not Deployed"; Code=404}
        } elseif ($statusCode -eq 405) {
            Write-Host "  SUCCESS - Function deployed (405 Method Not Allowed is expected)" -ForegroundColor Green
            $deployedCount++
            $results += @{Function=$func; Status="Deployed"; Code=405}
        } else {
            Write-Host "  WARNING - Function may be deployed but has issues: $statusCode" -ForegroundColor Yellow
            $deployedCount++
            $results += @{Function=$func; Status="Issues"; Code=$statusCode}
        }
    }
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "SUMMARY:" -ForegroundColor Cyan
Write-Host "Total Functions: $($functions.Count)"
Write-Host "Deployed: $deployedCount" -ForegroundColor Green
Write-Host "Not Deployed: $($functions.Count - $deployedCount)" -ForegroundColor Red
Write-Host "Deployment Rate: $([math]::Round(($deployedCount / $functions.Count) * 100, 1))%"

Write-Host ""
Write-Host "DETAILED RESULTS:" -ForegroundColor Cyan
foreach ($result in $results) {
    $color = if ($result.Status -eq "Deployed") { "Green" } elseif ($result.Status -eq "Not Deployed") { "Red" } else { "Yellow" }
    Write-Host "$($result.Function): $($result.Status) ($($result.Code))" -ForegroundColor $color
}

if ($deployedCount -eq $functions.Count) {
    Write-Host ""
    Write-Host "SUCCESS: All Edge Functions are deployed!" -ForegroundColor Green
    Write-Host "Next step: Run 'npm run test:api' to test functionality" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "ACTION NEEDED: Some functions are not deployed" -ForegroundColor Red
    Write-Host "Run: supabase functions deploy --all" -ForegroundColor Yellow
}
