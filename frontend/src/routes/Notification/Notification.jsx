import React, { useEffect, useState } from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchLowInventoryNotifications } from "../../api/api"; // Import the API function
import Loader from "../../components/Loader/Loader";
import DashboardDetails from "../../components/DashboardDetails/DashboardDetails";

const Notification = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [isToastShown, setIsToastShown] = useState(false); // New state to prevent multiple toast notifications

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      // Redirect to login if the token is missing
      toast.error("You need to be logged in to access this page.");
      navigate("/onboarding");
      return;
    }

    const fetchNotifications = async () => {
      try {
        const data = await fetchLowInventoryNotifications(token);

        // Delay the state update and toast notification
        setTimeout(() => {
          setNotifications(data);
          setLoading(false); // Stop loading after the delay

          // Show toast notification only once
          if (!isToastShown || isToastShown.length === 0) {
            toast.info(`Total Notification ${data.length}`);
            setIsToastShown(true); // Ensure toast is only shown once
          }
        }, 1500); // 2-second delay
      } catch (error) {
        toast.error(
          error.response
            ? error.response.data.detail
            : "Failed to load notifications."
        );
        setLoading(false); // Ensure loading stops even if an error occurs
        setIsToastShown(false);
      }
    };

    fetchNotifications();
  }, [navigate, isToastShown]); // Remove isToastShown from the dependency array

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  const summaryData = [
    {
      title: "Total Notifications",
      value: notifications.length,
    },
  ];

  return (
      <div className="min-h-screen flex px-4 py-2 lg:px-8 lg:py-4">
          {/* Main Content */}
          <div className="w-full md:w-[75%] ml-[20%] p-8 overflow-y-auto">
              <DashboardDetails
                  title="MaxHelp Business Admin - Dashboard"
                  subtitle="Notification Details Page"
                  summaryData={summaryData}
              />

              {/* Notification Grid Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-[2rem]">
                  {notifications.length > 0 ? (
                      notifications.map(
                          (
                              {
                                  id,
                                  inventory_item_name,
                                  message,
                                  business_unit_name,
                                  location,
                                  quantity,
                                  total_employees,
                              },
                              index,
                          ) => (
                              <Card
                                  key={index}
                                  className="w-full shadow-lg border rounded-lg"
                              >
                                  <CardBody className="p-4">
                                      <Typography
                                          variant="h6"
                                          color="blue-gray"
                                          className="mb-2"
                                      >
                                          Notification {index + 1}
                                      </Typography>
                                      <Typography
                                          variant="small"
                                          color="blue-gray"
                                          className="mb-1"
                                      >
                                          <strong>Item:</strong>{" "}
                                          {inventory_item_name}
                                      </Typography>
                                      <Typography
                                          variant="small"
                                          color="blue-gray"
                                          className="mb-1"
                                      >
                                          <strong>Message:</strong> {message}
                                      </Typography>
                                      <Typography
                                          variant="small"
                                          color="blue-gray"
                                          className="mb-1"
                                      >
                                          <strong>Business Unit:</strong>{" "}
                                          {business_unit_name}
                                      </Typography>
                                      <Typography
                                          variant="small"
                                          color="blue-gray"
                                          className="mb-1"
                                      >
                                          <strong>Location:</strong> {location}
                                      </Typography>
                                      <Typography
                                          variant="small"
                                          color="blue-gray"
                                          className="mb-1"
                                      >
                                          <strong>Quantity:</strong> {quantity}
                                      </Typography>
                                      <Typography
                                          variant="small"
                                          color="blue-gray"
                                          className="mb-1"
                                      >
                                          <strong>Total Employees:</strong>{" "}
                                          {total_employees}
                                      </Typography>
                                  </CardBody>
                              </Card>
                          ),
                      )
                  ) : (
                      <Typography variant="small" color="gray" className="mt-4">
                          No Notification available.
                      </Typography>
                  )}
              </div>
          </div>
      </div>
  );
};

export default Notification;
