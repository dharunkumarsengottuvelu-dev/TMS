# Enterprise Task Management System (TMS)

[![MNC Standard Architecture](https://img.shields.io/badge/Architecture-Tiered_Enterprise-blue.svg)](https://github.com)
[![Auth: Better Auth](https://img.shields.io/badge/Auth-Better_Auth-blueviolet.svg)](https://better-auth.com)
[![Database: MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB_Atlas-green.svg)](https://www.mongodb.com/atlas)
[![Frontend: React + Vite](https://img.shields.io/badge/Frontend-React_19_+_Vite-61dafb.svg)](https://vitejs.dev)

A production-quality, enterprise-grade Task Management System built strictly to MNC software engineering standards. Designed with a clear layered backend (Routes $\to$ Middleware $\to$ Controllers $\to$ Services $\to$ Models), robust session-based authentication via **Better Auth**, server-side Role-Based Access Control (**RBAC**), strict resource ownership verification, fault-tolerant email dispatching with **Nodemailer**, and an information-dense, responsive **React + Vite** frontend adhering to a strict design system without external CSS frameworks.

---

## 1. Project Overview

The Enterprise Task Management System provides mission-critical operational oversight for corporate teams. It establishes a clear operational separation between executive leadership (**ADMIN**) and engineering staff (**EMPLOYEE**), ensuring strict data boundaries, server-side authorization enforcement, and audit-ready logging.

---

## 2. Key Features

### For Administrators
* **Dedicated Admin Portal**: Secure portal authentication strictly verified against administrative credentials.
* **Operational Dashboard**: Live, non-mocked aggregate statistics (Active Employees, Total Tasks, Not Started, Pending, In Progress, Completed).
* **Task Management**: Create tasks with initial statuses (`NOT_STARTED`, `PENDING`, `IN_PROGRESS`, `COMPLETED`), set priorities (`HIGH`, `MEDIUM`, `LOW`), assign to verified personnel, search across titles and assignees, filter by status and priority, and paginate server-side.
* **Employee Directory**: Searchable directory of organizational staff with real-time active task counts and individual workload profiles.
* **Full Task Inspection & Deletion**: Deep-dive into technical specifications, assigned employee details, assignment dates, and administrative deletion.
* **Automated Notifications**: Receive instant email alerts whenever an employee transitions an assigned task's status.

### For Employees
* **Dedicated Employee Portal**: Distinct portal tab with role-gated access control.
* **Personal Workload Dashboard**: Overview of allocated assignments, active task statuses (`Not Started`, `Pending`, `In Progress`, `Completed`), and progress metrics.
* **Strict Scoped Task View**: Access only personally assigned tasks. Complete backend authorization prevents cross-employee data access.
* **Status Progression**: Transition task state across all four required stages (`NOT_STARTED` $\to$ `PENDING` $\to$ `IN_PROGRESS` $\to$ `COMPLETED`).
* **Instant Email Triggers**: System alerts assigning managers upon status changes.

---

## 3. Technology Stack

| Domain | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, JavaScript, React Router 7, Axios | Lightning fast HMR, lean bundle, zero framework overhead |
| **Styling** | Vanilla CSS Tokens & CSS Grid / Flexbox | Strict corporate design system, no Tailwind/Bootstrap dependencies |
| **Backend** | Node.js, Express.js (ES Modules) | Layered architecture with thin controllers and dedicated services |
| **Database** | MongoDB Atlas / Local MongoDB, Mongoose | Controlled schemas, compound indexes, text search, strict query validation |
| **Authentication** | Better Auth (`@better-auth/mongo-adapter`) | Session-cookie authentication authority, no tokens in `localStorage` |
| **Validation** | Zod | End-to-end schema validation for bodies, queries, and URL params |
| **Email** | Nodemailer | Responsive HTML transactional emails with fault-tolerant non-blocking queue |
| **Security** | Helmet, CORS, Express Rate Limit | Strict origin binding, header hardening, request limits, sanitized errors |

---

## 4. Architecture

The backend follows a strict unidirectional tiered architecture:

```text
Request
  │
  ▼
Routes (server/src/routes/)
  │
  ▼
Middleware (server/src/middleware/)
  ├── Helmet & CORS (Security headers & client origin validation)
  ├── Better Auth Handler (/api/auth/*)
  ├── Authentication (Session verification via Better Auth & User record check)
  ├── RBAC Authorization (requireRole('ADMIN' | 'EMPLOYEE'))
  └── Zod Validation (validateRequest for body, query, and params)
  │
  ▼
Controllers (server/src/controllers/)
  └── Thin HTTP adapters formatting standardized JSON envelopes
  │
  ▼
Services (server/src/services/)
  ├── TaskService (Business rules, ownership checks, search, pagination)
  ├── EmployeeService (Staff queries and workload aggregation)
  ├── DashboardService (Live MongoDB aggregation pipelines)
  └── EmailService (HTML email generation and SMTP dispatch)
  │
  ▼
Models / Database (server/src/models/)
  └── Mongoose Schemas (User & Task models with indexes)
```

---

## 5. Authentication & Authorization

### Authentication (Better Auth)
* Authentication is managed by **Better Auth** using its official MongoDB adapter.
* Authenticated requests transmit secure, `HttpOnly`, `SameSite=Lax` session cookies.
* Tokens are **never** stored in browser `localStorage`.
* Better Auth routes are mounted at `/api/auth/*` before Express body parsers.

### Authorization (RBAC & Resource Ownership)
* Roles: `ADMIN` and `EMPLOYEE`.
* Frontend role checks only govern UI navigation and visibility.
* All permissions are strictly verified on the server:
  * **Task Creation**: Admin only (`requireRole('ADMIN')`). Employees receive `403 Forbidden`.
  * **Employee Directory**: Admin only. Employees receive `403 Forbidden`.
  * **Task Status Updates**: When an employee calls `PATCH /api/tasks/:id/status`, the backend verifies that `task.assignedEmployee.toString() === req.user.id`. Modifying another employee's task returns `403 Forbidden`.

---

## 6. Database Models

### Task Model (`server/src/models/Task.js`)
```javascript
{
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120, index: true },
  description: { type: String, required: true, maxlength: 2000 },
  assignedEmployee: { type: ObjectId, ref: 'User', required: true, index: true },
  assignedBy: { type: ObjectId, ref: 'User', required: true, index: true },
  priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM', index: true },
  status: { type: String, enum: ['NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED'], default: 'NOT_STARTED', index: true },
  createdAt: Date,
  updatedAt: Date
}
```
* **Indexes**: Text index on `{ title: 'text', description: 'text' }`, compound index on `{ assignedEmployee: 1, status: 1 }`, and `{ status: 1, priority: 1, createdAt: -1 }`.

### User Model (`server/src/models/User.js`)
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  role: { type: String, enum: ['ADMIN', 'EMPLOYEE'], default: 'EMPLOYEE', index: true },
  isActive: { type: Boolean, default: true, index: true },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 7. API Documentation

### Base URL: `http://localhost:5000`

#### Authentication (`/api/auth/*`)
* `POST /api/auth/sign-in/email`: Log in with email and password (supports dedicated portal role enforcement).
* `POST /api/auth/sign-out`: Invalidate session and clear auth cookies.
* `GET  /api/auth/get-session`: Retrieve current active session and user profile.

#### Tasks (`/api/tasks`)
* `GET    /api/tasks`: List tasks with query params (`search`, `status`, `priority`, `employee`, `sort`, `order`, `page`, `limit`).
* `POST   /api/tasks`: Create and assign a task with initial status and priority (**Admin only**).
* `GET    /api/tasks/:id`: Get full task details (**Ownership checked for employees**).
* `PATCH  /api/tasks/:id/status`: Update task status (`NOT_STARTED`, `PENDING`, `IN_PROGRESS`, `COMPLETED`).
* `DELETE /api/tasks/:id`: Permanently delete a task (**Admin only**).

#### Employees (`/api/employees`)
* `GET /api/employees`: List employees with search, pagination, and workload metrics (**Admin only**).
* `GET /api/employees/:id`: Get employee profile, task counts, and assigned task history (**Admin only**).

#### Dashboard (`/api/dashboard`)
* `GET /api/dashboard/admin`: Live counts of employees, total tasks, and status breakdown (**Admin only**).
* `GET /api/dashboard/employee`: Live counts of personal assigned tasks and recent assignments (**Employee only**).

---

## 8. Standard API Response Envelope

### Success Response
```json
{
  "success": true,
  "message": "Task created and assignment email sent successfully",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Access denied. You can only update tasks assigned to you.",
  "errors": []
}
```

---

## 9. Environment Variables

### Server (`server/.env`)
```env
NODE_ENV=development
PORT=5000

# MongoDB Atlas URI (or local MongoDB for development)
MONGODB_URI=mongodb://127.0.0.1:27017/tms_enterprise_db

# Better Auth Secret (minimum 32 characters)
BETTER_AUTH_SECRET=enterprise_super_secret_session_key_min_32_characters_long_12345
BETTER_AUTH_URL=http://localhost:5000

# Client Origin (CORS & Cookie Lax)
CLIENT_URL=http://localhost:5173

# Nodemailer / SMTP Configuration
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM="Enterprise TMS" <no-reply@enterprise.corp>
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## 10. Installation & Quick Start

### Prerequisites
* **Node.js**: v18.0.0 or higher (v24 LTS tested)
* **MongoDB**: Active MongoDB Atlas cluster or local MongoDB service

### Step 1: Clone and Install
```bash
git clone <repo-url>
cd TMS
npm install
```

### Step 2: Configure Environment
```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env
```
Edit `server/.env` to configure your `MONGODB_URI` (Atlas or local).

### Step 3: Seed Initial Data
```bash
npm run seed
```
This populates deterministic test users and tasks:
* **Admin**: `admin@enterprise.corp` / `AdminPassword123!`
* **Employee**: `alex.chen@enterprise.corp` / `EmployeePassword123!`
* **Employee**: `maya.patel@enterprise.corp` / `EmployeePassword123!`
* **Employee**: `jordan.taylor@enterprise.corp` / `EmployeePassword123!`

### Step 4: Run Development Servers
```bash
# Start both server (:5000) and client (:5173)
npm run dev
```

Or run them individually:
```bash
npm run server  # Runs backend with nodemon
npm run client  # Runs frontend with Vite
```

### Step 5: Verification & Quality Checks
```bash
# Run linting across server and client
npm run lint

# Run backend automated integration tests
npm run test:api --workspace=server
```

---

## 11. Production Deployment

1. **Build the Client**:
   ```bash
   npm run build
   ```
2. **Configure Production Variables**:
   Set `NODE_ENV=production`, configure a high-entropy `BETTER_AUTH_SECRET`, point `MONGODB_URI` to a secure MongoDB Atlas cluster with IP whitelisting, and set valid corporate SMTP credentials.
3. **Run Backend**:
   ```bash
   npm run start --workspace=server
   ```
4. **Serve Static Client**:
   Serve `client/dist/` via Nginx, Cloudflare Pages, AWS S3/CloudFront, or Express static middleware.

---

## 12. Security Verification Checklist

- [x] **No sensitive data in client bundles**: Verified that `MONGODB_URI`, `BETTER_AUTH_SECRET`, and `MAIL_PASSWORD` are absent from `client/dist`.
- [x] **CORS with Credentials**: Whitelisted client origin with credentials support; wildcard origins disallowed.
- [x] **Strict RBAC Enforcement**: Verified that Employee roles cannot access Admin endpoints or mutate unassigned tasks.
- [x] **Rate Limiting**: Applied to `/api/auth/*` endpoints.
- [x] **Input Sanitization**: Zod validation schemas on all mutation routes.
- [x] **Centralized Error Handler**: Suppresses database stack traces and credentials in production.
