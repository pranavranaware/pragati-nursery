# Pragati Nursery E-Commerce Project Summary

This document provides a comprehensive overview of the **Pragati Nursery** E-Commerce application. You can paste this summary directly into ChatGPT or any other AI to explain, analyze, or extend the project.

---

## 🚀 1. Architectural Overview

The application is structured as a **decoupled Client-Server architecture**:
*   **Frontend**: Next.js 16 (App Router) using React 19, TypeScript, Tailwind CSS, and shadcn/ui.
*   **Backend**: Spring Boot 3.2 (Java 21/24) REST API using Spring Data JPA, Hibernate, Spring Security, and Flyway database migrations.
*   **Database**: MySQL 8.0 (persisting catalog, users, carts, orders, and payments).
*   **Authentication**: Stateless JWT-based authentication. Access and Refresh tokens are stored securely in HTTP-Only cookies to protect against XSS/CSRF.
*   **Payment Gateway**: Razorpay integration (for order generation and signature verification).

---

## 📁 2. Workspace File Structure

```text
Pragati-Nursery/
├── Backend/                            # Spring Boot API
│   ├── src/main/java/com/pragatinursery/
│   │   ├── config/                     # WebMvc static resource handlers & DataInitializer seeder
│   │   ├── common/                     # Global Enums, Exceptions, & API Response wrappers
│   │   │   ├── controller/             # FileUploadController.java
│   │   │   ├── exception/              # ResourceNotFoundException, UnauthorizedException, etc.
│   │   │   └── service/                # FileStorageService.java (handles uploads)
│   │   ├── security/                   # Spring Security 6, JWT Filter, Providers, & CORS Config
│   │   │   ├── SecurityConfig.java     # Configures HTTP security, state filters, and permissions
│   │   │   ├── JwtTokenProvider.java   # Token generation, validation, and parsing
│   │   │   └── JwtAuthenticationFilter.java # Intercepts requests to validate JWT cookies
│   │   ├── auth/                       # User & RefreshToken entities, repos, & services
│   │   ├── catalog/                    # Categories, Products, product specifications, care guides
│   │   ├── account/                    # Customer addresses (billing/shipping)
│   │   ├── cart/                       # Cart & Cart Items persistence
│   │   ├── wishlist/                   # Customer wishlist items
│   │   ├── order/                      # Order items & order records
│   │   └── payment/                    # Razorpay order generation & log verification
│   ├── src/main/resources/
│   │   ├── application.yml             # App configurations, H2 fallback, MySQL database config
│   │   └── db/migration/               # Flyway Migration scripts
│   │       ├── V1__initial_schema.sql  # Database tables setup
│   │       ├── V2__order_address_snapshot.sql # Order shipping address snapshots
│   │       ├── V3__razorpay_payment_fields.sql # Razorpay fields for payment validation
│   │       └── V4__guest_checkout.sql   # Relaxes non-null constraints on user and address for guest orders
│   ├── pom.xml                         # Maven dependencies (Spring, JWT, MySQL, Flyway, Lombok)
│   └── Dockerfile                      # Backend container configuration
│
├── Frontend/                           # Next.js Application
│   ├── app/                            # App Router Pages
│   │   ├── globals.css                 # CSS global classes & design system tokens
│   │   ├── layout.tsx                  # Root layout (handles cart context providers)
│   │   ├── page.tsx                    # Landing Page / Home Page
│   │   ├── shop/                       # Category & product browse pages
│   │   ├── products/                   # Single product details page
│   │   ├── cart/                       # Shopping Cart page
│   │   ├── checkout/                   # Shipping & Payment (Razorpay checkout)
│   │   ├── order-success/              # Order confirmation page
│   │   ├── login/                      # Customer Login & Register forms
│   │   ├── account/                    # User Profile, Addresses, Order History, Wishlist
│   │   └── admin/                      # Admin login & dashboard panels (Orders, Products, Categories, Settings)
│   ├── components/                     # Reusable React components
│   │   ├── ui/                         # shadcn/ui components (buttons, dialogs, inputs)
│   │   ├── catalog.tsx                 # Shop catalog grid
│   │   ├── admin.tsx                   # Admin portal layout wrapper
│   │   └── cart-provider.tsx           # Cart Context & State management (local storage synchronized)
│   ├── services/                       # API integration services (using axios-like fetch)
│   │   ├── authService.ts              # Customer login, register, admin login
│   │   ├── productService.ts           # Product CRUD & details fetching
│   │   ├── categoryService.ts          # Category operations
│   │   ├── addressService.ts           # Customer address CRUD
│   │   ├── wishlistService.ts          # Wishlist operations
│   │   └── orderService.ts             # Order placements & histories
│   ├── lib/                            # Helper utilities
│   │   ├── apiClient.ts                # Next.js custom fetch client (manages credentials, bases)
│   │   └── utils.ts                    # Classname mixers
│   ├── types/                          # TypeScript Interface definitions (product, order, etc.)
│   ├── package.json                    # Node dependencies (React 19, Next.js 16, Lucide, Tailwind 4)
│   └── next.config.mjs                 # Next.js image domains & rewrites
│
└── docker-compose.yml                  # Multicontainer orchestration (MySQL + Backend)
```

---

## 🔧 3. Key Backend Subsystems

### 🔒 Security & JWT Setup
*   **Stateless Filter**: `JwtAuthenticationFilter` checks HTTP cookies for `accessToken`. If missing, it uses `refreshToken` to auto-rotate a new access token without logging out the user.
*   **CORS & Allowed Origins**: Configured dynamically using environment variable `CORS_ALLOWED_ORIGINS` (defaults to `http://localhost:3000`).
*   **Guest Checkout Whitelisting**: Key guest purchase endpoints (`POST /api/v1/orders`, `GET /api/v1/orders/number/**`, `POST /api/v1/payments/create-order`, `POST /api/v1/payments/verify`) permit anonymous access.

### 🛍️ True Guest Checkout
*   **Schema Nullability**: `orders.user_id` and `orders.address_id` are modified to allow `NULL` (migration V4). Guest orders exist without any database-backed user account or saved address rows.
*   **Payload Mapping**: The frontend passes cart items and delivery coordinates directly to the order creation endpoint for unauthenticated customers. The backend service validates product price/stock level, creates order items, and records the guest shipping details directly in the order snapshot columns.

### 📦 Database & Seeding
*   **Flyway Migrations**: Applied sequentially from `src/main/resources/db/migration` ensuring scheme parity.
*   **Data Seeding**: `DataInitializer` auto-populates default admin credentials (`admin@pragatinursery.in` / `admin123`) and initial catalog categories and products if the tables are empty.

### 💳 Razorpay Payments Flow
1.  **Create Order**: Customer initiates checkout. Frontend calls `PaymentController` to trigger Razorpay's API to generate a `razorpay_order_id` in Indian Rupees (INR).
2.  **Verification**: After successful payment inside the frontend widget, Razorpay returns signatures. Frontend posts `VerifyPaymentRequest` (containing `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`) to the backend to calculate HMAC-SHA256 checksums and confirm payment authenticity before creating the order. Supports both registered and guest checkouts.

---

## 💻 4. Key Frontend Subsystems

### 🌐 Next.js Services
Services in `Frontend/services` abstract REST API calls:
*   `authService.ts`: Handles user lifecycle methods.
*   `orderService.ts`: Handles cart checkout, custom orders, Razorpay triggers, and retrieving user order lists.
*   `apiClient.ts`: Formulates headers and base paths, allowing relative calls that work natively with API proxies.

---

## 📝 5. How to Feed this to ChatGPT
To get the best explanation or start code generation, paste the following prompt template along with the file structure above:

> "I am working on an e-commerce platform called Pragati Nursery. The project has a Spring Boot 3 backend (using Java 21) and a Next.js 16 frontend. Below is the architecture outline and file structure of the project.
> 
> [PASTE THIS COMPLETED SUMMARY HERE]
> 
> Can you explain:
> 1. The communication path between the frontend Next.js dev server and the backend Spring Boot API.
> 2. How authentication cookie propagation works between the services.
> 3. Suggest 3 key improvements we can make to secure or optimize this project."
