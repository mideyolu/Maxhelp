import React, { useEffect, useState } from "react";
import { Card, Typography, Button } from "@material-tailwind/react";
import { getUnitName } from "../../api/helper";
import { Pie } from "react-chartjs-2";
import { FaTrash } from "react-icons/fa";
import { RxUpdate } from "react-icons/rx";
import { Tooltip, ArcElement, Legend, Chart as ChartJS } from "chart.js";
import {
    createEmployee,
    listEmployees,
    deleteEmployee,
    updateEmployee,
} from "../../api/api"; // Import the API function
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import EmployeeForm from "../../components/FormComponent/EmployeeForm";
import DeleteConfirmation from "../../components/FormComponent/DeleteConfirmation";
import DashboardDetails from "../../components/DashboardDetails/DashboardDetails";

// Initial Pie chart data (will be updated from API)
const TABLE_HEAD = [
    "S/N",
    "Name",
    "Email",
    "Role",
    "Gender",
    "Unit Name",
    "Update",
    "Delete",
];
import Loader from "../../components/Loader/Loader";

// Register necessary chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

const Employee = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [employeeToEdit, setEmployeeToEdit] = useState(null);
    const [genderCounts, setGenderCounts] = useState({ male: 0, female: 0 });
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "employee",
        unit_id: "",
        gender: "",
        password: "",
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [genderChartData, setGenderChartData] = useState({
        labels: ["Male", "Female"],
        datasets: [
            {
                data: [0, 0],
                backgroundColor: ["#FF6384", "#36A2EB"],
                hoverBackgroundColor: ["#FF6384", "#36A2EB"],
            },
        ],
    });

    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("You need to be logged in to access this page.");
            setTimeout(() => {
                navigate("/admin-login");
            }, 2000);
        }

        const fetchEmployees = async () => {
            setLoading(true); // Show loader
            try {
                const response = await listEmployees(token);
                const employeeList = response?.data || [];

                setEmployees(employeeList);

                const maleCount = employeeList.filter(
                    (emp) => emp.gender === "Male",
                ).length;
                const femaleCount = employeeList.filter(
                    (emp) => emp.gender === "Female",
                ).length;
                setGenderCounts({ male: maleCount, female: femaleCount });

                setGenderChartData({
                    labels: ["Male", "Female"],
                    datasets: [
                        {
                            data: [maleCount, femaleCount],
                            backgroundColor: ["#FF6384", "#36A2EB"],
                            hoverBackgroundColor: ["#FF6384", "#36A2EB"],
                        },
                    ],
                });

                toast.success("Employees Successfully Loaded");
            } catch (error) {
                console.error("Error fetching employees:", error);
                toast.error("Error fetching employees");
            } finally {
                setLoading(false); // Hide loader after fetch
            }
        };

        setLoading(true);

        // Simulate a loading time of 2 seconds
        setTimeout(() => {
            fetchEmployees();
        }, 1500);
    }, [navigate, token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Show loader

        try {
            // If editing an employee, update it, else create a new employee
            let response;
            if (employeeToEdit) {
                // Update existing employee
                response = await updateEmployee(
                    employeeToEdit.id,
                    formData,
                    token,
                ); // Use employeeToEdit.id
                const updatedEmployee = response.data;

                setEmployees((prevEmployees) =>
                    prevEmployees.map((emp) =>
                        emp.id === updatedEmployee.id
                            ? { ...emp, ...updatedEmployee }
                            : emp,
                    ),
                );
                toast.success("Employee updated successfully");
            } else {
                // Create new employee
                response = await createEmployee(formData, token);
                const newEmployee = response.data;

                setEmployees((prevEmployees) => [
                    ...prevEmployees,
                    newEmployee,
                ]);
                toast.success("Employee created successfully");
            }

            const newGenderCounts = {
                male:
                    response.data.gender === "Male"
                        ? genderCounts.male + 1
                        : genderCounts.male,
                female:
                    response.data.gender === "Female"
                        ? genderCounts.female + 1
                        : genderCounts.female,
            };

            setGenderCounts(newGenderCounts);
            setGenderChartData({
                labels: ["Male", "Female"],
                datasets: [
                    {
                        data: [newGenderCounts.male, newGenderCounts.female],
                        backgroundColor: ["#FF6384", "#36A2EB"],
                        hoverBackgroundColor: ["#FF6384", "#36A2EB"],
                    },
                ],
            });
        } catch (error) {
            console.error("Error submitting employee:", error);
            toast.error("Error processing employee");
        } finally {
            setLoading(false); // Hide loader after the operation
            handleCancel(); // Reset form after submission
        }
    };

    const handleDeleteEmployee = (employeeId) => {
        setEmployeeToDelete(employeeId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await deleteEmployee(employeeToDelete, token);
            toast.success("Employee deleted successfully");

            setEmployees((prevEmployees) =>
                prevEmployees.filter(
                    (employee) => employee.id !== employeeToDelete,
                ),
            );

            const deletedEmployee = employees.find(
                (emp) => emp.id === employeeToDelete,
            );
            if (deletedEmployee) {
                setGenderCounts((prevCounts) => ({
                    male:
                        deletedEmployee.gender === "Male"
                            ? prevCounts.male - 1
                            : prevCounts.male,
                    female:
                        deletedEmployee.gender === "Female"
                            ? prevCounts.female - 1
                            : prevCounts.female,
                }));

                setGenderChartData({
                    labels: ["Male", "Female"],
                    datasets: [
                        {
                            data: [genderCounts.male, genderCounts.female],
                            backgroundColor: ["#FF6384", "#36A2EB"],
                            hoverBackgroundColor: ["#FF6384", "#36A2EB"],
                        },
                    ],
                });
            }
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Error deleting employee:", error);
            toast.error("Failed to delete employee");
            setShowDeleteModal(false);
        } finally {
            setLoading(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
    };

    const handleEditEmployee = (employee) => {
        setEmployeeToEdit(employee);
        setFormData({
            name: employee.name,
            email: employee.email,
            role: employee.role,
            unit_id: employee.unit_id,
            gender: employee.gender,
            password: "", // Password is not updated during edits
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            unit_id: "",
            gender: "",
        });
        setShowForm(false);
        setEmployeeToEdit(null);
    };
    const summaryData = [
        {
            title: "Total Male Employees",
            value: genderCounts.male,
        },
        {
            title: "Total Female Employees",
            value: genderCounts.female,
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex px-4 py-2 lg:px-8 lg:py-4">
            <div className="w-full md:w-[75%] ml-[20%] p-8 overflow-y-auto">
                <DashboardDetails
                    title="MaxHelp Business Admin - Dashboard"
                    subtitle="Employee Details Page and Statistics"
                    summaryData={summaryData}
                />

                {/* Pie Chart for Employee Gender */}
                <div className="flex items-start justify-center mt-[2rem]">
                    <Card
                        color="transparent"
                        shadow={2}
                        className="flex flex-col items-center p-6"
                    >
                        <Typography
                            variant="h5"
                            color="blue-gray"
                            className="mb-4"
                        >
                            Employee Gender Distribution
                        </Typography>
                        <Pie
                            data={genderChartData}
                            options={{
                                responsive: true,
                                plugins: { legend: { position: "top" } },
                            }}
                            className="h-[50%] w-[50%]"
                        />
                    </Card>
                </div>

                {/* Popup Form */}

                {showForm && (
                    <EmployeeForm
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={handleSubmit}
                        onClose={handleCancel}
                        title={
                            employeeToEdit
                                ? "Edit Employee"
                                : "Create New Employee"
                        }
                        isUpdate={!!employeeToEdit}
                    />
                )}

                {/* Delete Confirmation */}
                <DeleteConfirmation
                    isOpen={showDeleteModal}
                    onClose={cancelDelete}
                    onDelete={confirmDelete}
                />

                {/* Employee Table */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-[2rem]">
                    <Card className="h-full w-full shadow-none relative">
                        <div className="flex items-center justify-between">
                            <Typography
                                variant="h5"
                                color="blue-gray"
                                className="mb-4 text-left"
                            >
                                Employee List
                            </Typography>

                            <div className="right absolute right-[-15%] lg:right-[-60%]">
                                <div className="flex justify-end mb-6">
                                    <Button
                                        onClick={() => setShowForm(true)}
                                        color="blue-gray"
                                    >
                                        Create Employee
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <table className="min-w-full table-auto text-left overflow-hidden">
                            <thead>
                                <tr>
                                    {TABLE_HEAD.map((head) => (
                                        <th
                                            key={head}
                                            className="border-b border-blue-gray-100 bg-blue-gray-100 px-4 py-2 text-sm font-semibold text-gray-500 whitespace-nowrap"
                                        >
                                            {head}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {employees.map((row, index) => (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-blue-gray-100"
                                    >
                                        <td className="border-b  border-blue-gray-100 p-4 text-sm text-gray-700">
                                            {index + 1}
                                        </td>
                                        <td className="border-b border-blue-gray-100 p-4 text-sm text-gray-700 whitespace-nowrap">
                                            {row.name}
                                        </td>
                                        <td className="border-b border-blue-gray-100 p-4 text-sm text-gray-700">
                                            {row.email}
                                        </td>
                                        <td className="border-b border-blue-gray-100 p-4 text-sm text-gray-700">
                                            {row.role.charAt(0).toUpperCase() +
                                                row.role.slice(1)}
                                        </td>
                                        <td className="border-b border-blue-gray-100 p-4 text-sm text-gray-700">
                                            {row.gender}
                                        </td>
                                        <td className="border-b border-blue-gray-100 p-4 text-sm text-gray-700 whitespace-nowrap">
                                            {getUnitName(row.unit_id)}
                                        </td>

                                        <td className="border-b border-blue-gray-100 p-4 text-sm text-gray-700">
                                            {/* Update Icon */}
                                            <RxUpdate
                                                className="text-blue-gray-700 cursor-pointer hover:text-blue-gray-600"
                                                onClick={() =>
                                                    handleEditEmployee(row)
                                                }
                                            />
                                        </td>

                                        <td className="border-b border-blue-gray-100 p-4 text-sm text-gray-700">
                                            {/* Delete Icon */}
                                            <FaTrash
                                                className="text-red-500 cursor-pointer hover:text-red-700"
                                                onClick={() =>
                                                    handleDeleteEmployee(row.id)
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Employee;
