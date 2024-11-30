import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Card, Typography, Button } from "@material-tailwind/react";
import { getUnitName } from "../../api/helper";
import { RxUpdate } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import Loader from "../../components/Loader/Loader";
import {
  fetchInventory,
  createInventory,
  updateInventory,
  deleteInventory, // Import the delete function
  fetchInventoryStats, // Import the stats function
} from "../../api/api"; // Import the necessary API functions
import InventoryForm from "../../components/FormComponent/InventoryForm";
import DeleteConfirmation from "../../components/FormComponent/DeleteConfirmation";
import DashboardDetails from "../../components/DashboardDetails/DashboardDetails";
const TABLE_HEAD = [
  "S/N",
  "Unit Name",
  "Name",
  "Description",
  "Quantity",
  "Reorder Level",
  "Price",
  "Update",
  "Delete", // Added delete column
];
import LowInventory from "../../components/FormComponent/LowInventory";

const Inventory = () => {
  const [inventoryData, setInventoryData] = useState([]); // State to hold fetched inventory data
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true); // State for loading stats
  const [inventoryStats, setInventoryStats] = useState({
    totalLowStock: 0,
  });
  const [totalinventory, settotalInventory] = useState({
    totalInventory: 0,
  });
    // Check if the role is admin
  const role = localStorage.getItem("role");
  const [showForm, setShowForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false); // Show update form state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Show delete confirmation dialog
  const [itemToDelete, setItemToDelete] = useState(null); // Item to delete
  const [showLowInventoryForm, setShowLowInventoryForm] = useState(false); // State for toggling the low inventory form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: "",
    reorder_level: "",
    price: "",
    unit_id: "",
  });
  const [updateData, setUpdateData] = useState({
    id: "",
    name: "",
    description: "",
    quantity: "",
    reorder_level: "",
    price: "",
    unit_id: "",
  });

  const navigate = useNavigate();

  // Fetch inventory data and stats
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You need to be logged in to access this page.");
      setTimeout(() => {
        navigate("/onboarding");
      }, 2000);
      return;
    }

    // Fetch inventory data from API
    const getInventory = async () => {
      try {
        const data = await fetchInventory(token); // Fetch inventory from API
        setInventoryData(data); // Set fetched data to state
      } catch (error) {
        toast.error("Failed to fetch inventory. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch inventory stats
    const getInventoryStats = async () => {
      try {
        const stats = await fetchInventoryStats(token); // Fetch stats from API
        setInventoryStats(stats.low_inventory_count); // Set stats data to state
        settotalInventory(stats.total_inventory);
      } catch (error) {
        toast.error("Failed to fetch inventory stats. Please try again.");
      } finally {
        setLoadingStats(false);
      }
    };

    getInventory();
    getInventoryStats();

    // Set a timeout for the loader (5 seconds)
    const loaderTimeout = setTimeout(() => {
      setLoading(false);
      setLoadingStats(false);
    }, 5500);

    // Cleanup timeout on component unmount
    return () => clearTimeout(loaderTimeout);
  }, [navigate]);

  // Handle form data changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle unit_id selection for creating new item
  const handleSelectChange = (value) => {
    setFormData({ ...formData, unit_id: value });
  };

  // Handle unit_id selection for updating item
  const handleUpdateSelectChange = (value) => {
    setUpdateData({ ...updateData, unit_id: value });
  };

  // Handle form submission for creating inventory
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await createInventory(formData, token);
      toast.success("Inventory item created successfully!");
      setShowForm(false);

      // Dynamically update the inventory list without refreshing
      setInventoryData((prevData) => [...prevData, response.data]);

      // Clear the form data after successful submission
      setFormData({
        name: "",
        description: "",
        quantity: "",
        reorder_level: "",
        price: "",
        unit_id: "",
      });

      // Fetch updated stats and total inventory after creation
      const updatedStats = await fetchInventoryStats(token);
      setInventoryStats(updatedStats.low_inventory_count); // Update low stock count
      settotalInventory(updatedStats.total_inventory); // Update total inventory
    } catch (error) {
      console.error("Error creating inventory:", error);
      toast.error("Failed to create inventory item. Please try again.");
    }
  };

  // Open the update form with data
  const openUpdateForm = (item) => {
    setUpdateData(item); // Set the data to be updated
    setShowUpdateForm(true); // Show the update form
  };

  // Handle update submission
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await updateInventory(updateData.id, updateData, token);
      toast.success("Inventory item updated successfully!");

      // Update the inventory list dynamically
      setInventoryData((prevData) =>
        prevData.map((item) =>
          item.id === updateData.id ? response.data : item
        )
      );

      setShowUpdateForm(false); // Close the update form

      // Clear the form data after successful submission
      setUpdateData({
        id: "",
        name: "",
        description: "",
        quantity: "",
        reorder_level: "",
        price: "",
        unit_id: "",
      });

      // Fetch updated stats after update
      const updatedStats = await fetchInventoryStats(token);
      setInventoryStats(updatedStats.low_inventory_count); // Update low stock count
      settotalInventory(updatedStats.total_inventory); // Update total inventory
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast.error("Failed to update inventory item. Please try again.");
      setUpdateData({
        id: "",
        name: "",
        description: "",
        quantity: "",
        reorder_level: "",
        price: "",
        unit_id: "",
      });
      setShowUpdateForm(false); // Close the update form
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!itemToDelete) return;

    try {
      await deleteInventory(itemToDelete.id, token);
      toast.success("Inventory item deleted successfully!");

      // Remove deleted item from the state dynamically
      setInventoryData((prevData) =>
        prevData.filter((item) => item.id !== itemToDelete.id)
      );

      setShowDeleteConfirm(false); // Close the delete confirmation dialog

      // Fetch updated stats and total inventory after deletion
      const updatedStats = await fetchInventoryStats(token);
      setInventoryStats(updatedStats.low_inventory_count); // Update low stock count
      settotalInventory(updatedStats.total_inventory); // Update total inventory
    } catch (error) {
      console.error("Error deleting inventory:", error);
      toast.error("Failed to delete inventory item. Please try again.");
      setShowDeleteConfirm(false);
    }
  };


  // Open delete confirmation
  const openDeleteConfirm = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  if (loading || loadingStats) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  const summaryData = [
    {
      title: "Total Inventory",
      value: totalinventory,
    },
    {
      title: "Total Low Stock Items",
      value: inventoryStats,
    },
  ];



  return (
    <div className="min-h-screen flex px-4 py-2 lg:px-8 lg:py-4">
      <div className="w-full md:w-[75%] ml-[20%] p-8 overflow-y-auto">
        <DashboardDetails
          title={`MaxHelp Business ${role !== "admin" ? "Employee" : "Admin"} - Dashboard`}
          subtitle="Inventory Details Page and Statistics"
          summaryData={summaryData}
        />
        {/* Inventory Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-[2rem]">
          <Card className="h-full w-full shadow-none relative">
            <div className="flex items-center justify-between">
              <div className="left">
                <Typography
                  variant="h5"
                  color="blue-gray"
                  className="mb-4 text-left"
                >
                  Inventory List
                </Typography>
              </div>

              {
                role === "admin" && (
                  <div className="right absolute right-[-15%] md:right-[-70%]">
                  {/* Button to open the form */}
                  <div className="flex justify-end mb-6">
                    <Button onClick={() => setShowForm(true)} color="blue">
                      Create Item
                    </Button>
                  </div>
                </div>

                )
              }        
              {role === "employee" && (
                  <div className="right absolute right-[-15%] md:right-[-70%]">
                    <div className="flex justify-end mb-6">
                      <Button
                        onClick={() => setShowLowInventoryForm(true)}
                        color="blue"
                        className="mb-4"
                      >
                        Report Low Inventory
                      </Button>
                    </div>
                  </div>
                )}
            </div>


            {/* Popup Form for Creating Item */}
            {showForm && (
              <InventoryForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                onClose={() => setShowForm(false)}
                title="Create New Inventory Item"
              />
            )}

            {/* Update Form */}
            {showUpdateForm && (
              <InventoryForm
                formData={updateData}
                setFormData={setUpdateData}
                onSubmit={handleUpdateSubmit}
                onClose={() => setShowUpdateForm(false)}
                title="Update Inventory Item"
                isUpdate
              />
            )}


          {/* Low Inventory Form Popup */}
          {showLowInventoryForm && (
            <LowInventory
              onClose={() => setShowLowInventoryForm(false)} // Close the form
              onSuccess={() => toast.success("Low inventory reported successfully")}
              onError={() => toast.error("Failed to report low inventory")}
            />
          )}

            {/* Delete Confirmation */}
            <DeleteConfirmation
              isOpen={showDeleteConfirm}
              onClose={() => setShowDeleteConfirm(false)}
              onDelete={handleDelete}
            />

            {/* Inventory Table */}
            <table className="min-w-full table-auto text-left">
              <thead>
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th
                      key={head}
                      className="border-b border-blue-gray-100 bg-blue-gray-100 px-4 py-2 text-sm font-semibold text-gray-500 whitespace-nowrap"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventoryData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="text-sm cursor-pointer hover:bg-blue-gray-100"
                  >
                    <td className="py-3 px-5 border-b border-blue-gray-100">
                      {index + 1}
                    </td>
                    <td className="py-3 px-5 border-b whitespace-nowrap border-blue-gray-100">
                      {getUnitName(item.unit_id)}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap border-b border-blue-gray-100">
                      {item.name}
                    </td>
                    <td className="py-3 px-5 border-b border-blue-gray-100 whitespace-nowrap">
                      {item.description}
                    </td>
                    <td className="py-3 px-5 border-b border-blue-gray-100">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-5 border-b border-blue-gray-100">
                      {item.reorder_level}
                    </td>
                    <td className="py-3 px-5 border-b border-blue-gray-100">
                      {item.price}
                    </td>
                    <td className="py-3 px-5 border-b border-blue-gray-100">
                      <RxUpdate
                        onClick={() => openUpdateForm(item)}
                        className="text-xl"
                      />
                    </td>
                    <td className="py-3 px-5">
                      <FaTrash
                        onClick={() => openDeleteConfirm(item)}
                        className="text-red-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Inventory;










