// Test the authentication flow with the simplified ProtectedRoute
console.log('Testing Authentication Flow...');

// Navigate to login page
window.location.href = '/login';

// Wait a moment and try to fill in login form
setTimeout(() => {
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.querySelector('input[type="password"]');
  const submitButton = document.querySelector('button[type="submit"]');
  
  if (emailInput && passwordInput && submitButton) {
    emailInput.value = 'simple@test.com';
    passwordInput.value = 'simple123';
    
    console.log('Login form found and filled');
    console.log('Click the login button to test the flow');
  } else {
    console.log('Login form elements not found');
  }
}, 1000);
