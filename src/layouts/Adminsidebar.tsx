import { useState, type JSX } from "react";
import {
  FaBorderAll,
  FaBoxes,
  FaChevronDown,
  FaChevronRight,
  FaChevronUp,
  FaCog,
  FaHome,
  FaProductHunt,
  FaShoppingBag,
  FaSignOutAlt,
  FaTh,
  FaTimes
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";
import type { AppDispatch } from "../redux/store/store";
import { FaKitchenSet } from "react-icons/fa6";
import { SiMaterialdesignicons } from "react-icons/si";
import { SiHiveBlockchain } from "react-icons/si";
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface MenuItemBase {
  icon: JSX.Element;
  name: string;
  to: string;
}

interface MenuItemWithChildren extends MenuItemBase {
  children: string[];
}

type MenuItem = MenuItemBase | MenuItemWithChildren;

export const AdminSidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const toggleExpand = (name: string) => {
    setExpanded(expanded === name ? null : name);
  };

  const menuItems: MenuItem[] = [
    { icon: <FaHome />, name: "DashBoard", to: "/admin-dashboard" },
    { icon: <FaBoxes />, name: "Store Stock", to: "/storeStock" },
    { icon: <FaProductHunt />, name: "Product categories", to: "/categories" },
    { icon: <FaShoppingBag />, name: "Products", to: "/admin/products" },
    { icon: <SiHiveBlockchain  />, name: "Assets", to: "/assets" },
    { icon: <FaKitchenSet />, name: "Kitchen Stoke", to: "/admin/kitchenStoke" },
    { icon:  <SiMaterialdesignicons />, name: "Consumables", to: "/admin/consumables" },
    { icon: <FaBorderAll />, name: "Order Management", to: "/admin/orders" },
  ];

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      window.location.href = "/login";
    });
  };

  const getInitials = (name: string): string => {
    const names = name.split(" ");
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  };

  return (
    <div
      className={`bg-gray-800 text-white w-64 h-screen p-3 sm:p-4 flex flex-col justify-between overflow-hidden
                  fixed inset-y-0 left-0 transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
                  md:fixed md:translate-x-0 transition-transform duration-300 ease-in-out z-50`}
    >
      {/* HEADER */}
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

        {/* NAVIGATION */}
        <nav>
          <ul>
            {menuItems.map((item, index) => {
              const isActive =
                location.pathname === item.to ||
                ("children" in item && location.pathname.startsWith(item.to));

              return (
                <li key={index} className="mb-2 sm:mb-4">
                  {"children" in item ? (
                    // Dropdown
                    <div>
                      <button
                        onClick={() => toggleExpand(item.name)}
                        className={`flex items-center justify-between w-full p-2 sm:p-3 rounded-lg transition-colors duration-200 text-sm sm:text-base 
              ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`}
                      >
                        <div className="flex items-center">
                          <span className="mr-3 sm:mr-4 text-lg sm:text-xl">{item.icon}</span>
                          <span>{item.name}</span>
                        </div>
                        {expanded === item.name ? (
                          <FaChevronDown className="text-gray-400" />
                        ) : (
                          <FaChevronRight className="text-gray-400" />
                        )}
                      </button>

                      {expanded === item.name && (
                        <ul className="ml-10 mt-1 space-y-1">
                          {item.children.map((sub, subIndex) => {
                            const subPath = `${item.to}/${item.name}/${sub.toLowerCase()}`;
                            const isSubActive = location.pathname === subPath;

                            return (
                              <li key={subIndex}>
                                <Link
                                  to={subPath}
                                  className={`block p-2 rounded-lg text-sm transition-colors duration-200 
                        ${isSubActive ? "bg-blue-600/40 text-white" : "text-gray-300 hover:bg-gray-600"}`}
                                >
                                  {sub}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    // Regular link
                    <Link
                      to={item.to}
                      className={`flex items-center w-full p-2 sm:p-3 rounded-lg text-sm sm:text-base transition-colors duration-200 
            ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`}
                    >
                      <span className="mr-3 sm:mr-4 text-lg sm:text-xl">{item.icon}</span>
                      {item.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* FOOTER */}
      <div>
        <Link
          to="/admin/setting"
          className={`flex items-center w-full p-2.5 rounded-xl hover:bg-gray-700/50 transition-colors duration-200 text-left mb-2 ${location.pathname === "/admin/setting" ? "bg-gray-700" : ""
            }`}
        >
          <FaCog className="mr-3 text-lg" />
          <span className="font-semibold text-sm">Settings</span>
        </Link>

        <div className="relative border-t border-gray-700 pt-3 mt-2">
          {isProfileOpen && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-gray-700 rounded-lg p-2 shadow-lg">
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
              >
                <FaSignOutAlt className="mr-3 text-lg" />
                Logout
              </button>
            </div>
          )}

          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`group flex items-center w-full p-2.5 rounded-xl hover:bg-gray-700/50 border transition-all duration-300 text-left ${isProfileOpen ? "border-blue-500" : "border-transparent"
              }`}
          >
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold mr-3 ring-2 ring-gray-600 group-hover:ring-blue-400 transition-all duration-300">
              {getInitials("Admin Full Name")}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-200 group-hover:text-white transition-colors">
                {"Admin Email"}
              </p>
              <p className="text-xs text-gray-400 capitalize">Admin</p>
            </div>
            <FaChevronUp
              className={`text-gray-400 group-hover:text-white transition-all duration-300 ${isProfileOpen ? "rotate-180" : ""
                }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
