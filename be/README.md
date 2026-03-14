# Artisan Backend API

Express backend for the Artisan e-commerce frontend with JWT authentication and bcrypt password hashing.

## Setup

1. Copy `.env.example` to `.env` and update values as needed.
2. Make sure MySQL is running and that the `ecommerce` database and required tables exist.
2. Install dependencies:

```bash
npm install
```

3. Start server:

```bash
npm run dev
# or
npm run start
```

Server runs on `http://localhost:5000` by default.

## Auth

- `POST /api/auth/register` -> `{ name, email, password }`
- `POST /api/auth/login` -> `{ email, password }`
- `GET /api/auth/me` -> requires `Authorization: Bearer <token>`

## Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

## Cart (auth required)

- `GET /api/cart`
- `POST /api/cart/items` -> `{ product_id, quantity }`
- `PATCH /api/cart/items/:itemId` -> `{ quantity }`
- `DELETE /api/cart/items/:itemId`
- `DELETE /api/cart/clear`

## Orders (auth required)

- `GET /api/orders`
- `POST /api/orders` (places order from current cart)
- `PATCH /api/orders/:id/pay` -> `{ success: boolean }`

## Seed Data

On first startup, backend seeds:
- Admin user: `admin@store.com` / `admin123`
- Product catalog matching frontend mock products

## MySQL Configuration

Set these values in `.env`:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_CONNECTION_LIMIT`
