# PMS - Project Understanding Report

## 1. PROJECT OVERVIEW
**Project Name:** Placement Management System (PMS)
**Purpose & Problem it Solves:** 
PMS is designed to streamline and automate the entire campus placement lifecycle. It bridges the gap between students, hiring companies, and the Training and Placement Office (TPO)/Administrators, facilitating everything from profile building and job postings to application tracking and interview scheduling.

**Target Users & Roles:**
*   **Student:** Can build academic profiles, upload resumes, view eligible jobs, track applications, and view interview schedules.
*   **Company:** Can create a company profile, post job drives (internships/full-time), review applicants, shortlist candidates, and schedule interview rounds.
*   **Admin (TPO):** Acts as the overarching authority. Oversees student academic verifications, approves company registrations, manages jobs, broadcasts announcements, and generates placement statistics and reports.

**Tech Stack Summary:**
*   **Frontend:** React 18, Vite, React Router DOM, Tailwind CSS (for styling), Recharts (for analytics), Framer Motion (animations), Axios.
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB via Mongoose ORM.
*   **Hosting/Environment:** Local environment setup provided via `.env.example`, utilizing generic MongoDB URI and regular Express setup. 

**High-Level Architecture:**
The application follows a standard decoupled Client-Server architecture. The frontend is a Single Page Application (SPA) built with Vite and React, communicating via RESTful API endpoints securely hosted on an Express (Node.js) server. The database is MongoDB, taking advantage of Mongoose models with extensive validation and relational referencing using ObjectIds. File storage for resumes is currently handled on the local server file system (`/uploads/resumes`).

---

## 2. FRONTEND — UI COMPONENTS
The frontend is strictly separated into role-based sections using React Router and protected routes based on Auth Context state.

### Public & Auth Pages
*   **`/` (LandingPage):** Main public-facing page detailing system features and stats.
*   **`/login`, `/register`, `/verify-otp`:** Core authentication flow pages storing global application state context.
*   **`/unauthorized`, `/*` (NotFound):** Error states and fallback UI.

### Student Module
*   **`/student/dashboard`:** High-level overview of available opportunities, pending applications, and recent announcements. 
*   **`/student/profile`:** Form component handling branch, CGPA, skills (`SKILLS_LIST`), links, and a dedicated `FormData` handler for Resume PDF uploads.
*   **`/student/jobs`:** Renders job listings filtered by the student's eligibility (CGPA, backlogs, branch).
*   **`/student/applications`:** An application tracker showing stages using Badges/Status indicators (Applied -> Shortlisted -> Interview -> Selected/Rejected).
*   **`/student/interviews`:** Lists upcoming scheduled interview rounds with dates and online meeting links/venues.

### Company Module
*   **`/company/dashboard`:** Analyzes metrics like total active jobs, applicants, and interviews scheduled.
*   **`/company/profile`:** Manages HR contact info, tier class, and company descriptions. 
*   **`/company/post-job` & `/company/jobs/:id/edit`:** Form handling multi-step inputs (title, package, max backlogs, eligible branches, skills).
*   **`/company/jobs` & `/company/jobs/:id`:** Listings and detailed views of jobs posted by the company.
*   **`/company/jobs/:jobId/applicants`:** A data table component for reviewing student lists, viewing resumes, and updating application statuses via API calls.
*   **`/company/jobs/:jobId/rounds`:** Interview manager modal/screen for scheduling subsequent rounds (online/offline).

### Admin Module
*   **`/admin/dashboard`:** Superuser overview.
*   **`/admin/students`:** Table view with functionality to view profiles, manually override statuses, and explicitly hit `/verify-academic` endpoints for data validity.
*   **`/admin/companies`:** Lists companies requesting approval. The admin must toggle the `isApproved` flag to permit hiring drives.
*   **`/admin/jobs`:** Can view all active job offerings across the platform and forcefully close/update them.
*   **`/admin/reports`:** Dynamic generator for `PlacementReport` documents based on an academic year, utilizing Recharts internally for UI statistics.

**State Management & Logic:**
Global authentication loading states, user data, and roles are maintained using a custom `AuthContext` utilizing React's Context API. All other data fetching runs tightly coupled to components using local `useState`/`useEffect` hooks communicating via a configured `axios` instance (`api.js`) that automatically intercepts 401s and redirects to `/login`.

---

## 3. BACKEND — API LAYER

> [!NOTE]
> All endpoints expect `Content-Type: application/json` unless indicated. Authorized endpoints require JWT in cookies.

### Authentication (`/api/auth`)
*   `POST /register`: Registers a Student or Company. (Validations: Name, valid Email, 6-char password, explicit role validation). Sends OTP payload via email.
*   `POST /verify-otp`: Finalizes registration.
*   `POST /login`: Initiates login, requires subsequent verify step.
*   `POST /login/verify`: Finalizes login. Issues JWT HttpOnly cookie.
*   `POST /logout`: Clears cookie.
*   `POST /resend-otp`: Refreshes OTP timer.
*   `POST /forgot-password` & `/verify-reset-otp` & `/reset-password`: Standard recovery path.
*   `GET /me`: Returns context-aware session user info.

### Student (`/api/student`)
*   `GET /dashboard`: Aggregated statistics. Middleware forces `role: student`.
*   `GET /profile` & `PUT /profile`: Fetches and updates base schema fields.
*   `POST /resume`: Accepts `multipart/form-data`. Key: `resume`. Validates PDF magic bytes before storing local URL.
*   `GET /jobs`: Retrieves `Job` items where `minCGPA` and schemas overlap favorably with requesting student.
*   `POST /apply/:jobId`: Creates `Application` document if no composite uniqueness conflict exists.
*   `GET /applications` & `PUT /applications/:id/withdraw`: Tracker lifecycle modifiers.
*   `GET /interviews`: Fetch joined interview schema details.

### Company (`/api/company`)
*   `GET /dashboard` & `GET|PUT /profile`: Base company CRUD.
*   `POST /jobs` & `GET|PUT /jobs/:id` & `PATCH /jobs/:id/status`: Job creation and status toggles (open/closed).
*   `GET /jobs/:id/applicants`: Fetches populated `Application` + `Student` info securely. 
*   `PUT /applications/:id/status`: Transition handler (`applied`, `shortlisted`, `selected`, `rejected`).
*   `POST /interviews`: Schedule. Generates internal `Interview` documents.
*   `PUT /interviews/:id/result`: Handles round output (`pass`/`fail`).

### Admin (`/api/admin`)
*   `GET /dashboard`: Global analytic view.
*   `GET|PUT /students/:id`, `PUT /students/:id/academic`, `PUT /students/:id/verify-academic`: Manage academic verification explicitly.
*   `GET|PUT /companies/:id`, `PUT /companies/:id/approve`: Approval pipeline controlling company access to students.
*   `GET|PUT /jobs/:id`: Central job administration.
*   `DELETE /users/:id`, `PUT /users/:id/status`: Universal user account control (soft/hard deletes). 
*   `POST /announcements`: Triggers platform-wide notification pushes.
*   `GET|POST /reports`: Data mining pipeline for final TPO summary generation.

### Notifications & Public (`/api/notifications`, `/api/public`)
*   `GET /`, `GET /unread-count`, `PUT /read-all`, `PUT /:id/read`, `DELETE /:id`
*   `/api/public/*`: Completely unprotected paths exposing global `/stats`, `/companies`, `/jobs`, and `/skills` parameters for the Landing Page.

---

## 4. DATABASE SCHEMA

### Database Stack
**Database Type:** MongoDB (NoSQL)
**ORM Used:** Mongoose
**ER Diagram Description:**
The overarching layout utilizes a shared polymorphic architecture. `Users` are the base entity holding credentials, OTPs, and authentication parameters. Depending on `User.role`, they connect 1:1 with either a `Student` or `Company` profile collection via an `ObjectId` ref.
A `Company` creates 1:N `Jobs`. A `Student` establishes an associative `Application` (M:N equivalent mapping) connecting `Student <-> Job`. Each Application can spawn 1:N `Interviews`. The `Notifications` collection is disjoint, mapped directly back to `User` ObjectIds for alert pushing. `PlacementReports` are system-level records mapped generally to the admin `User` who generated them.

### Data Schemas

#### 1. `users`
**Purpose:** Handles authentication and core identity.
**Fields:**
*   `name` (String, Required)
*   `email` (String, Unique, Required)
*   `password` (String, Selected: false, Hashed)
*   `role` (Enum: student, company, admin)
*   `isVerified` / `isActive` / `profileCompleted` (Boolean)
*   `otp` / `otpExpiry` / `otpAttempts` (String/Date)

#### 2. `students`
**Purpose:** Specific academic data.
**Fields:**
*   `user` (ObjectId ref User, Unique, Required)
*   `enrollmentNo` (String, Sparse Unique)
*   `branch`, `gender` (Enum)
*   `cgpa`, `tenthPercentage`, `twelfthPercentage`, `activeBacklogs` (Number)
*   `skills` (Array of Strings referencing `SKILLS_LIST`)
*   `resumeUrl` (String, path to uploaded file)
*   `placementStatus` (Enum: placed, unplaced)
*   `placedIn` (ObjectId ref Company)
*   `academicVerified` (Boolean)
**Sample:** `{ user: "65...2a", branch: "CSE", cgpa: 8.5, placed: false }`

#### 3. `companies`
**Purpose:** Target hiring entity profiles.
**Fields:**
*   `user` (ObjectId ref User, Required)
*   `name`, `industry`, `location`, `website` (String)
*   `tier` (Enum: tier1, tier2, mass_recruiter)
*   `hrName`, `hrEmail` (String)
*   `isApproved` (Boolean, default false)

#### 4. `jobs` (Job Drives)
**Purpose:** Individual placement drive listings.
**Fields:**
*   `company` (ObjectId ref Company)
*   `title`, `description`, `package` (String)
*   `jobType` (Enum: fulltime, internship)
*   `minCGPA`, `maxBacklogs`, `openings` (Number)
*   `eligibleBranches`, `requiredSkills` (Array)
*   `status` (Enum: open, closed, draft)

#### 5. `applications` 
**Purpose:** Records a candidate applying to a job.
**Fields:**
*   `student`, `job`, `company` (ObjectId mapping refs)
*   `status` (Enum: applied, shortlisted, interview, selected, rejected, withdrawn)
*   `offerStatus` (Enum)
*   *Constraints:* Compound index ensures {student, job} is unique (can only apply once).

#### 6. `interviews`
**Purpose:** Tracks exact sub-rounds of an application pipeline.
**Fields:**
*   `application`, `student`, `company`, `job` (ObjectId)
*   `roundName` (String), `roundNumber` (Number)
*   `scheduledAt` (Date), `mode` (Enum: online, offline)
*   `result` (Enum: pass, fail, pending)

#### 7. `notifications` & `placementreports`
`notifications` store boolean `isRead` flags pushing type (job_posted, application_update, etc) to `User`. `placementreports` save static computed metrics like `avgPackage` and `totalPlaced` for historical analysis.

---

## 5. AUTHENTICATION & AUTHORIZATION

**Mechanism:** JWT Authentication mapped to HttpOnly Cookies. The backend reads authorization directly from request cookies rather than authorization headers to prevent client-side script cross-site scripting (XSS) leaks.
**Token Structure:** While omitted in direct schema files, the standard Express structure is issuing payloads involving `{ id: user._id, role: user.role }`.
**Refresh Strategy:** Explicit explicit expiration logic set in `.env` (`JWT_EXPIRES_IN=7d`). Refresh rotation is not natively implemented; instead, it relies dynamically on the 7-day extended session.
**Password Hashing:** `bcryptjs` is implemented directly via `userSchema.pre('save')` middleware triggering a 12-round salt.
**Role-Based Access Control (RBAC):**

| Feature | Admin | Company | Student | Unauthenticated |
| :--- | :--- | :--- | :--- | :--- |
| **View Jobs** | FULL (All) | ALL OWNED | ELIGIBLE ONLY | PUBLIC STATS ONLY |
| **Manage Profiles** | OVERRIDE / SUSPEND | OWNED ONLY | OWNED ONLY | N/A |
| **Application Process**| VIEW ONLY | SHORTLIST / ADVANCE | APPLY / WITHDRAW | N/A |
| **Approve Companies**| ENABLE `IsApproved`| WAIT QUEUE | N/A | N/A |
| **Interviews Data** | FULL GLOBAL | SCHEDULE / GRADE | VIEW TIMESLOTS | N/A |

---

## 6. BUSINESS LOGIC & WORKFLOWS

**Workflow 1: Student Registration & Eligibility Check**
1. User provides signup details as `student`. Email OTP dispatched via NodeMailer.
2. User submits `/verify-otp`. System activates `User` schema and initializes empty `Student` schema.
3. User completes extensive form, submits CGPA, Branch, resumes.
4. Admin reviews physical documents/logs, flips `academicVerified: true` explicitly. Student can now confidently apply for strict filters.

**Workflow 2: Company Verification & Drive Creation**
1. Company registers. Default state is `isApproved: false`.
2. Admin reviews company authenticity in `ManageCompanies` module and approves.
3. Company accesses `PostJob`. Defines `minCGPA` and `maxBacklogs`.
4. System automatically sends notification triggers `"job_posted"` to all students whose profiles fall within branch/CGPA parameters.

**Workflow 3: End-to-End Recruitment Cycle**
1. Student hits `/apply/:jobId`. Backend checks compound index uniqueness. Generates `Application` setting status `applied`.
2. Company views `/applicants`. Reads `resumeUrl`. Opts to advance. Status -> `shortlisted`.
3. Company schedules an interview round in `/rounds`. `Interview` record created mapping to `Application`. Notification fired to student.
4. Interview occurs. Company submits `/result` (pass).
5. Subsequent rounds may be scheduled. If final round, Application moves to `selected`.
6. Student is automatically mapped in global `PlacementReport` calculations. `Student.placementStatus` -> `placed`. 

---

## 7. THIRD-PARTY INTEGRATIONS & SERVICES

*   **Email Communication:** `Nodemailer`. Utilizes generic SMTP configured primarily for Gmail App Passwords (`EMAIL_USER`, `EMAIL_PASS`). Used for strict Verification OTP and Password Resets.
*   **File Uploads:** Handled completely locally via `multer` memory storage. Processed iteratively by the `file-type` native library magic bytes validation (`application/pdf`) and eventually buffered into the root server's `./uploads/resumes/` folder.
*   **Data Visualization:** Custom React charts leveraging `recharts` on the administrative frontend.
*   **Env Variables:**
    ```env
    PORT, NODE_ENV, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, 
    EMAIL_USER, EMAIL_PASS, CLIENT_URL, VITE_API_URL
    ```

---

## 8. FOLDER STRUCTURE
```
e:\PMSv2\
├── .env / .env.example       # Process Environment Configs
├── package.json              # Global build scripts
├── client/                   # Frontend React App (Vite Base)
│   ├── src/
│   │   ├── components/       # Highly classified logic (admin, auth, company, common, student)
│   │   ├── pages/            # Public / high-level routables (LandingPage, NotFound)
│   │   ├── context/          # Auth Context global providers
│   │   ├── data/             # Config arrays/Lists
│   │   ├── services/         # api.js Axios configuration with 401 interceptors
│   │   └── App.jsx           # Global Router logic containing <ProtectedRoute>
│   └── vite.config.js / tailwind.config.js
├── server/                   # Backend Node API
│   ├── config/               # Database connect script
│   ├── controllers/          # Express route handler logic blocks
│   ├── middleware/           # auth (protect/authorize), limits, upload logic
│   ├── models/               # Mongoose ORM Schemas (User, Student, Job, Iterations)
│   ├── routes/               # Modular Express endpoint definitions
│   ├── services/             # Helper libs (emailService, otpService)
│   ├── utils/                # Hardcoded constants, api formatters
│   └── server.js             # API Bootstrapper & middleware injection
└── uploads/                  # Extruded dynamic storage folder
```

---

## 9. SECURITY & VALIDATION

*   **Input Sanitization:** Uses `express-mongo-sanitize` universally to block query selector injection (turning `$` into safe characters). 
*   **XSS Protection:** Enforced by universal deployment of `helmet()` and `xss-clean` middleware directly in `server.js`.
*   **Validation:** Handled rigidly on route layers taking advantage of array-based checks natively from `express-validator`.
*   **Rate Limiting:** Distinct customized rate limiters defined locally (`authLimiter`, `otpLimiter`, `resendOTPLimiter`) preventing enumeration or brute-force OTP spamming.
*   **Upload Safety:** Rejects falsified extensions by verifying binary mapping headers specifically via `"file-type"`. Restricts limit to `5MB` directly in chunk stream prior to saving.

---

## 10. KNOWN ISSUES, TODOS & IMPROVEMENT SUGGESTIONS

*   **Scalability Issue (Storage):** Saving resumes locally inside `/uploads/resumes/` binds the server locally. For robust cloud hosting (Vercel, AWS), this will cause data deletion on server rewrites. **Improvement:** Migrate to AWS S3, Cloudinary, or Firebase Storage.
*   **Socket.IO Missing:** The notification structures are present but rely strictly on static fetching behaviors. **Improvement:** Implement Websocket infrastructure (Socket.io) to push interview schedules explicitly in real-time.
*   **Performance Bottlenecks:** Placement summary generation leverages some intense MongoDB aggregation that is largely unoptimized. If user counts scale high (10k+), this unindexed processing might drop main threads.
*   **Missing Features:** Bulk email sending capability for Admin/TPO, and lack of OAuth (Google/LinkedIn log-in parameters). Advanced features like auto-verifying resumes via OCR.
*   **Testing:** Codebase lacks explicit directories for `.test` or `.spec` methodologies. E2E pipeline (Cypress) or general unit logic checks (Jest) are recommended strongly based on application severity.

---

## EXECUTIVE SUMMARY
If someone had 5 minutes to understand this entire project, they would need to know:
**The Placement Management System (PMS) is a rigid, role-separated MERN-stack application intended exclusively for colleges/universities.** It runs on a local monolithic infrastructure where data safety takes high priority via `HttpOnly` JWT cookie management, file upload "magic byte" validation, and explicit admin-triggered verification gates. The core cycle rotates completely around generating strict "User" profiles (Student vs Company), enabling companies to query specifically qualified individuals according to un-forgeable academic records. Admin functionality anchors the security, having full visibility over the ecosystem logic. It's robust on structure and validations, but currently requires physical/local file infrastructure or migration mapping for deployments.
