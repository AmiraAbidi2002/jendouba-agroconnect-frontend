// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/HomePage";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import "./axiosConfig"; // Axios interceptor configuration

/**
 * Main Application Component
 * --------------------------
 * Defines the routing structure for the app:
 * - Public routes: Home and Auth pages
 * - Protected routes: Farmer and Buyer dashboards
 * - Fallback route: Redirects unknown paths to AuthPage
 * 
 * Mobile-Responsive Considerations:
 * ---------------------------------
 * - Ensure dashboard components adapt to smaller screens
 * - Avoid overflowing containers on mobile devices
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard/farmer"
          element={
            <ProtectedRoute>
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/buyer"
          element={
            <ProtectedRoute>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<AuthPage />} />
      </Routes>
    </Router>
  );
}

export default App;
