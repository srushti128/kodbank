# 🏦 Kodbank - Digital Banking Application

A full-stack banking app with JWT authentication, Aiven MySQL, and beautiful UI.

---

## 📁 Project Structure

```
kodbank/
├── server.js                 # Express app entry point
├── package.json
├── .env                      # Environment variables (configure this!)
├── config/
│   └── db.js                 # Aiven MySQL connection + table creation
├── middleware/
│   └── auth.js               # JWT verification middleware
├── routes/
│   ├── auth.js               # Register / Login / Logout
│   └── user.js               # Balance check (protected)
└── public/
    ├── register.html         # Registration page
    ├── login.html            # Login page (COMPULSORY)
    └── dashboard.html        # User dashboard with balance + confetti
```

---

## ⚙️ Setup Instructions

### 1. Install dependencies
```bash
cd kodbank
npm install
```

### 2. Configure `.env`
Edit the `.env` file with your **Aiven MySQL** credentials:

```env
PORT=3000

DB_HOST=your-aiven-mysql-host.aivencloud.com
DB_PORT=23074
DB_USER=avnadmin
DB_PASSWORD=your_actual_password
DB_NAME=kodbank
DB_SSL=true

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=1h
```

> 💡 Get these from your **Aiven Console → MySQL service → Connection info**

### 3. Create the database
In your Aiven MySQL console, run:
```sql
CREATE DATABASE IF NOT EXISTS kodbank;
```
Tables (`KodUser` and `UserToken`) are **auto-created** when the server starts.

### 4. Start the server
```bash
npm start
# or for development:
npm run dev
```

---

## 🗃️ Database Schema

### KodUser Table
| Column   | Type                                  | Description              |
|----------|---------------------------------------|--------------------------|
| uid      | VARCHAR(36) PK                        | UUID primary key         |
| username | VARCHAR(100) UNIQUE                   | Login username           |
| email    | VARCHAR(150) UNIQUE                   | Email address            |
| password | VARCHAR(255)                          | bcrypt hashed password   |
| balance  | DECIMAL(15,2) DEFAULT 100000.00       | Account balance          |
| phone    | VARCHAR(20)                           | Phone number             |
| role     | ENUM('Customer','Manager','Admin')    | Only Customer allowed    |

### UserToken Table
| Column  | Type           | Description              |
|---------|----------------|--------------------------|
| tid     | VARCHAR(36) PK | UUID primary key         |
| token   | TEXT           | JWT token string         |
| uid     | VARCHAR(36) FK | Reference to KodUser.uid |
| expiry  | DATETIME       | Token expiry datetime    |

---

## 🔄 Application Flow

```
Register → Login → JWT Generated → Token Stored in DB
    → Dashboard → Check Balance → JWT Verified → Show Balance + Confetti 🎉
```

---

## 🔐 Security Features

| Feature         | Implementation                        |
|-----------------|---------------------------------------|
| Password        | bcrypt (12 salt rounds)               |
| JWT Subject     | username                              |
| JWT Claim       | role                                  |
| Token Storage   | HTTP-only cookie + localStorage       |
| Token Verify    | Signature + Expiry + DB check         |
| Role Restriction| Only Customer role allowed            |

---

## 🌐 API Endpoints

| Method | Endpoint              | Protected | Description        |
|--------|-----------------------|-----------|--------------------|
| POST   | /api/auth/register    | No        | Register new user  |
| POST   | /api/auth/login       | No        | Login + get JWT    |
| POST   | /api/auth/logout      | No        | Clear cookie       |
| GET    | /api/user/balance     | ✅ Yes     | Get balance        |

---

## 📄 Pages

| URL             | Page           |
|-----------------|----------------|
| /               | Register page  |
| /register       | Register page  |
| /login          | Login page     |
| /userdashboard  | Dashboard      |
