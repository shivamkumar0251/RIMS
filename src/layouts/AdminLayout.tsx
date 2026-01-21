import { useState } from "react";
import { AdminSidebar } from "./Adminsidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
        ></div>
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-64"
          } h-screen overflow-y-auto`}
      >
        <div className="flex-1 bg-white flex flex-col p-0">{children}</div>
      </main>
    </div>
  );
};
