# Online Shopping System Project Audit

Date: 2026-04-25

## Overall Score

7.2 / 10

The project has a solid educational/full-stack baseline: a layered ASP.NET Core backend, EF Core entities/migrations, JWT authentication, role-restricted admin endpoints, and a working Next.js frontend. The biggest functional issue was missing runtime seed data, which made categories/products appear as 0 in a fresh database. That has been fixed with an idempotent seed system.

## What Is Good

- Backend uses a clean layered structure: `Domain`, `Application`, `Infrastructure`, `Persistence`, `API`, and `Tests`.
- Entity boundaries are understandable: users, carts, products, categories, orders, order items, and payments.
- Admin-only endpoints are protected with `[Authorize(Roles = "Admin")]`.
- Customer cart and order flows have service-level tests.
- Product deletion is soft delete via `IsActive`, which is safer than physical deletion.
- Frontend uses Next.js App Router, React Query, Zustand auth persistence, and typed API models.
- Protected customer and admin route wrappers exist.
- Backend tests cover the main auth/cart/order/payment/admin-authorization flows.

## Current Limitations

- Error handling hides unexpected errors but has no structured problem-details contract or correlation IDs.
- `PaymentService.GetByOrderIdAsync` does not enforce user ownership if exposed later.
- Startup currently runs migrations automatically. This is convenient for development, but production should use a controlled migration step.
- UI is functional but still basic in admin tables/forms and lacks richer empty/error/loading states in several admin screens.
- The payment flow is simulated/demo only and is not a real provider integration.
- Frontend JWT storage uses localStorage, which is acceptable for this portfolio MVP but should be replaced for a production-grade auth strategy.

## Bugs Found

- Fresh database showed 0 products and 0 categories because there was no seed system.
- Default admin user was not created automatically.
- Frontend imported `@/lib/api`, but `frontend/src/lib/api.ts` did not exist.
- Frontend default API URL was therefore undefined/broken. It is now set to `http://localhost:5290/api` unless `NEXT_PUBLIC_API_URL` overrides it.
- Some UI strings contained broken mojibake or non-portable glyphs in loading/button text.
- Next.js Turbopack inferred the wrong workspace root because another `package-lock.json` exists in `C:\Users\Flori`.

## Security Issues

- `appsettings.json` contains a placeholder JWT secret. Real production secrets must come from environment variables or a secret manager.
- Demo seeded users use a known password. This is acceptable for local development only.
- No refresh-token flow or token revocation exists.
- No rate limiting on login/register endpoints.
- CORS is configured from settings and defaults to `http://localhost:3000`; production needs explicit deployed frontend origins.
- No HTTPS enforcement or HSTS configuration is present in middleware.
- No request-size limits or file upload hardening, which matters if product image upload is added.
- No audit trail for admin catalog/order actions.

## Database And Seed Issues

### Before

- Migrations existed, but database creation did not populate usable catalog data.
- Categories and products were absent in a fresh PostgreSQL database.
- Admin and demo customer accounts were absent.

### Implemented

- Added an idempotent database seeder.
- Added default users:
  - Admin: `admin@onlineshop.local`
  - Customer: `customer@onlineshop.local`
  - Password for both: `Password123!`
- Added 8 categories:
  - Books
  - Drinks
  - Electronics
  - Fashion
  - Home & Kitchen
  - Salty
  - Sports
  - Sweet
- Added broad demo catalog data across all categories.
- Each product has name, description, price, stock, image URL, active status, and category relation.
- Seeder is idempotent by email, category name, and product name, so backend restarts do not duplicate data.

## Architecture Review

### Backend

The backend structure is clean for this project size. Controllers are thin and delegate to services. DTOs are separated from entities. EF Core mapping is centralized in `ApplicationDbContext`.

Recommended improvements:

- Add an `Application` registration extension and wire FluentValidation into MVC.
- Add a dedicated `SeedOptions` config section so demo seeding can be disabled in production.
- Add request pagination validation and maximum page size.
- Split production migrations from app startup.
- Add richer service result status types instead of inferring 404 from error text.

### Frontend

The frontend structure is acceptable but could be more modular as it grows. API calls live under features, types are separated, and route protection exists.

Recommended improvements:

- Move repeated loading/error/empty UI into shared components.
- Add product details route at `/products/[id]`.
- Add centralized currency and date formatting utilities.
- Add richer admin dashboard statistics instead of only count cards.
- Add better typed API error handling.

## Backend Functional Review

- Auth: Register/login works and returns JWT. New registrations are customers only.
- Roles: Admin endpoints are protected. Customer/admin route distinction is present on frontend and backend.
- Products/categories: Public read endpoints exist; admin create/update/delete endpoints exist. Seed now prevents empty catalog.
- Cart: Add/update/remove/clear works and checks stock.
- Orders: Order creation decrements stock and clears cart. Cancel restores stock for pending/processing orders.
- Payments: Simulated payment creates a paid payment and moves order to Processing.
- Database design: Good baseline with unique email/category name, relationships, delete behavior, and decimal precision.
- Migrations: Initial migration exists and builds. No new migration was needed because schema did not change.

## Frontend Functional Review

- Auth flow: Zustand stores token/user and Axios attaches bearer token.
- Protected routes: Customer pages redirect to login; admin layout redirects non-admins.
- Products page: Reads backend products/categories, supports search/category filter, add-to-cart, loading, empty, and error states.
- Cart page: Reads backend cart and supports quantity update, remove, clear, and checkout link.
- Admin UI: Products/categories/orders pages exist and call protected APIs.
- Design: Improved baseline home/product/cart/login/register text and app background. Further UI polish is still recommended.

## Design Issues

- Admin pages are still form/table heavy and need stronger visual hierarchy.
- Product cards need consistent image aspect ratios and fallback imagery.
- Empty states should be more actionable across admin screens.
- Login/register pages are clean but still generic.
- Checkout and orders pages need clearer order status/timeline design.
- Color system is still mostly default Tailwind blue/gray; acceptable, but not yet distinctive.

## Missing Features Ranked By Priority

1. Product details page.
2. Search/filter/sort improvements with price/category/sort controls persisted in URL query.
3. Admin dashboard statistics: revenue, low stock, recent orders, pending orders.
4. Low stock indicators and admin low-stock filter.
5. Better validation messages wired through FluentValidation.
6. Product image upload with storage validation.
7. Order status timeline.
8. Docker Compose for PostgreSQL, API, and frontend.
9. README improvement with seeded credentials and setup commands.
10. Invoice PDF.
11. Email confirmation.

## Exact Fixes Implemented

- Added `DatabaseSeeder` with idempotent demo users, categories, and 60 products.
- Wired migration + seed execution into backend startup.
- Added missing frontend Axios API client with JWT request interceptor and 401 logout behavior.
- Set frontend API default to backend launch URL: `http://localhost:5290/api`.
- Improved home page copy/layout to reflect the real seeded catalog.
- Improved products page header and fixed search placeholder.
- Fixed broken UI text/loading strings in cart, login, register, checkout, and my-orders pages.
- Updated global styling baseline to use a light app background and consistent transition behavior.
- Set Turbopack root in Next config to avoid wrong workspace-root inference.

## Exact Files Changed

- `backend/API/Program.cs`
- `backend/Infrastructure/Services/DatabaseSeeder.cs`
- `frontend/src/lib/api.ts`
- `frontend/src/app/globals.css`
- `frontend/src/app/page.tsx`
- `frontend/src/app/products/page.tsx`
- `frontend/src/app/cart/page.tsx`
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/register/page.tsx`
- `frontend/src/app/my-orders/page.tsx`
- `frontend/src/app/checkout/page.tsx`
- `frontend/next.config.ts`
- `docs/PROJECT_AUDIT_REPORT.md`

## Verification Results

### Backend Build

Command:

```powershell
dotnet build backend\OnlineShop.sln -v minimal -nr:false
```

Result: Passed.

Note: Running without `-nr:false` hit a Windows/MSBuild stale file-lock issue on `backend\Infrastructure\obj\Debug\net9.0\OnlineShop.Infrastructure.csproj.CoreCompileInputs.cache`. With node reuse disabled, the solution builds successfully.

### Backend Tests

Command:

```powershell
dotnet test backend\Tests\OnlineShop.Tests.csproj -v minimal -nr:false
```

Result: Passed. Current backend coverage includes service-level flow tests and HTTP-level authorization tests.

### Frontend Build

Command:

```powershell
npm run build
```

Result: Passed.

Remaining warning:

- Node emitted `--localstorage-file was provided without a valid path`. This appears environment-related and did not fail the build.

## Commands To Run

### Start PostgreSQL

Use a local PostgreSQL instance matching:

```text
Host=localhost;Port=5432;Database=onlineshop;Username=replace-with-db-user;Password=replace-with-db-password
```

### Run Backend

```powershell
cd C:\Users\Flori\Desktop\onlineshopingsystem
dotnet run --project backend\API\OnlineShop.API.csproj --launch-profile http
```

Backend URL:

```text
http://localhost:5290
```

Swagger UI:

```text
http://localhost:5290
```

### Run Frontend

```powershell
cd C:\Users\Flori\Desktop\onlineshopingsystem\frontend
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

If your API uses a different URL, create `frontend\.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5290/api
```

## Demo Accounts

```text
Admin email: admin@onlineshop.local
Customer email: customer@onlineshop.local
Password: Password123!
```

## Next Recommended Steps

1. Add production deployment pipeline and platform secret management.
2. Replace localStorage auth with a production-grade token/session strategy when moving beyond portfolio/demo use.
3. Add a real payment provider such as Stripe if real checkout is required.
4. Add admin audit logging, structured observability, backup/restore planning, and controlled migration rollout.
5. Continue UI polish for admin tables, order timelines, empty states, and screenshots before portfolio publishing.
