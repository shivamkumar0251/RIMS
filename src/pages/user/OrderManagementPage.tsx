// src/components/OrderManagementPage.tsx
import React, { useState } from 'react';
import { orders, type Order, type Product } from '../../userOrdersData';
import UserLayout from '../../layouts/UserLayout';

// ==================================================================
// FIX: THIS IS THE LINE CAUSING THE ERROR.
// Try changing '../data' to './data' if both files are in the same folder.
// import { orders, Order, Product } from '../../userOrdersData'; 
// ==================================================================


// Helper function to get status badge color
const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'Delivered': return 'bg-green-100 text-green-800';
    case 'Shipped': return 'bg-blue-100 text-blue-800';
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to calculate total amount for an order
const calculateTotalAmount = (order: Order) => {
  return order.products.reduce((total: number, product: Product) => {
    const productTotal = product.price * product.quantity;
    const gstAmount = productTotal * (product.gst / 100);
    return total + productTotal + gstAmount;
  }, 0);
};


const OrderManagementPage: React.FC = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = orders.find((o: Order) => o.id === selectedOrderId);

  // ... the rest of the component code is correct and remains the same ...
  // (You can leave the rest of the file as it was from the previous answer)
  return (
    <UserLayout>
      <div className="container mx-auto p-4 md:p-6 lg:p-8 font-sans">

        {selectedOrder ? (

          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
                <p className="text-lg text-gray-600">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="text-blue-600 hover:underline font-semibold"
              >
                &larr; Back to All Orders
              </button>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Customer Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <p><strong className="text-gray-600">Customer:</strong> {selectedOrder.customerName}</p>
                <p><strong className="text-gray-600">Order Date:</strong> {selectedOrder.orderDate}</p>
                <p><strong className="text-gray-600">Status:</strong> {selectedOrder.status}</p>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <h2 className="text-xl font-semibold text-gray-700 p-6">Products in this Order</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="p-5 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                      <th className="p-5 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                      <th className="p-5 text-center text-xs font-semibold text-gray-600 uppercase">Qty</th>
                      <th className="p-5 text-right text-xs font-semibold text-gray-600 uppercase">Price</th>
                      <th className="p-5 text-right text-xs font-semibold text-gray-600 uppercase">GST</th>
                      <th className="p-5 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.products.map((product: Product) => {
                      const productTotal = product.price * product.quantity;
                      const gstAmount = productTotal * (product.gst / 100);
                      const totalPrice = productTotal + gstAmount;
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 border-b border-gray-200">
                          <td className="p-5 text-sm font-medium text-gray-900">{product.name}</td>
                          <td className="p-5 text-sm text-gray-700">{product.category}</td>
                          <td className="p-5 text-center text-sm text-gray-700">{product.quantity}</td>
                          <td className="p-5 text-right text-sm text-gray-700">₹{product.price.toLocaleString('en-IN')}</td>
                          <td className="p-5 text-right text-sm text-gray-700">{product.gst}%</td>
                          <td className="p-5 text-right text-sm font-semibold text-gray-900">₹{totalPrice.toLocaleString('en-IN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        ) : (

          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Management</h1>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Amount</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: Order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 border-b border-gray-200 cursor-pointer"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <td className="px-5 py-4">
                          <p className="text-blue-600 hover:text-blue-900 font-semibold">{order.id}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700">{order.customerName}</td>
                        <td className="px-5 py-4 text-sm text-gray-700">{order.orderDate}</td>
                        <td className="px-5 py-4 text-sm text-gray-700">₹{calculateTotalAmount(order).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4">
                          <span className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full text-xs ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default OrderManagementPage;