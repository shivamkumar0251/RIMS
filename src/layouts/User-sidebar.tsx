

import React, { useState } from 'react';
import { FaBars, FaTachometerAlt, FaChair, FaBoxes, FaShoppingCart, FaCog, FaSignOutAlt } from "react-icons/fa";

const dashboardData = [
    { id: 1, name: 'Dashboard', icon: FaTachometerAlt },
    { id: 2, name: 'Fixed Assets', icon: FaChair },
    { id: 3, name: 'Store Stock', icon: FaBoxes },
    { id: 4, name: 'Purchase Requests', icon: FaShoppingCart },
    { id: 5, name: 'Settings', icon: FaCog },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const UserSidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [isPinned, setIsPinned] = useState(true); 
  const [selectedId, setSelectedId] = useState(1);
  const isExpanded = isPinned;

  return (
    <>

      <div 
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div
        className={`fixed z-40 flex h-full flex-col border-r border-slate-200 bg-white text-slate-800 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isExpanded ? 'w-64' : 'w-20'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full' 
        }`}
      >
        <div className={`flex h-16 shrink-0 items-center border-b ${isExpanded ? 'px-4' : 'justify-center'}`}>
            <button onClick={() => setIsPinned(!isPinned)} className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:block">
                <FaBars className="h-5 w-5" />
            </button>
        </div>
        
        <nav className="flex-grow space-y-2 p-2">
          {dashboardData.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedId(item.id);
                setIsOpen(false); 
              }}
              className={`flex w-full items-center rounded-lg p-3 text-left transition-colors duration-200 ${
                selectedId === item.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {isExpanded && <span className="ml-4 whitespace-nowrap font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>
        
        <div className="border-t p-2">
            <button className="flex w-full items-center rounded-lg p-3 text-left text-slate-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-600">
                <FaSignOutAlt className="h-5 w-5 shrink-0" />
                {isExpanded && <span className="ml-4 whitespace-nowrap font-medium">Logout</span>}
            </button>
        </div>
      </div>
    </>
  );
};

export default UserSidebar;