// src/pages/OrderManagementPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockOrders as allOrdersData, type Order } from "../../data/ordersWithDetails";
import { AdminLayout } from "../../layouts/AdminLayout";

export default function OrderManagementPage() {
  const [activeTab, setActiveTab] = useState("Pending");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const filtered = allOrdersData.filter(o => o.status === activeTab);
    setFilteredOrders(filtered);
  }, [activeTab]);

  const renderTable = (orders: Order[]) => (
    <div className="bg-white rounded-lg shadow-xl overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-200 text-slate-700">
          <tr>
            <th className="p-4">Order ID</th>
            <th className="p-4 hidden md:table-cell">User ID</th>
            <th className="p-4">Customer</th>
            <th className="p-4 hidden lg:table-cell">Date</th>
            <th className="p-4 hidden sm:table-cell">Total Items</th>
            <th className="p-4">Total Amount</th>
            {activeTab === 'Pending' && <th className="p-4 text-center">Action</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-slate-200 hover:bg-slate-50">
              <td className="p-4 font-medium text-slate-800">{order.id}</td>
              <td className="p-4 text-slate-600 hidden md:table-cell">{order.userId}</td>
              <td className="p-4 text-slate-600">{order.customerName}</td>
              <td className="p-4 text-slate-600 hidden lg:table-cell">{order.orderDate}</td>
              <td className="p-4 text-slate-600 hidden sm:table-cell">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
              <td className="p-4 font-semibold">₹{order.totalAmount.toLocaleString("en-IN")}</td>
              {activeTab === 'Pending' && (
                <td className="p-4 text-center">
                  <button onClick={() => navigate(`/admin/order-details/${order.id}`)} className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full hover:bg-blue-600">
                    Update Order Request
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 md:p-6 bg-slate-50 min-h-screen">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Order Management1</h1>
        <div className="flex border-b border-slate-300 mb-6">
          <button onClick={() => setActiveTab('Pending')} className={`px-4 py-2 font-semibold ${activeTab === 'Pending' ? 'border-b-2 border-slate-800 text-slate-800' : 'text-slate-500'}`}>Pending Orders</button>
          <button onClick={() => setActiveTab('Delivered')} className={`px-4 py-2 font-semibold ${activeTab === 'Delivered' ? 'border-b-2 border-slate-800 text-slate-800' : 'text-slate-500'}`}>Delivered Orders</button>
          <button onClick={() => setActiveTab('Canceled')} className={`px-4 py-2 font-semibold ${activeTab === 'Canceled' ? 'border-b-2 border-slate-800 text-slate-800' : 'text-slate-500'}`}>Canceled Orders</button>
        </div>
        {renderTable(filteredOrders)}
      </div>
    </AdminLayout>
  );
}