import React, { useEffect, useState } from "react";
import { Card, Typography, Button, Input } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../components/Loader/Loader";
import { createBusinessUnit, listStats } from "../../api/api"; // Import API functions
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();

  // States
  const [totalSales, setTotalSales] = useState(500000);
  const [businessUnitName, setBusinessUnitName] = useState("");
  const [role, setRole] = useState("");
  const [totalEmployee, setTotalEmployee] = useState(0);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true); // State to control loading
  const [showForm, setShowForm] = useState(false);
  const [businessUnitsCount, setBusinessUnitsCount] = useState(0);

  // Line chart data for Sales Progress
  const salesData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Sales",
        data: [10000, 20000, 30000, 25000, 40000, 50000],
        borderColor: "#42A5F5",
        backgroundColor: "rgba(66, 165, 245, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Centralized function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedRole = localStorage.getItem("role");

      if (storedRole) {
        setRole(storedRole);
      }

      if (!token) {
        toast.error("You need to be logged in to access this page.");
        navigate("/onboarding");
        return;
      }

      const response = await listStats(token);

      // Fetch data based on role
      if (storedRole === "admin") {
        setBusinessUnitsCount(response.data.total_business_units);
        setTotalEmployee(response.data.total_employees);
      }

      // Total sales is common for all roles
      setTotalSales(response.data.total_sales);
    } catch (error) {
      const storedRole = localStorage.getItem("role");
      
      console.error("Error fetching dashboard data:", error);

            // Fetch data based on role
      if (storedRole === "admin") {
        toast.error(
          error.response ? error.response.data.detail : "An error occurred"
        );
      }
    } finally {
      setLoading(false); // Hide loader after fetching the data
    }
  };

  // Fetch data on component mount with setTimeout to simulate a loading delay
  useEffect(() => {
    setLoading(true); // Show loader when fetching data
    fetchDashboardData(); // Fetch data on mount
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You need to be logged in to perform this action.");
      return;
    }

    setLoading(true); // Show loader while submitting form

    const businessUnitData = {
      name: businessUnitName,
      location: location,
    };

    try {
      await createBusinessUnit(businessUnitData, token);
      toast.success("Business unit created successfully!");
      setBusinessUnitName("");
      setLocation("");
      setShowForm(false);

      // Reload dashboard data after creating a business unit
      await fetchDashboardData();
    } catch (err) {
      toast.error(
        err.response ? err.response.data.detail : "An error occurred"
      );
    } finally {
      setLoading(false); // Hide loader after form submission
    }
  };

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
        <div className="mb-8 text-left">
          <Typography variant="h3" color="blue-gray">
            MaxHelp Business{" "}
            {role !== "admin" ? "Employee" : "Admin"} - Dashboard
          </Typography>
        </div>

        {/* Summary Box */}
        <div className="mb-8 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Admin-specific section */}
          {role === "admin" && (
            <Card className="flex flex-col w-[100%] h-[150px] items-start justify-center p-4">
              <Typography
                variant="h6"
                color="gray"
                className="mb-2 text-left text-[0.9rem]"
              >
                Total Employees
              </Typography>
              <Typography variant="h4" color="blue-gray">
                {totalEmployee}
              </Typography>
            </Card>
          )}

          {/* Admin-only Business Units */}
          {role === "admin" && (
            <Card className="flex flex-col items-start h-[150px] justify-center p-4">
              <Typography
                variant="h6"
                color="gray"
                className="mb-2 text-left text-[0.9rem]"
              >
                Business Units
              </Typography>
              <Typography variant="h4" color="blue-gray">
                {businessUnitsCount}
              </Typography>
            </Card>
          )}

          {/* Common for all roles */}
          <Card className="flex flex-col items-start h-[150px] justify-center p-4">
            <Typography variant="h6" color="gray" className="mb-2">
              Total Sales
            </Typography>
            <Typography variant="h4" color="blue-gray">
              ${totalSales}
            </Typography>
          </Card>
        </div>

        {/* Line Chart for Sales Progress */}
        <div className="flex justify-center mt-8">
          <Card className="w-full max-w-md p-6">
            <Typography variant="h5" color="blue-gray" className="mb-4">
              Sales Progress
            </Typography>
            <Line data={salesData} options={{ responsive: true }} />
          </Card>
        </div>

        {/* Admin-only Create Unit Button */}
        {role === "admin" && (
          <div className="mb-8 absolute text-center top-[45%] md:top-[15%] lg:top-[15%] right-[10%] md:w-[15%] text-center whitespace-nowrap">
            <Button onClick={() => setShowForm(true)} color="blue" fullWidth>
              Create Unit
            </Button>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <Card className="w-full max-w-md p-6">
              <Typography variant="h5" color="blue-gray" className="mb-4">
                Create Business Unit
              </Typography>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Input
                    name="name"
                    label="Business Unit Name"
                    value={businessUnitName}
                    onChange={(e) => setBusinessUnitName(e.target.value)}
                    size="lg"
                    placeholder="Enter business unit name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <Input
                    name="location"
                    label="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    size="lg"
                    placeholder="Enter location"
                    required
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button color="red" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" color="blue" disabled={loading}>
                    {loading ? "Creating..." : "Create Business Unit"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
