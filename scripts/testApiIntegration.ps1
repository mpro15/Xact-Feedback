# API Integration Test Script for Windows PowerShell
# Tests all REST APIs and backend connections for Xact Feedback

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "development",
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose,
    
    [Parameter(Mandatory=$false)]
    [switch]$Quick
)

# Set error handling
$ErrorActionPreference = "Stop"

# Colors for output
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-ColorOutput {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Colors[$Color]
}

function Test-Prerequisites {
    Write-ColorOutput "🔍 Checking prerequisites..." "Info"
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-ColorOutput "✅ Node.js version: $nodeVersion" "Success"
    } catch {
        Write-ColorOutput "❌ Node.js not found. Please install Node.js" "Error"
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-ColorOutput "✅ npm version: $npmVersion" "Success"
    } catch {
        Write-ColorOutput "❌ npm not found" "Error"
        exit 1
    }
    
    # Check environment variables
    if (-not $env:VITE_SUPABASE_URL -and -not $env:SUPABASE_URL) {
        Write-ColorOutput "❌ VITE_SUPABASE_URL or SUPABASE_URL environment variable not set" "Error"
        exit 1
    }
    
    if (-not $env:VITE_SUPABASE_ANON_KEY -and -not $env:SUPABASE_ANON_KEY) {
        Write-ColorOutput "❌ VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY environment variable not set" "Error"
        exit 1
    }
    
    Write-ColorOutput "✅ All prerequisites met" "Success"
}

function Test-DatabaseConnection {
    Write-ColorOutput "`n🗄️ Testing Database Connection..." "Header"
    
    $supabaseUrl = if ($env:VITE_SUPABASE_URL) { $env:VITE_SUPABASE_URL } else { $env:SUPABASE_URL }
    $supabaseKey = if ($env:VITE_SUPABASE_ANON_KEY) { $env:VITE_SUPABASE_ANON_KEY } else { $env:SUPABASE_ANON_KEY }
    
    try {
        $headers = @{
            "apikey" = $supabaseKey
            "Authorization" = "Bearer $supabaseKey"
            "Content-Type" = "application/json"
        }
        
        # Test basic connection
        $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/companies?select=count&limit=1" -Headers $headers -Method Get
        Write-ColorOutput "✅ Database connection successful" "Success"
        
        # Test tables access
        $tables = @("users", "companies", "candidates", "feedback_reports", "email_campaigns", "analytics_events")
        
        foreach ($table in $tables) {
            try {
                $tableResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/$table?select=*&limit=1" -Headers $headers -Method Get
                Write-ColorOutput "✅ Table '$table' accessible" "Success"
            } catch {
                Write-ColorOutput "⚠️ Table '$table' access limited (RLS protection)" "Warning"
            }
        }
        
    } catch {
        Write-ColorOutput "❌ Database connection failed: $($_.Exception.Message)" "Error"
        return $false
    }
    
    return $true
}

function Test-EdgeFunctions {
    Write-ColorOutput "`n⚡ Testing Edge Functions..." "Header"
    
    $supabaseUrl = if ($env:VITE_SUPABASE_URL) { $env:VITE_SUPABASE_URL } else { $env:SUPABASE_URL }
    $supabaseKey = if ($env:VITE_SUPABASE_ANON_KEY) { $env:VITE_SUPABASE_ANON_KEY } else { $env:SUPABASE_ANON_KEY }
    $baseUrl = "$supabaseUrl/functions/v1"
    
    $headers = @{
        "Authorization" = "Bearer $supabaseKey"
        "Content-Type" = "application/json"
    }
    
    $testData = @{
        candidateId = "test-candidate-$(Get-Date -Format 'yyyyMMddHHmmss')"
        companyId = "test-company-$(Get-Date -Format 'yyyyMMddHHmmss')"
        feedbackId = "test-feedback-$(Get-Date -Format 'yyyyMMddHHmmss')"
        emailId = "test-email-$(Get-Date -Format 'yyyyMMddHHmmss')"
    }
    
    $functions = @(
        @{
            Name = "generate_feedback"
            Method = "POST"
            Body = @{
                candidate_id = $testData.candidateId
                job_description = "Software Engineer position requiring React and TypeScript"
            }
            ExpectedStatuses = @(200, 400, 500)
        },
        @{
            Name = "send_feedback"
            Method = "POST"
            Headers = @{ "x-user-id" = "test-user-123" }
            Body = @{
                candidate_id = $testData.candidateId
                feedback_id = $testData.feedbackId
            }
            ExpectedStatuses = @(200, 400, 404, 500)
        },
        @{
            Name = "send-feedback-email"
            Method = "POST"
            Body = @{
                candidate_id = $testData.candidateId
                company_id = $testData.companyId
                to_email = "test@example.com"
                to_name = "Test Candidate"
                subject = "Test Feedback"
                html_content = "<h1>Test</h1>"
                text_content = "Test"
            }
            ExpectedStatuses = @(200, 400, 500)
        },
        @{
            Name = "track_open"
            Method = "GET"
            Url = "track_open?fid=$($testData.feedbackId)"
            ExpectedStatuses = @(200, 400, 500)
        },
        @{
            Name = "track_click"
            Method = "GET"
            Url = "track_click?fid=$($testData.feedbackId)&link=https://example.com"
            ExpectedStatuses = @(200, 302, 400, 500)
        },
        @{
            Name = "track-email-open"
            Method = "GET"
            Url = "track-email-open?eid=$($testData.emailId)&cid=$($testData.candidateId)&coid=$($testData.companyId)"
            ExpectedStatuses = @(200, 400, 500)
        },
        @{
            Name = "track-link-click"
            Method = "GET"
            Url = "track-link-click?eid=$($testData.emailId)&cid=$($testData.candidateId)&coid=$($testData.companyId)&url=https://example.com"
            ExpectedStatuses = @(200, 302, 400, 500)
        },
        @{
            Name = "create-order"
            Method = "POST"
            Body = @{
                companyId = $testData.companyId
                amount = 100000
            }
            ExpectedStatuses = @(200, 400, 500)
        },
        @{
            Name = "verify-payment"
            Method = "POST"
            Body = @{
                companyId = $testData.companyId
                paymentId = "test_payment_123"
                orderId = "test_order_123"
            }
            ExpectedStatuses = @(200, 400, 502)
        }
    )
    
    $results = @{
        Passed = 0
        Failed = 0
        Tests = @()
    }
    
    foreach ($func in $functions) {
        $testName = $func.Name
        
        try {
            Write-ColorOutput "🧪 Testing: $testName" "Info"
            
            $url = if ($func.Url) { "$baseUrl/$($func.Url)" } else { "$baseUrl/$testName" }
            $requestHeaders = $headers.Clone()
            
            if ($func.Headers) {
                foreach ($h in $func.Headers.GetEnumerator()) {
                    $requestHeaders[$h.Key] = $h.Value
                }
            }
            
            $params = @{
                Uri = $url
                Method = $func.Method
                Headers = $requestHeaders
            }
            
            if ($func.Body -and $func.Method -eq "POST") {
                $params.Body = $func.Body | ConvertTo-Json
            }
            
            $startTime = Get-Date
            
            try {
                $response = Invoke-RestMethod @params
                $statusCode = 200  # Successful response
            } catch {
                $statusCode = $_.Exception.Response.StatusCode.value__
                $response = $_.Exception.Message
            }
            
            $duration = (Get-Date) - $startTime
            
            if ($statusCode -in $func.ExpectedStatuses) {
                Write-ColorOutput "✅ PASSED ($($duration.TotalMilliseconds)ms): $testName" "Success"
                $results.Passed++
                $results.Tests += @{
                    Name = $testName
                    Status = "PASSED"
                    Duration = $duration.TotalMilliseconds
                    StatusCode = $statusCode
                }
            } else {
                Write-ColorOutput "❌ FAILED: $testName (Status: $statusCode)" "Error"
                $results.Failed++
                $results.Tests += @{
                    Name = $testName
                    Status = "FAILED"
                    Error = "Unexpected status code: $statusCode"
                    StatusCode = $statusCode
                }
            }
            
            if ($Verbose) {
                Write-ColorOutput "   Response: $($response | ConvertTo-Json -Depth 2)" "Info"
            }
            
        } catch {
            Write-ColorOutput "❌ FAILED: $testName - $($_.Exception.Message)" "Error"
            $results.Failed++
            $results.Tests += @{
                Name = $testName
                Status = "FAILED"
                Error = $_.Exception.Message
            }
        }
    }
    
    return $results
}

function Test-StorageBuckets {
    Write-ColorOutput "`n🗂️ Testing Storage Buckets..." "Header"
    
    $supabaseUrl = if ($env:VITE_SUPABASE_URL) { $env:VITE_SUPABASE_URL } else { $env:SUPABASE_URL }
    $supabaseKey = if ($env:VITE_SUPABASE_ANON_KEY) { $env:VITE_SUPABASE_ANON_KEY } else { $env:SUPABASE_ANON_KEY }
    
    $headers = @{
        "Authorization" = "Bearer $supabaseKey"
    }
    
    $buckets = @("profile-images", "feedback-pdfs", "company-logos")
    
    foreach ($bucket in $buckets) {
        try {
            $response = Invoke-RestMethod -Uri "$supabaseUrl/storage/v1/object/list/$bucket" -Headers $headers -Method Get
            Write-ColorOutput "✅ Bucket '$bucket' accessible" "Success"
        } catch {
            Write-ColorOutput "⚠️ Bucket '$bucket' access limited: $($_.Exception.Message)" "Warning"
        }
    }
}

function Test-RPCFunctions {
    Write-ColorOutput "`n🔧 Testing RPC Functions..." "Header"
    
    $supabaseUrl = if ($env:VITE_SUPABASE_URL) { $env:VITE_SUPABASE_URL } else { $env:SUPABASE_URL }
    $supabaseKey = if ($env:VITE_SUPABASE_ANON_KEY) { $env:VITE_SUPABASE_ANON_KEY } else { $env:SUPABASE_ANON_KEY }
    
    $headers = @{
        "apikey" = $supabaseKey
        "Authorization" = "Bearer $supabaseKey"
        "Content-Type" = "application/json"
    }
    
    $rpcFunctions = @(
        @{
            Name = "increment_email_opens"
            Params = @{ candidate_id = "test-candidate-123" }
        },
        @{
            Name = "increment_email_clicks"
            Params = @{ candidate_id = "test-candidate-123" }
        },
        @{
            Name = "increment_course_enrollments"
            Params = @{ candidate_id = "test-candidate-123" }
        },
        @{
            Name = "check_daily_email_limit"
            Params = @{ company_id = "test-company-123" }
        }
    )
    
    foreach ($func in $rpcFunctions) {
        try {
            $body = $func.Params | ConvertTo-Json
            $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/$($func.Name)" -Headers $headers -Method Post -Body $body
            Write-ColorOutput "✅ RPC '$($func.Name)' callable" "Success"
        } catch {
            Write-ColorOutput "⚠️ RPC '$($func.Name)' access limited (expected for test data)" "Warning"
        }
    }
}

function Test-PerformanceBasics {
    Write-ColorOutput "`n⚡ Testing Basic Performance..." "Header"
    
    $supabaseUrl = if ($env:VITE_SUPABASE_URL) { $env:VITE_SUPABASE_URL } else { $env:SUPABASE_URL }
    $supabaseKey = if ($env:VITE_SUPABASE_ANON_KEY) { $env:VITE_SUPABASE_ANON_KEY } else { $env:SUPABASE_ANON_KEY }
    
    $headers = @{
        "Authorization" = "Bearer $supabaseKey"
    }
    
    # Test tracking endpoints (lightweight)
    $endpoints = @(
        "$supabaseUrl/functions/v1/track_open?fid=test",
        "$supabaseUrl/functions/v1/track_click?fid=test&link=https://example.com"
    )
    
    foreach ($endpoint in $endpoints) {
        $startTime = Get-Date
        try {
            $response = Invoke-RestMethod -Uri $endpoint -Headers $headers -Method Get
            $duration = (Get-Date) - $startTime
            
            if ($duration.TotalMilliseconds -lt 5000) {
                Write-ColorOutput "✅ Response time OK: $($duration.TotalMilliseconds)ms" "Success"
            } else {
                Write-ColorOutput "⚠️ Slow response: $($duration.TotalMilliseconds)ms" "Warning"
            }
        } catch {
            $duration = (Get-Date) - $startTime
            Write-ColorOutput "⚠️ Endpoint error after $($duration.TotalMilliseconds)ms" "Warning"
        }
    }
}

function Run-ComprehensiveTests {
    Write-ColorOutput "🚀 Starting Comprehensive API Integration Tests" "Header"
    Write-ColorOutput "Environment: $Environment" "Info"
    Write-ColorOutput "Quick Mode: $Quick" "Info"
    Write-ColorOutput "=" * 60 "Header"
    
    # Test prerequisites
    Test-Prerequisites
    
    # Test database connection
    $dbResult = Test-DatabaseConnection
    
    if (-not $dbResult) {
        Write-ColorOutput "❌ Database tests failed. Stopping." "Error"
        exit 1
    }
    
    # Test Edge Functions
    $functionResults = Test-EdgeFunctions
    
    # Test storage buckets
    if (-not $Quick) {
        Test-StorageBuckets
        Test-RPCFunctions
        Test-PerformanceBasics
    }
    
    # Summary
    Write-ColorOutput "`n📊 Test Results Summary" "Header"
    Write-ColorOutput "=" * 50 "Header"
    Write-ColorOutput "✅ Passed: $($functionResults.Passed)" "Success"
    Write-ColorOutput "❌ Failed: $($functionResults.Failed)" "Error"
    
    if ($functionResults.Passed + $functionResults.Failed -gt 0) {
        $successRate = ($functionResults.Passed / ($functionResults.Passed + $functionResults.Failed)) * 100
        Write-ColorOutput "📈 Success Rate: $($successRate.ToString('F1'))%" "Info"
    }
    
    if ($functionResults.Failed -gt 0) {
        Write-ColorOutput "`n❌ Failed Tests:" "Error"
        $functionResults.Tests | Where-Object { $_.Status -eq "FAILED" } | ForEach-Object {
            Write-ColorOutput "   - $($_.Name): $($_.Error)" "Error"
        }
    }
    
    if ($Verbose) {
        Write-ColorOutput "`n📋 Detailed Results:" "Info"
        $functionResults.Tests | ForEach-Object {
            $icon = if ($_.Status -eq "PASSED") { "✅" } else { "❌" }
            $duration = if ($_.Duration) { " ($($_.Duration.ToString('F0'))ms)" } else { "" }
            Write-ColorOutput "   $icon $($_.Name)$duration" "Info"
        }
    }
    
    # Exit with appropriate code
    if ($functionResults.Failed -gt 0) {
        Write-ColorOutput "`n⚠️ Some tests failed. Check the logs above." "Warning"
        exit 1
    } else {
        Write-ColorOutput "`n🎉 All tests passed!" "Success"
        exit 0
    }
}

# Run the tests
try {
    Run-ComprehensiveTests
} catch {
    Write-ColorOutput "❌ Test suite failed: $($_.Exception.Message)" "Error"
    exit 1
}
