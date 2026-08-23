# Karmix Helper (कार्मिक्स हेल्पर)
> **Tagline:** *"Understand. Discover. Apply."*  
> **Mission:** An AI-powered civic-tech platform to help ordinary citizens discover, understand, check eligibility for, and apply to government schemes, scholarships, subsidies, and public services across India.

---

## 🏛️ Executive Summary

Government welfare information is frequently fragmented across dozens of separate central and state portals, dense gazettes, and complicated bureaucratic jargon. Eligible citizens — especially students, farmers, rural artisans, and small business owners — often miss out on entitled benefits because of complex eligibility requirements and confusing documentation procedures.

**Karmix Helper** bridges this gap as a modern civic assistant:
- 🎯 **Personalized Scheme Discovery**: Smart filtering based on demographic, economic, and regional parameters.
- 🤖 **Context-Grounded Karmix AI Assistant**: Multi-turn civic chatbot answering queries in **English**, **Marathi (मराठी)**, and **Hindi (हिन्दी)** with verified scheme cards.
- 📊 **Multi-Criteria Eligibility Evaluator**: Instant calculation showing **Likely Eligible (🟢)**, **Needs More Info (🟡)**, and **Not Eligible (🔴)** with detailed breakdown of every single condition.
- 📋 **Document Readiness Checklist**: Real-time progress bar (e.g. *3 of 5 documents ready*) with issuing office guidance.
- 🔄 **Application Lifecycle Tracker**: Track scheme applications from *Interested* → *Documents Pending* → *Applied* → *Approved*.
- 🛡️ **Verified Official Sources**: Direct links to authentic government domains (`.gov.in`, `.nic.in`, MahaDBT, PM-Kisan, Ayushman Bharat) with zero intermediaries.
- ⚙️ **Administrative Management & Civic Analytics**: Live analytics for scheme views, search trends, user reports, and source verification.

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Civic-tech palette: Deep Navy, Trust Azure, Emerald, Amber)
- **Icons**: Lucide React
- **Analytics Charts**: Recharts
- **Internationalization (i18n)**: Native React Context supporting English, Marathi, and Hindi
- **Mobile First**: Responsive top navigation for desktop + Bottom navigation bar for mobile

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database & ORM**: SQLite / PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs password hashing + Role-Based Access Control (`CITIZEN` / `ADMIN`)
- **AI Engine**: Google Gemini API integration with automatic fallback to an intelligent deterministic civic knowledge base (guaranteeing 100% testability offline or during presentations)

---

## 🚀 Quick Start & Installation

### 1. Clone & Navigate to Project
```bash
cd karmix-helper
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run db:setup
```
*This command generates the Prisma client, creates the SQLite database, and seeds it with realistic Indian central & state government schemes, categories, official sources, and demo accounts.*

To start the backend server:
```bash
npm run dev
```
Backend API will be running at `http://localhost:5000`.

### 3. Frontend Setup
In a separate terminal:
```bash
cd ../frontend
npm install
npm run dev
```
Frontend Web App will be running at `http://localhost:3000`.

---

## 🔑 Demo Accounts

The application is pre-seeded with ready-to-test demo accounts:

| Role | Email | Password | Pre-loaded Features |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@karmix.in` | `Citizen@123456` | Pre-configured profile (Rahul Patil, 20yo Student, Maharashtra, OBC), active MahaDBT application, document checklist, saved schemes, notification alerts |
| **Admin** | `admin@karmix.gov.in` | `Admin@123456` | Full administrative access, scheme CRUD, citizen issue report resolution, domain verification, civic analytics charts |

*Note: On the login page, you can click the **Quick Demo Logins** button to fill in credentials automatically with a single click.*

---

## 🧭 Key User Journeys to Test

### Flow 1: Instant Quick Match (No Login Needed)
1. Open `http://localhost:3000/`.
2. On the Landing Page hero, enter `Age: 20`, `State: Maharashtra`, `Occupation: Student`, `Income: 1L - 2.5L`.
3. Click **Discover Matched Schemes**.
4. The system filters relevant schemes (e.g. *MahaDBT Post-Matric Scholarship*, *NAPS Apprenticeship*) with computed eligibility indicators.

### Flow 2: Multi-Language Switcher
1. In the navigation bar header, click the language dropdown (Globe icon).
2. Switch between **English**, **मराठी (Marathi)**, and **हिन्दी (Hindi)**.
3. Observe how UI buttons, scheme titles, benefits, disclaimers, and AI responses switch language seamlessly.

### Flow 3: AI Eligibility Assessment
1. Open any scheme (e.g., *MahaDBT Post-Matric Scholarship for OBC & EBC Students*).
2. Click **Check Eligibility**.
3. View the detailed criteria breakdown (Age, Domicile, Occupation, Income Ceiling, Caste Category) with pass/fail badges, match percentage, and explanation.

### Flow 4: Interactive Document Readiness
1. On the scheme detail page, scroll to **Required Documents**.
2. Toggle status between **Ready**, **Missing**, and **Not Applicable**.
3. Watch the readiness progress bar update in real time (e.g., *3 of 5 documents ready (60%)*).

### Flow 5: Karmix AI Assistant
1. Click **Ask Karmix AI** in the top navbar or the floating badge.
2. Ask in English, Marathi, or Hindi (e.g., *"What schemes are available for farmers in Maharashtra?"* or *"शेतकऱ्यांसाठी कोणत्या योजना आहेत?"*).
3. The AI responds with structured guidance, verified scheme benefit cards, and official portal links.

### Flow 6: Application Lifecycle Tracker
1. Click **Add to Tracker** on a scheme.
2. Enter an application reference ID and set the status to `Applied`.
3. Navigate to **Applications** to manage your pipeline from *Documents Pending* to *Approved*.

### Flow 7: Administrative Oversight & Analytics
1. Log in as `admin@karmix.gov.in` / `Admin@123456`.
2. Navigate to `/admin`.
3. Inspect category distribution charts, application status pipeline, most viewed schemes, search demand logs, create/edit schemes, and resolve citizen feedback reports.

---

## 🛡️ Statutory Disclaimer

> **Important Notice**: Karmix Helper is an independent civic-tech information and assistance platform. It is not affiliated with, sponsored by, or operated by any government authority. All scheme applications and final sanction determinations are made exclusively on official government portals (`.gov.in`, `.nic.in`, state gazettes).
