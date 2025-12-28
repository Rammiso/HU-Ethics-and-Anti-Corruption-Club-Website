import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import NewsManagement from "../pages/admin/NewsManagement";

// Placeholder components - to be implemented
const Login = () => <div>Login Page</div>;
const Dashboard = () => <div>Dashboard Page</div>;
const ReportsManagement = () => <div>Reports Management Page</div>;
const EventsManagement = () => <div>Events Management Page</div>;
// NewsManagement imported above
const ContactMessages = () => <div>Contact Messages Page</div>;
const UserManagement = () => <div>User Management Page</div>;
const AuditLogs = () => <div>Audit Logs Page</div>;
const Settings = () => <div>Settings Page</div>;
const Profile = () => <div>Profile Page</div>;

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <EventsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/news"
        element={
          <ProtectedRoute>
            <NewsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <ContactMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute>
            <AuditLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AdminRoutes;
