# Mini CRM Lead Manager (MERN)

Technical Assignment for Naxape – MERN Stack Intern

## 📌 Objective
Build a Lead Management System where authenticated users can:
- Add leads  
- Track lead status  
- Assign leads  
- View basic analytics  

---

## Tech Stack
- MongoDB
- Express.js
- React.js
- Node.js
- JWT Authentication

## ✨ Features Implemented

### 🔐 Authentication
- User Registration
- User Login
- JWT Token based protected routes

---

### 📊 Lead Management
Users can:

- Create new leads  
- View all leads with pagination  
- Search leads by name/email  
- Filter leads by status  
- Update lead status  
- Delete leads  
- Assign leads  

**Lead Status Options**
- New
- Contacted
- Converted

---

## 🗄 Lead Model

```js
{
  name: String,
  email: String,
  phone: String,
  status: "new" | "contacted" | "converted",
  assignedTo: String,
  createdAt: Date
}

---

## Project Structure
mini-crm/
│
├── backend/
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
│   ├── package.json
│   └── package-lock.json
│
├── frontend/   (React app will live here)
│
├── .gitignore
└── README.md

---

## Author
Ahmad Sarfraz
MERN Stack Intern Candidate – Naxape
