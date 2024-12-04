import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Slider from "react-slick";
import { listCustomerFeedbacks } from "../../api/api";
import {
    Card,
    CardBody,
    Typography,
    Spinner,
    Alert,
} from "@material-tailwind/react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Loader from "../Loader/Loader";

const FeedbackCarousel = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFeedbacks = async () => {
        try {
            const data = await listCustomerFeedbacks();
            setTimeout(() => {
                setFeedbacks(data);
                setLoading(false);
            }, 1500);
        } catch (error) {
            toast.error("Failed to fetch feedbacks");
            setLoading(false); // Ensure loading stops even on error
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const sliderSettings = {
        dots: false,
        infinite: true, // Enable infinite looping
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3,
        autoplay: true, // Enable autoplay
        autoplaySpeed: 3000, // Adjust speed for autoplay
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };

    // Show the loader while fetching data
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader />
            </div>
        );
    }

    // Show a message if no feedback is available
    if (!feedbacks || feedbacks.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Alert color="blue" variant="ghost">
                    No feedbacks available at the moment.
                </Alert>
            </div>
        );
    }

    // Render the feedbacks if available
    return (
        <div className="feedback-carousel container mx-auto p-4">
            <Typography color="" className="text-center uppercase mb-5">
                Clients Feedback and Testimonials
            </Typography>
            <Slider {...sliderSettings}>
                {feedbacks.map((feedback) => (
                    <Card
                        key={feedback.id}
                        className="mb-8 hover:shadow-xl transition-shadow"
                    >
                        <CardBody>
                            <Typography
                                variant="h6"
                                color=""
                                className="text-[0.9rem]
                            text-center"
                            >
                                <strong>Customer:</strong>{" "}
                                {feedback.customer_name}
                            </Typography>
                            <Typography variant="small" className="mt-2">
                                <strong>Unit:</strong> {feedback.unit_name}
                            </Typography>
                            <Typography variant="small" className="mt-2">
                                <strong>Comment:</strong> {feedback.comment}
                            </Typography>
                            <Typography variant="small" className="mt-2">
                                <strong>Rating:</strong>{" "}
                                {feedback.rating || "N/A"} / 5
                            </Typography>
                            <Typography variant="small" className="mt-2 flex items-center justify-end text-[0.7rem]">
                                {new Date(
                                    feedback.created_at,
                                ).toLocaleDateString()}
                            </Typography>
                        </CardBody>
                    </Card>
                ))}
            </Slider>
        </div>
    );
};

export default FeedbackCarousel;
