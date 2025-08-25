import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import FarmerDashboard from "./pages/FarmerDashboard.jsx";
import BuyerDashboard from "./pages/BuyerDashboard.jsx";

function App() {
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
         <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
