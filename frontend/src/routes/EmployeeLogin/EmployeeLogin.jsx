import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormComponent from "../../components/FormComponent/FormComponent";
import { login } from "../../api/api";
import { toast } from "react-toastify";
import Loader from "../../components/Loader/Loader";

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const handleLogin = async (formData) => {
    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      const username = formData.email.split('@')[0];

      localStorage.setItem("token", response.data.access_token); // Save JWT token
      localStorage.setItem("username", username); // Save employee email
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
    }, 1000);

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
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <img
          src="/Login.png"
          alt="Employee Login Illustration"
          className="w-[80%] max-w-sm md:block hidden"
        />
      </div>
    </div>
  );
};

export default EmployeeLogin;
