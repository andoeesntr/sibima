
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Page imports
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import VerifySignature from "./pages/VerifySignature";

// Student pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentProfile from "./pages/student/Profile";
import ProposalSubmission from "./pages/student/ProposalSubmission";
import ProposalDetail from "./pages/student/ProposalDetail";
import DigitalSignature from "./pages/student/DigitalSignature";
import Guide from "./pages/student/Guide";
import KpProgress from "./pages/student/KpProgress";
import StudentTimesheet from "./pages/student/Timesheet";

// Coordinator pages
import CoordinatorDashboard from "./pages/coordinator/Dashboard";
import CoordinatorProfile from "./pages/coordinator/Profile";
import ProposalList from "./pages/coordinator/ProposalList";
import ProposalReview from "./pages/coordinator/ProposalReview";
import CoordinatorProposalDetail from "./pages/coordinator/ProposalDetail";
import StudentEvaluation from "./pages/coordinator/StudentEvaluation";
import GuidanceManagement from "./pages/coordinator/GuidanceManagement";
import CoordinatorTimesheetOverview from "./pages/coordinator/TimesheetOverview";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProfile from "./pages/admin/Profile";
import UserManagement from "./pages/admin/UserManagement";
import GuideManagement from "./pages/admin/GuideManagement";
import DigitalSignatureManagement from "./pages/admin/DigitalSignatureManagement";
import KpTimelineManagement from "./pages/admin/KpTimelineManagement";

// Supervisor pages
import SupervisorDashboard from "./pages/supervisor/Dashboard";
import SupervisorProfile from "./pages/supervisor/Profile";
import DigitalSignatureUpload from "./pages/supervisor/DigitalSignatureUpload";
import Feedback from "./pages/supervisor/Feedback";
import KpProgressSupervision from "./pages/supervisor/KpProgressSupervision";
import SupervisorTimesheetOverview from "./pages/supervisor/TimesheetOverview";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Routes>
              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify" element={<VerifySignature />} />

              {/* Student routes */}
              <Route path="/student" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout role="student" />
                </ProtectedRoute>
              }>
                <Route index element={<StudentDashboard />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="proposal-submission" element={<ProposalSubmission />} />
                <Route path="proposal-detail/:id" element={<ProposalDetail />} />
                <Route path="digital-signature" element={<DigitalSignature />} />
                <Route path="guide" element={<Guide />} />
                <Route path="kp-progress" element={<KpProgress />} />
                <Route path="timesheet" element={<StudentTimesheet />} />
              </Route>

              {/* Coordinator routes */}
              <Route path="/coordinator" element={
                <ProtectedRoute allowedRoles={['coordinator']}>
                  <DashboardLayout role="coordinator" />
                </ProtectedRoute>
              }>
                <Route index element={<CoordinatorDashboard />} />
                <Route path="profile" element={<CoordinatorProfile />} />
                <Route path="proposal-list" element={<ProposalList />} />
                <Route path="proposal-review" element={<ProposalReview />} />
                <Route path="proposal-detail/:id" element={<CoordinatorProposalDetail />} />
                <Route path="student-evaluation" element={<StudentEvaluation />} />
                <Route path="guidance-management" element={<GuidanceManagement />} />
                <Route path="timesheet-overview" element={<CoordinatorTimesheetOverview />} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout role="admin" />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="user-management" element={<UserManagement />} />
                <Route path="guide-management" element={<GuideManagement />} />
                <Route path="digital-signature-management" element={<DigitalSignatureManagement />} />
                <Route path="digital-signatures" element={<DigitalSignatureManagement />} />
                <Route path="kp-timeline-management" element={<KpTimelineManagement />} />
              </Route>

              {/* Supervisor routes */}
              <Route path="/supervisor" element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                  <DashboardLayout role="supervisor" />
                </ProtectedRoute>
              }>
                <Route index element={<SupervisorDashboard />} />
                <Route path="profile" element={<SupervisorProfile />} />
                <Route path="digital-signature" element={<DigitalSignatureUpload />} />
                <Route path="feedback" element={<Feedback />} />
                <Route path="kp-progress" element={<KpProgressSupervision />} />
                <Route path="timesheet-overview" element={<SupervisorTimesheetOverview />} />
              </Route>

              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
