# University Admission Backend

## Quick Start for Frontend Integration

### Run the backend server

1. Ensure local MySQL is running (XAMPP MySQL is fine).
2. Create a `.env` file in `backend/` if it doesn't exist, and set:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=tuyensinh_db
JWT_SECRET=change-this-secret
ADMIN_EMAIL=admin@university.vn
ADMIN_PASSWORD=Admin123!
```

3. Start the backend from `backend`:

```bash
cd backend
npm install
node server.js
```

4. The API will be available at:

```text
http://localhost:4000/api
```

---

## Authentication

### Register student

`POST /api/auth/register`

Payload:

```json
{
  "username": "teststudent",
  "email": "student1@example.com",
  "password": "Student123!",
  "fullName": "Nguyen Van A",
  "phone": "0912345678"
}
```

### Login

`POST /api/auth/login`

Payload:

```json
{
  "identifier": "student1@example.com",
  "password": "Student123!"
}
```

Response includes token:

```json
{
  "token": "...",
  "user": {
    "id": 1,
    "username": "teststudent",
    "email": "student1@example.com",
    "role": "student"
  }
}
```

---

## Axios sample setup

```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;
```

---

## Student endpoints

### Get universities

`GET /api/universities`

### Get majors for a university

`GET /api/universities/:univId/majors`

### Get subject groups for a major

`GET /api/majors/:majorId/subject-groups`

### Submit application

`POST /api/applications`

Payload example:

```json
{
  "major_id": 2,
  "subject_group_id": 3,
  "scores": {
    "math": 8.5,
    "physics": 7.0,
    "chemistry": 6.5
  },
  "document_url": "https://files.example.com/doc.pdf"
}
```

### List my applications

`GET /api/applications/my`

---

## Admin endpoints

### Login as admin

`POST /api/auth/login`

Payload:

```json
{
  "identifier": "admin@university.vn",
  "password": "Admin123!"
}
```

### Get dashboard stats

`GET /api/admin/stats`

### List applications

`GET /api/admin/applications?page=1&limit=20&status=pending`

### Update application status

`PATCH /api/admin/applications/:id/status`

Payload examples:

```json
{
  "status": "approved"
}
```

```json
{
  "status": "rejected",
  "rejection_reason": "Missing transcript"
}
```

---

## Notes

- Student and admin endpoints require a Bearer token in the `Authorization` header.
- Use `identifier` for login, which supports either email or username.
- Default admin credentials are from `.env` if set, otherwise `admin@university.vn` / `Admin123!`.
