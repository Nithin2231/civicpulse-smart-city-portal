import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Imports
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Forgot from './pages/auth/Forgot';
import Reset from './pages/auth/Reset';

// Layout & Citizen Imports
import DashboardLayout from './components/layout/DashboardLayout';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import SubmitComplaint from './pages/citizen/SubmitComplaint';
import MyComplaints from './pages/citizen/MyComplaints';
import ComplaintDetail from './pages/citizen/ComplaintDetail';
import Settings from './pages/citizen/Settings';

// Admin Imports
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFeedbackView from './pages/admin/AdminFeedbackView';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard'; // <--- NEW: Analytics Import

// Officer Imports
import OfficerDashboard from './pages/officer/OfficerDashboard'; 
import OfficerAnalytics from './pages/officer/OfficerAnalytics';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset" element={<Reset />} />

        {/* Citizen Portal Routes (Wrapped in the Sidebar Layout) */}
        <Route path="/citizen" element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CitizenDashboard />} />
          <Route path="submit-complaint" element={<SubmitComplaint />} />
          <Route path="my-complaints" element={<MyComplaints />} />
          <Route path="complaint/:id" element={<ComplaintDetail />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Admin Portal Routes */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="feedback" element={<AdminFeedbackView />} />
          <Route path="analytics" element={<AnalyticsDashboard />} /> {/* <--- NEW: Admin Analytics Route */}
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Officer Portal Routes */}
        <Route path="/officer" element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<OfficerDashboard />} />
          <Route path="analytics" element={<OfficerAnalytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;