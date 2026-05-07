# Deployment

## Backend Deployment Options

The backend is an ASP.NET Core 9 API and can be deployed to:

- Azure App Service
- Render
- Railway
- Fly.io
- Docker on a VPS
- Any host that supports .NET 9 and PostgreSQL connectivity

Production requirements:

- PostgreSQL database
- Valid connection string
- Secure JWT secret with at least 32 characters
- HTTPS enabled
- CORS configured for the deployed frontend domain
- Real secret values supplied by environment variables or a platform secret store, not committed files

Backend build command:

```bash
cd backend
dotnet publish API/OnlineShop.API.csproj -c Release -o publish
```

Backend runtime command depends on the host. For a direct .NET host:

```bash
dotnet OnlineShop.API.dll
```

## Frontend Deployment With Firebase Hosting

The frontend is a Next.js app. For Firebase Hosting, use one of these approaches:

- Deploy through Firebase's web framework support for Next.js.
- Build and deploy a Node-backed hosting target if server-side Next.js features are required.

Typical setup:

```bash
cd frontend
npm install
npm run build
firebase login
firebase init hosting
firebase deploy
```

Set the frontend API URL before building:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

## Environment Variable Examples

Frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5290/api
```

Production frontend:

```env
NEXT_PUBLIC_API_URL=https://api.example.com/api
```

Backend app settings:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=onlineshop;Username=replace-with-db-user;Password=replace-with-db-password"
  },
  "Jwt": {
    "Secret": "replace-with-a-secure-32-character-minimum-secret",
    "Issuer": "OnlineShopAPI",
    "Audience": "OnlineShopClient",
    "ExpiryMinutes": 60
  }
}
```

Production backend values should be configured as environment variables or secret manager values, not committed to source control.

The included payment flow is simulated. A real deployment that charges customers would need a payment provider such as Stripe, provider-side webhooks, secret handling for provider keys, and a PCI-aware integration approach.

## Pre-Deployment Checklist

- Run backend tests: `dotnet test OnlineShop.sln`
- Run backend build: `dotnet build OnlineShop.sln`
- Run frontend build: `npm run build`
- Apply database migrations to production database.
- Confirm CORS allows the deployed frontend origin.
- Confirm `NEXT_PUBLIC_API_URL` points to the deployed backend API.
- Confirm committed config files still contain placeholders only.
