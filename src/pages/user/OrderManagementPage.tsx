// src/pages/UserOrderManagementPage.tsx

import React, { useMemo, useState } from 'react';
// Assuming the userOrdersData.ts file with 20 orders is correctly located
import { FiArrowLeft, FiBox, FiCalendar, FiClock, FiDollarSign, FiMapPin, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { orders, type Order, type Product } from '../../data/userOrdersData';
import UserLayout from '../../layouts/UserLayout';


// Helper functions (remain the same)
const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'Delivered': return 'bg-green-100 text-green-800 border-green-500';
    case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-500';
    case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
    case 'Cancelled': return 'bg-red-100 text-red-800 border-red-500';
    default: return 'bg-gray-100 text-gray-800 border-gray-500';
  }
};

const calculateTotalAmount = (order: Order) => {
  return order.products.reduce((total: number, product: Product) => {
    const productTotal = product.price * product.quantity;
    const gstAmount = productTotal * (product.gst / 100);
    return total + productTotal + gstAmount;
  }, 0);
};

const ProductRow: React.FC<{ product: Product }> = ({ product }) => {
  const productTotal = product.price * product.quantity;
  const gstAmount = productTotal * (product.gst / 100);
  const totalPrice = productTotal + gstAmount;

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100">
      <td className="p-4 text-sm font-medium text-gray-900">{product.name}</td>
      <td className="p-4 text-sm text-gray-600">{product.category}</td>
      <td className="p-4 text-center text-sm font-bold text-blue-600">{product.quantity}</td>
      <td className="p-4 text-right text-sm text-gray-700">₹{product.price.toLocaleString('en-IN')}</td>
      <td className="p-4 text-right text-sm text-gray-700">{product.gst}%</td>
      <td className="p-4 text-right text-sm font-extrabold text-green-700">₹{totalPrice.toLocaleString('en-IN')}</td>
    </tr>
  );
};
// -------------------------------------------------------------------


const UserOrderManagementPage: React.FC = () => {
  // 1. Order Detail State
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // 2. Filter States
  const [filterStatus, setFilterStatus] = useState<'All' | Order['status']>('All');
  const [filterDate, setFilterDate] = useState<string>(''); // Stores YYYY-MM-DD

  // 3. New Search State
  const [searchTerm, setSearchTerm] = useState<string>('');

  const selectedOrder = orders.find((o: Order) => o.id === selectedOrderId);


  // --- Memoized Filtered Orders List ---
  const filteredOrders = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return orders.filter(order => {
      // 1. Status Filter
      const matchesStatus = filterStatus === 'All' || order.status === filterStatus;

      // 2. Date Filter
      const matchesDate = filterDate === '' || order.orderDate === filterDate;

      // 3. Search Filter (by ID or Product Name)
      const matchesSearch =
        // Check Order ID
        order.id.toLowerCase().includes(lowerCaseSearchTerm) ||
        // Check any Product Name
        order.products.some(product =>
          product.name.toLowerCase().includes(lowerCaseSearchTerm)
        );

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [filterStatus, filterDate, searchTerm]);
  // --------------------------------------

  const handleResetFilters = () => {
    setFilterStatus('All');
    setFilterDate('');
    setSearchTerm(''); // Reset search term
  };

  const allStatuses: Array<Order['status']> = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];


  return (
    <UserLayout>
      <div className="container mx-auto p-4 md:p-6 lg:p-8 font-sans bg-gray-50 min-h-screen">

        {selectedOrder ? (
          // ====================================
          // 1. Order Details View (No Changes Needed Here)
          // ====================================
          <div>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-800">Order Details</h1>
                <p className="text-lg text-gray-600">ID: <span className="font-mono text-blue-600 font-bold">{selectedOrder.id}</span></p>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="flex items-center space-x-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-sm"
              >
                <FiArrowLeft className="h-4 w-4" /> <span>Back to All Orders</span>
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className={`p-4 rounded-xl shadow-lg border-l-8 font-bold ${getStatusColor(selectedOrder.status)}`}>
                <FiBox className="inline mr-2" />
                Status: <span className="uppercase">{selectedOrder.status}</span>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-lg border-l-4 border-gray-400">
                <FiCalendar className="inline mr-2 text-gray-500" />
                <p className="text-sm text-gray-500">Ordered On</p>
                <p className="font-semibold text-gray-900">{selectedOrder.orderDate}</p>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-lg border-l-4 border-blue-400">
                <FiClock className="inline mr-2 text-blue-500" />
                <p className="text-sm text-gray-500">Delivery Date</p>
                <p className="font-semibold text-gray-900">{selectedOrder.deliveryDate || 'N/A'}</p>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-lg border-l-4 border-green-500">
                <FiDollarSign className="inline mr-2 text-green-600" />
                <p className="text-sm text-gray-500">Total Charged</p>
                <p className="font-extrabold text-xl text-green-700">₹{calculateTotalAmount(selectedOrder).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Shipping & Product Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white shadow-xl rounded-xl p-6 h-fit">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2"><FiMapPin className="inline mr-2 text-blue-500" /> Shipping To</h2>
                <p className="font-semibold text-lg text-gray-900">{selectedOrder.customerName}</p>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedOrder.shippingAddress}</p>
              </div>

              <div className="lg:col-span-2 bg-white shadow-xl rounded-xl overflow-hidden">
                <h2 className="text-2xl font-bold text-gray-800 p-6 border-b border-gray-100">Items ({selectedOrder.products.length})</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full leading-normal">
                    <thead className="bg-gray-100 border-b-2 border-gray-200">
                      <tr>
                        <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Product Name</th>
                        <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
                        <th className="p-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Qty</th>
                        <th className="p-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Price</th>
                        <th className="p-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">GST</th>
                        <th className="p-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Total (Incl. GST)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.products.map((product: Product) => (
                        <ProductRow key={product.id} product={product} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // ====================================
          // 2. All Orders Card List View (With Search and Filters)
          // ====================================
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">My Orders ({filteredOrders.length} of {orders.length})</h1>
            <p className="text-gray-600 mb-6">Search by Order ID or Product Name, or use the filters below.</p>

            {/* --- Filter and Search Bar --- */}
            <div className="bg-white p-5 rounded-xl shadow-xl mb-8 flex flex-col lg:flex-row gap-4 items-end">

              {/* Search Input */}
              <div className="w-full lg:w-96">
                <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 mb-1">Search Orders</label>
                <div className="relative">
                  <input
                    id="search-term"
                    type="text"
                    placeholder="Search by Order ID or Product name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-auto lg:w-48">
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'All' | Order['status'])}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="All">All Statuses</option>
                  {allStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="w-full md:w-auto lg:w-48">
                <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                <input
                  id="date-filter"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-700 transition"
                />
              </div>

              {/* Reset Button */}
              <div className="w-full md:w-auto lg:w-fit">
                <button
                  onClick={handleResetFilters}
                  className="w-full lg:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition font-semibold text-sm h-[42px]"
                >
                  <FiRefreshCw className="h-4 w-4" /> <span>Reset</span>
                </button>
              </div>
            </div>
            {/* --- End Filter and Search Bar --- */}


            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order: Order) => (
                  <div
                    key={order.id}
                    className="bg-white shadow-lg rounded-xl overflow-hidden transform hover:shadow-xl hover:scale-[1.01] transition duration-300 border-t-4 border-blue-500 cursor-pointer"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <span className={`inline-block px-3 py-1 font-bold leading-tight rounded-full text-xs border ${getStatusColor(order.status)} border-opacity-50`}>
                          {order.status}
                        </span>
                        <p className="text-xs text-gray-500 flex items-center">
                          <FiCalendar className="mr-1" /> {order.orderDate}
                        </p>
                      </div>

                      {/* Content */}
                      <h2 className="text-xl font-bold text-blue-700 mb-1">{order.id}</h2>
                      <p className="text-sm text-gray-600 mb-3">
                        {order.products.length} {order.products.length === 1 ? 'Item' : 'Items'} purchased
                      </p>

                      {/* Total */}
                      <div className="border-t pt-3 mt-3 flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Total:</span>
                        <span className="text-lg font-extrabold text-green-700">
                          ₹{calculateTotalAmount(order).toLocaleString('en-IN')}
                        </span>
                      </div>

                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 bg-white rounded-xl shadow-lg border border-gray-200">
                  <p className="text-xl text-gray-600">No orders match the current search or filter criteria. 😔</p>
                  <button onClick={handleResetFilters} className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold">
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default UserOrderManagementPage;