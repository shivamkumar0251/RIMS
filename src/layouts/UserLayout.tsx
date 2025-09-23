// src/layouts/UserLayout.tsx

import React, { useState } from 'react';
import UserSidebar from './User-sidebar';
import UserHeader from './UserHeader';
// Corrected import paths assuming components are in the '../components' folder
// import UserHeader from '../components/UserHeader';
// import UserSidebar from '../components/UserSidebar';

// Props for the layout component
interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  // State to manage sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      
      {/* Sidebar component, gets state to control its visibility */}
      <UserSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Header component, gets a function to open the sidebar */}
        <UserHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* The rest of the page content will be rendered here */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;