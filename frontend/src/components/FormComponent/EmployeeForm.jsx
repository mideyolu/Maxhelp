import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
  Option,
  Button,
  Typography,
  Card,
} from "@material-tailwind/react";
import { toast } from "react-toastify"; // Importing the toast function

const EmployeeForm = ({
  formData,
  setFormData,
  onSubmit,
  onClose,
  title,
  isUpdate = false,
}) => {
  const [availableRoles, setAvailableRoles] = useState(["Employee"]);

  const [availableUnits, setAvailableUnits] = useState([
    { value: "1", label: "Restaurant" },
    { value: "2", label: "Grocery Store" },
    { value: "3", label: "Bottled Water Industry" },
    { value: "4", label: "Bookshop" },
  ]);

  const [availableGenders] = useState([
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ]);

  // Handle form data changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (value, name) => {
    setFormData({ ...formData, [name]: value });

    // Remove selected role/unit/gender from the list
    if (name === "role") {
      setAvailableRoles(availableRoles.filter((role) => role !== value));
    }
    if (name === "unit_id") {
      setAvailableUnits(availableUnits.filter((unit) => unit.value !== value));
    }
    if (name === "gender") {
      setAvailableGenders(
        availableGenders.filter((gender) => gender.value !== value)
      );
    }
  };

  // Validate the form before submitting
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.unit_id ||
      !formData.gender
    ) {
      toast.error("All fields are required except for password.");
      return;
    }

    // If updating, password is optional, show a warning if it's empty
    if (!isUpdate && !formData.password) {
      toast.error("Password is required for creating a new employee.");
      return;
    }

    // Call onSubmit if the form is valid
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 gap-5">
      <Card color="white" shadow={5} className="w-full max-w-md p-6 ">
        <Typography variant="h5" color="blue-gray" className="mb-4">
          {title}
        </Typography>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Employee Name */}
          <Input
            label="Employee Name"
            value={formData.name}
            onChange={handleInputChange}
            name="name"
            required
          />

          {/* Employee Email */}
          <Input
            label="Email"
            value={formData.email}
            onChange={handleInputChange}
            name="email"
            type="email"
            required
          />

          {/* Password (Optional for Update) */}
          {!isUpdate && (
            <Input
              label="Password"
              value={formData.password}
              onChange={handleInputChange}
              name="password"
              type="password"
              required
            />
          )}

          {/* Role Selection */}
          <Input
            label="Role"
            value={formData.role}
            onChange={handleInputChange}
            name="role"
            type="role"
            required
          />

          {/* Unit Selection */}
          <Select
            label="Unit ID"
            value={formData.unit_id}
            onChange={(value) => handleSelectChange(value, "unit_id")}
            required
          >
            {availableUnits.map((unit) => (
              <Option key={unit.value} value={unit.value}>
                {unit.label}
              </Option>
            ))}
          </Select>

          {/* Gender Selection */}
          <Select
            label="Gender"
            value={formData.gender}
            onChange={(value) => handleSelectChange(value, "gender")}
            required
          >
            {availableGenders.map((gender) => (
              <Option key={gender.value} value={gender.value}>
                {gender.label}
              </Option>
            ))}
          </Select>

          <div className="flex justify-between gap-4 mt-5">
            <Button type="submit" color="blue" className="mt-2">
              {isUpdate ? "Update Employee" : "Create Employee"}
            </Button>
            <Button onClick={onClose} color="red" className="mt-2">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EmployeeForm;
