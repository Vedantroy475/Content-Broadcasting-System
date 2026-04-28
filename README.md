# Content Broadcasting System

A backend-only content broadcasting platform built with **Node.js**, **Express**, and **PostgreSQL**. Teachers upload subject-based content (images), the Principal approves it, and students access live broadcasts via public API endpoints with scheduling and rotation logic.

---

## Tech Stack

- **Runtime:** Node.js (JavaScript)
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **Authentication:** JWT + bcryptjs
- **File Upload:** Multer memory storage + Appwrite Storage
- **Validation:** express-validator
- **Security:** helmet, cors

---

## Folder Structure

```
content-broadcasting-system/
├── src/
│   ├── config/          # Database, env, multer config
│   ├── controllers/     # Request handlers
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── models/          # Sequelize models
│   ├── middlewares/     # Auth, role, upload, error, validation
│   ├── utils/           # Helpers, constants, custom errors
│   ├── scripts/         # Seed scripts
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── tests/               # Test files (future)
├── .env                 # Environment variables
├── .env.example         # Example env file
├── architecture-notes.txt
└── README.md
```

---

## Prerequisites

- Node.js (v18+)
- PostgreSQL installed and running
- A PostgreSQL database created (default: `content_broadcasting`)

---

## Setup Instructions

### 1. Clone / Extract the project

```bash
cd content-broadcasting-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=content_broadcasting
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=your_super_secret_key
JWT_EXPIRY=24h

MAX_FILE_SIZE=10485760

# Appwrite Storage Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_BUCKET_ID=your_bucket_id
```

### 4. Seed the database

This creates the default **Principal** user and default **Subjects**.

```bash
npm run seed
```

Default Principal credentials:
- **Email:** `principal@school.edu`
- **Password:** `principal123`

Default subjects seeded: `maths`, `science`, `english`, `history`, `geography`

### 5. Start the server

```bash
# Production start
npm start

# Development start (with auto-reload)
npm run dev
```

The server will run on `http://localhost:3000`.

---

## API Documentation

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Optional | Register a user. Without auth, creates any role. With auth (Principal), only Principal can create users. |
| POST | `/auth/login` | No | Login and receive JWT token |

**Register:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Teacher",
    "email": "john@school.edu",
    "password": "teacher123",
    "role": "teacher"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "principal@school.edu",
    "password": "principal123"
  }'
```

### Content Endpoints (Teacher Only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/content/upload` | Teacher | Upload content with file, schedule, and rotation settings |
| GET | `/content/my-content` | Teacher | Get all content uploaded by the teacher |
| GET | `/content/:id` | Any (restricted) | Get specific content by ID |

**Upload Content:**
```bash
curl -X POST http://localhost:3000/content/upload \
  -H "Authorization: Bearer <teacher_jwt>" \
  -F "title=Maths Quiz 1" \
  -F "description=Chapter 1 quiz" \
  -F "subject_id=1" \
  -F "start_time=2026-04-25T00:00:00Z" \
  -F "end_time=2026-04-30T23:59:59Z" \
  -F "rotation_duration=5" \
  -F "rotation_order=0" \
  -F "file=@/path/to/image.jpg"
```

**My Content:**
```bash
curl -X GET "http://localhost:3000/content/my-content?status=pending&subject_id=1" \
  -H "Authorization: Bearer <teacher_jwt>"
```

### Approval Endpoints (Principal Only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/approval/pending` | Principal | List all pending content |
| GET | `/approval/all` | Principal | List all content with filters |
| PATCH | `/approval/:id/approve` | Principal | Approve content |
| PATCH | `/approval/:id/reject` | Principal | Reject content with reason |

**Approve Content:**
```bash
curl -X PATCH http://localhost:3000/approval/<content-id>/approve \
  -H "Authorization: Bearer <principal_jwt>"
```

**Reject Content:**
```bash
curl -X PATCH http://localhost:3000/approval/<content-id>/reject \
  -H "Authorization: Bearer <principal_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"rejection_reason": "Inappropriate content"}'
```

### Broadcast Endpoints (Public — No Auth)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/broadcast/live/:teacherId` | No | Get live content for a teacher with rotation applied |
| GET | `/broadcast/live/:teacherId?subject=maths` | No | Filter by subject |

**Get Live Content:**
```bash
curl -X GET "http://localhost:3000/broadcast/live/<teacher-id>?subject=maths"
```

---

## Content Lifecycle

```
UPLOADED (via teacher)
    |
    v
PENDING (visible to Principal)
    |
    +---> APPROVED (eligible for broadcast)
    |
    +---> REJECTED (with reason visible to teacher)
```

Only **APPROVED** content that falls within its `start_time` and `end_time` window is eligible for the public broadcast API.

---

## Scheduling / Rotation Logic

The broadcast system uses a **stateless, on-the-fly rotation algorithm**:

1. Fetches all **approved** content for a teacher where `NOW()` is between `start_time` and `end_time`.
2. Groups active content by **subject**.
3. For each subject:
   - Sorts content by `rotation_order`.
   - Computes `total_cycle = sum(rotation_duration)` for all active items.
   - Calculates elapsed time since the earliest `start_time`.
   - `position = elapsed_seconds % total_cycle_seconds`.
   - Iterates through items until cumulative duration exceeds `position`.
   - Returns the active content item.

This creates a **continuous loop** without background jobs or cron tasks.

---

## Edge Cases Handled

| Scenario | Response |
|----------|----------|
| No approved content for teacher | `200 OK` — `"No content available"` |
| Approved but outside time window | `200 OK` — `"No content available"` |
| Invalid subject in query | `200 OK` — `"No content available"` |
| File size > 10MB | `400 Bad Request` |
| Invalid file type (non-image) | `400 Bad Request` |
| Missing title / subject | `422 Validation Error` |
| Reject without reason | `400 Bad Request` |
| Unauthorized role access | `403 Forbidden` |
| Expired JWT | `401 Unauthorized` |

---

## Assumptions & Notes

- **Principal is pre-seeded** via the seed script. Only Principals can approve/reject content.
- **File uploads** are handled with Multer memory storage and persisted in Appwrite Storage. The generated Appwrite file view URL is stored in `file_url`; `file_path` remains `NULL` for these uploads.
- **Appwrite configuration** is required through `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`, and `APPWRITE_BUCKET_ID`. Bucket permissions should allow the intended file access pattern for broadcast consumers.
- **Content status** defaults to `pending` on upload. The architecture document originally described an `uploaded` status, but the flow was simplified to `pending` directly since teachers finalize everything in one upload request.
- **Rotation duration** defaults to `5 minutes` if not provided.
- **Time windows** use server-local time. Ensure PostgreSQL and the Node.js server are timezone-aligned for predictable scheduling.

---

## Optional Enhancements (Bonus Features)

The architecture supports these as future additions:
- **Redis Caching** for `/broadcast/live` endpoints
- **Rate Limiting** on public APIs
- **Private Appwrite bucket access** or signed/controlled file delivery
- **CDN optimization** in front of public Appwrite file URLs
- **Subject-wise Analytics** (most active subject, content usage)
- **Pagination & Filters** on list endpoints
- **Audit Trail** table for content status history

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the server |
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm run seed` | Seed principal user and default subjects |

---

## License

ISC
