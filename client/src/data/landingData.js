// ─── STATIC TOP RECRUITERS ─────────────────────────────────────────────────
// To add a new static company, add a new entry with name, package, hired.
// Logos are fetched dynamically via Logo.dev API using the company name.
// Template:
//   { name: "COMPANY", package: "X LPA", hired: N, isStatic: true },
// ────────────────────────────────────────────────────────────────────────────
export const topRecruiters = [
  { name: "Google", package: "45 LPA", hired: 12, isStatic: true },
  { name: "Microsoft", package: "42 LPA", hired: 8, isStatic: true },
  { name: "Amazon", package: "38 LPA", hired: 15, isStatic: true },
  { name: "Infosys", package: "8 LPA", hired: 10, isStatic: true },
  { name: "TCS", package: "7 LPA", hired: 8, isStatic: true },
  { name: "Wipro", package: "6.5 LPA", hired: 18, isStatic: true },
  { name: "Accenture", package: "9 LPA", hired: 13, isStatic: true },
  { name: "Deloitte", package: "12 LPA", hired: 16, isStatic: true },
  { name: "Cognizant", package: "7 LPA", hired: 8, isStatic: true },
  { name: "IBM", package: "15 LPA", hired: 18, isStatic: true },
  { name: "Adobe", package: "35 LPA", hired: 6, isStatic: true },
  { name: "Flipkart", package: "28 LPA", hired: 10, isStatic: true },
  { name: "CasePoint", package: "3 LPA", hired: 10, isStatic: true },
  { name: "Zignuts", package: "4 LPA", hired: 10, isStatic: true },
  { name: "Vivansh Infotech", package: "28 LPA", hired: 10, isStatic: true },
];

export const testimonials = [
  {
    id: 1,
    name: "Rahul Sharma",
    role: "Software Engineer at Google",
    batch: "2024",
    branch: "CSE",
    package: "45 LPA",
    avatar: "R",
    color: "from-blue-500 to-indigo-600",
    quote: "PMS made the entire placement process seamless. I got interview calls from 5 top companies and landed my dream job at Google!"
  },
  {
    id: 2,
    name: "Priya Patel",
    role: "Data Analyst at Amazon",
    batch: "2024",
    branch: "IT",
    package: "32 LPA",
    avatar: "P",
    color: "from-purple-500 to-pink-500",
    quote: "The skill matching feature is brilliant. It showed me exactly which jobs I was best suited for. Got placed in 3 weeks!"
  },
  {
    id: 3,
    name: "Arjun Mehta",
    role: "DevOps Engineer at Microsoft",
    batch: "2023",
    branch: "ECE",
    package: "38 LPA",
    avatar: "A",
    color: "from-emerald-500 to-teal-500",
    quote: "The interview scheduling system is fantastic. Real-time notifications kept me updated at every step of the process."
  },
  {
    id: 4,
    name: "Sneha Joshi",
    role: "Product Manager at Flipkart",
    batch: "2024",
    branch: "CSE",
    package: "28 LPA",
    avatar: "S",
    color: "from-orange-500 to-red-500",
    quote: "I loved how transparent the whole process was. I could track my application status in real-time. Highly recommend!"
  },
];

export const placementStats = [
  { label: "Placement Rate", value: "94%", icon: "trending-up", color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Average Package", value: "12 LPA", icon: "indian-rupee", color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "Highest Package", value: "45 LPA", icon: "trophy", color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Companies Visited", value: "50+", icon: "building-2", color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Students Placed", value: "500+", icon: "users", color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Offers This Year", value: "620+", icon: "file-check", color: "text-rose-600", bg: "bg-rose-50" },
];

export const howItWorks = [
  {
    step: "01",
    title: "Create your profile",
    description: "Register and build your complete academic and professional profile with skills, projects, and resume.",
    icon: "user-plus",
    color: "bg-indigo-600"
  },
  {
    step: "02",
    title: "Get verified",
    description: "Your placement officer verifies your academic records, making you eligible for top company drives.",
    icon: "shield-check",
    color: "bg-purple-600"
  },
  {
    step: "03",
    title: "Browse matched jobs",
    description: "Our smart algorithm shows you jobs perfectly matched to your CGPA, skills, and branch automatically.",
    icon: "search",
    color: "bg-emerald-600"
  },
  {
    step: "04",
    title: "Apply and track",
    description: "Apply with one click and track your application status in real-time from applied to offer letter.",
    icon: "rocket",
    color: "bg-amber-600"
  },
];

export const features = [
  {
    title: "Smart Job Matching",
    description: "Our algorithm automatically filters jobs based on your CGPA, branch, skills, and backlog status.",
    icon: "zap",
    color: "bg-indigo-50 text-indigo-600",
    highlight: "Saves hours of manual searching"
  },
  {
    title: "Academic Verification",
    description: "Secure admin-verified academic records prevent fraudulent applications and ensure fair opportunities.",
    icon: "shield-check",
    color: "bg-emerald-50 text-emerald-600",
    highlight: "Fraud-proof system"
  },
  {
    title: "Real-time Tracking",
    description: "Track every application from submitted to offer letter with instant notifications at each stage.",
    icon: "activity",
    color: "bg-purple-50 text-purple-600",
    highlight: "Never miss an update"
  },
  {
    title: "Placement Reports",
    description: "Detailed analytics and reports for placement officers with branch-wise and year-wise breakdowns.",
    icon: "bar-chart-2",
    color: "bg-amber-50 text-amber-600",
    highlight: "Data-driven insights"
  },
  {
    title: "Interview Scheduling",
    description: "Companies can schedule interview rounds directly. Students get notified instantly with all details.",
    icon: "calendar",
    color: "bg-rose-50 text-rose-600",
    highlight: "Seamless coordination"
  },
  {
    title: "Skill-based Sorting",
    description: "Jobs with strong skill matches appear at the top of your feed. Know your fit before you apply.",
    icon: "target",
    color: "bg-teal-50 text-teal-600",
    highlight: "Apply smarter"
  },
];
