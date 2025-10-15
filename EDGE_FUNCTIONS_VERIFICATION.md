# Edge Functions Deployment Verification Guide

## Overview
This guide provides step-by-step instructions to verify the deployment status of all 12 Supabase Edge Functions for the Xact-Feedback application.

---

## 🔍 **Method 1: Supabase Dashboard Verification**

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Login to your account
3. Navigate to your project: `jeyrciyahbkgjoqikapw`

### Step 2: Check Edge Functions
1. Click on **"Edge Functions"** in the left sidebar
2. Verify all 12 functions are listed and deployed:

**Expected Functions:**
- ✅ `generate_feedback`
- ✅ `send_feedback` 
- ✅ `send-feedback-email`
- ✅ `track_open`
- ✅ `track_click`
- ✅ `track-email-open`
- ✅ `track-link-click`
- ✅ `generate-feedback-pdf`
- ✅ `process-email-retry-queue`
- ✅ `create-order`
- ✅ `verify-payment`
- ✅ `razorpay-webhook`

### Step 3: Check Function Status
For each function, verify:
- **Status:** Should show "Active" or "Deployed"
- **Last Deploy:** Recent timestamp
- **Logs:** No critical errors in recent logs

---

## 🔍 **Method 2: CLI Verification (Recommended)**

### Step 1: Install Supabase CLI (if not installed)
```powershell
npm install -g supabase
```

### Step 2: Login to Supabase
```powershell
supabase login
```

### Step 3: Link to Your Project
```powershell
cd "c:\Users\Administrator\Documents\Xact-Feedback"
supabase link --project-ref jeyrciyahbkgjoqikapw
```

### Step 4: List All Edge Functions
```powershell
supabase functions list
```

### Step 5: Check Individual Function Status
```powershell
# Check specific function details
supabase functions deploy --verify-only generate_feedback
supabase functions deploy --verify-only send-feedback-email
# ... repeat for other functions
```

---

## 🔍 **Method 3: Direct API Testing**

### Step 1: Test Function Endpoints
Run this PowerShell script to test all endpoints:

```powershell
# Set your Supabase details
$supabaseUrl = "https://jeyrciyahbkgjoqikapw.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpleXJjaXlhaGJrZ2pvcWlrYXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI2MjEsImV4cCI6MjA2ODA4ODYyMX0.UIOc3GRhpGLlvj-K44y5uhrh6QTjhnaId3VlqVKt75w"

# Function endpoints to test
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

Write-Host "🔍 Testing Edge Functions Deployment Status..." -ForegroundColor Cyan
Write-Host "=" * 60

foreach ($func in $functions) {
    $url = "$supabaseUrl/functions/v1/$func"
    
    try {
        Write-Host "Testing: $func" -ForegroundColor Yellow
        
        # Test with OPTIONS request first (should always work if deployed)
        $response = Invoke-WebRequest -Uri $url -Method OPTIONS -Headers @{
            "Authorization" = "Bearer $anonKey"
            "apikey" = $anonKey
        } -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ DEPLOYED - Status: $($response.StatusCode)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  DEPLOYED BUT UNUSUAL - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "  ❌ NOT DEPLOYED - 404 Not Found" -ForegroundColor Red
        } elseif ($_.Exception.Response.StatusCode -eq 405) {
            Write-Host "  ✅ DEPLOYED - 405 Method Not Allowed (Expected for some functions)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  ERROR - $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Milliseconds 500
}

Write-Host "`n🏁 Edge Functions Test Complete!" -ForegroundColor Cyan
```

### Step 2: Save and Run the Script
1. Save the above script as `test-edge-functions.ps1`
2. Run it:
```powershell
cd "c:\Users\Administrator\Documents\Xact-Feedback"
.\test-edge-functions.ps1
```

---

## 🔍 **Method 4: Using Our Existing Test Suite**

### Run API Integration Tests
```powershell
cd "c:\Users\Administrator\Documents\Xact-Feedback"
npm run test:api
```

This will run our comprehensive test suite and show which functions are working.

---

## 🔍 **Method 5: Manual Deployment (if functions are missing)**

### Step 1: Deploy All Functions
```powershell
cd "c:\Users\Administrator\Documents\Xact-Feedback"

# Deploy each function individually
supabase functions deploy generate_feedback
supabase functions deploy send_feedback
supabase functions deploy send-feedback-email
supabase functions deploy track_open
supabase functions deploy track_click
supabase functions deploy track-email-open
supabase functions deploy track-link-click
supabase functions deploy generate-feedback-pdf
supabase functions deploy process-email-retry-queue
supabase functions deploy create-order
supabase functions deploy verify-payment
supabase functions deploy razorpay-webhook
```

### Step 2: Deploy All at Once
```powershell
# Deploy all functions at once
supabase functions deploy --all
```

---

## 📊 **Expected Results**

### ✅ **Healthy Deployment**
- All 12 functions show as "Active/Deployed"
- No 404 errors when testing endpoints
- Functions respond within 5-10 seconds
- No critical errors in function logs

### ⚠️ **Potential Issues**
- **404 Errors:** Function not deployed
- **500 Errors:** Function deployed but has runtime issues
- **Timeout Errors:** Function deployed but performance issues
- **CORS Errors:** Function deployed but configuration issues

---

## 🔧 **Troubleshooting Common Issues**

### Issue 1: Function Returns 404
**Solution:**
```powershell
supabase functions deploy [function-name]
```

### Issue 2: Function Times Out
**Check function logs:**
```powershell
supabase functions logs [function-name]
```

### Issue 3: CORS Issues
**Verify CORS headers in function code:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### Issue 4: Authentication Errors
**Verify environment variables are set:**
```powershell
supabase secrets list
```

---

## 📋 **Verification Checklist**

After running the verification steps, complete this checklist:

- [ ] All 12 functions visible in Supabase Dashboard
- [ ] All functions return 200/405 status (not 404)
- [ ] No timeout errors during testing
- [ ] Function logs show no critical errors
- [ ] API integration tests pass for Edge Functions
- [ ] Environment variables are properly set
- [ ] CORS headers are configured correctly

---

## 🚀 **Next Steps After Verification**

1. **If all functions are deployed:** 
   - Run full test suite: `npm run test:api`
   - Update deployment status in monitoring

2. **If some functions are missing:**
   - Deploy missing functions individually
   - Re-run verification steps
   - Check function logs for deployment issues

3. **If functions are slow:**
   - Check function logs for performance issues
   - Consider optimizing cold start times
   - Monitor function execution times

---

*Last Updated: August 14, 2025*  
*Status: Ready for verification* ✅
