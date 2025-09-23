import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaHome, FaBars, FaTimes } from 'react-icons/fa'; 
import { FiLogIn } from 'react-icons/fi'; 
import { IoRestaurant } from 'react-icons/io5'; 

const navLinks = [
 
  { to: '/', label: 'Home', icon: <FaHome className="mr-2" /> },
  { to: '/about', label: 'About' },
  { to: '/outlets', label: 'Our Outlets' },
  { to: '/franchise', label: 'Franchise Inquiry' },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-white/90 shadow-sm sticky top-0 z-40 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800">
         
              <IoRestaurant className="h-6 w-6 text-blue-600" />
              <span>Hops N Chops</span>
            </Link>

            <div className="hidden md:flex md:items-center md:space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center font-medium transition-colors duration-200 ${
                      isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                    }`
                  }
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="hidden md:block">
              <Link
                to="/login"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-all duration-300"
              >
             
                <FiLogIn size={16} />
                <span>Login</span>
              </Link>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(true)} className="p-2 text-gray-700">
                <FaBars size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60"
          onClick={() => setIsMenuOpen(false)}
        ></div>

        <aside
          className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white p-6 transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b">
            <span className="font-bold text-lg text-gray-800">Hops N Chops</span>
            <button onClick={() => setIsMenuOpen(false)} className="p-2">
              <FaTimes size={24} className="text-gray-600" />
            </button>
          </div>

          <div className="mt-6 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center text-lg p-2 rounded-md ${
                    isActive ? 'font-bold text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </div>

          <Link
            to="/login"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white w-full mt-8 px-4 py-2 rounded-full font-medium"
          >
            <FiLogIn size={16} />
            <span>Login</span>
          </Link>
        </aside>
      </div>
    </>
  );
};

export default Navbar;