# ShopNow Setup

## Prerequisites

- .NET 9 SDK
- Node.js 20 or newer
- PostgreSQL

## Database

Create a local PostgreSQL database matching the default development connection string:

```text
Host=localhost;Port=5432;Database=onlineshop;Username=replace-with-db-user;Password=replace-with-db-password
```

The API applies migrations and idempotent demo seed data on startup for local development.

## Backend

```powershell
cd C:\Users\Flori\Desktop\onlineshopingsystem
dotnet restore backend\OnlineShop.sln
dotnet run --project backend\API\OnlineShop.API.csproj --launch-profile http
```

Backend URL: `http://localhost:5290`

Swagger UI: `http://localhost:5290`

## Frontend

```powershell
cd C:\Users\Flori\Desktop\onlineshopingsystem\frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:3000`

Optional frontend environment file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5290/api
```

## Docker Compose

The full stack can also run through Docker Compose:

```powershell
cd C:\Users\Flori\Desktop\onlineshopingsystem
docker compose up --build
```

Docker URLs:

```text
Frontend: http://localhost:3000
Backend API: http://localhost:5290
Swagger UI: http://localhost:5290
PostgreSQL: localhost:5432
```

Stop and remove containers:

```powershell
docker compose down
```

Remove the PostgreSQL Docker volume as well:

```powershell
docker compose down -v
```

The Docker API container uses environment variables from `docker-compose.yml` and waits for PostgreSQL health before startup.

## Local Secrets

For local non-Docker development, prefer user secrets or environment variables over editing committed files:

```powershell
dotnet user-secrets init --project backend\API\OnlineShop.API.csproj
dotnet user-secrets set "Jwt:Secret" "your-local-32-character-minimum-secret" --project backend\API\OnlineShop.API.csproj
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=onlineshop;Username=your-local-db-user;Password=your-local-db-password" --project backend\API\OnlineShop.API.csproj
```

## Demo Accounts

```text
Admin: admin@onlineshop.local
Customer: customer@onlineshop.local
Password: Password123!
```
