import { Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";

const isAuthenticated = () => Boolean(localStorage.getItem("token"));

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const protectedDashboard = (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={protectedDashboard} />
      <Route path="/leads" element={protectedDashboard} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
