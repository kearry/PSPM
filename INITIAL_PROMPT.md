### 🌟 Goal:
In one shot develop a **complete, fully functional, and beautiful** personal stock market management application, designed to run **locally on a MacBook**, using **React + Next.js (App Router)**, **SQLite via Prisma ORM**, and TailwindCSS for styling. The app should enable users to track stocks, transactions, and notes with intuitive UI and clean data integrity.
---
### 🚀 Stack
- **Frontend:** React + Next.js (App Router)
- **Backend:** Next.js API routes or server actions using App Router conventions
- **Database:** SQLite (via Prisma ORM)
- **ORM:** Prisma (with strict typing, no `@db.Text`)
- **Styling:** TailwindCSS (and optionally shadcn/ui for UI components)
---
### ✨ Key Features
- **User Management** (even if local, add `User` model for future-proofing)
- CRUD for **Stocks**, **Transactions**, and **Notes**
- Notes can be linked to **stocks and/or transactions**
- Real-time summary of holdings (avg price, total quantity, total value)
- Dashboard with totals, sector breakdowns, recent activity
- Sorting, filtering (by ticker, date, sector)
- CSV Export for transactions
- Dark/light mode toggle
- Responsive design with smooth UI
- SQLite file should be persistent and stored locally
---
### 🔧 Prisma Schema Models
```prisma
model User {
  id           String         @id @default(uuid())
  name         String
  email        String         @unique
  createdAt    DateTime       @default(now())
  stocks       Stock[]
  transactions Transaction[]
  notes        Note[]
}
model Stock {
  id           String         @id @default(uuid())
  ticker       String
  name         String
  sectorId     String?
  sector       Sector?        @relation(fields: [sectorId], references: [id])
  createdAt    DateTime       @default(now())
  userId       String
  user         User           @relation(fields: [userId], references: [id])
  transactions Transaction[]
  notes        Note[]
}
model Transaction {
  id           String         @id @default(uuid())
  stockId      String
  stock        Stock          @relation(fields: [stockId], references: [id])
  userId       String
  user         User           @relation(fields: [userId], references: [id])
  type         TransactionType
  quantity     Float
  price        Float
  date         DateTime
  notes        Note[]
}
enum TransactionType {
  BUY
  SELL
}
model Note {
  id             String         @id @default(uuid())
  content        String
  createdAt      DateTime       @default(now())
  stockId        String?
  stock          Stock?         @relation(fields: [stockId], references: [id])
  transactionId  String?
  transaction    Transaction?   @relation(fields: [transactionId], references: [id])
  userId         String
  user           User           @relation(fields: [userId], references: [id])
}
model Sector {
  id       String   @id @default(uuid())
  name     String   @unique
  stocks   Stock[]
}
model AuditLog {
  id          String   @id @default(uuid())
  action      String   // e.g., CREATE_TRANSACTION
  entityType  String   // Stock | Transaction | Note
  entityId    String
  payload     String   // optional JSON
  timestamp   DateTime @default(now())
  userId      String
}
```
---
### ⚡ App Requirements
- Use `"use client"` in any interactive components (forms, modals, etc.)
- Server actions or API routes should handle all DB mutations
- Use `react-hook-form` or `useFormState` for UX
- Tailwind + shadcn/ui for clean and consistent design
- Persist state using Prisma and SQLite
- Show computed fields (e.g., average buy price per stock)