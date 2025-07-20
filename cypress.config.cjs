const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/integration/*.spec.ts',
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.js',
    video: false,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false
  }
});
