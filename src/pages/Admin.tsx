import React from 'react';
import { FaDollarSign, FaShoppingCart, FaBox, FaBuilding, FaFileCsv } from 'react-icons/fa';
import { AdminLayout } from '../layouts/AdminLayout';
import { exportToCsv } from '../utils/export';
// import { exportToCsv } from '../utils/export'; // Import the utility function

// --- Reusable Stats Card Component ---
interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  bgColor: string;
}
const StatsCard: React.FC<StatsCardProps> = ({ icon, title, value, bgColor }) => {
  return (
    <div className={`rounded-lg p-4 sm:p-6 text-white ${bgColor}`}>
      <div className="flex items-center">
        <div className="text-2xl sm:text-3xl mr-3 sm:mr-4">{icon}</div>
        <div>
          <p className="text-xs sm:text-sm font-light uppercase">{title}</p>
          <p className="text-xl sm:text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

// --- Sales Performance Table Component ---
const SalesPerformance = () => {
  const salesData = [
    { month: 'January', totalSales: '$1.2M', unitsSold: '5.58M', profit: '10/80 C', profitPercent: '6 uoni', status: 1 },
    { month: 'Hbdcnm3', totalSales: '$1.2M', unitsSold: '3.980K', profit: '3', profitPercent: '0 nota', status: 3 },
    { month: 'Mordstews', totalSales: '$43M', unitsSold: '4450K', profit: '3', profitPercent: '6 noti', status: 1 },
    { month: 'Swane', totalSales: '$1.05M', unitsSold: '1.003K', profit: '200 180k', profitPercent: '1k.18', status: 13 },
  ];

  return (
    <div className="bg-gray-800 p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-b border-gray-700 pb-2 sm:pb-3 mb-2 sm:mb-3">
        <h2 className="text-white text-sm sm:text-base md:text-lg font-semibold">Monthly Sales Performance</h2>
        <button
          onClick={() => exportToCsv(salesData, 'sales-performance.csv')}
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-xs sm:text-sm w-full sm:w-auto"
        >
          <FaFileCsv />
          Export
        </button>
      </div>
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <div className="px-2 sm:px-0">
          <table className="w-full text-left text-xs sm:text-sm min-w-[600px]">
            <thead className="text-gray-400 uppercase">
              <tr>
                <th className="py-2 px-2 sm:px-3">Month</th>
                <th className="py-2 px-2 sm:px-3">Total Sales</th>
                <th className="py-2 px-2 sm:px-3">Units Sold</th>
                <th className="py-2 px-2 sm:px-3">Profit</th>
                <th className="py-2 px-2 sm:px-3">Profit %</th>
                <th className="py-2 px-2 sm:px-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {salesData.map((row, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="py-2 px-2 sm:px-3">{row.month}</td>
                  <td className="py-2 px-2 sm:px-3">{row.totalSales}</td>
                  <td className="py-2 px-2 sm:px-3">{row.unitsSold}</td>
                  <td className="py-2 px-2 sm:px-3">{row.profit}</td>
                  <td className="py-2 px-2 sm:px-3">{row.profitPercent}</td>
                  <td className="py-2 px-2 sm:px-3">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Stock Movement Table Component ---
const StockMovement = () => {
    const stockData = [
        { id: 'Product ID', product: 'Product A', currentStock: '8 units', minThreshold: '5', status: 'In Stock', statusVal: 1 },
        { id: 'Product 1D', product: 'Product B', currentStock: '8 units', minThreshold: '8', status: 'Low Stock', statusVal: 3 },
        { id: 'Graduact 1Y', product: 'Product B', currentStock: '5 units', minThreshold: '8', status: 'Out of Stock', statusVal: 7 },
        { id: 'Graduact RY', product: 'Product C', currentStock: '4 units', minThreshold: '3', status: 'In Stock', statusVal: 7 },
        { id: 'Tredast RY', product: 'Product C', currentStock: '8 units', minThreshold: '8', status: 'In Stock', statusVal: 7 },
    ];
    
    return (
        <div className="bg-gray-800 p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
              <h2 className="text-white text-sm sm:text-base md:text-lg font-semibold">STOCK MOVEMENT</h2>
              <button
                onClick={() => exportToCsv(stockData, 'stock-movement.csv')}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-xs sm:text-sm w-full sm:w-auto"
              >
                <FaFileCsv />
                Export
              </button>
            </div>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div className="px-2 sm:px-0">
                    <table className="w-full text-left text-xs sm:text-sm min-w-[600px]">
                        <thead className="bg-gray-700 text-gray-400 uppercase">
                            <tr>
                                <th className="p-2 sm:p-3 rounded-l-lg">Product ID</th>
                                <th className="p-2 sm:p-3">Product</th>
                                <th className="p-2 sm:p-3">Current Stock</th>
                                <th className="p-2 sm:p-3">Min Threshold</th>
                                <th className="p-2 sm:p-3">Status</th>
                                <th className="p-2 sm:p-3 rounded-r-lg">Status #</th>
                            </tr>
                        </thead>
                        <tbody className="text-white">
                            {stockData.map((item, index) => (
                                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-2 sm:p-3">{item.id}</td>
                                    <td className="p-2 sm:p-3">{item.product}</td>
                                    <td className="p-2 sm:p-3">{item.currentStock}</td>
                                    <td className="p-2 sm:p-3">{item.minThreshold} units</td>
                                    <td className="p-2 sm:p-3">{item.status}</td>
                                    <td className="p-2 sm:p-3">{item.statusVal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


// --- Main Dashboard Component ---
function Admindashboard() {
  return (
    <AdminLayout>
      <div className="w-full p-2 sm:p-3 md:p-4 lg:p-6">
        {/* Stats Cards Grid - Now responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 my-3 sm:my-4 md:my-6">
          <StatsCard icon={<FaDollarSign />} title="SALES" value="$1.2M" bgColor="bg-blue-600" />
          <StatsCard icon={<FaShoppingCart />} title="ORDERS" value="5,800" bgColor="bg-green-600" />
          <StatsCard icon={<FaBox />} title="STOCK" value="15,000 Units" bgColor="bg-orange-500" />
          <StatsCard icon={<FaBuilding />} title="REVENUE" value="$950K" bgColor="bg-purple-600" />
        </div>

        {/* Tables Section */}
        <div className="flex flex-col space-y-3 sm:space-y-4 md:space-y-6">
            <SalesPerformance />
            <StockMovement />
        </div>
      </div>
    </AdminLayout>
  );
}

export default Admindashboard;