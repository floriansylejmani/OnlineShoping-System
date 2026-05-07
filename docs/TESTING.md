# Testing Strategy

## Backend

Backend tests use xUnit against service classes and controller metadata. The service tests use an in-memory SQLite database so EF Core relational behavior is closer to production than pure in-memory mocks.

Covered areas include:

- Auth register/login success and failure paths.
- Product listing with search, category, and price filters.
- Category create/update/delete behavior.
- Cart add/update/remove/clear flows.
- Order creation, cancellation, and admin status updates.
- Payment ownership and state transitions.
- Server-side authorization attributes and HTTP-level authorization behavior for protected and admin-only controllers/actions.

## Testing matrix

| Test area | Covered | Evidence |
|---|---|---|
| Backend authorization | Yes | `backend/Tests/ApiAuthorizationTests.cs` |
| Auth login/register | Yes | `backend/Tests/OnlineShopFlowTests.cs` |
| Password hashing | Yes | `backend/Tests/OnlineShopFlowTests.cs` |
| JWT claims | Yes | `backend/Tests/OnlineShopFlowTests.cs` |
| Cart ownership | Yes | `backend/Tests/OnlineShopFlowTests.cs` |
| Order ownership | Yes | `backend/Tests/OnlineShopFlowTests.cs` |
| Simulated payment flow | Yes | `backend/Tests/OnlineShopFlowTests.cs` |
| Frontend login page | Yes | `frontend/src/app/login/page.test.tsx` |
| Frontend checkout page | Yes | `frontend/src/app/checkout/page.test.tsx` |
| Protected route | Yes | `frontend/src/components/protected-route.test.tsx` |
| Admin route | Yes | `frontend/src/components/admin-route.test.tsx` |
| Cart API | Yes | `frontend/src/features/cart/cart-api.test.ts` |
| API client | Yes | `frontend/src/lib/api.test.ts` |

Run backend tests from the repository root:

```powershell
dotnet test backend\Tests\OnlineShop.Tests.csproj -v minimal -nr:false
```

## Frontend

Frontend tests use Vitest, jsdom, and React Testing Library. Tests mock network and router behavior where needed so they remain stable and do not require a running backend.

Covered areas include:

- Login form validation.
- Catalog UI rendering states.
- API client defaults and cart API endpoint behavior.
- Protected route and admin route behavior.
- Checkout empty-cart behavior.

Run frontend tests from `frontend`:

```powershell
npm run test
```

Run the production build from `frontend`:

```powershell
npm run build
```
