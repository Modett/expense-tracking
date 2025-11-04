# Expense Tracker API

A production-ready expense tracking API built with **Fastify**, **Prisma**, **TypeScript**, following **DDD**, **CQRS**, and **Clean Architecture** principles.

## 🚀 Features

- ✅ **Domain-Driven Design (DDD)** - Rich domain models with business logic
- ✅ **CQRS Pattern** - Separate read and write models
- ✅ **Clean Architecture** - Clear separation of concerns
- ✅ **Modular Monolith** - Organized by business modules
- ✅ **Type-Safe** - Full TypeScript with Zod validation
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role-Based Authorization** - Admin, Manager, Finance, Staff roles
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Swagger Documentation** - Interactive API docs
- ✅ **Password Security** - Bcrypt hashing (12 rounds)

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm >= 9.0.0

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd expense-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Setup database**
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. **Start development server**
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecureP@ss123",
  "role": "staff"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

### Change Password
```http
PUT /auth/change-password
Authorization: Bearer <token>

{
  "currentPassword": "SecureP@ss123",
  "newPassword": "NewSecureP@ss456"
}
```

## 👥 User Management (Admin Only)

### Get All Users
```http
GET /users?limit=10&offset=0&role=staff&isActive=true
Authorization: Bearer <token>
```

### Update User Profile
```http
PUT /users/:userId
Authorization: Bearer <token>

{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

## 🏗️ Project Structure

```
expense-tracker/
├── src/
│   ├── app.ts              # Fastify app setup
│   ├── server.ts           # Server entry point
│   └── config/             # Configuration
├── modules/
│   └── user/
│       ├── domain/         # Business logic
│       ├── application/    # Use cases (CQRS)
│       ├── infra/          # External dependencies
│       └── module.ts       # DI container
├── types/                  # TypeScript declarations
├── prisma/                 # Database schema
└── package.json
```

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio

npm test             # Run tests
```

## 🔒 Security

- Password validation (8-128 chars, complexity requirements)
- JWT tokens (15min access + 7day refresh)
- Rate limiting on all endpoints
- Bcrypt password hashing (12 rounds)
- Role-based access control

## 📄 License

MIT
