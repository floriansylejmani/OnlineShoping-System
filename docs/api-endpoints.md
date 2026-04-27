# API Endpoints

Base URL: `/api`

Protected endpoints require `Authorization: Bearer <token>`.

## Auth

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Register a customer account. |
| POST | `/auth/login` | Public | Login and receive a JWT token. |

Register request:

```json
{
  "email": "customer@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Customer"
}
```

Login request:

```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

Auth response:

```json
{
  "token": "jwt-token",
  "email": "customer@example.com",
  "firstName": "Jane",
  "lastName": "Customer",
  "role": "Customer"
}
```

## Products

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/products` | Public | List active products with pagination and optional filters. |
| GET | `/products/{id}` | Public | Get one product by ID. |
| POST | `/products` | Admin | Create a product. |
| PUT | `/products/{id}` | Admin | Update a product. |
| DELETE | `/products/{id}` | Admin | Soft delete a product by setting it inactive. |

Query parameters for `GET /products`: `page`, `pageSize`, `search`, `categoryId`, `minPrice`, `maxPrice`.

Create product request:

```json
{
  "name": "Keyboard",
  "description": "Mechanical keyboard",
  "price": 89.99,
  "stockQuantity": 20,
  "imageUrl": "https://example.com/keyboard.jpg",
  "categoryId": "category-guid"
}
```

Update product request includes the same fields plus:

```json
{
  "isActive": true
}
```

## Categories

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/categories` | Public | List categories with active product counts. |
| POST | `/categories` | Admin | Create a category. |
| PUT | `/categories/{id}` | Admin | Update a category name. |
| DELETE | `/categories/{id}` | Admin | Delete a category if it has no active products. |

Create/update category request:

```json
{
  "name": "Electronics"
}
```

## Cart

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/cart` | Customer/Admin | Get current user's cart. |
| POST | `/cart/items` | Customer/Admin | Add product to cart or increment existing item. |
| PUT | `/cart/items/{id}` | Customer/Admin | Update cart item quantity. |
| DELETE | `/cart/items/{id}` | Customer/Admin | Remove one cart item. |
| DELETE | `/cart/clear` | Customer/Admin | Clear current user's cart. |

Add item request:

```json
{
  "productId": "product-guid",
  "quantity": 1
}
```

Update item request:

```json
{
  "quantity": 2
}
```

## Orders

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/orders` | Customer/Admin | Create an order from the current cart. No request body. |
| GET | `/orders/my` | Customer/Admin | List current user's orders. |
| GET | `/orders?page=1&pageSize=20` | Admin | List all orders. |
| PUT | `/orders/{id}/status` | Admin | Update order status. |
| PUT | `/orders/{id}/cancel` | Customer/Admin | Cancel the current user's pending or processing order. |

Update status request:

```json
{
  "status": "Shipped"
}
```

Valid statuses: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`.

## Payments

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/payments` | Customer/Admin | Process payment for an order owned by the current user. |

Payment request:

```json
{
  "orderId": "order-guid"
}
```
