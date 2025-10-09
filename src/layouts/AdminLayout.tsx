import { useState } from "react";
import { AdminSidebar } from "./Adminsidebar";
import { AdminHeader } from "./AdminHeader";


interface LayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Sidebar - Hidden on mobile by default, visible on desktop */}

      {/* Mobile Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
        ></div>
      )}

      <main className="flex-1 flex flex-col min-w-0 md:ml-64">
        <AdminHeader toggleSidebar={toggleSidebar}/>
        <div className="flex-1 bg-gray-500 overflow-y-auto p-0">
          {children}
        </div>
      </main>
    </div>
  );
};