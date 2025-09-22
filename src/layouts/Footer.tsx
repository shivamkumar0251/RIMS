import React from 'react';

const Footer: React.FC = () => {

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-5 mt-12 border-t border-gray-200">
      <p className="text-center text-sm text-gray-500">
        &copy; {currentYear} Hops N Chops. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;