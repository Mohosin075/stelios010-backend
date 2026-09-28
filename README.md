# 🚀 Modern Express + TypeScript + Prisma Backend Starter

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Zod](https://img.shields.io/badge/Zod-Validation-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)

A clean, production-ready backend boilerplate built with **Express.js**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, and **Zod**. Built on a scalable **Modular Architecture**, ready for production-grade applications.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#1-installation)
  - [Environment Configuration](#2-environment-configuration)
  - [Database Setup & Migration](#3-database-setup--migration)
  - [Running the Server](#4-running-the-server)
- [Default Seeded Account](#-default-seeded-account)
- [API Reference](#-api-reference)
  - [Health Check](#health-check)
  - [Authentication](#authentication-apiv1auth)
  - [User Management](#user-management-apiv1user)
- [Helper Utilities](#-helper-utilities)
- [Adding New Modules (Step-by-Step)](#-adding-new-modules-step-by-step)
- [Available Scripts](#-available-scripts)
- [License](#-license)

---

## ✨ Features

- 🏗️ **Modular Pattern**: Easily scalable feature-based module structure (`interface`, `validation`, `service`, `controller`, `routes`).
- 🔐 **Authentication & RBAC**: JWT Access & Refresh Tokens, bcrypt password hashing, and role-based permissions (`SUPER_ADMIN`, `ADMIN`, `USER`).
- 🛡️ **Request Validation**: Schema-level validation using Zod (`body`, `query`, `params`, `cookies`).
- ⚡ **Prisma ORM**: Modern database schema, automated client generation, migrations, and clean disconnects on server shutdown.
- 🗑️ **Soft Deletion**: Status-based soft delete flow (`ACTIVE`, `BLOCKED`, `DELETED`) preserving relational integrity.
- 🚨 **Centralized Error Handling**: Standardized error responses handling Prisma exceptions, Zod errors, and custom `ApiError`.
- 📦 **File Uploads**: Multer local storage + AWS S3 / DigitalOcean Spaces integration.
- 💳 **Payment & Messaging Ready**: Pre-wired helpers for Stripe, SendGrid, and Nodemailer.
- 🪵 **Logging**: Structured request and system logging with Winston.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Runtime & Language** | [Node.js](https://nodejs.org/) & [TypeScript](https://www.typescriptlang.org/) |
| **Framework** | [Express.js](https://expressjs.com/) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) with [Prisma](https://www.prisma.io/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Auth & Security** | [JSON Web Tokens (JWT)](https://jwt.io/), [bcryptjs](https://www.npmjs.com/package/bcryptjs), [CORS](https://www.npmjs.com/package/cors) |
| **Storage & Upload** | [Multer](https://github.com/expressjs/multer), [@aws-sdk/client-s3](https://aws.amazon.com/sdk-for-javascript/) |
| **Logging** | [Winston](https://github.com/winstonjs/winston) |

---

## 📁 Project Architecture

```text
├── prisma/
│   └── schema.prisma          # Database models, enums & relations
├── src/
│   ├── app.ts                 # Express application & global middleware setup
│   ├── server.ts              # HTTP server, DB seeding & graceful shutdown
│   ├── config/
│   │   ├── index.ts           # Central environment configuration
│   │   └── serviceAccount.ts  # Firebase service account template
│   ├── constants/             # Global constants (pagination, etc.)
│   ├── errors/                # Global error handler & Prisma error parsers
│   ├── helpars/               # Reusable external integrations
│   │   ├── emailSender/       # Nodemailer & SendGrid email helpers
│   │   ├── file/              # Multer storage configs & file filter
│   │   ├── firebase/          # Firebase Admin SDK initialization
│   │   ├── s3Bucket/          # AWS S3 / DO Spaces upload & delete
│   │   ├── stripe/            # Stripe payment & account helpers
│   │   └── redisServer.ts     # Redis client instance
│   ├── interfaces/            # Global TypeScript definitions
│   ├── shared/                # Core utilities (prisma, catchAsync, sendResponse, pick)
│   ├── utils/                 # Utilities (jwtHelpers, logger, paginationHelper)
│   └── app/
│       ├── db/                # Initial database seeders (Super Admin)
│       ├── middlewares/       # Custom middlewares (auth, validateRequest, globalErrorHandler)
│       ├── routes/            # Central router registry
│       └── modules/           # Feature modules
│           ├── Auth/          # Authentication & Token endpoints
│           │   ├── auth.controller.ts
│           │   ├── auth.interface.ts
│           │   ├── auth.routes.ts
│           │   ├── auth.service.ts
│           │   └── auth.validation.ts
│           └── User/          # User management & profile CRUD
│               ├── user.constant.ts
│               ├── user.controller.ts
│               ├── user.interface.ts
│               ├── user.routes.ts
│               ├── user.service.ts
│               └── user.validation.ts
├── .env.example               # Example environment variables
└── package.json
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** (v18.x or v20.x recommended)
- **PostgreSQL** (running locally or cloud instance)
- **npm** or **yarn** / **pnpm**

### 1. Installation

Clone your repository and install dependencies:

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment template:

```bash
cp .env.example .env
```

Configure your `.env` file:

```env
# Application
NODE_ENV=development
PORT=5000

# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"

# Super Admin Initial Credentials (Seeded on first startup)
SUPER_ADMIN_EMAIL="admin@example.com"
SUPER_ADMIN_PASSWORD="admin123"

# JWT Secrets
JWT_SECRET="your_jwt_secret_key"
EXPIRES_IN=1d
REFRESH_TOKEN_SECRET="your_refresh_token_secret_key"
REFRESH_TOKEN_EXPIRES_IN=7d
PASSWORD_SALT=10

# Client Redirection
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:5000"
```

### 3. Database Setup & Migration

```bash
# Generate Prisma Client
npm run db:generate

# Run initial migration
npm run migrate:dev -- --name init
```

### 4. Running the Server

```bash
# Development (with auto-reload)
npm run dev

# Production Build
npm run build
npm run start
```

The server will start at: `http://localhost:5000`

---

## 👤 Default Seeded Account

When the server starts, it automatically seeds an initial Super Admin if none exists:

- **Email**: `admin@example.com` *(or value from `SUPER_ADMIN_EMAIL`)*
- **Password**: `admin123` *(or value from `SUPER_ADMIN_PASSWORD`)*
- **Role**: `SUPER_ADMIN`

---

## 🔌 API Reference

### Health Check

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | Public | Check server health, uptime, and environment |

---

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Log in with email & password |
| `POST` | `/api/v1/auth/refresh-token` | Public | Get a new access token via refresh token |
| `POST` | `/api/v1/auth/change-password` | Authenticated | Change current password |
| `GET` | `/api/v1/auth/me` | Authenticated | Get current logged-in user profile |

#### Login Request Body
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

#### Login Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged in successfully!",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "user": {
      "id": "cm1...",
      "email": "admin@example.com",
      "name": "Super Admin",
      "role": "SUPER_ADMIN"
    }
  }
}
```

---

### User Management (`/api/v1/user`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/user/register` | Public | Register a new user |
| `GET` | `/api/v1/user` | `SUPER_ADMIN`, `ADMIN` | List users with pagination & search |
| `GET` | `/api/v1/user/:id` | Authenticated | Retrieve user profile by ID |
| `PATCH` | `/api/v1/user/:id` | Authenticated | Update user profile |
| `DELETE` | `/api/v1/user/:id` | `SUPER_ADMIN`, `ADMIN` | Soft delete user (`DELETED` status) |

#### Query Parameters for User List
- `searchTerm`: Search across `name` and `email`
- `page`: Page number (default: `1`)
- `limit`: Items per page (default: `10`)
- `sortBy`: Field to sort by (default: `createdAt`)
- `sortOrder`: `asc` or `desc` (default: `desc`)

---

## 🧰 Helper Utilities

The `src/helpars/` directory includes plug-and-play integrations:

- **S3 Bucket (`src/helpars/s3Bucket/`)**:
  - `fileUploadToS3(folder, title, originalName, mimeType, filePath)`
  - `deleteFromS3ByUrl(fileUrl)`
  - `s3Uploader` multer middleware
- **Local File Upload (`src/helpars/file/`)**:
  - `upload` multer middleware storing files locally in `/uploads`
- **Stripe (`src/helpars/stripe/`)**:
  - `createPaymentIntent(amount, paymentMethodId, currency)`
  - `createStripeAccount(email, country, businessType)`
  - `BalanceTransfer(amount, destinationAccountId, currency)`
- **Email (`src/helpars/emailSender/`)**:
  - `emailSender(subject, email, html)` (via Gmail / SMTP)
  - `sendGridEmailSender(subject, email, html)`
  - `sendGridBulkEmailSender(emails)`

---

## 🧩 Adding New Modules (Step-by-Step)

To add a new feature (e.g. `Product`):

### 1. Update Schema
In `prisma/schema.prisma`:
```prisma
model Product {
  id          String   @id @default(cuid())
  title       String
  price       Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("products")
}
```
Run `npm run db:generate` and `npm run migrate:dev -- --name add_product`.

### 2. Create Module Files
Create a new directory `src/app/modules/Product/`:

- **`product.interface.ts`**: Types for filters and inputs
- **`product.validation.ts`**: Zod validation schemas
- **`product.service.ts`**: Prisma database logic
- **`product.controller.ts`**: Handlers wrapped in `catchAsync` and returning `sendResponse`
- **`product.routes.ts`**: Express routes protected by `auth(UserRole.ADMIN)` and `validateRequest()`

### 3. Register Route
In `src/app/routes/index.ts`:
```typescript
import { ProductRoutes } from "../modules/Product/product.routes";

const moduleRoutes = [
  { path: "/auth", route: AuthRoutes },
  { path: "/user", route: UserRoutes },
  { path: "/product", route: ProductRoutes }, // New module
];
```

---

## 📜 Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `ts-node-dev --respawn src/server.ts` | Runs dev server with live-reload |
| `npm run build` | `tsc` | Compiles TypeScript to `dist/` |
| `npm run start` | `node ./dist/server.js` | Runs compiled production server |
| `npm run db:generate` | `prisma generate` | Generates latest Prisma client |
| `npm run migrate:dev` | `prisma migrate dev` | Applies database migrations in dev |
| `npm run migrate:prod` | `prisma migrate deploy` | Applies migrations in production |
| `npm run migrate:status`| `prisma migrate status` | Checks pending migration status |

---

## 📄 License

This starter template is open source and available under the [ISC License](LICENSE).