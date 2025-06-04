
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/auth";

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
import ProposalDetail from "./pages/student/ProposalDetail";

// Coordinator Pages
import CoordinatorDashboard from "./pages/coordinator/Dashboard";
import CoordinatorProfile from "./pages/coordinator/Profile";
import ProposalReview from "./pages/coordinator/ProposalReview";
import ProposalList from "./pages/coordinator/ProposalList";
import CoordinatorProposalDetail from "./pages/coordinator/ProposalDetail";
import GuidanceManagement from "./pages/coordinator/GuidanceManagement";
import StudentEvaluation from "./pages/coordinator/StudentEvaluation";

// SuperAdmin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProfile from "./pages/admin/Profile";
import UserManagement from "./pages/admin/UserManagement";
import GuideManagement from "./pages/admin/GuideManagement";
import DigitalSignatureManagement from "./pages/admin/DigitalSignatureManagement";

// Supervisor Pages
import SupervisorDashboard from "./pages/supervisor/Dashboard";
import SupervisorProfile from "./pages/supervisor/Profile";
import DigitalSignatureUpload from "./pages/supervisor/DigitalSignatureUpload";
import SupervisorFeedback from "./pages/supervisor/Feedback";
import Index from "./pages/Index";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode, 
  requiredRole?: string 
}) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to={`/${profile?.role || ''}`} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      {/* Student Routes */}
      <Route 
        path="/student" 
        element={
          <ProtectedRoute requiredRole="student">
            <DashboardLayout role="student" />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="proposal-submission" element={<ProposalSubmission />} />
        <Route path="proposal-detail/:id" element={<ProposalDetail />} />
        <Route path="guide" element={<StudentGuide />} />
        <Route path="digital-signature" element={<DigitalSignature />} />
      </Route>
      
      {/* Coordinator Routes */}
      <Route 
        path="/coordinator" 
        element={
          <ProtectedRoute requiredRole="coordinator">
            <DashboardLayout role="coordinator" />
          </ProtectedRoute>
        }
      >
        <Route index element={<CoordinatorDashboard />} />
        <Route path="profile" element={<CoordinatorProfile />} />
        <Route path="proposal-list" element={<ProposalList />} />
        <Route path="proposal-review" element={<ProposalReview />} />
        <Route path="proposal-detail/:id" element={<CoordinatorProposalDetail />} />
        <Route path="guidance-management" element={<GuidanceManagement />} />
        <Route path="student-evaluation" element={<StudentEvaluation />} />
      </Route>
      
      {/* SuperAdmin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="guide-management" element={<GuideManagement />} />
        <Route path="digital-signatures" element={<DigitalSignatureManagement />} />
      </Route>
      
      {/* Supervisor Routes */}
      <Route 
        path="/supervisor" 
        element={
          <ProtectedRoute requiredRole="supervisor">
            <DashboardLayout role="supervisor" />
          </ProtectedRoute>
        }
      >
        <Route index element={<SupervisorDashboard />} />
        <Route path="profile" element={<SupervisorProfile />} />
        <Route path="digital-signature" element={<DigitalSignatureUpload />} />
        <Route path="feedback" element={<SupervisorFeedback />} />
      </Route>
      
      {/* Catch all for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
