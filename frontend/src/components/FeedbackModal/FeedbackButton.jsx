import React from "react";
import { FaRegCommentDots } from "react-icons/fa"; // Feedback icon

const FeedbackButton = ({ handleOpen }) => {
    return (
        <button
            onClick={handleOpen}
            className="text-2xl text-blue-600 hover:text-blue-800 p-2"
        >
            <FaRegCommentDots />
        </button>
    );
};

export default FeedbackButton;
