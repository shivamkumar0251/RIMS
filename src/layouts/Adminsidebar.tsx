import { useState, useEffect, type JSX } from "react";
import {
  FaBorderAll,
  FaBoxes,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaCog,
  FaHome,
  FaShoppingBag,
  FaShoppingCart,
  FaSignOutAlt,
  FaTh,
  FaChartBar,
  FaCalendarDay,
  FaStore,
  FaUserTie,
  FaLayerGroup,
  FaTag,
  FaClipboardList,
  FaList,
  FaStar,
  FaTruck,
  FaFileInvoiceDollar,
  FaUtensils,
  FaTint,
  FaChartLine,
  FaGlobeAmericas,
} from "react-icons/fa";
import { SiMaterialdesignicons } from "react-icons/si";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout, clearToken } from "../redux/slices/authSlice";
import { clearAuth } from "../redux/slices/checkTokenSlice";
import { deleteCookie } from "../utils/cookieUtils";
import type { AppDispatch } from "../redux/store/store";
import { PiOvenDuotone } from "react-icons/pi";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { FiPlus, FiSend } from "react-icons/fi";

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
  children: (string | { name: string; to: string; icon?: JSX.Element; type?: "group" | "link"; subChildren?: { name: string; to: string }[] })[];
}

type MenuItem = MenuItemBase | MenuItemWithChildren;

const menuItems: MenuItem[] = [
  { icon: <FaHome size={18} />, name: "Dashboard", to: "/admin-dashboard" },
  {
    icon: <FaShoppingBag size={18} />,
    name: "Products",
    to: "/admin/products",
    children: [
      { name: "Daily Product", to: "/admin/products", icon: <FaCalendarDay size={14} /> },
      { name: "Restaurant Setup", to: "/admin/restaurant-setup", icon: <FaStore size={14} /> },
    ],
  },
  {
    icon: <FaBorderAll size={18} />,
    name: "Order Management",
    to: "/admin/orders",
    children: [
      {
        name: "By Vendor",
        to: "/admin/orders?mode=vendor",
        icon: <FaTruck size={14} />
      },
      {
        name: "By Category",
        to: "/admin/orders?mode=category",
        icon: <FaLayerGroup size={14} />
      },
      {
        name: "By Brand",
        to: "/admin/orders?mode=brand",
        icon: <FaTag size={14} />
      }
    ]
  },
  {
    icon: <PiOvenDuotone size={18} />,
    name: "Order History",
    to: "/admin/vendorsOrder",
  },
  {
    icon: <BiSolidPurchaseTag size={18} />,
    name: "Purchase",
    to: "/admin/purchase",
    children: [
      { name: "Purchase List", to: "/admin/purchase", icon: <FaClipboardList size={14} /> },
    ],
  },
  { icon: <FaBoxes size={18} />, name: "Store Stock", to: "/storeStock" },
  {
    icon: <FiSend size={18} />,
    name: "Kitchen Issue",
    to: "/admin/kitchen-issue",
  },
  {
    icon: <FaShoppingCart size={18} />,
    name: "Kitchen Store",
    to: "/admin/kitchenStock",
  },
  {
    icon: <PiOvenDuotone size={18} />,
    name: "Kitchen Consumption",
    to: "/admin/kitchen-consumption",
  },
  {
    icon: <SiMaterialdesignicons size={18} />,
    name: "Consumables",
    to: "/admin/consumables",
  },
  {
    icon: <FaBoxes size={18} />,
    name: "Setup Store",
    to: "/admin/setup-store",
  },
  {
    icon: <FaTh size={18} />,
    name: "Master Lists",
    to: "/admin/masters",
    children: [
      { name: "Categories List", to: "/admin/categories", icon: <FaLayerGroup size={14} /> },
      { name: "Brand List", to: "/admin/company", icon: <FaTag size={14} /> },
      { name: "Vendor List", to: "/admin/vendorList", icon: <FaTruck size={14} /> },
    ],
  },
  {
    icon: <FaChartBar size={18} />,
    name: "Reports",
    to: "/admin/reports",
    children: [
      { name: "Purchase Report", to: "/admin/reports/purchase", icon: <FaFileInvoiceDollar size={14} /> },
      { name: "Stock Report", to: "/admin/reports/stock", icon: <FaBoxes size={14} /> },
      { name: "Consumption Report", to: "/admin/reports/consumption", icon: <FaUtensils size={14} /> },
      { name: "Consumables Report", to: "/admin/reports/consumables", icon: <FaTint size={14} /> },
      { name: "Sales Report", to: "/admin/reports/sales", icon: <FaChartLine size={14} /> },
      { name: "Purchase Origin Report", to: "/admin/reports/purchase-origin", icon: <FaGlobeAmericas size={14} /> },
    ],
  },
];

export const AdminSidebar: React.FC<SidebarProps> = ({
  isOpen,
  collapsed,
  setCollapsed,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleExpand = (name: string) => {
    setExpanded(expanded === name ? null : name);
  };

  // Automatically expand parent menu if current route matches
  useEffect(() => {
    menuItems.forEach((item) => {
      if ("children" in item) {
        const isChildActive = location.pathname.startsWith(item.to) ||
          item.children.some(
            (child) => typeof child !== "string" && child.to === location.pathname
          );

        if (isChildActive) {
          setExpanded(item.name);
        }
      }
    });
  }, [location.pathname]);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    deleteCookie("token");
    deleteCookie("userId");
    localStorage.removeItem("rims_role");
    localStorage.removeItem("rims_userId");
    dispatch(clearAuth());
    dispatch(clearToken());
    dispatch(logout()).finally(() => {
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
      className={`bg-[#0d1529] text-gray-300 ${collapsed ? "w-20" : "w-64"
        } h-screen flex flex-col justify-between overflow-hidden
          fixed inset-y-0 left-0 transform ${isOpen ? "translate-x-0" : "-translate-x-full"
        } md:fixed md:translate-x-0 transition-all duration-200 ease-in-out z-50 border-r border-[#1e293b]`}
    >
      {/* FULL HEIGHT CONTAINER */}
      <div className="flex flex-col h-full">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white shrink-0">
              <FaTh size={16} />
            </div>
            {!collapsed && (
              <h1 className="text-xl font-bold text-white tracking-tight">Inventory</h1>
            )}
          </div>
          <button onClick={toggleCollapse} className="text-gray-400 hover:text-white transition-colors">
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        {/* SCROLLABLE MENU */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <nav>
            <ul className="space-y-1">
              {menuItems.map((item, index) => {
                const isActive =
                  location.pathname === item.to ||
                  ("children" in item &&
                    (location.pathname.startsWith(item.to) ||
                      item.children.some(
                        (child) =>
                          typeof child !== "string" &&
                          child.to === location.pathname
                      )));

                // Expandable Item (Parent)
                if ("children" in item) {
                  const isExpanded = expanded === item.name;

                  return (
                    <li key={index}>
                      <div
                        className={`group flex items-center w-full py-2.5 px-4 rounded-md transition-all duration-100 select-none cursor-pointer
                          ${isActive
                            ? "bg-[#1e293b] text-blue-400"
                            : "text-gray-400 hover:bg-[#1e293b] hover:text-white"}`}
                      >
                        {/* Main Clickable Area: Icon & Text */}
                        <div
                          className="flex-1 flex items-center"
                          onClick={() => {
                            if (["Purchase", "Products", "Order Management"].includes(item.name)) {
                              navigate(item.to);
                              // Force expand, never collapse on main click
                              setExpanded(item.name);
                            } else {
                              toggleExpand(item.name);
                            }
                          }}
                        >
                          {/* Icon Column */}
                          <div className="w-6 flex items-center justify-center shrink-0 ml-0 mr-3">
                            {item.icon}
                          </div>

                          {/* Text Column */}
                          {!collapsed && (
                            <span className="font-medium text-sm flex-1 text-left truncate">{item.name}</span>
                          )}
                        </div>

                        {/* Chevron Column (Toggle Only) */}
                        {!collapsed && (
                          <div
                            className="w-4 flex items-center justify-center shrink-0 ml-auto p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(item.name);
                            }}
                          >
                            <FaChevronRight
                              size={10}
                              className={`transition-transform duration-150 ${isExpanded ? "rotate-90" : "rotate-0"}`}
                            />
                          </div>
                        )}
                      </div>

                      {/* Submenu */}
                      {!collapsed && isExpanded && (
                        <ul className="mt-1 relative ml-[1.7rem] border-l border-gray-800 space-y-1 py-1 transition-all duration-200">
                          {item.children.map((sub, subIndex) => {
                            let subName = "";
                            let subPath = "";
                            let subIcon: JSX.Element | undefined;
                            let isGroup = false;

                            if (typeof sub === 'string') {
                              subName = sub;
                              subPath = `${item.to}/${sub.toLowerCase()}`;
                            } else {
                              subName = sub.name;
                              subPath = sub.to;
                              subIcon = sub.icon;
                              isGroup = sub.type === "group";
                            }

                            const isSubActive = location.pathname === subPath.split('?')[0] &&
                              (subPath.includes('?') ? location.search.includes(subPath.split('?')[1]) : true);

                            if (isGroup) return null;

                            return (
                              <li key={subIndex} className="relative group/item">
                                <Link
                                  to={subPath}
                                  className={`flex items-center justify-between w-full py-2 pl-4 pr-3 text-[13px] rounded-r-md transition-all duration-150
                                  ${isSubActive
                                      ? "bg-gradient-to-r from-blue-600/20 to-transparent border-l-2 border-blue-500 text-blue-400 font-medium"
                                      : "text-gray-500 hover:text-gray-200 border-l-2 border-transparent hover:border-gray-600 hover:bg-white/5"
                                    }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {subIcon ? (
                                      <span className={`text-[14px] transition-all duration-150 ${isSubActive ? 'text-blue-500' : 'text-gray-600 group-hover/item:text-gray-400'}`}>{subIcon}</span>
                                    ) : (
                                      <span className={`w-1.5 h-1.5 rounded-full transition-all duration-150 ${isSubActive ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-gray-700 group-hover/item:bg-gray-400'}`}></span>
                                    )}
                                    <span>{subName}</span>
                                  </div>

                                  {!["Reports", "Order Management"].includes(item.name) && (
                                    <FiPlus
                                      className={`transition-all duration-150 hover:text-blue-400 hover:scale-110 cursor-pointer ${isSubActive ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'}`}
                                      size={14}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        navigate(subPath.includes('?') ? `${subPath}&action=add` : `${subPath}?action=add`);
                                      }}
                                    />
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                // Simple Link Item
                return (
                  <li key={index}>
                    <Link
                      to={item.to}
                      className={`flex items-center w-full py-2.5 px-4 rounded-md transition-all duration-200 select-none
                        ${isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                          : "text-gray-400 hover:bg-[#1e293b] hover:text-white"}`}
                    >
                      <div className="w-6 flex items-center justify-center shrink-0 ml-0 mr-3">
                        {item.icon}
                      </div>

                      {!collapsed && (
                        <span className="font-medium text-sm truncate">{item.name}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-[#1e293b] bg-[#0b1121]">
          <Link
            to="/admin/setting"
            className={`flex items-center w-full py-2.5 px-4 rounded-md hover:bg-[#1e293b] transition-colors duration-200 ${location.pathname === "/admin/setting" ? "bg-[#1e293b] text-white" : "text-gray-400"
              }`}
          >
            <div className="w-6 flex items-center justify-center ml-0 mr-3"><FaCog size={18} /></div>
            {!collapsed && <span className="font-medium text-sm">Settings</span>}
          </Link>

          <div className="relative pt-2">
            {!collapsed && isProfileOpen && (
              <div className="absolute bottom-full left-0 w-full bg-[#1e293b] rounded-lg p-2 shadow-xl border border-gray-700 mb-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full p-2 rounded hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200 text-sm text-gray-300"
                >
                  <FaSignOutAlt className="mr-3" />
                  Logout
                </button>
              </div>
            )}

            <button
              onClick={() => collapsed ? null : setIsProfileOpen(!isProfileOpen)}
              className={`group flex items-center w-full px-4 py-2 rounded-md hover:bg-[#1e293b] transition-all duration-200`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0 ring-2 ring-[#0d1529] group-hover:ring-blue-500 transition-all">
                {getInitials("Admin")}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 ml-3 text-left overflow-hidden">
                    <p className="font-medium text-sm text-gray-200 truncate">Admin User</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Administrator</p>
                  </div>
                  <FaChevronDown size={10} className={`text-gray-500 ${isProfileOpen ? "rotate-180" : ""}`} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
