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

## Previously Missing Or Incomplete

- FluentValidation validators needed to be wired into MVC request execution. This is now handled through the API validation filter.
- CORS needed to come from configuration. This is now configurable through `Cors:AllowedOrigins`.
- Product queries needed clamping/sorting improvements. Current product/order paging is clamped and product sorting is implemented.
- Requested API route aliases were missing, including `/api/orders/my-orders`, `/api/orders/admin/all`, `/api/orders/{id}`, and `DELETE /api/cart`. These aliases now exist.
- Seed data only covered Sweet, Salty, and Drinks instead of the full requested category set. The current seeder provides 8 categories and broad demo catalog data.
- `/products/[id]` was missing on the frontend. The product details page now exists.
- Documentation was spread across older files and did not fully reflect the setup. `README.md` now points to canonical setup, API, security, Docker, testing, and roadmap docs.

## What Is Risky

- Committed appsettings files use placeholders/safe local metadata; production must supply real JWT and database values through environment variables or a secret manager.
- Frontend JWT storage uses localStorage through Zustand persistence. This is acceptable for a portfolio MVP but is more exposed to XSS than an HttpOnly cookie strategy.
- Startup still runs migrations automatically, which is convenient for local development but should be a controlled deployment step in production.
- Payment is only a simulation, accepts no card data, and should not be presented as a real payment integration.
- There is no refresh-token flow, token revocation, audit trail, or real email notification system yet.

## Next Phases

- Add production deployment pipeline and platform secret management.
- Replace localStorage auth with a production-grade token strategy when moving beyond portfolio/demo use.
- Add Stripe, wishlist, reviews, discounts, email notifications, and invoice PDFs as future features.
