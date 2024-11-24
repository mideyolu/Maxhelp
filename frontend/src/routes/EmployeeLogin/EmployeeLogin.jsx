// import React, { useEffect, useState } from "react"; // Ensure `useState` is imported
// import { useNavigate } from "react-router-dom";
// import FormComponent from "../../components/FormComponent/FormComponent";
// import { loginEmployee } from "../../api/api"; // Updated API function for employee login
// import { toast } from "react-toastify";
// import Loader from "../../components/Loader/Loader"; // Make sure your Loader component is correctly imported

// const EmployeeLogin = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true); // Initially set loading to true

//   const handleLogin = async (formData) => {
//     try {
//       // Make the API call to the FastAPI employee login endpoint
//       const response = await loginEmployee({
//         email: formData.email, // Ensure the field name matches the API
//         password: formData.password,
//       });

//       // Save the JWT token in localStorage
//       localStorage.setItem("token", response.data.access_token);
//       localStorage.setItem("employee_email", formData.email); // Store the email or any user identifier

//       // Show success message
//       toast.success("Login Successful!");

//       // Wait for 2 seconds before redirecting to the dashboard
//       setTimeout(() => {
//         navigate("/dashboard");
//       }, 2000);
//     } catch (error) {
//       // If login fails, show error message
//       toast.error("Login Failed: Invalid credentials");
//     }
//   };

//   const fields = [
//     {
//       label: "Email",
//       name: "email",
//       type: "text",
//       placeholder: "Enter your username",
//       required: true,
//     },
//     {
//       label: "Password",
//       name: "password",
//       type: "password",
//       placeholder: "Enter your password",
//       required: true,
//     },
//   ];

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setLoading(false); // After 2 seconds, stop loading and show the form
//     }, 1500); // 1.5 seconds loading time

//     // Cleanup function to clear timeout if the component unmounts before timer finishes
//     return () => clearTimeout(timer);
//   }, []); // Empty dependency array to run only once when the component mounts

//   if (loading) {
//     return <Loader />; // Show loader while loading (Loader component should be visible)
//   }

//   return (
//     <div className="min-h-screen flex flex-col justify-center md:justify-normal md:flex-row">
//       {/* Left Section: Login Form */}
//       <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-8 py-6 sm:mt-12">
//         <FormComponent
//           title="Employee Login"
//           fields={fields}
//           onSubmit={handleLogin}
//           submitButtonText="Login"
//         />
//       </div>

//       {/* Right Section: Illustration */}
//       <div className="w-full md:w-1/2 bg-blue-900 flex items-center justify-center">
//         <img
//           src="/Login.png"
//           alt="Employee Login Illustration"
//           className="w-2/3 max-w-sm md:block hidden"
//         />
//       </div>
//     </div>
//   );
// };

// export default EmployeeLogin;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormComponent from "../../components/FormComponent/FormComponent";
import { loginEmployee } from "../../api/api";
import { toast } from "react-toastify";
import Loader from "../../components/Loader/Loader";

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const handleLogin = async (formData) => {
    try {
      const response = await loginEmployee({
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", response.data.access_token); // Save JWT token
      localStorage.setItem("employee_email", formData.email); // Save employee email
      localStorage.setItem("role", "employee"); // Save role as employee

      toast.success("Login Successful!");

      // Wait for 2 seconds before redirecting to the dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      toast.error("Login Failed: Invalid credentials");
    }
  };

  const fields = [
    {
      label: "Email",
      name: "email",
      type: "text",
      placeholder: "Enter your email",
      required: true,
    },
    {
      label: "Password",
      name: "password",
      type: "password",
      placeholder: "Enter your password",
      required: true,
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center md:justify-normal md:flex-row">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-8 py-6 sm:mt-12">
        <FormComponent
          title="Employee Login"
          fields={fields}
          onSubmit={handleLogin}
          submitButtonText="Login"
        />
      </div>
      <div className="w-full md:w-1/2 bg-blue-900 flex items-center justify-center">
        <img
          src="/Login.png"
          alt="Employee Login Illustration"
          className="w-2/3 max-w-sm md:block hidden"
        />
      </div>
    </div>
  );
};

export default EmployeeLogin;
