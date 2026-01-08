import { useState, type JSX } from "react";
import {
  FaBorderAll,
  FaBoxes,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaCog,
  FaHome,
  FaProductHunt,
  FaShoppingBag,
  FaShoppingCart,
  FaSignOutAlt,
  FaTh,
  FaTimes,
} from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import { MdBrandingWatermark } from "react-icons/md";
import { SiMaterialdesignicons } from "react-icons/si";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";
import type { AppDispatch } from "../redux/store/store";
import { PiOvenDuotone } from "react-icons/pi";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { FiSend } from "react-icons/fi";
import { useEffect } from "react";
import { getVendorNameList, selectVendorNames } from "../redux/slices/vendorSlice";
import { getCategories, selectCategories } from "../redux/slices/categorySlice";
import { getCompanies, selectCompanies } from "../redux/slices/companySlice";

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
  children: (string | { name: string; to: string; type?: "group" | "link"; subChildren?: { name: string; to: string }[] })[];
}

type MenuItem = MenuItemBase | MenuItemWithChildren;

export const AdminSidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  collapsed,
  setCollapsed,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [subExpanded, setSubExpanded] = useState<string | null>(null); // For 3rd level menu
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  // Fetch Data for Sidebar
  const vendors = useSelector(selectVendorNames) || [];
  const categories = useSelector(selectCategories) || [];
  const brands = useSelector(selectCompanies) || [];

  useEffect(() => {
    dispatch(getVendorNameList());
    dispatch(getCategories({ page: 1, limit: 100 }));
    dispatch(getCompanies({ page: 1, limit: 100 }));
  }, [dispatch]);

  const toggleExpand = (name: string) => {
    setExpanded(expanded === name ? null : name);
    setSubExpanded(null); // Reset sub-menu when main menu changes
  };

  const toggleSubExpand = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSubExpanded(subExpanded === name ? null : name);
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const menuItems: MenuItem[] = [
    { icon: <FaHome />, name: "Dashboard", to: "/admin-dashboard" },
    { icon: <FaShoppingBag />, name: "Products", to: "/admin/products" },
    {
      icon: <FaBorderAll />,
      name: "Order Management",
      to: "/admin/orders",
      children: [
        {
          name: "By Vendor",
          to: "#",
          type: "group",
          subChildren: vendors.map(v => ({ name: v.vendor_name || "Unknown", to: `/admin/orders?mode=vendor&id=${v._id}` }))
        },
        {
          name: "By Category",
          to: "#",
          type: "group",
          subChildren: categories.map(c => ({ name: c.categoryName || "Unknown", to: `/admin/orders?mode=category&id=${c._id}` }))
        },
        {
          name: "By Brand",
          to: "#",
          type: "group",
          subChildren: brands.map(b => ({ name: b.brandName || "Unknown", to: `/admin/orders?mode=brand&id=${b._id}` }))
        }
      ]
    },
    {
      icon: <PiOvenDuotone />,
      name: "Order History",
      to: "/admin/vendorsOrder",
    },
    { icon: <BiSolidPurchaseTag />, name: "Purchase", to: "/admin/purchase" },
    { icon: <FaBoxes />, name: "Store Stock", to: "/storeStock" },
    {
      icon: <FiSend size={20} />,
      name: "Kitchen Issue",
      to: "/admin/kitchen-issue",
    },
    {
      icon: <FaShoppingCart size={20} />,
      name: "Kitchen Store",
      to: "/admin/kitchenStock",
    },
    {
      icon: <PiOvenDuotone size={20} />,
      name: "Kitchen Consumption",
      to: "/admin/kitchen-consumption",
    },
    {
      icon: <SiMaterialdesignicons />,
      name: "Consumables",
      to: "/admin/consumables",
    },
    {
      icon: <FaProductHunt />,
      name: "Categories List",
      to: "/admin/categories",
    },
    { icon: <MdBrandingWatermark />, name: "Brand List", to: "/admin/company" },
    { icon: <FaShop />, name: "Vendor List", to: "/admin/vendorList" },

    { icon: <FaTh />, name: "Restaurant Setup", to: "/admin/restaurant-setup" },
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
      className={`bg-gray-800 text-white ${collapsed ? "w-20" : "w-64"
        } h-screen p-3 sm:p-4 flex flex-col justify-between overflow-hidden
          fixed inset-y-0 left-0 transform ${isOpen ? "translate-x-0" : "-translate-x-full"
        } md:fixed md:translate-x-0 transition-all duration-300 ease-in-out z-50`}
    >
      {/* FULL HEIGHT CONTAINER */}
      <div className="flex flex-col h-full">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaTh className="text-2xl text-blue-400 mr-2" />
              {!collapsed && (
                <h1 className="text-lg font-bold">Admin Dashboard</h1>
              )}
            </div>
            <button onClick={toggleSidebar} className="md:hidden text-2xl">
              <FaTimes />
            </button>
          </div>
          <button onClick={toggleCollapse}>
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        {/* SCROLLABLE MENU */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
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
                          className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors duration-200 ${isActive ? "bg-gray-700" : "hover:bg-gray-700"
                            }`}
                        >
                          <div className="flex items-center">
                            <span className="text-xl">{item.icon}</span>
                            {!collapsed && (
                              <span className="ml-3">{item.name}</span>
                            )}
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
                              let subName = "";
                              let subPath = "";
                              let isGroup = false;
                              let subChildrenResults: { name: string; to: string }[] = [];

                              if (typeof sub === 'string') {
                                subName = sub;
                                subPath = `${item.to}/${sub.toLowerCase()}`;
                              } else {
                                subName = sub.name;
                                subPath = sub.to;
                                isGroup = sub.type === "group";
                                subChildrenResults = sub.subChildren || [];
                              }

                              const isSubActive = location.pathname + location.search === subPath;
                              const isGroupExpanded = subExpanded === subName;

                              if (isGroup) {
                                return (
                                  <li key={subIndex}>
                                    <button
                                      onClick={(e) => toggleSubExpand(subName, e)}
                                      className={`flex items-center justify-between w-full p-2 rounded-lg text-sm transition-colors duration-200 text-gray-300 hover:bg-gray-600`}
                                    >
                                      <span className="truncate">{subName}</span>
                                      {isGroupExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                                    </button>

                                    {isGroupExpanded && (
                                      <ul className="ml-4 mt-1 space-y-1 border-l border-gray-600 pl-2 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-track]:bg-transparent">
                                        {subChildrenResults.map((child, childIndex) => {
                                          const isChildActive = location.pathname + location.search === child.to;
                                          return (
                                            <li key={childIndex}>
                                              <Link
                                                to={child.to}
                                                className={`block p-2 rounded text-xs transition-colors duration-200
                                                ${isChildActive ? "text-blue-400 font-semibold" : "text-gray-400 hover:text-white"}`}
                                              >
                                                {child.name}
                                              </Link>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    )}
                                  </li>
                                );
                              }

                              return (
                                <li key={subIndex}>
                                  <Link
                                    to={subPath}
                                    className={`block p-2 rounded-lg text-sm transition-colors duration-200
                                    ${isSubActive
                                        ? "bg-blue-600/40 text-white"
                                        : "text-gray-300 hover:bg-gray-600"
                                      }`}
                                  >
                                    {subName}
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
                        className={`flex items-center w-full p-2 rounded-lg transition-colors duration-200 ${isActive ? "bg-gray-700" : "hover:bg-gray-700"
                          }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        {!collapsed && (
                          <span className="ml-3">{item.name}</span>
                        )}
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
            className={`flex items-center w-full p-2.5 rounded-xl hover:bg-gray-700/50 transition-colors duration-200 mb-2 ${location.pathname === "/admin/setting" ? "bg-gray-700" : ""
              }`}
          >
            <FaCog className="text-lg" />
            {!collapsed && (
              <span className="font-semibold text-sm ml-3">Settings</span>
            )}
          </Link>

          <div className="relative pt-2">
            {!collapsed && isProfileOpen && (
              <div className="absolute bottom-full left-0 w-full bg-gray-700 rounded-lg p-2 shadow-lg">
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
              onClick={() =>
                collapsed ? null : setIsProfileOpen(!isProfileOpen)
              }
              className={`group flex items-center w-full p-3 rounded-xl bg-gray-700/50 border transition-all duration-300 ${isProfileOpen ? "border-blue-500" : "border-transparent"
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
                  <FaChevronDown
                    className={`text-gray-400 group-hover:text-white transition-all duration-300 ${isProfileOpen ? "rotate-180" : ""
                      }`}
                  />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
