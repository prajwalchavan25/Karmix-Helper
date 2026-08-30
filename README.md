<div align="center">
  <img src="frontend/public/karmix-logo.png" width="120" height="120" alt="Karmix Helper Logo" style="border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);" />
  <h1>🏛️ Karmix Helper (कार्मिक्स हेल्पर)</h1>
  <p><strong>Understand. Discover. Apply.</strong></p>
  <p><em>An AI-powered civic-tech platform helping citizens discover, understand, check eligibility for, and apply to Indian Central & State government schemes.</em></p>

  <p>
    <img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  </p>
</div>

---

## 🌟 Executive Summary

Government welfare information in India is often fragmented across dozens of separate portals, gazettes, and complicated bureaucratic jargon. Millions of eligible citizens — students, farmers, rural artisans, women entrepreneurs, and senior citizens — miss out on entitled benefits because of complex eligibility requirements and confusing documentation procedures.

**Karmix Helper** transforms public governance through AI:
- 🎯 **Personalized Scheme Discovery**: Smart filtering based on demographic, economic, and regional parameters.
- 🤖 **Context-Grounded Karmix AI Assistant**: Multi-turn civic assistant answering queries in **English**, **मराठी (Marathi)**, and **हिन्दी (Hindi)** with verified scheme cards.
- 📊 **Multi-Criteria Eligibility Evaluator**: Instant calculation showing **Likely Eligible (🟢)**, **Needs More Info (🟡)**, and **Not Eligible (🔴)** with detailed condition-by-condition breakdown.
- 📋 **Document Readiness Checklist**: Real-time progress bar (e.g. *3 of 5 documents ready*) with issuing authority guidelines.
- 🔄 **Application Lifecycle Tracker**: Track scheme applications from *Interested* → *Documents Pending* → *Applied* → *Approved*.
- 🛡️ **Verified Official Sources**: Direct links to authentic government domains (`.gov.in`, `.nic.in`, MahaDBT, PM-Kisan, Ayushman Bharat) with zero intermediaries.
- ⚙️ **Administrative Management & Civic Analytics**: Live analytics for scheme views, search trends, user reports, and source verification.

---

## 🏗️ System Architecture & Tech Stack

```
                               ┌────────────────────────────────┐
                               │   Karmix Helper Web Client     │
                               │  (React 18 + TS + Tailwind)    │
                               └───────────────┬────────────────┘
                                               │
                                 REST API & Local Fallback
                                               │
                               ┌───────────────▼────────────────┐
                               │    Express & Node.js Server    │
                               │   (Authentication & Routing)   │
                               └───────────────┬────────────────┘
                                               │
                      ┌────────────────────────┼────────────────────────┐
                      │                        │                        │
             ┌────────▼────────┐      ┌────────▼────────┐      ┌────────▼────────┐
             │   Prisma ORM    │      │  Hybrid AI Core │      │ Civic Analytics │
             │  (SQLite DB)    │      │ (Gemini/Offline)│      │  (Search Logs)  │
             └─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Civic-tech palette: Deep Navy, Trust Azure, Emerald, Amber)
- **Icons & Charts**: Lucide React + Recharts
- **Internationalization**: Native i18n supporting English, Marathi, and Hindi
- **Mobile First**: Responsive top navigation + mobile bottom navigation bar

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database & ORM**: SQLite / PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs + RBAC (`CITIZEN` / `ADMIN`)
- **AI Engine**: Google Gemini API integration with automatic fallback to an intelligent deterministic civic knowledge base

---

## 🚀 Quick Start & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/prajwalchavan25/Karmix-Helper.git
cd Karmix-Helper
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run db:setup
npm run dev
```
*Backend API runs at: `http://localhost:5000`*

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend Web App runs at: `http://localhost:3000`*

---

## 🔑 Pre-Loaded Demo Accounts

| Role | Email | Password | Features Included |
| :--- | :--- | :--- | :--- |
| **👤 Citizen** | `citizen@karmix.in` | `Citizen@123456` | Student profile (Rahul Patil, Pune, OBC), active MahaDBT application, document checklist, saved schemes, notification alerts |
| **🛡️ Admin** | `admin@karmix.gov.in` | `Admin@123456` | Full administrative access, civic analytics charts, scheme CRUD, citizen report review, source verification |

---

## 📂 Project Directory Structure

```
karmix-helper/
├── backend/
│   ├── prisma/            # Relational database schema & seed scripts
│   ├── src/
│   │   ├── controllers/   # Auth, Scheme, AI, Eligibility, Admin controllers
│   │   ├── middleware/    # JWT auth & error handling middleware
│   │   ├── routes/        # Express API route endpoints
│   │   ├── services/      # AI engine, eligibility & recommendation services
│   │   └── server.ts      # Main Express server entry point
│   └── package.json
├── frontend/
│   ├── public/            # Static assets & brand logos
│   ├── src/
│   │   ├── components/    # Reusable UI, AI modal, Checklist, Cards
│   │   ├── context/       # Auth, Language (i18n), and Notification context
│   │   ├── pages/         # Landing, Find, Detail, Dashboard, Admin, Auth
│   │   ├── services/      # Centralized API client & offline dataset
│   │   ├── App.tsx        # Router configuration
│   │   └── main.tsx       # React root
│   └── package.json
├── start-karmix.bat       # One-click Windows launch script
└── README.md
```

---

## 🛡️ Statutory Disclaimer

> **Important Notice**: Karmix Helper is an independent civic-tech information and assistance platform. It is not affiliated with or operated by any government authority. All scheme applications and final sanction determinations are made exclusively on official government portals (`.gov.in`, `.nic.in`, state gazettes).

---

<div align="center">
  <p>Made with ❤️ by <strong>Prajwal Chavan</strong></p>
  <p>
    <a href="https://github.com/prajwalchavan25">GitHub Profile</a> •
    <a href="https://github.com/prajwalchavan25/Karmix-Helper">Repository</a>
  </p>
</div>
