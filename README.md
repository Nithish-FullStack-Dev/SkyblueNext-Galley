# ✈️ SKYBLUE GALLEY - Advanced Catering Management

> A premium, production-ready catering and grocery management platform for flight operations. Migrated to Next.js 14, Prisma, and PostgreSQL.

---

## ✨ Features
- 🔐 **Secure Authentication** - NextAuth.js with Credentials (Login/Password)
- 📊 **Relational Database** - PostgreSQL via Prisma ORM for complex data relations
- 📱 **Modern App Router** - High-performance Server Components and optimized routing
- 🎨 **Premium UI** - Tailwind CSS + shadcn/ui + Framer Motion animations
- 📄 **Order Management** - Full CRUD for flights, vendors, and catalogs
- 📈 **Real-time Tracking** - Visual progress of catering orders

---

## 🚀 Getting Started

### 1. Configure Environment
Create a `.env` file (see `.env.example`):
```env
DATABASE_URL="your-postgresql-url"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Install & Generate
```bash
npm install
npx prisma generate
```

### 3. Database Migration & Seed
```bash
npx prisma migrate dev --name init
npm run prisma seed
```

### 4. Run Development Server
```bash
npm run dev
```

---

## 🔐 Default Credentials
- **Email**: `admin@skyblue.com`
- **Password**: `admin123`

---

## 📁 Project Structure
```
/app          # App Router pages and API routes
/components   # UI components and layout
/lib          # Core utilities (Auth, Prisma)
/prisma       # Database schema and seed
/public       # Static assets
```

---

## 🛠️ Technology Stack
- **Framework**: Next.js 14
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon DB)
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Animations**: Framer Motion
