import NavbarList from "./components/Navbar/NavbarList";
import { Router, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./routes/HomePage/HomePage";
import Footer from "./components/Footer/Footer";
import AboutPage from "./routes/AboutPage/AboutPage";
import Onboarding from "./routes/Onboarding/Onboarding";
const App = () => {
      const location = useLocation();
      const hideNavbarRoutes = [
        "/login",
        "/onboarding",
        "/signup",
        "/dashboard",
      ];
  return (
    <div className="min-h-screen">
      {!hideNavbarRoutes.includes(location.pathname) && <NavbarList />}

      <Routes className="">
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/*

      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>

      {!hideNavbarRoutes.includes(location.pathname) && <Footer />}
    </div>
  );
};

export default App;
