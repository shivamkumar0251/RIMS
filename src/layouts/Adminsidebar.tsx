import { useState, type JSX } from "react";
import {
  FaBorderAll,
  FaBoxes,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaCog,
  FaHome,
  FaProductHunt,
  FaShoppingBag,
  FaSignOutAlt,
  FaTh,
  FaTimes,
} from "react-icons/fa";
import { FaKitchenSet, FaShop } from "react-icons/fa6";
import { SiHiveBlockchain, SiMaterialdesignicons } from "react-icons/si";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";
import type { AppDispatch } from "../redux/store/store";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
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

export const AdminSidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  collapsed,
  setCollapsed,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const toggleExpand = (name: string) => {
    setExpanded(expanded === name ? null : name);
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const menuItems: MenuItem[] = [
    { icon: <FaHome />, name: "DashBoard", to: "/admin-dashboard" },
    { icon: <FaBoxes />, name: "Store Stock", to: "/storeStock" },
    { icon: <FaProductHunt />, name: "Product categories", to: "/categories" },
    { icon: <FaShoppingBag />, name: "Products", to: "/admin/products" },
    { icon: <SiHiveBlockchain />, name: "Assets", to: "/assets" },
    { icon: <FaKitchenSet />, name: "Kitchen Stock", to: "/admin/kitchenStock" },
    { icon: <SiMaterialdesignicons />, name: "Consumables", to: "/admin/consumables" },
    { icon: <FaShop />, name: "Vendor", to: "/admin/vendor" },
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
      className={`bg-gray-800 text-white ${
        collapsed ? "w-20" : "w-64"
      } h-screen p-3 sm:p-4 flex flex-col justify-between overflow-hidden
        fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:fixed md:translate-x-0 transition-all duration-300 ease-in-out z-50`}
    >
      {/* FULL HEIGHT CONTAINER */}
      <div className="flex flex-col h-full">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaTh className="text-2xl text-blue-400 mr-2" />
            {!collapsed && <h1 className="text-lg font-bold">Admin Dashboard</h1>}
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-2xl">
            <FaTimes />
          </button>
        </div>

        {/* SCROLLABLE MENU */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1">
          <nav>
            <ul>
              {menuItems.map((item, index) => {
                const isActive =
                  location.pathname === item.to ||
                  ("children" in item && location.pathname.startsWith(item.to));

                return (
                  <li key={index} className="mb-3">
                    {"children" in item ? (
                      <div>
                        <button
                          onClick={() => toggleExpand(item.name)}
                          className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors duration-200 ${
                            isActive ? "bg-gray-700" : "hover:bg-gray-700"
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="text-xl">{item.icon}</span>
                            {!collapsed && <span className="ml-3">{item.name}</span>}
                          </div>
                          {!collapsed &&
                            (expanded === item.name ? (
                              <FaChevronDown className="text-gray-400" />
                            ) : (
                              <FaChevronRight className="text-gray-400" />
                            ))}
                        </button>

                        {!collapsed && expanded === item.name && (
                          <ul className="ml-10 mt-1 space-y-1">
                            {item.children.map((sub, subIndex) => {
                              const subPath = `${item.to}/${sub.toLowerCase()}`;
                              const isSubActive = location.pathname === subPath;
                              return (
                                <li key={subIndex}>
                                  <Link
                                    to={subPath}
                                    className={`block p-2 rounded-lg text-sm transition-colors duration-200 
                                    ${
                                      isSubActive
                                        ? "bg-blue-600/40 text-white"
                                        : "text-gray-300 hover:bg-gray-600"
                                    }`}
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
                      <Link
                        to={item.to}
                        className={`flex items-center w-full p-2 rounded-lg transition-colors duration-200 ${
                          isActive ? "bg-gray-700" : "hover:bg-gray-700"
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        {!collapsed && <span className="ml-3">{item.name}</span>}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* FOOTER */}
        <div className="pt-2 border-t border-gray-700 mt-2">
          <Link
            to="/admin/setting"
            className={`flex items-center w-full p-2.5 rounded-xl hover:bg-gray-700/50 transition-colors duration-200 mb-2 ${
              location.pathname === "/admin/setting" ? "bg-gray-700" : ""
            }`}
          >
            <FaCog className="text-lg" />
            {!collapsed && <span className="font-semibold text-sm ml-3">Settings</span>}
          </Link>

          <div className="relative pt-3">
            {!collapsed && isProfileOpen && (
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
              onClick={() => (collapsed ? null : setIsProfileOpen(!isProfileOpen))}
              className={`group flex items-center w-full p-2.5 rounded-xl hover:bg-gray-700/50 border transition-all duration-300 ${
                isProfileOpen ? "border-blue-500" : "border-transparent"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold mr-3 ring-2 ring-gray-600 group-hover:ring-blue-400 transition-all duration-300">
                {getInitials("Admin")}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-200 group-hover:text-white transition-colors">
                      {"Admin Email"}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">Admin</p>
                  </div>
                  <FaChevronUp
                    className={`text-gray-400 group-hover:text-white transition-all duration-300 ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}
            </button>
          </div>

          <button
            onClick={toggleCollapse}
            className="mt-4 w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-lg transition-all duration-300"
          >
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
            {!collapsed && <span className="ml-2 text-sm">Collapse Sidebar</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
