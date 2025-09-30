import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockOrders as allOrdersData, type Order } from "../../data/ordersWithDetails";
import { AdminLayout } from "../../layouts/AdminLayout";

// Define the tabs with their display names and corresponding status values
const TABS = [
  { name: "View Orders", status: "Pending" },
  { name: "Process", status: "Processing" },
  { name: "Sent to User", status: "Delivered" },
  { name: "Order Conform", status: "Confirmed" },
];

export default function OrderManagementPage() {
  // Set the initial active tab to the status of the first tab
  const [activeTab, setActiveTab] = useState(TABS[0].status);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // This logic correctly filters orders based on the active tab's status
    const filtered = allOrdersData.filter(o => o.status === activeTab);
    setFilteredOrders(filtered);
  }, [activeTab]);

  const renderOrders = (orders: Order[]) => {
    if (orders.length === 0) {
      return <div className="text-center p-8 bg-white rounded-lg shadow-xl text-slate-500">No orders found in this category.</div>
    }

    // Determine if the action button should be shown (for the first two stages)
    const showActionButton = activeTab === 'Pending' || activeTab === 'Processing';

    return (
      <>
        {/* Mobile View */}
        <div className="space-y-4 md:hidden">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-lg p-4 border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-800">{order.id}</p>
                  <p className="text-xs text-slate-500">{order.orderDate}</p>
                </div>
                <p className="font-bold text-lg text-slate-900">₹{order.totalAmount.toLocaleString("en-IN")}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-medium text-slate-700">{order.customerName} ({order.userId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Items:</span>
                  <span className="font-medium text-slate-700">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
              </div>
              {showActionButton && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button onClick={() => navigate(`/admin/order-details/${order.id}`)} className="w-full px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors">
                    View & Process
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block bg-white rounded-lg shadow-xl overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead className="bg-slate-200 text-slate-700">
              <tr>
                <th className="p-4">Order Info</th>
                <th className="p-4">Customer Info</th>
                <th className="p-4">Total Items</th>
                <th className="p-4">Total Amount</th>
                {showActionButton && <th className="p-4 text-center">Action</th>}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">
                    <div>{order.id}</div>
                    <div className="text-xs text-slate-400">{order.orderDate}</div>
                  </td>
                  <td className="p-4 text-slate-600">
                    <div>{order.customerName}</div>
                    <div className="text-xs text-slate-400">{order.userId}</div>
                  </td>
                  <td className="p-4 text-slate-600">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                  <td className="p-4 font-semibold">₹{order.totalAmount.toLocaleString("en-IN")}</td>
                  {showActionButton && (
                    <td className="p-4 text-center">
                      <button onClick={() => navigate(`/admin/order-details/${order.id}`)} className="px-4 py-2 bg-blue-500 text-white text-xs font-semibold rounded-full hover:bg-blue-600 transition-colors">
                        View & Process
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 md:p-6 bg-slate-50 min-h-screen">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">Order Management</h1>
        
        {/* Responsive Dynamic Tab Buttons */}
        <div className="w-full overflow-x-auto">
            <div className="flex border-b border-slate-300 mb-6 min-w-max">
                {TABS.map(tab => (
                    <button 
                        key={tab.status}
                        onClick={() => setActiveTab(tab.status)} 
                        className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold transition-colors whitespace-nowrap ${activeTab === tab.status ? 'border-b-2 border-slate-800 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>
        </div>
        
        {renderOrders(filteredOrders)}
      </div>
    </AdminLayout>
  );
}