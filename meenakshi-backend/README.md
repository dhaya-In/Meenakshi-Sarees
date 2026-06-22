# Meenakshi Sarees — Backend API

Node.js + Express REST API backed by Supabase (PostgreSQL).

## Quick Start

```bash
cd meenakshi-backend
cp .env.example .env        # fill in your Supabase keys
npm install
npm run dev                 # starts on http://localhost:5000
```

## Folder Structure

```
meenakshi-backend/
├── src/
│   ├── server.js                  # Entry point
│   ├── config/
│   │   ├── supabase.js            # Supabase client
│   │   └── schema.sql             # Run once in Supabase SQL editor
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT protect / adminOnly
│   │   ├── validate.middleware.js # express-validator rules
│   │   └── error.middleware.js    # Global error handler
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── category.controller.js
│   │   ├── review.controller.js
│   │   ├── order.controller.js
│   │   ├── appointment.controller.js
│   │   ├── enquiry.controller.js
│   │   └── upload.controller.js
│   └── routes/
│       ├── auth.routes.js
│       ├── product.routes.js
│       ├── category.routes.js
│       ├── review.routes.js
│       ├── order.routes.js
│       ├── appointment.routes.js
│       ├── enquiry.routes.js
│       └── upload.routes.js
└── uploads/                       # Local fallback (use Supabase Storage in prod)
```

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Create customer account |
| POST | `/api/auth/login` | Public | Login → returns JWT |
| GET | `/api/auth/me` | Auth | Get current user |
| PATCH | `/api/auth/me` | Auth | Update profile |
| PATCH | `/api/auth/password` | Auth | Change password |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | Public | List with filters/search/pagination |
| GET | `/api/products/:id` | Public | Single product detail |
| POST | `/api/products` | Admin | Add new product |
| PATCH | `/api/products/:id` | Admin | Edit product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| PATCH | `/api/products/:id/stock` | Admin | Toggle stock status |

### Categories
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/categories` | Public | All categories + product count |
| POST | `/api/categories` | Admin | Create category |
| PATCH | `/api/categories/:id` | Admin | Edit category |
| DELETE | `/api/categories/:id` | Admin | Delete (blocks if products exist) |

### Reviews
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/reviews/:productId/reviews` | Public | Get product reviews |
| POST | `/api/reviews/:productId/reviews` | Auth | Submit review (1 per user) |
| DELETE | `/api/reviews/reviews/:id` | Admin | Delete review |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/orders` | Auth | Place order |
| GET | `/api/orders/my` | Auth | Customer's own orders |
| GET | `/api/orders` | Admin | All orders |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |

### Appointments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/appointments` | Public | Book appointment |
| GET | `/api/appointments` | Admin | All appointments |
| PATCH | `/api/appointments/:id/status` | Admin | Update status |

### Enquiries
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/enquiries` | Public | Submit enquiry |
| GET | `/api/enquiries` | Admin | All enquiries |
| PATCH | `/api/enquiries/:id/status` | Admin | Mark read/replied |

### Upload
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/upload/product-image` | Admin | Upload image → Supabase Storage |
| DELETE | `/api/upload/product-image` | Admin | Delete image |

## Connect Frontend to Backend

In your React frontend (`meenakshi-sarees`), replace the Supabase direct calls
with fetch calls to this API:

```js
// Example: fetch products
const res  = await fetch("http://localhost:5000/api/products?category=silk");
const data = await res.json();

// Example: login
const res  = await fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const { token, user } = await res.json();
localStorage.setItem("token", token);

// Example: authenticated request
const res = await fetch("http://localhost:5000/api/orders/my", {
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
```
