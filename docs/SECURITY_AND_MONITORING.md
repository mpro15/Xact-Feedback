# Security, RLS, and Monitoring Setup

## Row Level Security (RLS)
- RLS is enabled for all main tables (`users`, `companies`, `support_logins`).
- Only allow users to select, update, insert, and delete their own rows in `users`.
- Only allow users to select their own company in `companies` (via `company_id`).
- Support/admin users can select all rows if their `user_id` is in `support_logins`.
- Broad SELECT policies for authenticated users have been removed for production.
- See `supabase/migrations/20250720130000_refine_rls_least_privilege.sql` for details.

## Monitoring & Logging
- Onboarding events and errors are logged via `/api/monitor/onboarding` endpoint (see `OnboardingPage.tsx`).
- Replace with Sentry or a production-grade logger for enterprise deployments.
- All critical flows (auth, onboarding, feedback, billing) should have monitoring hooks.

## Error Boundaries
- Global error boundaries and notification system are implemented in React (see `OnboardingPage.tsx`).
- All major flows provide user feedback and log errors for support.

## Automated Tests
- Cypress tests for onboarding and protected routes are in `cypress/integration/onboarding.spec.ts`.
- Ensure tests are run in CI/CD for every release.

## Audit & Compliance
- All RLS migrations are tracked in `supabase/migrations/`.
- Security and monitoring documentation is maintained in this file.
- Review RLS and monitoring setup before every major release.
