# Online Shopping System — Project Phases

This document defines a complete roadmap for building an Online Shopping System.

---

## 0. Tech Stack

Frontend:
- Next.js 15
- TypeScript
- Tailwind CSS
- React Query
- Zustand
- Zod
- Axios

Backend:
- ASP.NET Core Web API
- Clean Architecture
- Entity Framework Core
- JWT Authentication
- FluentValidation
- Swagger

Database:
- PostgreSQL (recommended)
- EF Core Migrations

---

## PHASE 1 — Planning

docs/
- discussion-history.md
- system-requirements.md
- database-design.md
- api-endpoints.md
- frontend-pages.md
- deployment.md

tasks/
- todo.md
- lessons.md

---

## PHASE 2 — Database

Entities:
User, Role, Product, Category, Cart, Order, Payment, Shipment, Review, Notification

---

## PHASE 3 — Backend

Structure:
backend/
- API
- Application
- Domain
- Infrastructure
- Persistence
- Tests

Modules:
Auth, Products, Cart, Orders, Payments, Shipments, Reviews, Notifications

---

## PHASE 4 — Frontend

Structure:
frontend/
- app
- components
- features
- hooks
- store
- types

Pages:
Home, Products, Product Details, Cart, Checkout, Login, Register, Orders, Admin

---

## PHASE 5 — Development Order

1. Documentation
2. Backend setup
3. Database
4. Auth
5. Products API
6. Cart API
7. Orders API
8. Frontend UI
9. Admin Panel
10. Testing
11. Deployment

---

## Final Goal

- Full online shop
- Admin dashboard
- Cart & checkout
- Payment system
- Order tracking
- Reviews
- Notifications
- Responsive UI
