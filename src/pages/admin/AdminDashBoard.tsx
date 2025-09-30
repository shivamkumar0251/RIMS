import React, { useEffect, useState } from 'react';
import { FaDollarSign, FaShoppingCart, FaBox, FaBuilding, FaFileCsv, FaArrowUp, FaArrowDown, FaUsers, FaTimes } from 'react-icons/fa';
import { AdminLayout } from '../../layouts/AdminLayout';
import { exportToCsv } from '../../utils/export';

// --- Reusable Stats Card Component ---
interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  iconBgColor: string;
  onClick?: () => void;
}
const StatsCard: React.FC<StatsCardProps> = ({ icon, title, value, change, changeType, iconBgColor, onClick }) => {
  const isIncrease = changeType === 'increase';
  const isClickable = !!onClick;
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 flex items-center justify-between ${isClickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`} onClick={onClick}>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        {change && (
          <div className={`flex items-center text-xs mt-2 ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
            {isIncrease ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            <span>{change} vs last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${iconBgColor}`}>
        {icon}
      </div>
    </div>
  );
};

// --- Sales Performance Table Component ---
const SalesPerformance = () => {
    const salesData = [
        { month: 'January 2025', totalSales: '₹1,20,00,000', unitsSold: '5,580', profit: '₹10,80,000', profitPercent: '9.0%', status: 'Completed' },
        { month: 'February 2025', totalSales: '₹95,00,000', unitsSold: '3,980', profit: '₹8,50,000', profitPercent: '8.9%', status: 'Completed' },
        { month: 'March 2025', totalSales: '₹1,43,00,000', unitsSold: '6,450', profit: '₹12,10,000', profitPercent: '8.5%', status: 'Completed' },
        { month: 'April 2025', totalSales: '₹1,05,00,000', unitsSold: '4,800', profit: '₹9,20,000', profitPercent: '8.8%', status: 'In Progress' },
    ];
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Completed': return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Completed</span>;
            case 'In Progress': return <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">In Progress</span>;
            default: return <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">{status}</span>;
        }
    };
    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-gray-800 text-lg font-semibold">Monthly Sales Performance</h2>
                {/* UPDATED BUTTON STYLE */}
                <button 
                    onClick={() => exportToCsv(salesData, 'sales-performance.csv')} 
                    className="flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg transition text-sm w-full sm:w-auto"
                    style={{ backgroundColor: '#1A2536', opacity: 0.9 }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '0.9'}
                >
                    <FaFileCsv size={14} /> 
                    <span>Export</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="py-3 px-3 text-gray-500 font-medium">Month</th>
                            <th className="py-3 px-3 text-gray-500 font-medium">Total Sales</th>
                            <th className="py-3 px-3 text-gray-500 font-medium">Units Sold</th>
                            <th className="py-3 px-3 text-gray-500 font-medium">Profit</th>
                            <th className="py-3 px-3 text-gray-500 font-medium">Profit %</th>
                            <th className="py-3 px-3 text-gray-500 font-medium text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {salesData.map((row, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-3 font-medium">{row.month}</td>
                                <td className="py-3 px-3">{row.totalSales}</td>
                                <td className="py-3 px-3">{row.unitsSold}</td>
                                <td className="py-3 px-3 font-medium text-green-600">{row.profit}</td>
                                <td className="py-3 px-3">{row.profitPercent}</td>
                                <td className="py-3 px-3 text-center">{getStatusBadge(row.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Stock Movement Table Component ---
const StockMovement = () => {
    const stockData = [
        { id: 'PROD-001A', product: 'Wireless Mouse', currentStock: 80, minThreshold: 50, status: 'In Stock' },
        { id: 'PROD-002B', product: 'Mechanical Keyboard', currentStock: 45, minThreshold: 50, status: 'Low Stock' },
        { id: 'PROD-003C', product: '4K Webcam', currentStock: 0, minThreshold: 20, status: 'Out of Stock' },
        { id: 'PROD-004D', product: 'USB-C Hub', currentStock: 120, minThreshold: 30, status: 'In Stock' },
        { id: 'PROD-005E', product: 'Monitor Stand', currentStock: 75, minThreshold: 40, status: 'In Stock' },
    ];
    const getStatusDot = (status: string) => {
        switch (status) {
            case 'In Stock': return <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> In Stock</div>;
            case 'Low Stock': return <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div> Low Stock</div>;
            case 'Out of Stock': return <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Out of Stock</div>;
            default: return <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div> {status}</div>;
        }
    };
    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-gray-800 text-lg font-semibold">Stock Movement</h2>
                {/* UPDATED BUTTON STYLE */}
                <button 
                    onClick={() => exportToCsv(stockData.map(({ ...rest }) => rest), 'stock-movement.csv')} 
                    className="flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg transition text-sm w-full sm:w-auto"
                    style={{ backgroundColor: '#1A2536', opacity: 0.9 }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '0.9'}
                >
                    <FaFileCsv size={14} />
                    <span>Export</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="py-3 px-3 text-gray-500 font-medium">Product ID</th>
                            <th className="py-3 px-3 text-gray-500 font-medium">Product</th>
                            <th className="py-3 px-3 text-gray-500 font-medium">Current Stock</th>
                            <th className="py-3 px-3 text-gray-500 font-medium">Min Threshold</th>
                            <th className="py-3 px-3 text-gray-500 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {stockData.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-3 font-mono text-xs">{item.id}</td>
                                <td className="py-3 px-3 font-medium">{item.product}</td>
                                <td className="py-3 px-3">{item.currentStock} units</td>
                                <td className="py-3 px-3">{item.minThreshold} units</td>
                                <td className="py-3 px-3 font-medium">{getStatusDot(item.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- [NEW] User Data Modal Component ---
const UsersModal = ({ users, onClose }: { users: any[], onClose: () => void }) => {
  const [userList, setUserList] = useState(users);

  const handleToggle = (userId: number) => {
    setUserList(currentUsers =>
      currentUsers.map(user =>
        user.id === userId ? { ...user, active: !user.active } : user
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <FaTimes className="text-gray-600"/>
          </button>
        </div>
        
        {/* Modal Body with scroll */}
        <div className="p-4 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-3 text-gray-500 font-medium">Name</th>
                  <th className="py-3 px-3 text-gray-500 font-medium">Email</th>
                  <th className="py-3 px-3 text-gray-500 font-medium">Last Purchase</th>
                  <th className="py-3 px-3 text-gray-500 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {userList.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium">{user.name}</td>
                    <td className="py-3 px-3">{user.email}</td>
                    <td className="py-3 px-3">{user.lastPurchase}</td>
                    <td className="py-3 px-3 text-center">
                      <label htmlFor={`toggle-${user.id}`} className="flex items-center justify-center cursor-pointer">
                        <div className="relative">
                          <input type="checkbox" id={`toggle-${user.id}`} className="sr-only" checked={user.active} onChange={() => handleToggle(user.id)} />
                          <div className={`block w-12 h-6 rounded-full ${user.active ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${user.active ? 'translate-x-6' : ''}`}></div>
                        </div>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Main Dashboard Component ---
function Admindashboard() {
  const [showUsersModal, setShowUsersModal] = useState(false);

  // Mock data for the users modal
  const userData = [
    { id: 1, name: 'Rohan Sharma', email: 'rohan.s@example.com', lastPurchase: '55" 4K TV', active: true },
    { id: 2, name: 'Priya Singh', email: 'priya.singh@example.com', lastPurchase: 'Sofa Set', active: true },
    { id: 3, name: 'Amit Kumar', email: 'amit.k@example.com', lastPurchase: 'Office Chair', active: false },
    { id: 4, name: 'Sunita Devi', email: 'sunita.d@example.com', lastPurchase: 'Dinner Set', active: true },
    { id: 5, name: 'Vikram Rathod', email: 'vikram.r@example.com', lastPurchase: 'Smart Watch', active: true },
  ];

  useEffect(() => {
    document.title = "Admin Dashboard | Inventory Management System";
    window.scrollTo(0, 0);
  }, []);

  return (
    <AdminLayout>
      <div className="w-full bg-gray-100 min-h-screen p-4 md:p-6">
        {/* Stats Cards Grid - New Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <StatsCard icon={<FaDollarSign size={22} className="text-blue-800"/>} title="TOTAL SALES" value="₹1.2Cr" change="+5.2%" changeType="increase" iconBgColor="bg-blue-100"/>
          <StatsCard icon={<FaShoppingCart size={22} className="text-green-800"/>} title="TOTAL ORDERS" value="5,820" change="+2.1%" changeType="increase" iconBgColor="bg-green-100"/>
          <StatsCard icon={<FaBox size={22} className="text-orange-800"/>} title="TOTAL STOCK" value="15,400" change="-1.5%" changeType="decrease" iconBgColor="bg-orange-100"/>
          <StatsCard icon={<FaBuilding size={22} className="text-purple-800"/>} title="TOTAL REVENUE" value="₹95L" change="+8.0%" changeType="increase" iconBgColor="bg-purple-100"/>
          <StatsCard 
            icon={<FaUsers size={22} className="text-teal-800"/>} 
            title="TOTAL USERS" 
            value={userData.length.toString()} 
            iconBgColor="bg-teal-100"
            onClick={() => setShowUsersModal(true)}
          />
        </div>

        {/* Tables Section */}
        <div className="flex flex-col space-y-6">
          <SalesPerformance />
          <StockMovement />
        </div>
      </div>
      
      {/* Conditionally render the modal */}
      {showUsersModal && <UsersModal users={userData} onClose={() => setShowUsersModal(false)} />}
    </AdminLayout>
  );
}

export default Admindashboard;