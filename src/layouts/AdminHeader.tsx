import { FaSearch, FaBars, FaPrint } from 'react-icons/fa';
// import { CgProfile } from "react-icons/cg";
// import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const AdminHeader: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  // const navigate = useNavigate()
  return (
    <header className="sticky top-0 flex justify-between items-center p-2 sm:p-3 md:p-4 bg-white shadow-sm border-b border-gray-200 z-40">
      {/* Hamburger Menu - Visible only on mobile */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200 md:hidden"
        >
          <FaBars className="text-lg" />
        </button>
        <h1 className="hidden md:block text-gray-800 text-xl font-bold">
          {/* {currentPageTitle} */}
          Admin Sidebar
        </h1>
      </div>

      {/* Right-side items */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 ml-auto">
        <div className="relative">
          <FaSearch className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
          <input
            type="text"
            placeholder="Q ENGINE"
            className="bg-gray-700 text-white placeholder-gray-400 rounded-lg py-1.5 sm:py-2 pl-7 sm:pl-8 md:pl-10 pr-2 sm:pr-3 md:pr-4 w-28 sm:w-36 md:w-48 lg:w-64 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm md:text-base"
        >
          <FaPrint />
          <span className="hidden sm:inline">Print</span>
        </button>
        
          {/* <CgProfile  size={30} color='black' onClick={()=>navigate('/admin/profile')} /> */}
      </div>
    </header>
  );
};