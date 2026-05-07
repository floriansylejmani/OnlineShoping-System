# ShopNow / Online Shopping System

ShopNow is a portfolio-grade full-stack e-commerce MVP built with ASP.NET Core, PostgreSQL, and Next.js. It demonstrates clean backend architecture, JWT authentication, role-based admin flows, a customer storefront, cart and checkout workflows, simulated payments, and an admin dashboard for catalog and order operations. This is a portfolio-grade full-stack e-commerce project, not a production-ready payment system or SaaS product.

## Tech Stack

- Backend: ASP.NET Core 9 Web API, EF Core, PostgreSQL, JWT, BCrypt, FluentValidation, xUnit
- Frontend: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, React Query, Zustand, Axios
- Quality: ESLint, Prettier, Vitest, React Testing Library
- DevOps: Docker Compose for PostgreSQL, API, and frontend

## Features

- Customer registration and login.
- Product browsing with search, category filters, sorting, pagination, and product details.
- Cart add, update, remove, and clear actions.
- Checkout from cart into order creation.
- Simulated payment completion for demo order workflow only.
- Customer order history and eligible order cancellation.
- Admin product, category, and order management.
- Admin dashboard with revenue, order, low-stock, recent-order, and best-seller metrics.
- Seeded demo users, 8 categories, and broad demo catalog data.

## Project Status

This repository is prepared as a portfolio project. The main customer/admin flows work locally, backend authorization is enforced server-side, and tests cover the important service and route-protection behavior. Production hardening items such as real payment processing, refresh-token revocation, audit logging, platform secret management, and controlled migration rollout are intentionally listed as limitations or roadmap items.

## Simulated Payment Notice

Payments are simulated for demo and portfolio purposes. No real payment provider is integrated, no card or CVV data is accepted, stored, logged, or transmitted, and no PCI compliance is claimed. Payment statuses are demo workflow states used to show order lifecycle behavior.

## Screenshots

Add final screenshots under `docs/screenshots/` before publishing the portfolio post. The repository keeps the directory in place but does not include placeholder images.

## Demo Login

Demo users are seeded automatically by the backend startup seeder.

```text
Admin email: admin@onlineshop.local
Customer email: customer@onlineshop.local
Password: Password123!
```

## Local Setup

Start PostgreSQL with:

```text
Host=localhost;Port=5432;Database=onlineshop;Username=replace-with-db-user;Password=replace-with-db-password
```

Run the backend:

```powershell
cd C:\Users\Flori\Desktop\onlineshopingsystem
dotnet restore backend\OnlineShop.sln
dotnet run --project backend\API\OnlineShop.API.csproj --launch-profile http
```

Run the frontend:

```powershell
cd C:\Users\Flori\Desktop\onlineshopingsystem\frontend
npm install
npm run dev
```

URLs:

```text
Frontend: http://localhost:3000
Backend API: http://localhost:5290/api
Swagger UI: http://localhost:5290
```

Optional `frontend\.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5290/api
```

## Docker Setup

Docker Compose is included for local development and portfolio review. It starts PostgreSQL, the ASP.NET Core API, and the Next.js frontend with placeholder defaults. Supply `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `JWT_SECRET` from your shell or an untracked local `.env` file.

Run the full stack:

```powershell
cd C:\Users\Flori\Desktop\onlineshopingsystem
docker compose up --build
```

Stop containers:

```powershell
docker compose down
```

Reset the Docker database volume:

```powershell
docker compose down -v
```

## Environment Variables

Backend values can be supplied through environment variables or user secrets:

```text
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=onlineshop;Username=your-local-db-user;Password=your-local-db-password
Jwt__Secret=replace-with-a-secure-32-character-minimum-secret
Jwt__Issuer=OnlineShopAPI
Jwt__Audience=OnlineShopClient
Jwt__ExpiryMinutes=60
Cors__AllowedOrigins__0=http://localhost:3000
```

Use `backend/API/appsettings.json`, `backend/API/appsettings.Development.json`, and `backend/API/appsettings.Example.json` as safe templates only. Real database credentials and JWT secrets should come from environment variables, user secrets, a local untracked `.env`, or deployment secrets outside source control.

Docker Compose reads `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `JWT_SECRET` from the shell or a local untracked `.env` file. The committed compose file uses placeholders only.

Local `.env` files are never committed. `.env.example` files are safe metadata because they document required variable names without real secret values.

Generated runtime reports belong under `reports/generated` and should not be committed. Docker and Git ignore local/generated/cache files such as `node_modules`, `.next`, `.pytest_cache`, `__pycache__`, `codearchitect.db`, logs, and `reports/generated`.

AI-assisted reports should use sanitized analyzer data only and must not include real credentials, tokens, private keys, or raw `.env` contents.

## API Overview

- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Products:
  - `GET /api/products`
  - `GET /api/products/{id}`
  - `POST /api/products` Admin
  - `PUT /api/products/{id}` Admin
  - `DELETE /api/products/{id}` Admin
- Categories:
  - `GET /api/categories`
  - `POST /api/categories` Admin
  - `PUT /api/categories/{id}` Admin
  - `DELETE /api/categories/{id}` Admin
- Cart:
  - `GET /api/cart`
  - `POST /api/cart/items`
  - `PUT /api/cart/items/{id}`
  - `DELETE /api/cart/items/{id}`
  - `DELETE /api/cart`
  - `DELETE /api/cart/clear`
- Orders:
  - `POST /api/orders`
  - `GET /api/orders/my`
  - `GET /api/orders/my-orders`
  - `GET /api/orders/{id}`
  - `GET /api/orders` Admin
  - `GET /api/orders/admin/all` Admin
  - `PUT /api/orders/{id}/status` Admin
  - `PUT /api/orders/{id}/cancel`
- Payments:
  - `POST /api/payments`
- Admin:
  - `GET /api/admin/dashboard` Admin

## Project Structure

```text
backend/
  API/              ASP.NET Core controllers, middleware, Swagger, auth setup
  Application/      DTOs, interfaces, validators, result types
  Domain/           Entities, enums, base entity
  Infrastructure/   Service implementations, JWT/password logic, seed data
  Persistence/      EF Core DbContext and migrations
  Tests/            xUnit backend tests
frontend/
  src/app/          Next.js App Router pages and layouts
  src/components/   Shared UI, nav, route guards, catalog/home components
  src/features/     Domain API clients
  src/store/        Zustand auth store
  src/types/        TypeScript API models
docs/               API, setup, architecture, roadmap, portfolio notes
```

## Validation

Backend tests cover auth, password hashing, JWT claims, authorization, ownership isolation, cart/order flows, and simulated payments. Frontend tests cover login, checkout, route guards, the cart API wrapper, and the shared API client. See `docs/TESTING.md` for the testing matrix.

```powershell
dotnet build backend\OnlineShop.sln -v minimal -nr:false
dotnet test backend\Tests\OnlineShop.Tests.csproj -v minimal -nr:false
```

```powershell
cd frontend
npm run lint
npm run test
npm run build
```

```powershell
docker compose config
```

## Security Notes

Passwords are stored with BCrypt hashes, not plaintext. JWT settings include issuer, audience, signing-key, and expiration validation. Admin API actions use role-based authorization on the server; frontend route guards are only UX. Backend authorization is the source of truth. See `docs/SECURITY.md` for the security proof table and configuration notes.

The payment flow is a demo simulation. It accepts only an `orderId`, creates a completed payment record for the authenticated user's order, and has no real payment provider integration. It does not accept, store, log, or transmit card numbers, CVV values, billing tokens, or provider keys. This project does not claim PCI compliance.

## Known Limitations

- Payments are simulated/demo only and are not production payment processing.
- No real payment provider is integrated and no PCI compliance is claimed.
- Docker Compose is configured for local development, not hardened production hosting.
- Production deployment would require stronger hardening, including platform secret management, controlled migrations, HTTPS/HSTS at the hosting edge, observability, backups, and audit logging.
- Demo credentials are local-only and intentionally known for portfolio walkthroughs.
- Real secrets must be supplied through environment variables, user secrets, an untracked local `.env`, or deployment secret storage.
- Frontend JWT persistence uses localStorage; a production-grade auth strategy should use stronger token/session handling.
- There is no refresh-token revocation, email verification, admin audit log, or production observability stack.

## Roadmap

Future additions include Stripe or another real payment provider, wishlist, reviews, discount codes, email notifications, invoice PDFs, admin audit logs, refresh tokens or HttpOnly cookie auth, and a deployment pipeline.

## Documentation Map

Canonical setup and operations docs:

- `docs/SETUP.md`: local setup.
- `docs/DOCKER_SETUP.md`: Docker Compose setup.
- `docs/API.md`: concise API overview.
- `docs/api-endpoints.md`: expanded API reference.
- `docs/SECURITY.md`: security and secret-handling notes.
- `docs/TESTING.md`: test/build commands.
- `docs/ARCHITECTURE.md`: backend/frontend architecture.
- `docs/ROADMAP.md`: planned improvements.
- `docs/PORTFOLIO_REVIEW.md`: portfolio readiness summary.
- `docs/FINAL_CHECKLIST.md`: publication checklist.

Audit files such as `PROJECT_AUDIT.md` and `docs/PROJECT_AUDIT_REPORT.md` are historical review notes. Prefer the canonical docs above for current setup and API instructions.
