import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/HomePage";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import "./axiosConfig";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard/farmer" element={
          <ProtectedRoute>
          <FarmerDashboard />
          </ProtectedRoute>} />
        <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
