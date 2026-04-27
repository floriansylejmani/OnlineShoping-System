# ShopNow / Online Shopping System

ShopNow is a portfolio-ready full-stack e-commerce MVP built with ASP.NET Core, PostgreSQL, and Next.js. It demonstrates a clean backend architecture, JWT authentication, role-based admin flows, a modern customer storefront, cart and checkout workflows, simulated payments, and an admin dashboard for catalog and order operations.

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
- Simulated payment completion.
- Customer order history and eligible order cancellation.
- Admin product, category, and order management.
- Admin dashboard with revenue, order, low-stock, recent-order, and best-seller metrics.
- Seeded demo users, 8 categories, and broad demo catalog data.

## Screenshots

Add screenshots before publishing:

- Home
- Product listing
- Product details
- Cart
- Checkout
- My orders
- Admin dashboard

## Demo Login

```text
Admin email: admin@onlineshop.local
Customer email: customer@onlineshop.local
Password: Password123!
```

## Local Setup

Start PostgreSQL with:

```text
Host=localhost;Port=5432;Database=onlineshop;Username=postgres;Password=postgres
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
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=onlineshop;Username=postgres;Password=postgres
Jwt__Secret=replace-with-a-secure-32-character-minimum-secret
Jwt__Issuer=OnlineShopAPI
Jwt__Audience=OnlineShopClient
Jwt__ExpiryMinutes=60
Cors__AllowedOrigins__0=http://localhost:3000
```

Use `backend/API/appsettings.Example.json` as the safe template. Do not commit production secrets.

## API Overview

- Auth: `/api/auth/register`, `/api/auth/login`
- Products: `/api/products`, `/api/products/{id}`
- Categories: `/api/categories`
- Cart: `/api/cart`, `/api/cart/items`
- Orders: `/api/orders`, `/api/orders/my-orders`, `/api/orders/admin/all`
- Payments: `/api/payments`
- Admin dashboard: `/api/admin/dashboard`

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

## Roadmap

Future production-level additions include Stripe, wishlist, reviews, discount codes, email notifications, invoice PDFs, admin audit logs, refresh tokens or HttpOnly cookie auth, and a deployment pipeline.

More details are in `docs/API.md`, `docs/ARCHITECTURE.md`, `docs/SETUP.md`, `docs/ROADMAP.md`, `docs/PORTFOLIO_REVIEW.md`, and `docs/FINAL_CHECKLIST.md`.
