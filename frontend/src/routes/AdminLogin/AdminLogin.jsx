// import React from "react";
// import { useNavigate } from "react-router-dom";
// import FormComponent from "../../components/FormComponent/FormComponent";
// import { loginAdmin } from "../../api/api";
// import { toast } from "react-toastify";

// const AdminLogin = () => {
//   const navigate = useNavigate();

//   const handleLogin = async (formData) => {
//     try {
//       const response = await loginAdmin({
//         username: formData.username,
//         password: formData.password,
//       });
//       localStorage.setItem("token", response.data.access_token); // Save JWT token
//       localStorage.setItem("username", formData.username); // Save username

//       // Wait for 2 seconds before navigating to the dashboard
//       setTimeout(() => {
//         navigate("/admin-dashboard");
//       }, 2000);
//     } catch (error) {
//       toast.error("Login Failed: Invalid credentials");
//     }
//   };

//   const fields = [
//     {
//       label: "Username",
//       name: "username",
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

//   return (
//     <div className="min-h-screen flex flex-col justify-center md:justify-normal md:flex-row">
//       {/* Left Section: Login Form */}
//       <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-8 py-6 sm:mt-12">
//         <FormComponent
//           title="Admin Login"
//           fields={fields}
//           onSubmit={handleLogin}
//           submitButtonText="Login"
//         />
//       </div>

//       {/* Right Section: Illustration */}
//       <div className="w-full md:w-1/2 bg-blue-900 flex items-center justify-center">
//         <img
//           src="/admin.png"
//           alt="Admin Login Illustration"
//           className="w-2/3 max-w-sm md:block hidden"
//         />
//       </div>
//     </div>
//   );
// };

// export default AdminLogin;

import React from "react";
import { useNavigate } from "react-router-dom";
import FormComponent from "../../components/FormComponent/FormComponent";
import { loginAdmin } from "../../api/api";
import { toast } from "react-toastify";

const AdminLogin = () => {
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    try {
      const response = await loginAdmin({
        username: formData.username,
        password: formData.password,
      });

      localStorage.setItem("token", response.data.access_token); // Save JWT token
      localStorage.setItem("username", formData.username); // Save username
      localStorage.setItem("role", "admin"); // Save role as admin

      toast.success("Login Successful!");

      // Wait for 2 seconds before navigating to the dashboard
      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 2000);
    } catch (error) {
      toast.error("Login Failed: Invalid credentials");
    }
  };

  const fields = [
    {
      label: "Username",
      name: "username",
      type: "text",
      placeholder: "Enter your username",
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

  return (
    <div className="min-h-screen flex flex-col justify-center md:justify-normal md:flex-row">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-8 py-6 sm:mt-12">
        <FormComponent
          title="Admin Login"
          fields={fields}
          onSubmit={handleLogin}
          submitButtonText="Login"
        />
      </div>
      <div className="w-full md:w-1/2 bg-blue-900 flex items-center justify-center">
        <img
          src="/admin.png"
          alt="Admin Login Illustration"
          className="w-2/3 max-w-sm md:block hidden"
        />
      </div>
    </div>
  );
};

export default AdminLogin;
