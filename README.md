# ShopNow / Online Shopping System

![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-9.0-512BD4?style=flat-square&logo=dotnet&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-F59E0B?style=flat-square)
![EF Core](https://img.shields.io/badge/EF%20Core-ORM-512BD4?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-Passing-16A34A?style=flat-square)
![Status](https://img.shields.io/badge/Status-Portfolio%20MVP-2563EB?style=flat-square)
![Payments](https://img.shields.io/badge/Payments-Simulated-6B7280?style=flat-square)

ShopNow is a portfolio-grade full-stack e-commerce MVP built with ASP.NET Core, PostgreSQL, and Next.js. It demonstrates clean backend architecture, JWT authentication, role-based admin flows, a customer storefront, cart and checkout workflows, simulated payments, and an admin dashboard for catalog and order operations.

This is a portfolio-grade full-stack e-commerce project, not a production-ready payment system or SaaS product.

## Project Status

The main customer and admin flows run locally, backend authorization is enforced server-side, and the test suite covers authentication, JWT claims, authorization, ownership isolation, cart/order behavior, simulated payments, and key frontend flows.

Production hardening items such as real payment processing, refresh-token revocation, audit logging, platform secret management, controlled migrations, observability, and backup/restore planning are intentionally documented as limitations or roadmap items.

## Highlights

- Layered ASP.NET Core backend with API, Application, Domain, Infrastructure, Persistence, and Tests projects.
- EF Core persistence with PostgreSQL, migrations, relational entities, and seeded demo data.
- JWT authentication with role-based server-side authorization for admin endpoints.
- BCrypt password hashing and DTO-based API responses.
- Next.js App Router frontend with React Query, Zustand auth state, and TypeScript API models.
- Customer catalog, cart, checkout, order history, and cancellation flows.
- Admin dashboard plus product, category, and order management.
- Docker Compose setup for local PostgreSQL, API, and frontend orchestration.
- Backend and frontend tests for portfolio-readiness proof.

## Tech Stack

- Backend: ASP.NET Core 9 Web API, EF Core, PostgreSQL, JWT, BCrypt, FluentValidation, xUnit.
- Frontend: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, React Query, Zustand, Axios.
- Testing: xUnit, SQLite test database, WebApplicationFactory, Vitest, jsdom, React Testing Library.
- DevOps: Docker Compose for local development.

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

## Simulated Payment Notice

Payments are simulated for demo and portfolio purposes. No real payment provider is integrated. No card or CVV data is accepted, stored, logged, or transmitted. No PCI compliance is claimed.

Payment statuses are demo workflow states used to show order lifecycle behavior.

## Demo Login

Demo users are seeded automatically by the backend startup seeder.

```text
Admin email: admin@onlineshop.local
Customer email: customer@onlineshop.local
Password: Password123!
```

These credentials are local/demo-only and intentionally known for portfolio walkthroughs.

## Screenshots

Screenshot guidance is available in [docs/screenshots/README.md](docs/screenshots/README.md). The repository intentionally avoids broken placeholder image links until actual screenshots are added.

## Architecture Summary

The solution separates a Next.js frontend from an ASP.NET Core API and keeps backend concerns split across API, Application, Domain, Infrastructure, and Persistence projects. PostgreSQL is accessed through EF Core, and Docker Compose is included for local development orchestration.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full architecture notes and diagram.

## Local Setup

For the full setup guide, see [docs/SETUP.md](docs/SETUP.md).

Start PostgreSQL with a local database matching:

```text
Host=localhost;Port=5432;Database=onlineshop;Username=replace-with-db-user;Password=replace-with-db-password
```

Run the backend:

```powershell
dotnet restore backend\OnlineShop.sln
dotnet run --project backend\API\OnlineShop.API.csproj --launch-profile http
```

Run the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Local URLs:

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

Docker Compose is included for local development and portfolio review. It starts PostgreSQL, the ASP.NET Core API, and the Next.js frontend with placeholder defaults.

See [docs/DOCKER_SETUP.md](docs/DOCKER_SETUP.md) for Docker-specific notes.

```powershell
$env:POSTGRES_USER="your-local-db-user"
$env:POSTGRES_PASSWORD="your-local-db-password"
$env:JWT_SECRET="your-local-32-character-minimum-secret"
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

Backend values can be supplied through environment variables, .NET user secrets, a local untracked `.env`, or deployment secrets.

```text
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=onlineshop;Username=your-local-db-user;Password=your-local-db-password
Jwt__Secret=replace-with-a-secure-32-character-minimum-secret
Jwt__Issuer=OnlineShopAPI
Jwt__Audience=OnlineShopClient
Jwt__ExpiryMinutes=60
Cors__AllowedOrigins__0=http://localhost:3000
```

Use `backend/API/appsettings.json`, `backend/API/appsettings.Development.json`, and `backend/API/appsettings.Example.json` as safe templates only. Real database credentials and JWT secrets should not be committed.

Docker Compose reads `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `JWT_SECRET` from the shell or a local untracked `.env` file. The committed compose file uses placeholders only.

## API Overview

Concise API docs are in [docs/API.md](docs/API.md). Expanded endpoint examples are in [docs/api-endpoints.md](docs/api-endpoints.md).

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
  - `POST /api/payments` simulated
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
docs/               Setup, API, security, testing, architecture, roadmap
```

Architecture details are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Testing and Validation

See [docs/TESTING.md](docs/TESTING.md) for the testing matrix.

Backend tests cover auth, password hashing, JWT claims, authorization, ownership isolation, cart/order flows, and simulated payments. Frontend tests cover login, register, cart, checkout, product details, my-orders, protected/admin routes, catalog UI, the cart API wrapper, and the shared API client.

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

See [docs/SECURITY.md](docs/SECURITY.md) for the security proof table and configuration notes.

- Passwords are stored with BCrypt hashes, not plaintext.
- Authentication uses JWT bearer tokens with issuer, audience, signing-key, and expiration validation.
- Admin API actions use server-side role authorization.
- Customer cart, order, and payment actions are scoped to the authenticated user.
- Frontend protected/admin route guards improve UX only.
- Backend authorization is the source of truth.
- Real secrets must be supplied through environment variables, user secrets, or deployment secret storage.
- Local `.env` files, real credentials, tokens, private keys, payment-provider keys, and production connection strings must not be committed.

## Known Limitations

- Payments are simulated/demo only and are not production payment processing.
- No real payment provider is integrated and no PCI compliance is claimed.
- Docker Compose is configured for local development, not hardened production hosting.
- Demo credentials are local-only and intentionally known for portfolio walkthroughs.
- Frontend JWT persistence uses localStorage; a production-grade auth strategy should use stronger token/session handling.
- Startup migrations are convenient for local development but should be a controlled production deployment step.
- There is no refresh-token revocation, email verification, admin audit log, production observability stack, or backup/restore plan.

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for the current roadmap.

Future additions include Stripe or another real payment provider, wishlist, reviews, discount codes, email notifications, invoice PDFs, admin audit logs, refresh tokens or HttpOnly cookie auth, and a deployment pipeline.

## Documentation Map

- [docs/SETUP.md](docs/SETUP.md): local setup.
- [docs/DOCKER_SETUP.md](docs/DOCKER_SETUP.md): Docker Compose setup.
- [docs/API.md](docs/API.md): concise API overview.
- [docs/api-endpoints.md](docs/api-endpoints.md): expanded API reference.
- [docs/SECURITY.md](docs/SECURITY.md): security and secret-handling notes.
- [docs/TESTING.md](docs/TESTING.md): test/build commands and coverage matrix.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): backend/frontend architecture.
- [docs/screenshots/README.md](docs/screenshots/README.md): screenshot capture guide.
- [docs/ROADMAP.md](docs/ROADMAP.md): planned improvements.

Historical review notes and internal task files are archived under [docs/archive/](docs/archive/). Prefer the canonical docs above for current setup, API, security, testing, and roadmap information.

## Portfolio Positioning

This project is intended to show practical full-stack engineering judgment: backend layering, EF Core persistence, authentication and authorization, ownership checks, typed frontend API integration, test coverage, Docker-based local orchestration, and honest documentation of demo-level boundaries.

It should be evaluated as a portfolio MVP, not as a hosted production commerce platform.

## License

No license file is currently included.
