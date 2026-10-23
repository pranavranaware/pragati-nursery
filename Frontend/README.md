# Pragati Nursery — Next.js 16 Frontend

Modern, high-performance e-commerce frontend for **Pragati Nursery**, built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

---

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4, `@base-ui/react`, `shadcn/ui`
- **Icons**: Lucide React
- **Language**: TypeScript 5.7+

---

## 📁 Directory Structure

```text
Frontend/
├── app/                    # Next.js App Router
│   ├── admin/              # Admin dashboard, products, categories, orders
│   ├── cart/               # Cart page
│   ├── checkout/           # Checkout & Razorpay payment integration
│   ├── shop/               # Product catalog & filters
│   ├── your-orders/        # Mobile OTP customer order tracking
│   ├── globals.css         # Styling system & theme tokens
│   └── layout.tsx          # Root layout & CartProvider
├── components/             # Reusable UI components
├── lib/                    # Language context, API client, local storage helpers
├── services/               # REST API client services
├── types/                  # TypeScript interfaces & types
└── public/                 # Static brand assets and icons
```

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Build for Production

```bash
npm run build
npm run start
```