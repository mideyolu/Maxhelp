import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FormComponent from "../../components/FormComponent/FormComponent";
import { createUser } from "../../api/api"; // Import the API function for creating customer
import { toast } from "react-toastify";
import Loader from "../../components/Loader/Loader";


const CustomerSignup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Handle form submission
    const handleSubmit = async (formData) => {
        try {
            const response = await createUser({
                name: formData.username,
                email: formData.email,
                password: formData.password,
                gender: formData.gender,

            });
            toast.success("Customer registration successful!");
            setTimeout(() => {
                navigate("/customer-login");
            }, 2000);
        } catch (error) {
            toast.error("Customer Registration failed: " + error.message);
            console.log(error.message);
        }
    };

    // Fields for the form
    const fields = [
        {
            label: "Username",
            name: "username",
            type: "text",
            placeholder: "Enter your username",
            required: true,
        },
        {
            label: "Email",
            name: "email",
            type: "email",
            placeholder: "Enter your email",
            required: true,
        },
        {
            label: "Gender",
            name: "gender",
            type: "text",
            placeholder: "Enter your gender",
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
                    title="Customer Register"
                    fields={fields}
                    onSubmit={handleSubmit}
                    submitButtonText="Register"
                />
                <Link className="text-[0.8rem]" to={"/customer-login"}>
                    Have an Account? Login
                </Link>
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center">
                <img
                    src="/customer.png"
                    alt="Customer Register Illustration"
                    className="w-[100%] max-w-sm md:block hidden"
                />
            </div>
        </div>
    );
};

export default CustomerSignup;
