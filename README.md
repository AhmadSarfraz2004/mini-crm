# Mini CRM Lead Manager (MERN)

Technical Assignment for Naxape – MERN Stack Intern

---

# 📌 Project Overview

Mini CRM is a full-stack MERN application that allows authenticated users to manage leads efficiently.

Users can:
- Register and login securely using JWT authentication
- Create and manage leads
- Track lead status
- Search and filter leads
- View paginated lead records
- Assign leads
- Manage their own leads securely

---

# 🚀 Live Demo

## URL
https://mini-crm-9jby.vercel.app/

---

# 🛠 Tech Stack

## Frontend
- React.js
- Axios
- CSS3

## Backend
- Node.js
- Express.js
- JWT Authentication
- bcryptjs

## Database
- MongoDB Atlas
- Mongoose

## Deployment
- Vercel
- GitHub CI/CD

---

# ✨ Features Implemented

## 🔐 Authentication
- User Registration
- User Login
- JWT Token Authentication
- Protected Routes

---

## 📊 Lead Management

Authenticated users can:

- Create new leads
- View paginated leads
- Search leads
- Filter leads by status
- Update lead status
- Delete leads
- Assign leads

---

## 🔎 Search & Filtering
- Search by:
  - Name
  - Email
  - Phone
- Filter by lead status
- Backend-powered filtering and pagination

---

## 📄 Pagination
- Paginated lead listing
- Dynamic page navigation
- Backend-based pagination handling

---

## 👤 User-Specific Lead Ownership
- Each authenticated user can only:
  - View their own leads
  - Update their own leads
  - Delete their own leads
- Lead ownership is protected using JWT middleware

---

# 📈 Lead Status Options

- New
- Contacted
- Converted
- Lost

---

# 📂 Project Structure

```txt
mini-crm/
│
├── backend/
│   ├── api/
│   │   └── index.js
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── leadController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Lead.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── leadRoutes.js
│   │
│   ├── .env
│   ├── server.js
│   ├── vercel.json
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── vercel.json
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# 🧪 Local Development Setup

## 1. Clone Repository

```bash
git clone https://github.com/AhmadSarfraz2004/mini-crm.git
```

---

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## 4. Start Backend Server

```bash
npm run dev
```

---

## 5. Start Frontend Server

```bash
npm run dev
```

---

# 🔗 API Endpoints

## Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |

---

# 🌐 Deployment

Application deployed using:

- Vercel (Frontend + Backend)
- MongoDB Atlas
- GitHub CI/CD Integration

Automatic deployment occurs on every push to GitHub.

---

# 📚 Concepts Implemented

- REST APIs
- JWT Authentication
- Protected Routes
- CRUD Operations
- Pagination
- Search & Filtering
- React State Management
- Axios API Integration
- MongoDB Relationships
- Environment Variables
- CI/CD Deployment
- Responsive UI

---

# 👨‍💻 Author

Ahmad Sarfraz  
MERN Stack Intern Candidate – Naxape
