import React, { useState, useEffect } from "react";
import { Typography } from "@material-tailwind/react";
import { FaUser, FaUserTie, FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader/Loader";

const Onboarding = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        // Simulate a loading process (e.g., data fetching or async operations)
        const timer = setTimeout(() => {
            setLoading(false); // After 2 seconds, stop loading
        }, 1500);

        return () => clearTimeout(timer); // Cleanup timer
    }, []);

    const EmployeeRedirect = () => {
        navigate("/login");
    };
    const AdminRedirect = () => {
        navigate("/admin-login");
    };
    const CustRedirect = () => {
        navigate("/customer-login");
    };

    // Navigate back to the onboarding screen
    const handleBackToHome = () => {
        navigate("/"); // Replace with the correct path for your onboarding screen
    };

    if (loading) {
        return <Loader />; // Show loader while loading
    }

    return (
        <div className="onboarding min-h-screen bg-gray-100 flex md:flex-row">
            {/* Left Section */}
            <div className="left w-full md:w-1/2 flex flex-col justify-center px-8 py-6">
                <Typography
                    as="h2"
                    variant="h4"
                    className="text-gray-800 font-bold mb-6 text-center md:text-left"
                >
                    Choose Your Option
                </Typography>

                <div className="cursor-pointer grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Admin Option */}
                    <div
                        className="flex flex-col items-center space-y-2 p-4 bg-white rounded-lg w-[90%] mx-auto md:w-full hover:scale-105 transition-all duration-100 ease-in-out"
                        onClick={AdminRedirect}
                    >
                        <FaUser className="text-blue-gray-900 text-2xl" />
                        <Typography
                            variant="h6"
                            className="text-gray-800 font-semibold text-center"
                        >
                            Admin
                        </Typography>
                        <Typography className="text-gray-600 text-sm text-center">
                            Manage your organization's settings and users.
                        </Typography>
                    </div>

                    {/* Employee Option */}
                    <div
                        className="flex flex-col items-center space-y-2 p-4 bg-white rounded-lg w-[90%] mx-auto hover:scale-105  transition-all duration-100 ease-in-out"
                        onClick={EmployeeRedirect}
                    >
                        <FaUserTie className="text-blue-gray-900 text-2xl" />
                        <Typography
                            variant="h6"
                            className="text-gray-800 font-semibold text-center"
                        >
                            Employee
                        </Typography>
                        <Typography className="text-gray-600 text-sm text-center">
                            Access tools and resources to manage your work.
                        </Typography>
                    </div>

                    {/* Employee Option */}
                    <div
                        className="flex flex-col items-center space-y-2 p-4 bg-white rounded-lg w-[90%] mx-auto md:w-full hover:scale-105 transition-all duration-100 ease-in-out"
                        onClick={CustRedirect}
                    >
                        <FaUserShield className="text-blue-gray-900 text-2xl" />
                        <Typography
                            variant="h6"
                            className="text-gray-800 font-semibold text-center"
                        >
                            Customer
                        </Typography>
                        <Typography className="text-gray-600 text-sm text-center">
                            View and purchase from our various services
                        </Typography>
                    </div>

                    <span
                        className="mt-4 text-sm absolute cursor-pointer left-[55%] top-[80%]"
                        onClick={handleBackToHome}
                    >
                        Home
                    </span>
                </div>
            </div>

            {/* Right Section */}
            <div className="hidden right md:w-1/2 md:flex items-center justify-center py-6 sm:bg-transparent">
                <img
                    src="/Onboarding.png"
                    alt="Admin Login Illustration"
                    className="w-[90%] max-w-sm md:block hidden"
                />
            </div>
        </div>
    );
};

export default Onboarding;
