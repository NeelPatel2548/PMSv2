# PMS System Audit & Roadmap Report

## PHASE 2 — CURRENT STATE REPORT

### SECTION 1: System snapshot

**Current tech stack (confirmed from package.json):**
- Frontend: `react` ^18.2.0, `vite` ^5.1.0, `react-router-dom` ^6.22.0, `tailwindcss` ^3.4.1, `framer-motion` ^11.0.3, `recharts` ^2.12.0
- Backend: `node.js` (Express `^4.18.2`),  `mongoose` `^8.1.1`
- Cloud services: Cloudinary (`cloudinary` `^1.41.3`, `multer-storage-cloudinary` `^4.0.0`). Folders: `pms-resumes`, `pms-profile-pictures`, `pms-company-logos`
- Auth: JWT (`jsonwebtoken` `^9.0.2`), `bcryptjs` `^2.4.3`, 6-digit OTP via Email (`nodemailer` `^6.9.8`). Cookies parser (`cookie-parser` `^1.4.6`).

**User roles and exact capabilities:**

**Student:**
- View Dashboard Stats: `GET /api/student/dashboard`
- View & Update Profile: `GET /api/student/profile`, `PUT /api/student/profile`
- Upload Profile Picture (Cloudinary): `POST /api/student/profile/picture`
- Upload Resume (Cloudinary): `POST /api/student/resume`
- View Eligible Jobs (Filtered by branch, CGPA, backlogs): `GET /api/student/jobs`
- Apply to Job: `POST /api/student/apply/:jobId`
- Track Applications: `GET /api/student/applications`
- Withdraw Application: `PUT /api/student/applications/:id/withdraw`
- View Interview Schedule: `GET /api/student/interviews`
- Read/Manage Notifications: `GET /api/notifications`

**Company:**
- View Dashboard Stats: `GET /api/company/dashboard`
- View & Update Profile: `GET /api/company/profile`, `PUT /api/company/profile`
- Upload Logo (Cloudinary): `POST /api/company/profile/logo`
- Create New Job: `POST /api/company/jobs`
- View Own Jobs & Details: `GET /api/company/jobs`, `GET /api/company/jobs/:id`
- Edit Job details: `PUT /api/company/jobs/:id`
- Toggle Job Status (Open/Close): `PATCH /api/company/jobs/:id/status`
- View Job Applicants: `GET /api/company/jobs/:id/applicants`
- Update Applicant Status (Shortlist, Select, Reject): `PUT /api/company/applications/:id/status`
- Schedule Interviews: `POST /api/company/interviews`
- Submit Round Results: `PUT /api/company/interviews/:id/result`
- Read/Manage Notifications: `GET /api/notifications`

**Admin (TPO):**
- View Platform Dashboard Stats: `GET /api/admin/dashboard`
- View Students Database: `GET /api/admin/students`, `GET /api/admin/students/:id`
- Override Student Academics: `PUT /api/admin/students/:id/academic`
- Verify Student Academics: `PUT /api/admin/students/:id/verify-academic`
- View Companies Database: `GET /api/admin/companies`, `GET /api/admin/companies/:id`
- Update Company Details: `PUT /api/admin/companies/:id`
- Approve/Reject Company: `PUT /api/admin/companies/:id/approve`
- View All Jobs & Edit: `GET /api/admin/jobs`, `PUT /api/admin/jobs/:id`
- Manage Users (Suspend/Delete): `PUT /api/admin/users/:id/status`, `DELETE /api/admin/users/:id`
- Broadcast Global Announcements: `POST /api/admin/announcements`
- Generate & View Placement Reports: `POST /api/admin/reports`, `GET /api/admin/reports`
- Read/Manage Notifications: `GET /api/notifications`

**Public (unauthenticated):**
- Auth Flows: `POST /api/auth/register`, `POST /api/auth/verify-otp`, `POST /api/auth/login`, `POST /api/auth/login/verify`, `POST /api/auth/resend-otp`
- Password Recovery: `POST /api/auth/forgot-password`, `POST /api/auth/verify-reset-otp`, `POST /api/auth/reset-password`
- Platform Analytics: `GET /api/public/stats`
- View Approved Companies: `GET /api/public/companies`
- View Open Jobs: `GET /api/public/jobs`
- View Valid Skills: `GET /api/public/skills`

---

### SECTION 2: Complete data model map

**1. users**
- **Fields:** `name` (String, Req), `email` (String, Req, Unique), `password` (String, Req, Selected: false), `role` (Enum: student, company, admin), `isVerified`, `isActive`, `profileCompleted` (Boolean), `profileImageUrl`, `otp`, `otpExpiry`, `otpAttempts`, `otpVerifiedForReset`
- **Indexes:** `{ email: 1 }` (unique), `{ role: 1, isActive: 1 }`
- **Missing Logically:** Last login timestamp for security tracking.

**2. students**
- **Fields:** `user` (ObjectId ref User, Unique, Req), `enrollmentNo` (String, Sparse Unique), `branch`, `gender` (Enum), `phone`, `dob`, `address`, `passingYear`, `currentSemester`, `tenthPercentage`, `twelfthPercentage`, `cgpa`, `activeBacklogs` (Numbers/Dates), `skills` (Array), `projects`, `certifications` (Sub-docs), `internshipExperience`, `linkedin`, `github`, `resumeUrl`, `placementStatus` (Enum: placed, unplaced), `placedIn` (ObjectId ref Company), `academicVerified`, `academicVerifiedBy`, `academicVerifiedAt`, `profilePicture` (url, publicId).
- **Indexes:** `{ user: 1 }` (unique), `{ enrollmentNo: 1 }` (unique, sparse), `{ cgpa: 1, branch: 1, activeBacklogs: 1 }`, `{ placementStatus: 1 }`, `{ academicVerified: 1 }`, `{ passingYear: 1 }`
- **Missing Logically:** "Placement Rules Override" flag (e.g. allowing multiple offers if package is >X multiplier).

**3. companies**
- **Fields:** `user` (ObjectId ref User, Unique, Req), `name` (String, Req), `industry`, `location`, `website`, `description`, `hrName`, `hrEmail`, `hrPhone`, `tier` (Enum), `isApproved`, `isActive` (Boolean), `logo` (url, publicId).
- **Indexes:** `{ user: 1 }` (unique), `{ isApproved: 1 }`, `{ tier: 1 }`
- **Missing Logically:** "Blacklist" flag with reason. Registration limits per year.

**4. jobs**
- **Fields:** `company` (ObjectId ref Company, Req), `title` (Req), `description`, `requiredSkills` (Array), `package`, `jobType`, `stipend`, `bondPeriod`, `location`, `minCGPA`, `maxBacklogs`, `eligibleBranches`, `openings`, `deadline`, `status` (Enum: open, closed, draft).
- **Indexes:** `{ company: 1 }`, `{ status: 1, minCGPA: 1 }`, `{ eligibleBranches: 1 }`, `{ jobType: 1 }`, `{ createdAt: -1 }`, `{ deadline: 1 }`
- **Missing Logically:** Assessment links, "Hide Salary" option, explicit interview mode definition at job-level.

**5. applications**
- **Fields:** `student` (ObjectId ref Student), `job` (ObjectId ref Job), `company` (ObjectId ref Company), `resumeUrl`, `status` (Enum: applied, shortlisted, interview, selected, rejected, withdrawn), `currentRound`, `remarks`, `offerLetterUrl`, `offeredPackage`, `offerStatus` (Enum: pending, accepted, declined, revoked).
- **Indexes:** `{ student: 1, job: 1 }` (unique), `{ job: 1, status: 1 }`, `{ student: 1, status: 1 }`, `{ company: 1 }`
- **Missing Logically:** Automatic timestamps for every status transition (e.g., date_shortlisted, date_rejected).

**6. interviews**
- **Fields:** `application`, `student`, `company`, `job` (ObjectIds), `roundName`, `roundNumber`, `scheduledAt`, `mode` (Enum: online, offline), `venue`, `meetingLink`, `status` (Enum: scheduled, completed, cancelled), `result` (Enum: pass, fail, pending), `feedback`.
- **Indexes:** `{ application: 1 }`, `{ student: 1 }`, `{ company: 1 }`, `{ scheduledAt: 1 }`
- **Missing Logically:** Interviewer Name / Assessor Contact details. Candidate confirmation flag (RSVP).

**7. notifications**
- **Fields:** `user` (ObjectId ref User), `title`, `message`, `type` (Enum), `isRead`, `link`.
- **Indexes:** `{ user: 1, isRead: 1 }`, `{ user: 1, createdAt: -1 }`, `{ createdAt: 1 }` (TTL 90 days)
- **Missing Logically:** Bulk classification (e.g. global alert vs localized alert) to reduce DB duplication.

**8. placementreports**
- **Fields:** `academicYear`, `branch`, `totalStudents`, `totalPlaced`, `totalApplications`, `avgPackage`, `maxPackage`, `branchWiseStats` (Sub-doc array), `generatedBy` (ObjectId ref User).
- **Indexes:** None explicitly configured.
- **Missing Logically:** Export-ready formats storage url (e.g. PDF link generated via CRON).

---

### SECTION 3: Complete API surface

**Auth Module**
- POST ` /api/auth/register` (Public) - Register new account. Returns success msg.
- POST ` /api/auth/verify-otp` (Public) - Verify OTP and generate User/Role doc. Returns success.
- POST ` /api/auth/login` (Public) - First step login (pw check). Returns requiresVerification/requiresOTP boolean.
- POST ` /api/auth/login/verify` (Public) - Finalizes login. Sets JWT cookie. Returns User object.
- POST ` /api/auth/logout` (Auth) - Clears JWT cookie.
- POST ` /api/auth/resend-otp` (Public) - Triggers email service.
- POST ` /api/auth/forgot-password` (Public) - Initiates reset.
- POST ` /api/auth/verify-reset-otp` (Public) - Validates reset OTP.
- POST ` /api/auth/reset-password` (Public) - Changes password internally.
- GET  ` /api/auth/me` (Auth) - Resolves current user info from HttpOnly cookie.

**Student Module**
- GET  ` /api/student/dashboard` (Student) - Stats, upcoming interviews, score.
- GET  ` /api/student/profile` (Student) - Returns populated student data.
- PUT  ` /api/student/profile` (Student) - Updates text/array fields.
- POST ` /api/student/profile/picture` (Student) - Multer Cloudinary photo upload. returns ImageURL.
- POST ` /api/student/resume` (Student) - Multer Cloudinary PDF upload.
- GET  ` /api/student/jobs` (Student) - List jobs with `matchScore` calculations overriding branches.
- POST ` /api/student/apply/:jobId` (Student) - Creates Application.
- GET  ` /api/student/applications` (Student) - List applications.
- PUT  ` /api/student/applications/:id/withdraw` (Student) - Sets status to withdrawn.
- GET  ` /api/student/interviews` (Student) - List interview schedule.

**Company Module**
- GET  ` /api/company/dashboard` (Company) - Recruiter aggregate job views.
- GET  ` /api/company/profile` (Company) - Read company.
- PUT  ` /api/company/profile` (Company) - Mutate details.
- POST ` /api/company/profile/logo` (Company) - Multer Cloudinary photo upload.
- POST ` /api/company/jobs` (Company) - Post a drive.
- GET  ` /api/company/jobs` (Company) - List own drives.
- GET  ` /api/company/jobs/:id` (Company) - Drive details with apply counts.
- PUT  ` /api/company/jobs/:id` (Company) - Edit job (excl status).
- PATCH `/api/company/jobs/:id/status` (Company) - Toggles job Open/Close; bulk rejects if Closed.
- GET  ` /api/company/jobs/:id/applicants` (Company) - Paginated table data.
- PUT  ` /api/company/applications/:id/status` (Company) - Transitions `status` flow.
- POST ` /api/company/interviews` (Company) - Provisions interview.
- PUT  ` /api/company/interviews/:id/result` (Company) - Pass/Fail endpoint.

**Admin Module**
- GET  ` /api/admin/dashboard` (Admin) - Global overarching queries.
- GET  ` /api/admin/students` (Admin) - Paginated aggregated student lists.
- GET  ` /api/admin/students/:id` (Admin) - Single student inspect.
- PUT  ` /api/admin/students/:id/academic` (Admin) - Forceful edit and verification reset.
- PUT  ` /api/admin/students/:id/verify-academic` (Admin) - Flip verify boolean.
- GET  ` /api/admin/companies` (Admin) - TPO company lookup.
- GET  ` /api/admin/companies/:id` (Admin) - Inspect company.
- PUT  ` /api/admin/companies/:id` (Admin) - Forceful edit.
- PUT  ` /api/admin/companies/:id/approve` (Admin) - Triggers verify status.
- GET  ` /api/admin/jobs` (Admin) - Global job lists.
- PUT  ` /api/admin/jobs/:id` (Admin) - Global job edits.
- DELETE `/api/admin/users/:id` (Admin) - Aggressive cascade delete tool.
- PUT  ` /api/admin/users/:id/status` (Admin) - Suspend/Activate tool.
- POST ` /api/admin/announcements` (Admin) - Broadcast utility.
- POST ` /api/admin/reports` (Admin) - Compute year snapshot.
- GET  ` /api/admin/reports` (Admin) - View historical maps.

**Notification/Public Modules**
- GET  ` /api/notifications` (Any Auth) - List array.
- GET  ` /api/notifications/unread-count` (Any Auth) - Badge API limit.
- PUT  ` /api/notifications/read-all` (Any Auth) - Mark all true.
- PUT  ` /api/notifications/:id/read` (Any Auth) - Mark specific.
- DELETE `/api/notifications/:id` (Any Auth) - Drop.
- GET  ` /api/public/stats` (Public) - Summary payload.
- GET  ` /api/public/companies` (Public) - `limit 20` top tiers.
- GET  ` /api/public/jobs` (Public) - Unexpired active jobs.
- GET  ` /api/public/skills` (Public) - Retrieves hardcoded list.

---

### SECTION 4: Frontend screen inventory

**Public Context:**
- `/` -> `LandingPage.jsx` (Fetches public stats, jobs, companies)
- `/login` -> `Login.jsx` (Auth)
- `/register` -> `Register.jsx` (Auth + role context)
- `/verify-otp` -> `VerifyOTP.jsx` (Auth)

**Student Context:**
- `/student/dashboard` -> `StudentDashboard.jsx` (Fetches student/dashboard API)
- `/student/profile` -> `StudentProfile.jsx` (Fetches `student/profile`, can upload resume/PFP)
- `/student/jobs` -> `JobList.jsx` + `JobCard.jsx` (Fetches eligible jobs)
- `/student/applications` -> `ApplicationTracker.jsx` (Tracks lifecycle statuses)
- `/student/interviews` -> `InterviewSchedule.jsx` (Fetches timeslots)

**Company Context:**
- `/company/dashboard` -> `CompanyDashboard.jsx`
- `/company/profile` -> `CompanyProfile.jsx`
- `/company/post-job` -> `PostJob.jsx`
- `/company/jobs` -> `CompanyJobList.jsx`
- `/company/jobs/:id` -> `JobDetails.jsx`
- `/company/jobs/:id/edit` -> `EditJob.jsx`
- `/company/jobs/:id/applicants` -> `ApplicantList.jsx` (Fetches applicants with pagination)
- `/company/jobs/:id/rounds` -> `RoundManager.jsx` (Schedules/Grades)

**Admin Context:**
- `/admin/dashboard` -> `AdminDashboard.jsx`
- `/admin/students` -> `ManageStudents.jsx` (Overrides, Verifications)
- `/admin/companies` -> `ManageCompanies.jsx`
- `/admin/companies/:id` -> `AdminCompanyView.jsx`
- `/admin/jobs` -> `ManageJobs.jsx` 
- `/admin/reports` -> `PlacementReports.jsx` (Recharts integration)

---

### SECTION 5: What is FULLY working right now

1. **End-to-End Auth Pipeline:** Registration -> OTP email flow -> Role assignment -> Secure verification -> Login OTP -> HttpOnly Cookie JWT attachment + Role-Based Context routing.
2. **Cloudinary Asset Uploads:** Both `multer-storage-cloudinary` implementations for Resume PDFs, Profile Headshots, and Company Logos execute flawlessly over API and reflect successfully.
3. **Application Lifecycle Tracking:** Students can apply -> Application enforces DB Unique Indexes constraints (anti-spam) -> Company can retrieve paginated candidate views -> Update status directly -> Reflected back in Student's `ApplicationTracker` with proper notifications synced to User DB.
4. **Environment Initialization Safety:** `validateEnv.js` immediately protects against absent deployment variables by halting the Express process before Database initialization.
5. **CORS Hardening:** Production domain locking is strictly enforced out-of-the-box (`process.env.CLIENT_URL`).

---

### SECTION 6: What is PARTIALLY working or BROKEN

- **Feature:** User Cascade Delete (`DELETE /api/admin/users/:id`).
  - **What works:** Successfully drops relational MongoDB documents (Applications, Jobs, Interviews, Notifications). Successfully purges Cloudinary arrays via explicit API calls utilizing stored `publicId`s.
  - **What is broken/clunky:** Line 411 in `adminController.js` retains legacy synchronous local filesystem deletion fallback referencing `__dirname, '..', '..', student.resumeUrl`. Since we migrated to pure Cloudinary paths (HTTPS), this triggers an isolated local exception trap. It's enclosed in a try/catch, so it doesn't crash the server, but it creates unnecessary IO blocks and warning traces.

---

### SECTION 7: What is MISSING but has DB/API foundation

1. **Email Templates API (Missing UI):** The backend utilizes `sendOTPEmail` reliably, but `adminController` generic "Announcements" trigger strictly in-app notifications. TPOs typically expect system-wide blast features to push native `.html` layouts.
2. **Real-time Engine (Missing Infra):** The entire React UI polls or reacts conditionally upon refreshing (e.g., Badge count limits on Notifications). The database models `Notification.js` extensively support timestamping and fast retrieval queues, but there is zero active `Socket.IO` web-socket connectivity currently bridging server > client updates.

---

### SECTION 8: Current security posture

- [x] **JWT HttpOnly cookie** — Confirmed in `server/middleware/authMiddleware.js:77`.
- [x] **bcrypt rounds** — Confirmed as `12` rounds in `User.js:83` & `authController.js:58`.
- [x] **CORS origin** — Confirmed as locked to `process.env.CLIENT_URL` in `server.js:46`.
- [x] **Rate limiting** — Confirmed applied aggressively on auth routes via `server/middleware/rateLimiter.js`.
- [x] **Input sanitization** — Confirmed `express-mongo-sanitize` invoked at `server.js:54`.
- [x] **File upload validation** — Confirmed MIME mapping arrays + magic bytes for PDFs/Images, alongside explicit limits (5MB and 2MB) in `upload.js:37,78,117`.
- [x] **Helmet** — Confirmed activated globally in `server.js:43`.
- [x] **XSS clean** — Confirmed activated globally in `server.js:55`.
- [x] **BYPASS_OTP** — Confirmed safely restricted to non-production environments logically at `authController.js:14-16` using explicit `process.env.NODE_ENV !== 'production'`.

---

### SECTION 9: Performance bottlenecks confirmed

- **N+1 Operations (Company Post-Job Notification Trigger):** `companyController.js` fires an aggregate `Job Post` notification to eligible students. It loops `students.map()` to generate `insertMany` arrays. Currently fine, but scanning the entire candidate pool (10K+ records) linearly using nested OR queries causes minor indexing strains.
- **Unoptimized Analytics queries (Admin Report Generators):** `adminController.js:555` uses Javascript `Promise.all` `.map()` array blocks executing separate independent integer counts per branch across `placed` constraints, rather than offloading to native MongoDB `$group` aggregation pipelines.
- **Client Cache Missing:** Redis isn't connected. Endpoints like `GET /api/public/companies` pull DB arrays redundantly on every single Landing Page hit across all sessions.

---

### SECTION 10: Code quality observations

- **Monolithic Controllers:** `authController.js` sits at 619 lines. `studentController.js` and `companyController.js` are hovering around 600. File boundaries should be split into `authController/login.js`, `authController/register.js`, etc.
- **Robust Exception Capturing:** Almost every single block of logic perfectly honors asynchronous wrapping and returns a structured, predictable `{ success, message, data }` format via utility maps. Top tier implementation in `utils/apiResponse.js`.
- **Duplicate Logic Validation:** Both `Student` and `Company` updates redundantly trigger `profileCompleted` verifications internally inside controllers, rather than wrapping that as a Mongoose pre-save observer.

---

## PHASE 3 — FEATURE GAP ANALYSIS

### A. Student experience improvements

**1. Offer Comparison/Selector Interface**
- **Category:** Student UX
- **Priority:** High
- **Effort:** 6 hours
- **Why it matters:** Competent students generating multiple selections natively can't formally "Decline" cross-offers. They are trapped in `selected` purgatory infinitely.
- **What already exists:** `Application` model has `offerStatus` enum (pending, accepted, declined).
- **What needs to be built:** Create `PUT /api/student/applications/:id/offer` to update status, and build actionable "Accept / Decline" UI buttons within the student tracker modal.

**2. Visual Resume Builder Toolkit**
- **Category:** Student UX
- **Priority:** Low
- **Effort:** 24 hours
- **Why it matters:** TPOs hate mismatched resume formats. Students struggle with standard aesthetics.
- **What already exists:** Highly detailed `Student` model capturing all identical academic/project references.
- **What needs to be built:** Implement `jspdf` / `react-pdf` on frontend, fetching the profile JSON mapped into a sleek predetermined template export.

### B. Company recruiter experience

**1. Bulk Decision Extractor (Applicant CSV Export)**
- **Category:** Admin Tools
- **Priority:** Critical
- **Effort:** 5 hours
- **Why it matters:** HRs utilize Excel universally. Paginating 500 applicants on a webpage is restrictive.
- **What already exists:** `companyController.getApplicants` fetches all related populated Data.
- **What needs to be built:** Add a `GET /api/company/jobs/:id/export` route utilizing `json2csv` emitting raw file attachments directly to browser.

**2. Custom Application Questions (Screener Logic)**
- **Category:** Company UX
- **Priority:** Medium
- **Effort:** 16 hours
- **Why it matters:** Companies need short-answers to assess capability out of the box (e.g. "Do you have 6mo MERN experience?").
- **What already exists:** `jobs` schema exists independently.
- **What needs to be built:** Amend `jobs` schema arrays with custom Question objects. Amend `Application` arrays integrating Answer payloads. Adapt forms across `PostJob` and `ApplicantList`.

### C. Admin / TPO tools

**1. Bulk Eligibility Rules Engine (Admin Job Override)**
- **Category:** Admin Tools
- **Priority:** High
- **Effort:** 18 hours
- **Why it matters:** Currently, TPOs can't programmatically ban placed Tier 2 students from applying to mass recruiters.
- **What already exists:** Application API checks validation constraints inside controllers.
- **What needs to be built:** Extract rules logic into a centralized `SystemSettings` singleton model where Admin can globally toggle "One Application Per Student" or "Tier Restrictions". Admin UI settings page.

**2. Company Relationship CRM Pipeline**
- **Category:** System Infrastructure
- **Priority:** Medium
- **Effort:** 20 hours
- **Why it matters:** TPOs must maintain longitudinal contact histories over multiple years. Currently, it's just a passive company roster.
- **What already exists:** `Company` model holds basic HR contact arrays.
- **What needs to be built:** New `Interactions` log schema. New Notes tab on the Admin Company Details viewer bridging contact timestamps.

### D. Communication & notifications

**1. Server-Side Push WebSocket (Socket.IO)**
- **Category:** Communication
- **Priority:** High
- **Effort:** 12 hours
- **Why it matters:** Drive alerts hitting in real-time maximize candidate funnel response dramatically efficiently rather than students pressing F5 on dashboard tabs.
- **What already exists:** `Notification` middleware model captures events consistently.
- **What needs to be built:** Install `socket.io`. Bind it across `server.js` matching user IDs. Modify frontend `AuthContext` to sustain active connectivity listeners and push internal React-Toastify alerts overriding `isRead` counts instantly. 

### E. Analytics & reporting

**1. Unplaced Target List Exports**
- **Category:** Analytics
- **Priority:** Medium
- **Effort:** 8 hours
- **Why it matters:** Management usually demands an audit matrix targeting specific individuals trailing in the placement cycle to offer aggressive coaching.
- **What already exists:** DB correctly flags `placementStatus: 'unplaced'`.
- **What needs to be built:** Custom isolated endpoint within Admin module pushing distinct query CSV arrays restricted by active iterations filtering null placements. 

---

## PHASE 4 — FINAL OUTPUT: PRIORITISED ROADMAP

### Phase A — Quick wins (1-3 days each, high impact)

1. **Offer State Tracking (Accept/Decline)**
   - Effort: 1 day
   - Depends: None
   - Modify: `server/controllers/studentController.js` (add accept path).
   - Create: `client/src/components/student/OfferModal` UI integration.

2. **Applicant List to CSV Extractor**
   - Effort: 2 days
   - Depends: None
   - Modify: `server/routes/companyRoutes.js` (add export path).
   - Modify: `client/src/components/company/ApplicantList.jsx` (Add Download button header).

3. **Admin Unplaced Target Engine**
   - Effort: 1 day
   - Depends: None
   - Modify: `server/controllers/adminController.js`.
   - Modify: `client/src/components/admin/ManageStudents.jsx` (Add "Export Unplaced List").

### Phase B — Core enhancements (1-2 weeks each)

4. **Socket.IO Realtime Push Environment**
   - Effort: 3 days
   - Depends: Phase A completion mapping.
   - Modify: `server.js` (Http attach), `AuthContext.jsx` (Client listeners).
   - Modify: Add dynamic `socket.broadcaster(userId)` throughout `companyController.js` logic paths.

5. **Student Resume PDF Automatic Generator**
   - Effort: 5 days
   - Depends: None
   - Create: `client/src/utils/resumeGenerator.js` utilizing `jspdf`.
   - Modify: `client/src/components/student/StudentProfile.jsx`.

6. **TPO Global Override Configuration Panel**
   - Effort: 5 days
   - Depends: None
   - Create: `server/models/SystemSettings.js` schema. 
   - Modify: `server/controllers/studentController.js` (Wrap `applyToJob` inside global validation fetches).
   - Modify: `client/src/components/admin/AdminDashboard.jsx` (Add Settings Tab module).

### Phase C — Advanced features (2-4 weeks each)

7. **Custom Screening Questions Engine Strategy**
   - Effort: 10 days
   - Depends: Phase B (specifically Realtime connections).
   - Modify: Core `Job` and `Application` schemas in backend.
   - Create: Advanced dynamic form components across multiple Company and Student Views in React accommodating mixed data types (Input, Textarea, Multiple Choice) seamlessly rendering recursively across distinct database documents.

8. **Redis Cache Layer Attachment**
   - Effort: 5 days
   - Depends: Pure infrastructure iteration.
   - Modify: Enhance caching inside `server/controllers/publicController.js` specifically surrounding `/public/stats` and `/public/companies` minimizing MongoDB active reads exponentially optimizing frontend metric mapping logic.
