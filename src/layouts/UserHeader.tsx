import React from 'react';
import { FaBars, FaBell, FaUserCircle } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

interface UserHeaderProps {
  onMenuClick: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Map routes to titles
  const routeTitles: Record<string, string> = {
    '/user/products': 'Products',
    '/user/storestock': 'Store Stock',
    '/user/orders': 'Orders',
    '/user/consumables': 'Consumables',
    '/user/setting': 'Setting',
  };

  // Determine title based on current path
  const title = routeTitles[location.pathname] || 'Dashboard';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
      <button 
        onClick={onMenuClick}
        className="text-slate-600 hover:text-blue-600 md:hidden"
        aria-label="Open sidebar"
      >
        <FaBars className="h-6 w-6" />
      </button>

      {/* Dynamic Page Title */}
      <h1 className="text-xl font-bold text-slate-800 hidden md:block">
        {title}
      </h1>

      {/* Notification + Profile Icons */}
      <div className="flex items-center space-x-4">
        <FaBell className="h-5 w-5 text-slate-500" />
        <FaUserCircle
          className="h-6 w-6 text-slate-500 cursor-pointer"
          onClick={() => navigate('/user/profile')}
        />
      </div>
    </header>
  );
};

export default UserHeader;
