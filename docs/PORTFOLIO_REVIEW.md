# ShopNow Portfolio Review

![.NET](https://img.shields.io/badge/.NET-ASP.NET%20Core%209-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-UI-38B2AC)
![JWT](https://img.shields.io/badge/Auth-JWT-green)
![Architecture](https://img.shields.io/badge/architecture-clean--architecture-blue)
![Status](https://img.shields.io/badge/status-portfolio--MVP-green)

## What This Project Demonstrates

ShopNow demonstrates a realistic full-stack e-commerce MVP with customer shopping flows, admin management, authentication, database persistence, validation, testing, and Docker-based local orchestration.

## Backend Skills Shown

- ASP.NET Core Web API structure.
- Clean Architecture-style project separation.
- EF Core with PostgreSQL and migrations.
- DTO-based API responses.
- JWT authentication and role-based authorization.
- BCrypt password hashing.
- FluentValidation request validation.
- Global exception handling, logging, rate limiting, and basic security headers.
- Service-level and HTTP-level tests for auth, cart, orders, payments, ownership isolation, and admin authorization.

## Frontend Skills Shown

- Next.js App Router.
- TypeScript domain models.
- React Query server-state management.
- Zustand auth persistence.
- Protected customer/admin routes.
- Product listing, filtering, sorting, details, cart, checkout, orders, and admin pages.
- Responsive Tailwind UI with loading, empty, and error states.
- ESLint, Prettier, Vitest, and React Testing Library setup.

## Database Skills Shown

- Relational modeling for users, carts, products, categories, orders, order items, and payments.
- EF Core relationships, delete behavior, decimal precision, and indexes.
- Idempotent seed data for demo users, categories, and catalog products.
- Migration-based schema management.

## Security Practices Shown

- Password hashes instead of plain text passwords.
- Admin-only API endpoints protected by role authorization.
- JWT validation for issuer, audience, lifetime, and signing key.
- Login/register rate limiting.
- CORS configured through settings.
- Production guard against obvious placeholder JWT secrets.
- Stack traces hidden from frontend responses.
- Security proof table is documented in `docs/SECURITY.md`.

## Still Demo-Level

- Payment is simulated and not integrated with a real provider; no card/CVV data is accepted, stored, logged, or transmitted.
- JWT is stored in frontend localStorage.
- Demo credentials are intentionally known.
- Migrations run on application startup for local convenience.
- No refresh-token revocation, email confirmation, admin audit log, or production observability stack.

## Needed For Production

- Real payment provider such as Stripe.
- PCI-aware payment-provider integration if real card payments are required.
- HttpOnly cookie or hardened refresh-token strategy.
- Secret manager or platform environment secrets.
- Controlled migration deployment step.
- HTTPS/HSTS at the hosting edge.
- Centralized logging, metrics, tracing, and alerts.
- Admin audit trail.
- Email service for transactional notifications.
- Backup and restore plan for PostgreSQL.
