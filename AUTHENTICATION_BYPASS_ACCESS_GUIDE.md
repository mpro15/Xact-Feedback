# 📋 Application Access Guide - Authentication Disabled

## ✅ Overview

Authentication has been completely disabled in the application, allowing you to access all features without logging in. This document provides a guide to using the application with authentication bypass enabled.

## 🔓 Available Routes

All routes are now accessible without authentication:

### Main Dashboard
- **URL**: [http://localhost:5173/dashboard](http://localhost:5173/dashboard)
- **Description**: Main application dashboard with overview metrics
- **Access**: Direct access, no login required

### Candidates
- **URL**: [http://localhost:5173/candidates](http://localhost:5173/candidates)
- **Description**: Manage candidate information and feedback
- **Access**: Direct access, no login required

### Analytics
- **URL**: [http://localhost:5173/analytics](http://localhost:5173/analytics)
- **Description**: View performance metrics and analytics data
- **Access**: Direct access, no login required

### Billing
- **URL**: [http://localhost:5173/billing](http://localhost:5173/billing)
- **Description**: Manage billing and subscription information
- **Access**: Direct access, no login required

### Settings
- **URL**: [http://localhost:5173/settings](http://localhost:5173/settings)
- **Description**: Configure application settings
- **Access**: Direct access, no login required

### User Profile
- **URL**: [http://localhost:5173/user-profile](http://localhost:5173/user-profile)
- **Description**: View and edit user profile information
- **Access**: Direct access, no login required

## 👤 User Context

While using the application with authentication disabled:

- You are automatically logged in as an admin user
- You have full permissions for all features
- Your user details are:
  - **Name**: Admin User
  - **Email**: admin@example.com
  - **Role**: Admin
  - **Company ID**: mock-company-id

## 🔧 Technical Details

The application has the following modifications:

1. **ProtectedRoute**: All routes render without authentication checks
2. **AuthContext**: A mock admin user is always provided
3. **LoginPage**: Auto-redirects to dashboard

## 📝 Notes

- Backend operations requiring actual authentication may still fail
- Database operations are still subject to RLS (Row Level Security) policies
- This configuration is for development purposes only

## 🔒 Data Security

Remember that while frontend authentication is bypassed, any data you create will still be stored in the database and subject to its security rules.

## 🚀 Getting Started

Simply navigate to any of the URLs listed above to start using the application without authentication.
