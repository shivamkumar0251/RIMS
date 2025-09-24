import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 py-12">
      <h1 className="text-9xl font-extrabold text-gray-800">404</h1>
      <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-gray-700">
        Oops! Page not found
      </h2>
      <p className="mt-2 text-gray-500 text-center">
        The page you’re looking for doesn’t exist or has been moved.
      </p>

      <div className="mt-6">
        <Link
          to="/"
          className="px-6 py-3 text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
