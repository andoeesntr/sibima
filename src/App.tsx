
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth Pages
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Layout Components
import DashboardLayout from "./layouts/DashboardLayout";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentProfile from "./pages/student/Profile";
import ProposalSubmission from "./pages/student/ProposalSubmission";
import StudentGuide from "./pages/student/Guide";
import DigitalSignature from "./pages/student/DigitalSignature";

// Coordinator Pages
import CoordinatorDashboard from "./pages/coordinator/Dashboard";
import CoordinatorProfile from "./pages/coordinator/Profile";
import ProposalReview from "./pages/coordinator/ProposalReview";
import ProposalDetail from "./pages/coordinator/ProposalDetail";

// SuperAdmin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProfile from "./pages/admin/Profile";
import UserManagement from "./pages/admin/UserManagement";
import GuideManagement from "./pages/admin/GuideManagement";

// Supervisor Pages
import SupervisorDashboard from "./pages/supervisor/Dashboard";
import SupervisorProfile from "./pages/supervisor/Profile";
import DigitalSignatureUpload from "./pages/supervisor/DigitalSignatureUpload";
import SupervisorFeedback from "./pages/supervisor/Feedback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Student Routes */}
          <Route path="/student" element={<DashboardLayout role="student" />}>
            <Route index element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="proposal-submission" element={<ProposalSubmission />} />
            <Route path="guide" element={<StudentGuide />} />
            <Route path="digital-signature" element={<DigitalSignature />} />
          </Route>
          
          {/* Coordinator Routes */}
          <Route path="/coordinator" element={<DashboardLayout role="coordinator" />}>
            <Route index element={<CoordinatorDashboard />} />
            <Route path="profile" element={<CoordinatorProfile />} />
            <Route path="proposal-review" element={<ProposalReview />} />
            <Route path="proposal-detail/:id" element={<ProposalDetail />} />
          </Route>
          
          {/* SuperAdmin Routes */}
          <Route path="/admin" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="guide-management" element={<GuideManagement />} />
          </Route>
          
          {/* Supervisor Routes */}
          <Route path="/supervisor" element={<DashboardLayout role="supervisor" />}>
            <Route index element={<SupervisorDashboard />} />
            <Route path="profile" element={<SupervisorProfile />} />
            <Route path="digital-signature" element={<DigitalSignatureUpload />} />
            <Route path="feedback" element={<SupervisorFeedback />} />
          </Route>
          
          {/* Catch all for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
