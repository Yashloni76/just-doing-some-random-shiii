# Rentpe B2B SaaS Platform 📦⚡

Rentpe is a highly dynamic, intelligent Next.js 14 B2B SaaS platform specifically engineered for Indian equipment/hardware rental businesses. It seamlessly bridges real-time inventory tracking with mathematical booking engines, autonomous tax calculation, and instant A4 PDF invoicing.

## 🚀 Core Features (Phases 1-4)

### 1. Advanced Inventory Management
- **Full CRUD Engine**: Add, edit, delete, and categorize unlimited rental stock.
- **Microsecond Stock Persistence**: Fully typed Supabase PostgREST synchronization to keep the multi-tenant database continuously up to date without browser caching.

### 2. Intelligent Booking System & Conflict Engine
- **Hardware Overlap Prevention**: The `verifyAvailabilityAction` edge function dynamically guarantees NO double-booking! It cross-checks every single request against thousands of dates ensuring total reliability.
- **Dynamic Dual-Dashboard**: 
  - **List View**: Chronological sorting of active rentals.
  - **Calendar Grid View**: A 7-col visual timeline overlapping current bookings intuitively into color-coded status pills spanning multi-day gaps!

### 3. Auto-GST Cognitive Routing (CBIC Law Bound)
- **Zero-Input Tax Automation**: When you type "Camera" or "Honda Activa" into the Inventory, the silent `gstEngine.ts` infers the item type against complex Indian CBIC laws (HSN 9973 vs 9966) and autonomously injects the 0%, 5%, 12%, 18%, or 28% bracket perfectly onto your database row without asking input!

### 4. Direct Node PDF Invoice Generation
- **Line-By-Line Assembly**: The `/api/invoice` binary stream calculates exact duration modifiers, extracts the exact mathematical Base price, splits out literal 9% CGST and 9% SGST accurately, and utilizes `pdf-lib` to safely draw an un-tamperable Tax PDF.
- **WhatsApp Deep Links**: One-click URL generation injecting Tax-inclusive Grand Totals directly to standard WA Chats instantly.

---

## 💻 Tech Stack
- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Database & Auth**: [Supabase PostgreSQL](https://supabase.com/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Lucide-React](https://lucide.dev/)
- **PDF Binary Engine**: [`pdf-lib`](https://pdf-lib.js.org/)

---

## 🛠️ Getting Started Locally

First, clone down the repository and install all strict node dependencies:
```bash
npm install
```

Configure your specific `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Spin up the local development edge server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience the engine!
