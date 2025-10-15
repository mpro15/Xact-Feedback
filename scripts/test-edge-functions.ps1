# Edge Functions Deployment Status Checker
# This script tests all 12 Supabase Edge Functions to verify deployment status

param(
    [switch]$Detailed,
    [switch]$QuickTest,
    [int]$TimeoutSeconds = 10
)

# Set your Supabase details
$supabaseUrl = "https://jeyrciyahbkgjoqikapw.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpleXJjaXlhaGJrZ2pvcWlrYXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI2MjEsImV4cCI6MjA2ODA4ODYyMX0.UIOc3GRhpGLlvj-K44y5uhrh6QTjhnaId3VlqVKt75w"

# Function endpoints to test
$functions = @(
    @{Name="generate_feedback"; Description="AI-powered feedback generation"},
    @{Name="send_feedback"; Description="Send feedback emails via SMTP"},
    @{Name="send-feedback-email"; Description="Advanced email sending with tracking"},
    @{Name="track_open"; Description="Email open tracking"},
    @{Name="track_click"; Description="Email click tracking"},
    @{Name="track-email-open"; Description="Enhanced email open tracking"},
    @{Name="track-link-click"; Description="Link click tracking with redirects"},
    @{Name="generate-feedback-pdf"; Description="PDF generation for feedback reports"},
    @{Name="process-email-retry-queue"; Description="Process failed email retries"},
    @{Name="create-order"; Description="Razorpay order creation"},
    @{Name="verify-payment"; Description="Payment verification"},
    @{Name="razorpay-webhook"; Description="Payment webhook handler"}
)

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    switch ($Color) {
        "Green" { Write-Host $Message -ForegroundColor Green }
        "Red" { Write-Host $Message -ForegroundColor Red }
        "Yellow" { Write-Host $Message -ForegroundColor Yellow }
        "Cyan" { Write-Host $Message -ForegroundColor Cyan }
        "Magenta" { Write-Host $Message -ForegroundColor Magenta }
        default { Write-Host $Message }
    }
}

function Test-EdgeFunction {
    param(
        [string]$FunctionName,
        [string]$Description,
        [int]$Timeout = 10
    )
    
    $url = "$supabaseUrl/functions/v1/$FunctionName"
    $startTime = Get-Date
    
    try {
        if ($QuickTest) {
            # Quick test with OPTIONS (should work for all deployed functions)
            $response = Invoke-WebRequest -Uri $url -Method OPTIONS -Headers @{
                "Authorization" = "Bearer $anonKey"
                "apikey" = $anonKey
                "Content-Type" = "application/json"
            } -TimeoutSec $Timeout -ErrorAction Stop
        } else {
            # More comprehensive test with POST (actual function test)
            $testBody = @{
                test = $true
                timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            } | ConvertTo-Json
            
            $response = Invoke-WebRequest -Uri $url -Method POST -Headers @{
                "Authorization" = "Bearer $anonKey"
                "apikey" = $anonKey
                "Content-Type" = "application/json"
            } -Body $testBody -TimeoutSec $Timeout -ErrorAction Stop
        }
        
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds
        
        $status = @{
            Name = $FunctionName
            Description = $Description
            Deployed = $true
            StatusCode = $response.StatusCode
            ResponseTime = [math]::Round($duration, 0)
            Error = $null
        }
        
        return $status
    }
    catch {
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds
        
        $deployed = $true
        $errorMsg = $_.Exception.Message
        
        # Check if it's a 404 (not deployed) vs other errors (deployed but has issues)
        if ($_.Exception.Response.StatusCode -eq 404) {
            $deployed = $false
            $errorMsg = "Function not deployed (404 Not Found)"
        } elseif ($_.Exception.Response.StatusCode -eq 405) {
            $deployed = $true
            $errorMsg = "Method not allowed (function is deployed)"
        } elseif ($_.Exception.Response.StatusCode -eq 500) {
            $deployed = $true
            $errorMsg = "Function deployed but has runtime errors"
        }
        
        $status = @{
            Name = $FunctionName
            Description = $Description
            Deployed = $deployed
            StatusCode = $_.Exception.Response.StatusCode
            ResponseTime = [math]::Round($duration, 0)
            Error = $errorMsg
        }
        
        return $status
    }
}

# Main execution
Write-ColorOutput "🔍 Edge Functions Deployment Status Checker" "Cyan"
Write-ColorOutput "=" * 70 "Cyan"
Write-ColorOutput "Supabase URL: $supabaseUrl" "White"
Write-ColorOutput "Test Mode: $(if ($QuickTest) { 'Quick (OPTIONS only)' } else { 'Comprehensive (POST requests)' })" "White"
Write-ColorOutput "Timeout: $TimeoutSeconds seconds" "White"
Write-ColorOutput ""

$results = @()
$deployedCount = 0
$totalCount = $functions.Count

foreach ($func in $functions) {
    Write-ColorOutput "Testing: $($func.Name)" "Yellow"
    
    $result = Test-EdgeFunction -FunctionName $func.Name -Description $func.Description -Timeout $TimeoutSeconds
    $results += $result
    
    if ($result.Deployed) {
        $deployedCount++
        if ($result.StatusCode -eq 200) {
            Write-ColorOutput "  ✅ DEPLOYED & WORKING - $($result.StatusCode) ($($result.ResponseTime)ms)" "Green"
        } elseif ($result.StatusCode -eq 405) {
            Write-ColorOutput "  ✅ DEPLOYED - $($result.StatusCode) Method Not Allowed ($($result.ResponseTime)ms)" "Green"
        } else {
            Write-ColorOutput "  ⚠️  DEPLOYED BUT ISSUES - $($result.StatusCode) ($($result.ResponseTime)ms)" "Yellow"
        }
    } else {
        Write-ColorOutput "  ❌ NOT DEPLOYED - $($result.Error)" "Red"
    }
    
    if ($Detailed -and $result.Error) {
        Write-ColorOutput "     Error: $($result.Error)" "Red"
    }
    
    Start-Sleep -Milliseconds 300
}

# Summary Report
Write-ColorOutput ""
Write-ColorOutput "📊 DEPLOYMENT SUMMARY" "Cyan"
Write-ColorOutput "=" * 70 "Cyan"
Write-ColorOutput "Total Functions: $totalCount" "White"
Write-ColorOutput "Deployed: $deployedCount" "Green"
Write-ColorOutput "Not Deployed: $($totalCount - $deployedCount)" "Red"
Write-ColorOutput "Deployment Rate: $([math]::Round(($deployedCount / $totalCount) * 100, 1))%" "White"

# Detailed Results Table
if ($Detailed) {
    Write-ColorOutput ""
    Write-ColorOutput "📋 DETAILED RESULTS" "Cyan"
    Write-ColorOutput "=" * 70 "Cyan"
    
    $results | Format-Table -Property @(
        @{Name="Function"; Expression={$_.Name}; Width=25},
        @{Name="Status"; Expression={if ($_.Deployed) {"✅ Deployed"} else {"❌ Missing"}}; Width=12},
        @{Name="Code"; Expression={$_.StatusCode}; Width=6},
        @{Name="Time(ms)"; Expression={$_.ResponseTime}; Width=10},
        @{Name="Description"; Expression={$_.Description}; Width=30}
    ) -AutoSize
}

# Recommendations
Write-ColorOutput ""
Write-ColorOutput "💡 RECOMMENDATIONS" "Cyan"
Write-ColorOutput "=" * 70 "Cyan"

if ($deployedCount -eq $totalCount) {
    Write-ColorOutput "🎉 All functions are deployed! Your Edge Functions are ready." "Green"
    Write-ColorOutput ""
    Write-ColorOutput "Next Steps:" "Yellow"
    Write-ColorOutput "1. Run full API integration tests: npm run test:api" "White"
    Write-ColorOutput "2. Monitor function performance in Supabase Dashboard" "White"
    Write-ColorOutput "3. Check function logs for any runtime errors" "White"
} else {
    Write-ColorOutput "⚠️  Some functions are missing. Deployment needed." "Yellow"
    Write-ColorOutput ""
    Write-ColorOutput "To deploy missing functions:" "Yellow"
    
    $missingFunctions = $results | Where-Object { -not $_.Deployed }
    foreach ($missing in $missingFunctions) {
        Write-ColorOutput "supabase functions deploy $($missing.Name)" "White"
    }
    
    Write-ColorOutput ""
    Write-ColorOutput "Or deploy all at once:" "Yellow"
    Write-ColorOutput "supabase functions deploy --all" "White"
}

# Performance Analysis
$avgResponseTime = ($results | Where-Object { $_.Deployed } | Measure-Object -Property ResponseTime -Average).Average
if ($avgResponseTime -gt 0) {
    Write-ColorOutput ""
    Write-ColorOutput "⚡ PERFORMANCE ANALYSIS" "Cyan"
    Write-ColorOutput "Average Response Time: $([math]::Round($avgResponseTime, 0))ms" "White"
    
    if ($avgResponseTime -lt 1000) {
        Write-ColorOutput "Performance: Excellent (< 1s)" "Green"
    } elseif ($avgResponseTime -lt 3000) {
        Write-ColorOutput "Performance: Good (< 3s)" "Yellow"
    } else {
        Write-ColorOutput "Performance: Needs optimization (> 3s)" "Red"
    }
}

Write-ColorOutput ""
Write-ColorOutput "🏁 Edge Functions Test Complete!" "Cyan"
Write-ColorOutput "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "White"
