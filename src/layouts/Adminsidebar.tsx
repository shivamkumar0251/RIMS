import { useState } from "react";
import {
  FaBorderAll,
  FaChevronDown,
  FaChevronRight,
  FaCog,
  FaFileAlt,
  FaHome,
  FaProductHunt,
  FaSignOutAlt, FaTh, FaTimes,
  FaUserPlus
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";
import type { AppDispatch } from "../redux/store/store";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {

  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (name: string) => {
    setExpanded(expanded === name ? null : name);
  };

  const menuItems = [
    { icon: <FaHome />, name: "Home", to: '/admin-dashboard' },
    { icon: <FaUserPlus />, name: "UserRegistration", to: '/userRegistrationForm' },
    { icon: <FaFileAlt />, name: "Category", to: '/addCategoryManagement' },
    {
      icon: <FaProductHunt />, name: "SetUp", to: '/addAdminProducts', children: [
        "Kitchen",
        "Interior",
        "Crockery",
        "Electronics",
        "Furniture",
        "Lighting",
        "Appliances",
        "Decor"
      ],
    },
    {
      icon: <FaProductHunt />, name: "Products", to: '/addAdminProducts', children: [
        "Grocory",
        "Sweets",
        "Cleaning Supplies",
        "Sweet-Specific Ingredients",
        "Beverages"
      ],
    },
    // --- THIS IS THE LINE I CHANGED ---
    { icon: <FaBorderAll />, name: "Order Management", to: '/admin/orders' },
    // ------------------------------------
    { icon: <FaCog />, name: "Settings", to: '/admin-dashboard' },
  ];

  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      window.location.href = '/login'
      // navigate("/login");
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
                {/* This part handles rendering the links and dropdowns */}
                {item.children ? (
                  // This is a dropdown item
                  <div>
                    <button
                      onClick={() => toggleExpand(item.name)}
                      className="flex items-center justify-between w-full p-2 sm:p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm sm:text-base"
                    >
                      <div className="flex items-center">
                        <span className="mr-3 sm:mr-4 text-lg sm:text-xl">{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      {expanded === item.name ? <FaChevronDown className="text-gray-400" /> : <FaChevronRight className="text-gray-400" />}
                    </button>
                    {expanded === item.name && (
                      <ul className="ml-10 mt-1 space-y-1">
                        {item.children.map((sub, subIndex) => (
                          <li key={subIndex}>
                            <Link
                              to={`${item.to}/${item.name}/${sub.toLowerCase()}`}
                              className="block p-2 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors duration-200 text-sm"
                            >
                              {sub}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  // This is a regular link item
                  <Link
                    to={item.to!}
                    className="flex items-center w-full p-2 sm:p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm sm:text-base"
                  >
                    <span className="mr-3 sm:mr-4 text-lg sm:text-xl">{item.icon}</span>
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-2 sm:p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm sm:text-base"
        >
          <FaSignOutAlt className="mr-3 sm:mr-4 text-lg sm:text-xl" />
          Logout
        </button>
      </div>
    </div>
  );
};