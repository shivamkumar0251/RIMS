import React from 'react';
import { FaSearch, FaBars, FaPrint } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const AdminHeader: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const location = useLocation();

  // Map of routes to page titles
  const routeTitles: Record<string, string> = {
    '/admin-dashboard': 'Dashboard',
    '/storeStock': 'Store Stock',
    '/categories': 'Categories',
    '/admin/products': 'Products',
    '/assets': 'Assets',
    '/admin/kitchenStock': 'Kitchen Stock',
    '/admin/consumables': 'Consumables',
    '/admin/orders': 'Orders Management',
    '/admin/order-details': 'Orders Management',
    '/admin/vendor': 'Vendors',
    '/admin/setting': 'Setting',
  };

  // Detect title from current route (fallback to Dashboard)
  const title =
    Object.entries(routeTitles).find(([path]) =>
      location.pathname.startsWith(path)
    )?.[1] || 'Dashboard';

  return (
    <header className="sticky top-0 flex justify-between items-center p-2 sm:p-3 md:p-4 bg-white shadow-sm border-b border-gray-200 z-40">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle Button - visible on mobile */}
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200 md:hidden"
        >
          <FaBars className="text-lg" />
        </button>

        {/* Dynamic Page Title */}
        <h1 className="hidden md:block text-gray-800 text-xl font-bold">
          {title}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 ml-auto">
        {/* Search Box */}
        <div className="relative">
          <FaSearch className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
          <input
            type="text"
            placeholder="Q ENGINE"
            className="bg-gray-700 text-white placeholder-gray-400 rounded-lg py-1.5 sm:py-2 pl-7 sm:pl-8 md:pl-10 pr-2 sm:pr-3 md:pr-4 w-28 sm:w-36 md:w-48 lg:w-64 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Print Button */}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm md:text-base"
        >
          <FaPrint />
          <span className="hidden sm:inline">Print</span>
        </button>

        {/* Optional Profile Icon */}
        {/* 
        <CgProfile
          size={30}
          color="black"
          onClick={() => navigate('/admin/profile')}
          className="cursor-pointer"
        /> 
        */}
      </div>
    </header>
  );
};
