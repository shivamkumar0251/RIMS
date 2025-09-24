// src/components/UserHeader.tsx

import React from 'react';
import { FaBars, FaBell, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface UserHeaderProps {
  onMenuClick: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
      <button 
        onClick={onMenuClick}
        className="text-slate-600 hover:text-blue-600 md:hidden"
        aria-label="Open sidebar"
      >
        <FaBars className="h-6 w-6" />
      </button>
      <h1 className="text-xl font-bold text-slate-800 hidden md:block">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <FaBell className="h-5 w-5 text-slate-500" />
        <FaUserCircle className="h-6 w-6 text-slate-500" onClick={()=>navigate("/user/profile")} />
      </div>
    </header>
  );
};

export default UserHeader;