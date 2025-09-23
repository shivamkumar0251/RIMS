import { FaSearch, FaBars, FaPrint } from 'react-icons/fa';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const AdminHeader: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="flex justify-between items-center p-2 sm:p-3 md:p-4 bg-gray-800 md:bg-transparent">
      {/* Hamburger Menu - Visible only on mobile */}
      <button onClick={toggleSidebar} className="text-white text-lg sm:text-xl md:text-2xl md:hidden">
        <FaBars />
      </button>

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
      </div>
    </header>
  );
};