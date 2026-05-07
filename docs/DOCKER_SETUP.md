# Docker Setup

## Build and run

From the repository root:

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

Reset the PostgreSQL Docker volume:

```powershell
docker compose down -v
```

## Build context hygiene

The root, backend, and frontend Docker ignore files exclude local-only and generated files from Docker build contexts, including:

- `.env`
- `.venv`
- `node_modules`
- `.next`
- `.pytest_cache`
- `__pycache__`
- `reports/generated`
- `codearchitect.db`
- `*.log`
- `.git`

`.env.example` is safe to keep as metadata, but real `.env` files must remain local-only and must not be committed or copied into Docker images.

The compose file is intended for local development and stores placeholders only. Provide `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `JWT_SECRET` from your shell, a local untracked `.env` file, or environment-specific secret injection.

## Payment scope

Docker runs the same demo payment workflow as local development. No real payment provider is integrated, no card/CVV data is accepted, stored, logged, or transmitted, and no PCI compliance is claimed.

## Verification

```powershell
docker compose build --no-cache frontend
```
