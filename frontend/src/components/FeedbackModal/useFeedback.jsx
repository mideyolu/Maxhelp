import { useState } from "react";
import { toast } from "react-toastify";
import { createFeedback } from "../../api/api";

const useFeedback = () => {
    const [open, setOpen] = useState(false);
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState("");
    const [unit, setUnit] = useState("");

    // Open and close modal functions
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleSubmitFeedback = async () => {
        if (!unit) {
            toast.error("Please select a business unit.");
            return;
        }

        try {
            const feedbackData = {
                comment,
                rating: parseInt(rating),
                unit_name: unit,
            };

            await createFeedback(feedbackData);
            toast.success("Feedback submitted successfully!");
            handleClose();
            setComment("");
            setRating("");
            setUnit("");
        } catch (error) {
            toast.error("Failed to submit feedback: " + error.message);
        }
    };

    return {
        open,
        comment,
        rating,
        unit,
        handleOpen,
        handleClose,
        handleSubmitFeedback,
        setComment,
        setRating,
        setUnit,
    };
};

export default useFeedback;
