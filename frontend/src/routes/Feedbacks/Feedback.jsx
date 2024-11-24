import React, { useEffect, useState } from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { listFeedbacks } from "../../api/api"; // Import the API function
import Loader from "../../components/Loader/Loader"; // Ensure correct import
import DashboardDetails from "../../components/DashboardDetails/DashboardDetails";
const Feedback = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [loading, setLoading] = useState(true); // Set loading to true initially
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // Redirect to login if the token is missing
      toast.error("You need to be logged in to access this page.");
      setTimeout(() => {
        navigate("/admin-login");
      }, 2000);
      return;
    }

    // Fetch feedback data
    const fetchFeedbacks = async () => {
      try {
        setLoading(true); // Set loading true before starting the request
        const response = await listFeedbacks(token);

        // Introduce a 2-second delay before setting the feedbacks
        setTimeout(() => {
          setFeedbackData(response.data);
          setTotalFeedbacks(response.data.length);
          toast.info(`Total Feedback ${response.data.length}`);
          setLoading(false); // Stop loading after the delay
        }, 1500); // 2-second delay
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        toast.error("Failed to load feedback data. Please try again later.");
        setLoading(false); // Ensure loading stops even if there's an error
      }
    };

    fetchFeedbacks();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader /> {/* Ensure Loader is properly implemented */}
      </div>
    );
  }

  const summaryData = [
    {
      title: "Total Notifications",
      value: totalFeedbacks,
    },
  ];

  return (
    <div className="min-h-screen flex px-4 py-2 lg:px-8 lg:py-4">
      {/* Main Content */}
      <div className="w-full md:w-[75%] ml-[20%] p-8 overflow-y-auto">
        <DashboardDetails
          title="MaxHelp Business Admin - Dashboard"
          subtitle="Feedback Details Page"
          summaryData={summaryData}
        />

        {/* Feedback Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-[2rem]">
          {feedbackData.length > 0 ? (
            feedbackData.map(
              (
                { id, customer_name, unit_name, comment, rating, created_at },
                index
              ) => (
                <Card key={id} className="w-full shadow-lg border rounded-lg">
                  <CardBody className="p-4">
                    <Typography variant="h6" color="blue-gray" className="mb-2">
                      Feedback {index + 1}
                    </Typography>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-1"
                    >
                      <strong>Customer Name:</strong> {customer_name}
                    </Typography>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-1"
                    >
                      <strong>Unit Name:</strong> {unit_name}
                    </Typography>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-1"
                    >
                      <strong>Comment:</strong> {comment}
                    </Typography>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-1"
                    >
                      <strong>Rating:</strong> {rating} / 5
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      <strong>Created At:</strong>{" "}
                      {new Date(created_at).toLocaleString()}
                    </Typography>
                  </CardBody>
                </Card>
              )
            )
          ) : (
            <Typography variant="small" color="gray" className="mt-4">
              No feedback available.
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
