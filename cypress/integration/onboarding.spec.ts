/// <reference types="cypress" />

describe('Onboarding Flow', () => {
  beforeEach(() => {
    // Log in as test user
    cy.visit('/login');
    cy.contains('Sign in').should('exist');
    cy.get('input[placeholder="Enter your email"]').type('info@camcess.com');
    cy.get('input[placeholder="Enter your password"]').type('kyoya123');
    cy.contains('Sign in').click();
    // Wait for possible error message to appear
    cy.get('body').then($body => {
      if ($body.text().includes('Invalid login') || $body.text().includes('error')) {
        throw new Error('Login failed: Invalid credentials or error shown on login page');
      }
    });
    // Wait for dashboard redirect (increase timeout)
    cy.url({ timeout: 10000 }).should('not.include', '/login');
  });

  it('should complete onboarding and access dashboard', () => {
    cy.visit('/onboarding');
    // Step 1: Branding
    cy.get('[data-cy="logo-upload"]').attachFile('logo.png');
    cy.get('[data-cy="primary-color"]').invoke('val', '#123456').trigger('change');
    cy.get('[data-cy="secondary-color"]').invoke('val', '#654321').trigger('change');
    cy.contains('Next').click();
    // Step 2: Email
    cy.get('[data-cy="email-sender"]').type('HR Team');
    cy.get('[data-cy="email-signature"]').type('Best regards,\nHR Team\nYour Company');
    cy.contains('Next').click();
    // Step 3: Complete
    cy.contains('Complete Setup').click();
    cy.contains('Setup Complete');
    cy.url().should('include', '/dashboard');
  });

  it('should block access to dashboard if not onboarded', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/onboarding');
  });
});
