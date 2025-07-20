#!/bin/bash
set -e

BASE_URL="http://localhost:3000"
EMAIL="smoke+$(date +%s)@test.com"
PASSWORD="smoketest123"
COMPANY="SmokeTestCo"
CANDIDATE_NAME="Smoke Candidate"
CANDIDATE_EMAIL="smoke.candidate@test.com"
JOB_DESC="QA Engineer"

# 1. Signup
signup_resp=$(curl -s -X POST "$BASE_URL/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"company\":\"$COMPANY\"}")
if ! echo "$signup_resp" | grep -q 'id'; then
  echo "Signup failed"; exit 1;
fi

# 2. Login
login_resp=$(curl -s -X POST "$BASE_URL/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
access_token=$(echo "$login_resp" | grep -o 'access_token":"[^"]*' | cut -d'"' -f3)
if [ -z "$access_token" ]; then
  echo "Login failed"; exit 1;
fi

# 3. Upload candidate
candidate_resp=$(curl -s -X POST "$BASE_URL/functions/upload_candidate" \
  -H "Authorization: Bearer $access_token" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$CANDIDATE_NAME\",\"email\":\"$CANDIDATE_EMAIL\"}")
candidate_id=$(echo "$candidate_resp" | grep -o 'candidate_id":"[^"]*' | cut -d'"' -f3)
if [ -z "$candidate_id" ]; then
  echo "Candidate upload failed"; exit 1;
fi

# 4. Generate feedback
feedback_resp=$(curl -s -X POST "$BASE_URL/functions/generate_feedback" \
  -H "Authorization: Bearer $access_token" \
  -H "Content-Type: application/json" \
  -d "{\"candidate_id\":\"$candidate_id\",\"job_description\":\"$JOB_DESC\"}")
feedback_id=$(echo "$feedback_resp" | grep -o 'feedback_id":"[^"]*' | cut -d'"' -f3)
if [ -z "$feedback_id" ]; then
  echo "Feedback generation failed"; exit 1;
fi

# 5. Send feedback
send_resp=$(curl -s -X POST "$BASE_URL/functions/send_feedback" \
  -H "Authorization: Bearer $access_token" \
  -H "Content-Type: application/json" \
  -d "{\"candidate_id\":\"$candidate_id\",\"feedback_id\":\"$feedback_id\"}")
if ! echo "$send_resp" | grep -q 'sent'; then
  echo "Send feedback failed"; exit 1;
fi

# 6. Fetch analytics
analytics_resp=$(curl -s -X GET "$BASE_URL/analytics/overview" \
  -H "Authorization: Bearer $access_token")
if ! echo "$analytics_resp" | grep -q 'totalCandidates'; then
  echo "Analytics fetch failed"; exit 1;
fi

# All checks passed
echo "OK"
