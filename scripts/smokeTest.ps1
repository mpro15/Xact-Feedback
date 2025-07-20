$ErrorActionPreference = 'Stop'

$BASE_URL = "http://localhost:3000"
$EMAIL = "smoke+$(Get-Date -UFormat %s)@test.com"
$PASSWORD = "smoketest123"
$COMPANY = "SmokeTestCo"
$CANDIDATE_NAME = "Smoke Candidate"
$CANDIDATE_EMAIL = "smoke.candidate@test.com"
$JOB_DESC = "QA Engineer"

# 1. Signup
$signupBody = @{ email = $EMAIL; password = $PASSWORD; company = $COMPANY } | ConvertTo-Json
$signupResp = Invoke-RestMethod -Uri "$BASE_URL/signup" -Method Post -ContentType "application/json" -Body $signupBody
if (-not $signupResp.id) { Write-Error "Signup failed" }

# 2. Login
$loginBody = @{ email = $EMAIL; password = $PASSWORD } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$BASE_URL/auth/v1/token?grant_type=password" -Method Post -ContentType "application/json" -Body $loginBody
$access_token = $loginResp.access_token
if (-not $access_token) { Write-Error "Login failed" }

# 3. Upload candidate
$candidateBody = @{ name = $CANDIDATE_NAME; email = $CANDIDATE_EMAIL } | ConvertTo-Json
$candidateResp = Invoke-RestMethod -Uri "$BASE_URL/functions/upload_candidate" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access_token" } -Body $candidateBody
$candidate_id = $candidateResp.candidate_id
if (-not $candidate_id) { Write-Error "Candidate upload failed" }

# 4. Generate feedback
$feedbackBody = @{ candidate_id = $candidate_id; job_description = $JOB_DESC } | ConvertTo-Json
$feedbackResp = Invoke-RestMethod -Uri "$BASE_URL/functions/generate_feedback" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access_token" } -Body $feedbackBody
$feedback_id = $feedbackResp.feedback_id
if (-not $feedback_id) { Write-Error "Feedback generation failed" }

# 5. Send feedback
$sendBody = @{ candidate_id = $candidate_id; feedback_id = $feedback_id } | ConvertTo-Json
$sendResp = Invoke-RestMethod -Uri "$BASE_URL/functions/send_feedback" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access_token" } -Body $sendBody
if (-not $sendResp.sent) { Write-Error "Send feedback failed" }

# 6. Fetch analytics
$analyticsResp = Invoke-RestMethod -Uri "$BASE_URL/analytics/overview" -Method Get -Headers @{ Authorization = "Bearer $access_token" }
if (-not $analyticsResp.totalCandidates) { Write-Error "Analytics fetch failed" }

Write-Host "OK"
