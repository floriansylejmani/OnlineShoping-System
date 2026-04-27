# ShopNow API

Base URL: `http://localhost:5290/api`

## Auth

- `POST /auth/register` creates a customer account.
- `POST /auth/login` returns a JWT and user profile data.
- Send protected requests with `Authorization: Bearer <token>`.

## Products

- `GET /products` supports `page`, `pageSize`, `search`, `categoryId`, `minPrice`, `maxPrice`, `sortBy`, and `sortDirection`.
- `GET /products/{id}` returns one product.
- `POST /products` creates a product. Admin only.
- `PUT /products/{id}` updates a product. Admin only.
- `DELETE /products/{id}` soft-deletes a product. Admin only.

## Categories

- `GET /categories` lists categories with active product counts.
- `POST /categories` creates a category. Admin only.
- `PUT /categories/{id}` updates a category. Admin only.
- `DELETE /categories/{id}` deletes a category when no active products block deletion. Admin only.

## Cart

- `GET /cart` returns the logged-in user's cart.
- `POST /cart/items` adds a product to the cart.
- `PUT /cart/items/{itemId}` updates quantity.
- `DELETE /cart/items/{itemId}` removes one item.
- `DELETE /cart` or `DELETE /cart/clear` clears the cart.

## Orders

- `POST /orders` creates an order from the logged-in user's cart.
- `GET /orders/my` or `GET /orders/my-orders` returns the user's orders.
- `GET /orders/{id}` returns one accessible order.
- `GET /orders` or `GET /orders/admin/all` lists all orders. Admin only.
- `PUT /orders/{id}/status` updates status. Admin only.
- `PUT /orders/{id}/cancel` cancels an eligible customer order.

## Payments

- `POST /payments` creates a simulated payment for an order.
- Payment statuses are `Pending`, `Completed`, and `Failed`.

## Admin

- `GET /admin/dashboard` returns dashboard KPIs, revenue, pending order count, low-stock products, recent orders, and best-selling products. Admin only.
