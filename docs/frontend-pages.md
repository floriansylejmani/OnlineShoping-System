# Frontend Pages

## Public Pages

| Route | Purpose |
| --- | --- |
| `/` | Home page with entry points to browse products or create an account. |
| `/products` | Public product listing with search, category filtering, pagination, and add-to-cart actions. |
| `/login` | User login. |
| `/register` | Customer registration. |

## Customer Pages

These pages require authentication.

| Route | Purpose |
| --- | --- |
| `/cart` | View cart, update item quantities, remove items, and clear cart. |
| `/checkout` | Review cart total, create order, and process payment. |
| `/my-orders` | View order history, payment state, and cancel eligible orders. |

## Admin Pages

These pages require an authenticated user with role `Admin`.

| Route | Purpose |
| --- | --- |
| `/admin/dashboard` | Admin summary and links to management areas. |
| `/admin/products` | List, create, update, and soft delete products. |
| `/admin/categories` | List, create, update, and delete categories. |
| `/admin/orders` | List all orders and update order status. |

## Route Protection

- `ProtectedRoute` redirects unauthenticated users to `/login`.
- `AdminRoute` redirects unauthenticated users to `/login` and blocks non-admin users.
- Axios attaches the stored JWT token to API requests.
