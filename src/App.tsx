import React from "react";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { Toaster } from "sonner";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProfile from "./pages/admin/Profile";
import UserManagement from "./pages/admin/UserManagement";
import GuideManagement from "./pages/admin/GuideManagement";
import DigitalSignatureManagement from "./pages/admin/DigitalSignatureManagement";

// Coordinator Pages
import CoordinatorDashboard from "./pages/coordinator/Dashboard";
import CoordinatorProfile from "./pages/coordinator/Profile";
import ProposalReview from "./pages/coordinator/ProposalReview";
import ProposalDetail from "./pages/coordinator/ProposalDetail";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentProfile from "./pages/student/Profile";
import ProposalSubmission from "./pages/student/ProposalSubmission";
import DigitalSignature from "./pages/student/DigitalSignature";
import Guide from "./pages/student/Guide";

// Supervisor Pages
import SupervisorDashboard from "./pages/supervisor/Dashboard";
import SupervisorProfile from "./pages/supervisor/Profile";
import SupervisorFeedback from "./pages/supervisor/Feedback";
import DigitalSignatureUpload from "./pages/supervisor/DigitalSignatureUpload";

import DashboardLayout from "./layouts/DashboardLayout";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route element={<DashboardLayout role="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/user-management" element={<UserManagement />} />
          <Route path="/admin/guide-management" element={<GuideManagement />} />
          <Route path="/admin/digital-signatures" element={<DigitalSignatureManagement />} />
        </Route>

        {/* Coordinator Routes */}
        <Route element={<DashboardLayout role="coordinator" />}>
          <Route path="/coordinator" element={<CoordinatorDashboard />} />
          <Route path="/coordinator/profile" element={<CoordinatorProfile />} />
          <Route path="/coordinator/proposal-review" element={<ProposalReview />} />
          <Route path="/coordinator/proposal-review/:id" element={<ProposalDetail />} />
        </Route>

        {/* Student Routes */}
        <Route element={<DashboardLayout role="student" />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/proposal-submission" element={<ProposalSubmission />} />
          <Route path="/student/digital-signature" element={<DigitalSignature />} />
          <Route path="/student/guide" element={<Guide />} />
        </Route>

        {/* Supervisor Routes */}
        <Route element={<DashboardLayout role="supervisor" />}>
          <Route path="/supervisor" element={<SupervisorDashboard />} />
          <Route path="/supervisor/profile" element={<SupervisorProfile />} />
          <Route path="/supervisor/feedback" element={<SupervisorFeedback />} />
          <Route path="/supervisor/digital-signature" element={<DigitalSignatureUpload />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
