# ShopNow / Online Shopping System Audit

Date: 2026-04-27

## What Is Good

- Backend follows a clear layered shape: API, Application, Domain, Infrastructure, Persistence, and Tests.
- Core e-commerce flows exist: auth, catalog, cart, checkout/order creation, payment simulation, order history, and admin catalog/order management.
- API responses use DTOs instead of returning EF entities directly.
- Passwords are hashed with BCrypt, and admin-only operations are protected with role authorization.
- EF Core migrations exist and the database can be initialized from code.
- Frontend uses Next.js App Router, TypeScript, React Query, Zustand, and feature folders.
- The UI already has a usable customer flow and admin pages.

## What Was Missing Or Incomplete

- FluentValidation validators existed but were not wired into MVC request execution.
- CORS was hardcoded instead of coming from configuration.
- Product queries had pagination but no clamping or sorting.
- Some requested API route names were missing aliases, including `/api/orders/my-orders`, `/api/orders/admin/all`, `/api/orders/{id}`, and `DELETE /api/cart`.
- Seed data only covered Sweet, Salty, and Drinks instead of the full requested category set.
- `/products/[id]` was missing on the frontend.
- Documentation was spread across older files and did not fully reflect the current setup.

## What Is Risky

- Local demo JWT and database values are still present in `appsettings.json`; production must use environment variables or a secret manager.
- Frontend JWT storage uses localStorage through Zustand persistence. This is acceptable for a portfolio MVP but is more exposed to XSS than an HttpOnly cookie strategy.
- Startup still runs migrations automatically, which is convenient for local development but should be a controlled deployment step in production.
- Payment is only a simulation and should not be presented as a real payment integration.
- There is no refresh-token flow, token revocation, audit trail, or real email notification system yet.

## Next Phases

- Expand backend tests around product filtering/sorting, validation failures, and API-level authorization.
- Improve admin dashboard metrics with revenue, low-stock products, and recent orders.
- Add Docker Compose for PostgreSQL, API, and frontend.
- Replace localStorage auth with a production-grade token strategy when moving beyond portfolio/demo use.
- Add Stripe, wishlist, reviews, discounts, email notifications, and invoice PDFs as future features.
