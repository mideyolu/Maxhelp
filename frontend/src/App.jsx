import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import NavbarList from "./components/Navbar/NavbarList";
import Footer from "./components/Footer/Footer";
import Sidebar from "./components/Sidebar/Sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import HomePage from "./routes/HomePage/HomePage";
import AboutPage from "./routes/AboutPage/AboutPage";
import Onboarding from "./routes/Onboarding/Onboarding";
import AdminLogin from "./routes/AdminLogin/AdminLogin";
import Dashboard from "./routes/Dashboard/Dashboard";
import Employee from "./routes/Employee/Employee";
import Notification from "./routes/Notification/Notification";
import Feedback from "./routes/Feedbacks/Feedback";
import Inventory from "./routes/Inventory/Inventory";
import EmployeeLogin from "./routes/EmployeeLogin/EmployeeLogin";

const App = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const location = useLocation();

  // Define routes where sidebar should be shown
  const showSidebarRoutes = [
    "/dashboard",
    "/admin-employees",
    "/notifications",
    "/feedbacks",
    "/inventory",
  ];

  // Fetch username from localStorage when the app loads
  useEffect(() => {
    // Exclude routes that should not trigger login checks
    const noLoginRequiredRoutes = [
      "/",
      "/about",
      "/onboarding",
      "/login",

    ];

    if (noLoginRequiredRoutes.includes(location.pathname)) {
      return; // Don't perform login check for these routes
    }

    // Check for stored username
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      // Redirect to login if username is not found in localStorage
      navigate("/admin-login");
    }
  }, [location.pathname, navigate]);

  // Determine whether to show the Navbar and Footer
  const showNavbarFooter = ![
    "/admin-login",
    "/onboarding",
    "/login",
    "/dashboard",
    "/admin-employees",
    "/notifications",
    "/feedbacks",
    "/inventory",
  ].includes(location.pathname);

  return (
    <div className="min-h-screen">
      {/* Navbar: Conditionally render based on current route */}
      {showNavbarFooter && <NavbarList />}

      <div className="flex">
        {/* Sidebar: Conditionally render on specific routes */}
        {showSidebarRoutes.includes(location.pathname) && (
          <Sidebar username={username} />
        )}

        <div className="flex-1">
          {/* Define Routes for the application */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin-employees" element={<Employee />} />
            <Route path="/notifications" element={<Notification />} />
            <Route path="/feedbacks" element={<Feedback />} />
            <Route path="/inventory" element={<Inventory />} />

            {/* Employee Routes */}
            <Route path="/login" element={<EmployeeLogin />} />
          </Routes>
        </div>
      </div>

      {/* Footer: Conditionally render based on current route */}
      {showNavbarFooter && <Footer />}

      {/* Global Toast Notification Container */}
      <ToastContainer
        position="top-right"
        autoClose={2100}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default App;
