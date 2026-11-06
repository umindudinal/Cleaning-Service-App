# JaniFlow - Cleaning Operations & Inspection Management Platform

**JaniFlow** is an end-to-end cleaning operations and field service management platform designed for commercial and residential cleaning service providers. 

The system seamlessly connects **Field Cleaning Staff** with the **Operations Admin Team** and **Customers** through an integrated mobile application, a real-time web dashboard, and an automated report generation and email dispatch pipeline.

---

## 🌟 System Architecture Overview

```
                      ┌─────────────────────────────────────────┐
                      │        JaniFlow Operations Admin        │
                      │  (React + Vite + Tailwind CSS + Lucide) │
                      └────────────────────┬────────────────────┘
                                           │
                                           │ REST API (JSON)
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │          JaniFlow Backend API           │
                      │         (Node.js + Express.js)          │
                      │                                         │
                      │   ┌───────────────┬─────────────────┐   │
                      │   │ Supabase DB   │ PDFKit Engine   │   │
                      │   │ & Auth Client │ & File Cache    │   │
                      │   └───────────────┴─────────────────┘   │
                      │   │ Nodemailer (Gmail SMTP Engine)  │   │
                      │   └─────────────────────────────────┘   │
                      └───────▲─────────────────────────┬───────┘
                              │                         │
             REST API (JSON & │                         │ Automated PDF Report
             Base64 Evidence) │                         │ via Email Dispatch
                              │                         ▼
     ┌────────────────────────┴────────┐      ┌──────────────────────────┐
     │      JaniFlow Mobile App        │      │    Customer & Admin      │
     │      (Flutter / Dart / M3)      │      │       Inboxes            │
     └─────────────────────────────────┘      └──────────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

### 1. 📱 Field Staff Mobile App (`cleaning_service_mobile_app`)
- **Modern Minimalist UI**: Crafted following Linear & Apple design principles with clean Slate Navy (`#1E3A8A`) accents, crisp borders, and subtle micro-shadows.
- **Smart Customer Dropdown**: Allows staff to quickly switch between assigned customers with zero technical database IDs displayed.
- **Customer-Specific Inspection Checklists**: Dynamically loads the exact cleaning questions configured by admin for the selected customer.
- **Interactive Checklists**: Tactile segmented controls (`[ Completed ]` / `[ Not Done ]`).
- **Photo Proof Evidence**: Attach before/after proof photos directly via Camera or Photo Gallery.
- **Auto-Archiving Workflow**: Completed cleaning tasks immediately disappear from the Home Screen and move to the History screen.
- **Job History with Live Search**: Filter past completed jobs by customer name or street address.
- **Persistent Sessions**: Staff stays securely logged in across app launches using local session storage (`SharedPreferences`).

### 2. 🖥️ Operations Admin Dashboard (`cleaning_service_admin_dashboard`)
- **100% English Professional UI**: High-density operational interface built with React, Vite, and Tailwind CSS.
- **Operational Metrics & KPIs**: Real-time counter of total customers, active staff, pending tasks, and completed cleanings.
- **Customer Management**: Register, view, update, and manage property addresses and contact details.
- **Staff Roster**: Manage cleaning specialists and track field assignments.
- **Checklist Question Builder**: Assign customer-specific inspection items and standards directly to individual accounts.
- **Work Order Dispatch**: Create, assign, and schedule cleaning visits.
- **PDF Report Viewer**: Direct in-browser viewing and downloading of generated inspection reports with embedded photographic evidence.

### 3. ⚙️ Backend API & Services (`cleaning_service_backend`)
- **RESTful Endpoints**: Built on Node.js & Express with a 50MB payload capacity for high-resolution base64 photo sync.
- **Supabase Integration**: Cloud database persistence and staff authentication.
- **Automated PDFKit Engine**: Renders clean, branded inspection reports formatted with customer metadata, checklist badges, and dual-column photographic proofs.
- **Nodemailer SMTP Pipeline**: Automatically emails completion certificates and PDF attachments directly to the customer's email and CCs admin dispatch (`sudinal2002@gmail.com`).

---

## 📂 Project Structure

```
Cleaning Service/
├── .gitignore                              # Comprehensive multi-stack ignore configuration
├── README.md                               # Project documentation
│
├── cleaning_service_backend/               # Node.js / Express Backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── adminController.js          # Admin CRUD, stats, and PDF streaming
│   │   │   └── jobController.js            # Staff auth, job submission, and questions
│   │   ├── routes/
│   │   │   ├── adminRoutes.js              # /api/admin/* endpoints
│   │   │   └── jobRoutes.js                # /api/jobs/* endpoints
│   │   ├── services/
│   │   │   ├── emailService.js             # Nodemailer Gmail SMTP dispatch
│   │   │   ├── pdfService.js               # PDFKit document generator
│   │   │   └── supabaseService.js          # Supabase client instance
│   │   └── index.js                        # Express server entry point
│   ├── uploads/
│   │   ├── photos/                         # Cached inspection proof photos
│   │   └── reports/                        # Cached generated PDF reports
│   ├── .env                                # Backend configuration & credentials
│   └── package.json
│
├── cleaning_service_admin_dashboard/       # React / Vite Admin Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                     # Sidebar, Header, Toast notifications
│   │   │   ├── customers/                  # CustomerTable, CustomerModal
│   │   │   ├── jobs/                       # JobTable (with direct PDF viewer), JobModal
│   │   │   ├── questions/                  # QuestionTable, QuestionModal
│   │   │   └── staff/                      # StaffCard, StaffModal
│   │   ├── layouts/
│   │   │   └── AdminLayout.jsx             # Persistent sidebar & content wrapper
│   │   ├── pages/                          # Overview, Customers, Staff, Questions, Jobs, Login
│   │   ├── services/
│   │   │   └── api.js                      # Axios API client
│   │   ├── App.jsx                         # React Router routes definition
│   │   └── main.jsx                        # React root mount
│   ├── index.html
│   └── package.json
│
└── cleaning_service_mobile_app/            # Flutter Mobile Application
    ├── lib/
    │   ├── screens/
    │   │   ├── checklist_screen.dart       # Interactive inspection checklist & photo upload
    │   │   ├── history_screen.dart         # Completed job history & search ledger
    │   │   ├── home_screen.dart            # Staff home with customer dropdown & job card
    │   │   └── login_screen.dart           # Staff authentication & server URL config
    │   ├── services/
    │   │   └── api_service.dart            # HTTP client with dynamic endpoint switching
    │   ├── theme/
    │   │   └── app_theme.dart              # Centralized Minimalist design tokens
    │   └── main.dart                       # App entry point & AuthGate session checker
    ├── pubspec.yaml
    └── test/
        └── widget_test.dart
```

---

## 🛠️ Getting Started & Installation

### Prerequisites
- **Node.js**: v18.x or v20.x+
- **npm**: v9.x+
- **Flutter SDK**: v3.24.x+
- **Android Studio / VS Code** with Flutter and Dart extensions
- **Supabase Account** with PostgreSQL database configured
- **Gmail Account** with an App Password generated for SMTP dispatch

---

### Step 1: Backend Setup (`cleaning_service_backend`)

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd "cleaning_service_backend"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   PORT=3000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-supabase-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   ADMIN_EMAIL=sudinal2002@gmail.com
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:3000`.*

---

### Step 2: Admin Dashboard Setup (`cleaning_service_admin_dashboard`)

1. Open a new terminal and navigate to the dashboard directory:
   ```bash
   cd "cleaning_service_admin_dashboard"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

4. **Production Build**:
   ```bash
   npm run build
   ```

---

### Step 3: Mobile App Setup (`cleaning_service_mobile_app`)

1. Open a terminal and navigate to the mobile app folder:
   ```bash
   cd "cleaning_service_mobile_app"
   ```

2. Fetch Flutter packages:
   ```bash
   flutter pub get
   ```

3. Verify code health:
   ```bash
   flutter analyze
   flutter test
   ```

4. Run the application:
   - **On Android Emulator**:
     ```bash
     flutter run
     ```
     *(The app connects to backend via `http://10.0.2.2:3000/api/jobs`)*
   - **On Physical Device (Wi-Fi)**:
     Set your machine's local IP address (e.g. `http://192.168.1.50:3000/api/jobs`) in the app's server configuration settings modal.
   - **On Chrome (Web)**:
     ```bash
     flutter run -d chrome
     ```

---

## 📡 API Reference Overview

### Public & Staff Endpoints (`/api/jobs`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/jobs/login` | Authenticate cleaning staff account |
| `GET` | `/api/jobs/staff/:staffId` | Retrieve jobs assigned to a specific staff member |
| `GET` | `/api/jobs/questions/:customerId` | Retrieve checklist questions assigned to a specific customer |
| `POST` | `/api/jobs/submit` | Submit job checklist answers with base64 proof photos & trigger report email |

### Admin Endpoints (`/api/admin`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Retrieve aggregate counts (Customers, Staff, Questions, Jobs, Status) |
| `GET` | `/api/admin/customers` | List all registered customers |
| `POST` | `/api/admin/customers` | Create a new customer profile |
| `GET` | `/api/admin/staff` | List all cleaning staff |
| `POST` | `/api/admin/staff` | Register a new cleaning staff specialist |
| `GET` | `/api/admin/questions` | List questions with customer association |
| `POST` | `/api/admin/questions` | Add a new checklist question for a specific customer |
| `GET` | `/api/admin/jobs` | List all assigned work orders with live statuses |
| `POST` | `/api/admin/jobs` | Dispatch / assign a cleaning job to a staff member |
| `GET` | `/api/admin/jobs/:id/report-pdf` | Stream or download the generated inspection PDF report |

---

## 🔒 Security & Data Integrity
- Sensitive credentials (`.env`, private keys, passwords) are strictly excluded from version control via `.gitignore`.
- Proof photos and generated PDF documents are saved with unique timestamp hashes.
- Database access is validated through Supabase Row-Level Policies and API controller validations.

---

## 📄 License
This project is licensed under the **MIT License**. All rights reserved.

