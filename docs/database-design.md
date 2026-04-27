# Database Design

## Entities

### User

- `Id`
- `Email`
- `PasswordHash`
- `FirstName`
- `LastName`
- `Role`
- `CreatedAt`
- `UpdatedAt`

Roles are stored as strings: `Customer`, `Admin`.

### Category

- `Id`
- `Name`
- `CreatedAt`
- `UpdatedAt`

### Product

- `Id`
- `Name`
- `Description`
- `Price`
- `StockQuantity`
- `ImageUrl`
- `IsActive`
- `CategoryId`
- `CreatedAt`
- `UpdatedAt`

### Cart

- `Id`
- `UserId`
- `CreatedAt`
- `UpdatedAt`

### CartItem

- `Id`
- `CartId`
- `ProductId`
- `Quantity`
- `CreatedAt`
- `UpdatedAt`

### Order

- `Id`
- `UserId`
- `Status`
- `TotalAmount`
- `CreatedAt`
- `UpdatedAt`

Statuses are stored as strings: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`.

### OrderItem

- `Id`
- `OrderId`
- `ProductId`
- `Quantity`
- `UnitPrice`
- `CreatedAt`
- `UpdatedAt`

### Payment

- `Id`
- `OrderId`
- `Status`
- `Amount`
- `PaidAt`
- `CreatedAt`
- `UpdatedAt`

Payment statuses are stored as strings.

## Relationships

- One user has one cart.
- One user has many orders.
- One category has many products.
- One cart has many cart items.
- One cart item belongs to one product.
- One order has many order items.
- One order item belongs to one product.
- One order has one payment.

## Important Rules

- Product soft delete: product deletion sets `IsActive = false`; normal product listing returns active products only.
- Order price snapshot: `OrderItem.UnitPrice` stores the product price at the time the order is created.
- Stock decrement: creating an order from a cart decrements product stock.
- Stock restore on cancel: cancelling a pending or processing order restores stock for each order item.
- Order created from current cart: `POST /orders` uses the authenticated user's cart and does not accept a request body.
- Cart clearing: after order creation, cart items are removed.
- Category delete: a category cannot be deleted while active products reference it.
