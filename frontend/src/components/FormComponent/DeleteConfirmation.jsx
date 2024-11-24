import React from "react";
import { Button, Card, Typography } from "@material-tailwind/react";

const DeleteConfirmation = ({
  isOpen,
  onClose,
  onDelete,
  message = "Are you sure you want to delete this item?",
}) => {
  if (!isOpen) return null; // Do not render if not open

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 gap-5">
      <Card color="white" shadow={5} className="w-full max-w-md p-6">
        <Typography variant="h5" color="blue-gray" className="mb-4">
          {message}
        </Typography>
        <div className="flex justify-between">
          <Button onClick={onDelete} color="red" className="mr-2">
            Yes, Delete
          </Button>
          <Button onClick={onClose} color="gray">
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DeleteConfirmation;
