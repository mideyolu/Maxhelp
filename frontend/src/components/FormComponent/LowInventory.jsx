import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/api'; // Adjust the path based on your project structure
import { Button, Input, Typography, Card } from '@material-tailwind/react';

const LowInventory = ({ onSuccess, onError, onClose }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState(null);

  const onSubmit = async (data) => {
    const token = localStorage.getItem('token'); // Assuming token is saved in localStorage

    if (!token) {
      setMessage('User not authenticated');
      onError && onError('User not authenticated');
      return;
    }

    try {
      const response = await api.post('/notifications/report-low-inventory', {
        inventory_name: data.inventory_name,  // Make sure it's the correct key
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      setMessage(response.data.message);
      setNotification(response.data.notification);
      onSuccess && onSuccess(response.data.notification);

      // Reset the form after successful submission
      reset();
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.detail || 'An error occurred');
        onError && onError(error.response.data.detail || 'An error occurred');
      } else {
        setMessage('Failed to report low inventory');
        onError && onError('Failed to report low inventory');
      }
    }
  };

  return (
    <div className="mx-auto p-4 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 gap-5">
      <Card className="p-6 bg-white shadow-lg">
        <Typography variant="h4" color="blue-gray">Report Low Inventory</Typography>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="inventory_name" className="block text-gray-700">Inventory Name:</label>
            <Input
              id="inventory_name"
              type="text"
            
              size="lg"
              {...register('inventory_name', { required: 'Inventory Name is required' })}
            />
            {errors.inventory_name && <p className="text-red-500 text-sm">{errors.inventory_name.message}</p>}
          </div>
        </form>

        <div className="mt-4 text-center">
          {message && <p className="text-sm text-gray-600">{message}</p>}

          {notification && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Notification Details:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Business Unit: {notification.business_unit_name}</li>
                <li>Location: {notification.location}</li>
                {/* <li>Total Employees: {notification.total_employees}</li> */}
                <li>Inventory Item: {notification.inventory_item_name}</li>
                <li>Price: {notification.price}</li>
                <li>Quantity: {notification.quantity}</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-9">
        <Button type="submit" color="blue" fullWidth className="mt-4">Report</Button>
        <Button onClick={onClose} color="red" fullWidth className="mt-4">Cancel</Button>
        </div>

      </Card>
    </div>
  );
};

export default LowInventory;
