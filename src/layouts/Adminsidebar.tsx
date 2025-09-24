import {
  FaHome, FaChartBar, FaFileAlt, FaCog, FaSignOutAlt, FaTh, FaTimes,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import type { AppDispatch } from "../redux/store/store";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { icon: <FaHome />, name: "Home" },
    { icon: <FaChartBar />, name: "Analytics" },
    { icon: <FaFileAlt />, name: "Reports" },
    { icon: <FaCog />, name: "Settings" },
  ];
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      // redirect after logout
      window.location.href = "/login";
    });
  };

  return (
    <div
      className={`bg-gray-800 text-white w-64 min-h-screen p-3 sm:p-4 flex flex-col justify-between
                  fixed inset-y-0 left-0 transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
                  md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-40`}
    >
      <div>
        <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10">
          <div className="flex items-center">
            <FaTh className="text-xl sm:text-2xl mr-2 sm:mr-3 text-blue-400" />
            <h1 className="text-lg sm:text-xl font-bold">Admin Dashboard</h1>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-xl sm:text-2xl">
            <FaTimes />
          </button>
        </div>
        <nav>
          <ul>
            {menuItems.map((item, index) => (
              <li key={index} className="mb-2 sm:mb-4">
                <a
                  href="#"
                  className="flex items-center p-2 sm:p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm sm:text-base"
                >
                  <span className="mr-3 sm:mr-4 text-lg sm:text-xl">{item.icon}</span>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div>
        <a
          // href="#"
          onClick={handleLogout}
          className="flex items-center p-2 sm:p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm sm:text-base"
        >
          <FaSignOutAlt className="mr-3 sm:mr-4 text-lg sm:text-xl" />
          Logout
        </a>
      </div>
    </div>
  );
};