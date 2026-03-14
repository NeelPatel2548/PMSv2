import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loader from './components/common/Loader';

// Auth pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyOTP from './components/auth/VerifyOTP';

// Student pages
import StudentDashboard from './components/student/StudentDashboard';
import StudentProfile from './components/student/StudentProfile';
import JobList from './components/student/JobList';
import ApplicationTracker from './components/student/ApplicationTracker';
import InterviewSchedule from './components/student/InterviewSchedule';

// Company pages
import CompanyDashboard from './components/company/CompanyDashboard';
import CompanyProfile from './components/company/CompanyProfile';
import PostJob from './components/company/PostJob';
import JobDetails from './components/company/JobDetails';
import EditJob from './components/company/EditJob';
import ApplicantList from './components/company/ApplicantList';
import RoundManager from './components/company/RoundManager';

// Admin pages
import AdminDashboard from './components/admin/AdminDashboard';
import ManageStudents from './components/admin/ManageStudents';
import ManageCompanies from './components/admin/ManageCompanies';
import ManageJobs from './components/admin/ManageJobs';
import PlacementReports from './components/admin/PlacementReports';

// Public pages
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loader text="Starting PMS..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        <main className={`flex-1 ${isAuthenticated ? 'p-4 sm:p-6 lg:p-8' : ''}`}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Student */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>
            } />
            <Route path="/student/jobs" element={
              <ProtectedRoute allowedRoles={['student']}><JobList /></ProtectedRoute>
            } />
            <Route path="/student/applications" element={
              <ProtectedRoute allowedRoles={['student']}><ApplicationTracker /></ProtectedRoute>
            } />
            <Route path="/student/interviews" element={
              <ProtectedRoute allowedRoles={['student']}><InterviewSchedule /></ProtectedRoute>
            } />

            {/* Company */}
            <Route path="/company/dashboard" element={
              <ProtectedRoute allowedRoles={['company']}><CompanyDashboard /></ProtectedRoute>
            } />
            <Route path="/company/profile" element={
              <ProtectedRoute allowedRoles={['company']}><CompanyProfile /></ProtectedRoute>
            } />
            <Route path="/company/post-job" element={
              <ProtectedRoute allowedRoles={['company']}><PostJob /></ProtectedRoute>
            } />
            <Route path="/company/jobs/:id" element={
              <ProtectedRoute allowedRoles={['company']}><JobDetails /></ProtectedRoute>
            } />
            <Route path="/company/jobs/:id/edit" element={
              <ProtectedRoute allowedRoles={['company']}><EditJob /></ProtectedRoute>
            } />
            <Route path="/company/jobs/:jobId/applicants" element={
              <ProtectedRoute allowedRoles={['company']}><ApplicantList /></ProtectedRoute>
            } />
            <Route path="/company/jobs/:jobId/rounds" element={
              <ProtectedRoute allowedRoles={['company']}><RoundManager /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute allowedRoles={['admin']}><ManageStudents /></ProtectedRoute>
            } />
            <Route path="/admin/companies" element={
              <ProtectedRoute allowedRoles={['admin']}><ManageCompanies /></ProtectedRoute>
            } />
            <Route path="/admin/jobs" element={
              <ProtectedRoute allowedRoles={['admin']}><ManageJobs /></ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin']}><PlacementReports /></ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
