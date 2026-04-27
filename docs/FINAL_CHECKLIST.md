# ShopNow Final Checklist

## Build And Tests

- [ ] Backend build: `dotnet build backend\OnlineShop.sln -v minimal -nr:false`
- [ ] Backend tests: `dotnet test backend\Tests\OnlineShop.Tests.csproj -v minimal -nr:false`
- [ ] Frontend lint: `npm run lint`
- [ ] Frontend tests: `npm run test`
- [ ] Frontend build: `npm run build`
- [ ] Docker config: `docker compose config`
- [ ] Docker run: `docker compose up --build`

## API Smoke Tests

- [ ] `GET /api/categories` returns 8 categories.
- [ ] `GET /api/products?page=1&pageSize=1` returns a paged product response.
- [ ] Admin login works with `admin@onlineshop.local`.
- [ ] Customer login works with `customer@onlineshop.local`.
- [ ] `GET /api/admin/dashboard` works for admin and rejects non-admin users.

## Customer Flow

- [ ] Register a customer.
- [ ] Login.
- [ ] Browse products.
- [ ] Filter and sort products.
- [ ] Open product details.
- [ ] Add item to cart.
- [ ] Update quantity.
- [ ] Checkout.
- [ ] View order in My Orders.

## Admin Flow

- [ ] Login as admin.
- [ ] View dashboard KPIs.
- [ ] Create/edit/deactivate product.
- [ ] Create/edit category.
- [ ] View all orders.
- [ ] Update order status.

## GitHub Publishing

- [ ] No real secrets committed.
- [ ] `appsettings.Development.json` not tracked.
- [ ] `.env.local` not tracked.
- [ ] `node_modules`, `.next`, `bin`, and `obj` not tracked.
- [ ] README includes screenshots before final portfolio publishing.
