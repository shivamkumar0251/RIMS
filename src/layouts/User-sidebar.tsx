import React, { useEffect, useState } from 'react';
import {
  FaBars,
  FaBorderAll,
  FaBoxes,
  FaChair,
  FaCog,
  FaSignOutAlt,
  FaTachometerAlt
} from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { logout } from '../redux/slices/authSlice';
import type { AppDispatch, RootState } from '../redux/store/store';
import { MdBlindsClosed } from "react-icons/md";

const dashboardData = [
  { id: 1, name: 'Dashboard', icon: FaTachometerAlt, to: '/userdashboard' },
  { id: 2, name: 'Products', icon: FaChair, to: '/user/products' },
  { id: 3, name: 'Store Stock', icon: FaBoxes, to: '/user/storestock' },
  { id: 4, name: 'Orders', icon: FaBorderAll, to: '/user/orders' },
  { id: 5, name: 'Consumables', icon: MdBlindsClosed , to: '/user/consumables' },
  { id: 6, name: 'Settings', icon: FaCog, to: '/user/setting' },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const UserSidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const userData = useSelector((state: RootState) => state.auth);
  const [isPinned, setIsPinned] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const isExpanded = isPinned;
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useDispatch<AppDispatch>();

  // ✅ Automatically set active tab based on current route
  useEffect(() => {
    const current = dashboardData.find(item => location.pathname.startsWith(item.to));
    if (current) setSelectedId(current.id);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      window.location.href = "/login";
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar */}
      <div
        className={`fixed z-40 flex h-full flex-col border-r border-slate-200 bg-white text-slate-800 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isExpanded ? 'w-64' : 'w-20'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div
          className={`flex h-16 shrink-0 items-center border-b ${
            isExpanded ? 'px-4' : 'justify-center'
          }`}
        >
          <button
            onClick={() => setIsPinned(!isPinned)}
            className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:block"
          >
            <FaBars className="h-5 w-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-grow space-y-2 p-2">
          {dashboardData.map((item) => {
            const isActive = selectedId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id);
                  navigate(item.to);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center rounded-lg p-3 text-left transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {isExpanded && (
                  <span className="ml-4 whitespace-nowrap font-medium">
                    {item.name}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t p-2">
          <Button
            loading={userData.loading}
            onClick={handleLogout}
            className="flex w-full items-center rounded-lg p-3 text-left font-medium text-gray-600 transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <FaSignOutAlt className="h-5 w-5 shrink-0" />
            {isExpanded && <span className="ml-4 whitespace-nowrap">Logout</span>}
          </Button>
        </div>
      </div>
    </>
  );
};

export default UserSidebar;
