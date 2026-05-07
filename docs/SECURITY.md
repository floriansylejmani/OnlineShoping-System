# Security

## Configuration

- `.env` and local environment override files are local-only and must never be committed.
- `.env.example` is safe metadata because it documents required variable names without real secret values.
- Backend production secrets should be supplied through environment variables, user secrets, or the deployment platform secret store.
- Committed `appsettings.json` values must remain placeholders; use `ConnectionStrings__DefaultConnection`, `Jwt__Secret`, `Jwt__Issuer`, `Jwt__Audience`, and `Jwt__ExpiryMinutes` for real runtime configuration.
- `docker-compose.yml` contains placeholders only. Supply `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `JWT_SECRET` locally through untracked environment configuration.
- Frontend public values must use only non-secret `NEXT_PUBLIC_*` values.

## Repository hygiene

- Docker ignore files exclude local secrets, generated reports, caches, dependency folders, build output, logs, and local database files from build contexts.
- `reports/generated` is runtime output from report generation and should not be committed.
- Local cache folders such as `.pytest_cache`, `__pycache__`, `.next`, and `node_modules` are ignored.

## AI-assisted review

AI-assisted reports should use sanitized analyzer data only. Do not paste real credentials, tokens, private keys, production connection strings, or raw `.env` contents into AI review prompts or generated reports.

## Safe security metadata

Security documentation and analyzer source files are safe to keep in the repository when they do not contain real secrets. Paths such as `docs/SECURITY.md`, security scanner source code, security prompts, and review flow code should not be treated as secrets solely because their filenames contain security-related words.

## Server-side authorization checklist

- Product and category write actions require `Authorize(Roles = "Admin")` on the API controllers.
- Admin dashboard and all-order/status operations require the `Admin` role server-side.
- Cart, order, and payment customer flows require authenticated API requests.
- Frontend route guards improve UX only and are not the security boundary.
- Backend authorization is the source of truth for protected and admin-only behavior.

## Security proof table

| Area | Expected behavior | Evidence/Test file |
|---|---|---|
| Admin endpoints | Admin-only access | `backend/Tests/ApiAuthorizationTests.cs` |
| Anonymous access | Protected endpoints reject unauthenticated users | `backend/Tests/ApiAuthorizationTests.cs` |
| Customer access | Normal users cannot access admin endpoints | `backend/Tests/ApiAuthorizationTests.cs` |
| Cart ownership | Users can access only their own cart | `backend/Tests/OnlineShopFlowTests.cs` |
| Order ownership | Users can access only their own orders | `backend/Tests/OnlineShopFlowTests.cs` |
| Payment ownership | Users can pay only for their own orders | `backend/Tests/OnlineShopFlowTests.cs` |
| JWT claims | Token includes user id, role, and expiration | `backend/Tests/OnlineShopFlowTests.cs` |
| Password safety | Password hash is stored; plaintext is not exposed | `backend/Tests/OnlineShopFlowTests.cs` |

## JWT authentication

- `Jwt:Secret` must be supplied from environment variables, user secrets, or deployment configuration for real runtime use.
- The signing secret must be at least 32 characters.
- Real JWT secrets, database passwords, provider keys, and tokens must never be committed.
- Tokens include an expiration configured by `Jwt:ExpiryMinutes`; non-positive expiration values are rejected at startup.
- Tokens include user ID and role claims. The backend uses the user ID claim for customer resource scoping and role claims for admin authorization.
- Protected endpoints should return `401 Unauthorized` for anonymous or invalid-token requests.
- Admin endpoints should return `403 Forbidden` for authenticated non-admin users.
- Frontend protected/admin route guards are UX only; backend authorization is the source of truth.

## Payment scope

- Payments are simulated for portfolio/demo use.
- The payment API accepts only an order ID and scopes processing to the authenticated user's order.
- No real payment provider is integrated.
- No card number, CVV, billing token, payment-provider secret, or webhook secret is accepted, stored, logged, or transmitted.
- Payment statuses are demo workflow statuses.
- The project does not claim PCI compliance or production payment processing.
