import React, { useState } from "react";
import { createFeedback } from "../../api/api";
import { toast } from "react-toastify";
import { Button, Select, Option } from "@material-tailwind/react";

const FeedbackModal = ({ open, handleClose }) => {
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState("");
    const [unit, setUnit] = useState("");

    const handleSubmitFeedback = async () => {
        if (!unit || !rating || !comment) {
            toast.error("Please fill all fields.");
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

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h2 className="text-xl font-semibold mb-4">Provide Feedback</h2>

                {/* Material Tailwind Select for business unit */}
                <div className="mb-4">
                    <Select
                        label="Select a Business Unit"
                        value={unit}
                        onChange={(value) => setUnit(value)}
                    >
                        <Option value="Restaurant">Resturant</Option>
                        <Option value="Bookshop">BookShop</Option>
                        <Option value="Bottled Water Industry">
                            Bottled Water
                        </Option>
                        <Option value="Grocery Store">Grocery Store</Option>
                    </Select>
                </div>

                {/* Textarea for comment */}
                <textarea
                    placeholder="Write your comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-2 border rounded-md mb-4"
                    rows="4"
                />

                {/* Input for rating */}
                <input
                    type="number"
                    placeholder="Rating (1-5)"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full p-2 border rounded-md mb-4"
                    min="1"
                    max="5"
                />

                <div className="flex justify-between">
                    <Button onClick={handleSubmitFeedback} color="blue">
                        Submit Feedback
                    </Button>

                    <Button onClick={handleClose} color="red">
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;
