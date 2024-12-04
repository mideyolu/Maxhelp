import axios from "axios";

const API_BASE_URL = "http://localhost:8000"; // Update this to match your FastAPI server's base URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded", // Correct content type for form-encoded data
  },
});
// Admin Login API
export const loginAdmin = (data) => {
  // Convert object to URLSearchParams to match FastAPI expectations
  const formData = new URLSearchParams();
  for (const key in data) {
    formData.append(key, data[key]);
  }
  return api.post("/auth/admin/login", formData); // Adjust endpoint path if needed
};
// API call to create a business unit
export const createBusinessUnit = (data, token) => {
  return api.post(
    "/auth/admin/create-business-unit",
    data, // Send the data as JSON (no need for URLSearchParams)
    {
      headers: {
        Authorization: `Bearer ${token}`, // Attach the JWT token for authorization
        "Content-Type": "application/json", // Ensure the request is sent as JSON
      },
    }
  );
};
// API call to create a employee
export const createEmployee = (data, token) => {
  return api.post(
    "/auth/admin/create-employee",
    data, // Send the data as JSON (no need for URLSearchParams)
    {
      headers: {
        Authorization: `Bearer ${token}`, // Attach the JWT token for authorization
        "Content-Type": "application/json", // Ensure the request is sent as JSON
      },
    }
  );
};
// API call to list all employees along with gender counts
export const listEmployees = (token) => {
  return api.get("/auth/admin/list-details", {
    headers: {
      Authorization: `Bearer ${token}`, // Attach the JWT token for authorization
      },
      per_page: 10,
  });
};
// API call to delete an employee
export const deleteEmployee = async (employeeId, token) => {
  return api.delete(`/auth/admin/delete-employee/${employeeId}`, {
    headers: {
      Authorization: `Bearer ${token}`, // Attach the JWT token for authorization
    },
  });
};
// API call to update an employee
export const updateEmployee = (employeeId, data, token) => {
  return api.put(
    `/auth/admin/update-employee/${employeeId}`, // Replace with your API endpoint
    data, // Employee data to update
    {
      headers: {
        Authorization: `Bearer ${token}`, // Attach the JWT token for authorization
        "Content-Type": "application/json", // Ensure the request is sent as JSON
      },
    }
  );
};
// API call to list all employees along with gender counts
export const listStats = (token) => {
  // Token is missing as a parameter
  return api.get("/auth/admin/list-stats", {
    headers: {
      Authorization: `Bearer ${token}`, // ReferenceError occurs here
    },
  });
};
// API call to create an inventory item
export const createInventory = (data, token) => {
  return api.post(
    "/auth/admin/create-inventory",
    data, // Send the data as JSON
    {
      headers: {
        Authorization: `Bearer ${token}`, // Attach the JWT token for authorization
        "Content-Type": "application/json", // Ensure the request is sent as JSON
      },
    }
  );
};
// API call to fetch inventory items based on user role
export const fetchInventory = async (token) => {
  try {
    const response = await api.get("/inventory", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Return the fetched data
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw error; // Rethrow error to be handled in the calling function
  }
};
// API call to fetch inventory items based on user role
export const fetchCustomerInventory = async (token) => {
  try {
    const response = await api.get("/inventory/inventorylist", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Return the fetched data
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw error; // Rethrow error to be handled in the calling function
  }
};

// API call to update an inventory item
export const updateInventory = (itemId, data, token) => {
  return api.put(
    `/inventory/${itemId}`,
    data, // Send the updated data as JSON
    {
      headers: {
        Authorization: `Bearer ${token}`, // Attach the JWT token for authorization
        "Content-Type": "application/json", // Ensure the request is sent as JSON
      },
    }
  );
};
// API call to delete an inventory item
export const deleteInventory = (itemId, token) => {
  return api.delete(`/inventory/${itemId}`, {
    headers: {
      Authorization: `Bearer ${token}`, // Attach the JWT token for authorization
    },
  });
};
// API call to fetch inventory statistics (total inventory and low inventory count)
export const fetchInventoryStats = async (token) => {
  try {
    const response = await api.get("/inventory/inventory-stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Return the statistics data
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    throw error; // Rethrow error to be handled in the calling function
  }
};
// API call to list feedbacks
export const listFeedbacks = async (token) => {
  return api.get("/feedback/list-feedbacks", {
    headers: {
      Authorization: `Bearer ${token}`, // Attach the JWT token for authorization
    },
  });
};
// API call to list feedbacks
export const listCustomerFeedbacks = async () => {
    try {
        const response = await api.get("/feedback/customer/list-feedbacks");
        return response.data; // Return the feedback data
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        throw error;
    }
};
// API call to fetch low inventory notifications
export const fetchLowInventoryNotifications = async (token) => {
  try {
    const response = await api.get("/notifications/low-inventory", {
      // Ensure URL matches backend
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Return the fetched notifications
  } catch (error) {
    console.error("Error fetching low inventory notifications:", error);
    throw error;
  }
};
// Api class for employee login
export const login = (data, token) => {
  return api.post(
    "/auth/login",
    data, // Send the data as JSON
    {
      headers: {
        Authorization: `Bearer ${token}`, // Attach the JWT token for authorization
        "Content-Type": "application/json", // Ensure the request is sent as JSON
      },
    }
  );
};
// API call to report low inventory
export const reportLowInventory = (inventoryId, token) => {
  return api.post(
    "/auth/admin/report-low-inventory", // Endpoint to report low inventory
    { inventory_id: inventoryId }, // Send inventory_id as part of the request
    {
      headers: {
        Authorization: `Bearer ${token}`, // Attach the JWT token for authorization
        "Content-Type": "application/json", // Ensure the request is sent as JSON
      },
    }
  );
};

// Function to create a new user (POST request to the backend)
export const createUser = async (userData) => {
  try {
    const response = await axios.post("http://localhost:8000/auth/users", userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data; // Return the created user data
  } catch (error) {
    // Handle error response
    if (error.response) {
      throw new Error(error.response.data.detail || "An unknown error occurred.");
    } else {
      throw new Error(error.message || "Something went wrong.");
    }
  }
};

export const createFeedback = async (feedbackData) => {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.post(
            "http://localhost:8000/feedback/create-feedback",
            feedbackData,
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.detail || "Failed to create feedback",
        );
    }
};



export default api;
