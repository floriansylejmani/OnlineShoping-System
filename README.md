# Online Shopping System

A full-stack online shopping system with a .NET API backend and a Next.js frontend. The application supports product browsing, customer cart and checkout flows, order history, payments, and an admin panel for managing products, categories, and orders.

## Tech Stack

- Backend: ASP.NET Core 9, Entity Framework Core, PostgreSQL, JWT authentication, xUnit
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, React Query, Zustand, Axios
- Database: PostgreSQL
- Testing: xUnit, EF Core SQLite in-memory tests

## Features

- Customer registration and login
- JWT-protected customer routes
- Public product browsing with category/search filters
- Cart add, update, remove, and clear
- Checkout from current cart
- Payment processing simulation
- Customer order history and order cancellation
- Admin-protected dashboard
- Admin product create, update, and soft delete
- Admin category create, update, and delete
- Admin order listing and status updates

## User Roles

- Customer: browse products, manage cart, checkout, pay, view and cancel eligible orders.
- Admin: manage products, categories, and all order statuses.

## Backend Setup

```bash
cd backend
dotnet restore
dotnet build OnlineShop.sln
dotnet run --project API
```

Default API URL: `http://localhost:5290/api`

Swagger UI is enabled in development at `http://localhost:5290`.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Default frontend URL: `http://localhost:3000`

## Database Setup

1. Install and start PostgreSQL.
2. Create a database, for example `onlineshop`.
3. Configure the backend connection string in `backend/API/appsettings.Development.json` or environment variables.
4. Apply migrations:

```bash
cd backend
dotnet ef database update --project Persistence --startup-project API
```

## Test Commands

```bash
cd backend
dotnet test OnlineShop.sln
dotnet build OnlineShop.sln
```

```bash
cd frontend
npm run build
```

## Environment Variables

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5290/api
```

Backend settings:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=onlineshop;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "Secret": "replace-with-a-secure-32-character-minimum-secret",
    "Issuer": "OnlineShopAPI",
    "Audience": "OnlineShopClient",
    "ExpiryMinutes": 60
  }
}
```

See `frontend/.env.example` and `backend/API/appsettings.Example.json`.

## Screenshots

Screenshots can be added here before publishing:

- Home page
- Product listing
- Cart
- Checkout
- My orders
- Admin dashboard
- Admin product management

## Deployment

- Backend: deploy the ASP.NET Core API to Azure App Service, Render, Railway, Fly.io, or a Docker-capable host. Configure PostgreSQL and JWT settings as production environment variables.
- Frontend: deploy the Next.js app to Firebase Hosting, Vercel, or another Node-compatible frontend host. Set `NEXT_PUBLIC_API_URL` to the deployed backend API URL.

See `docs/deployment.md` for deployment notes.

## GitHub Repository Note

Before pushing to GitHub, confirm secrets are not committed. Use `.env.example` and `appsettings.Example.json` as templates, and keep real production values in deployment environment settings.
