import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartBar, FaCalculator, FaTruck, FaFileAlt, FaCheckCircle } from 'react-icons/fa';
import Layout from '../layouts/Layout';

// --- Data for Sections ---
const features = [
  {
    icon: <FaChartBar size={32} className="text-blue-500" />,
    title: 'Real-Time Stock Tracking',
    description: 'Monitor every ingredient live, from anywhere, ensuring you never run out unexpectedly.',
  },
  {
    icon: <FaCalculator size={32} className="text-blue-500" />,
    title: 'Automated Food Costing',
    description: 'Instantly know the exact cost of every dish on your menu to maximize profitability.',
  },
  {
    icon: <FaTruck size={32} className="text-blue-500" />,
    title: 'Centralized Supplier Hub',
    description: 'Manage all vendor information, purchase orders, and payments from a single dashboard.',
  },
  {
    icon: <FaFileAlt size={32} className="text-blue-500" />,
    title: 'Intelligent Sales Reports',
    description: 'Identify best-selling items, track ingredient usage, and receive smart stock forecasts.',
  },
];

const benefits = [
  'Tailor-made for the unique workflow of Hops N Chops, not a generic, one-size-fits-all solution.',
  'Eliminate manual counts and data entry, freeing up valuable time for you and your staff.',
  'Reduce food waste with smart expiry alerts and accurate demand forecasting.',
];

// --- Reusable Components ---
const FeatureCard = ({ icon, title, description }: typeof features[0]) => (
  <div className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
    <div className="mb-4 inline-block p-3 bg-blue-100 rounded-full transition-transform duration-300 group-hover:scale-110">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const BenefitItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start">
    <FaCheckCircle className="text-green-500 mr-4 mt-1 flex-shrink-0" size={24} />
    <span className="text-gray-700 text-lg">{children}</span>
  </li>
);

// --- Main Component ---
const Home: React.FC = () => {
  return (
    <Layout>
      <div className="bg-white text-gray-800">
        {/* Hero Section */}
        <section
          className="relative min-h-[80vh] flex items-center justify-center text-center text-white px-4 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1974&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 opacity-0 animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
              Streamline Your Stock. Amplify Your Profits.
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              The all-in-one inventory management system built exclusively for Hops N Chops. Track stock in real-time, minimize waste, and drive profitability.
            </p>
            <div className="flex justify-center gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Link
                to="/admin-login"
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Admin Login
              </Link>
              <Link
                to="/user-login"
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                User Login
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Everything You Need. All In One Place.</h2>
            <p className="text-gray-600 text-lg mb-16 max-w-3xl mx-auto">
              Our platform is packed with powerful tools designed to simplify your restaurant's inventory management from end to end.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">An Intuitive & Powerful Dashboard</h2>
            <p className="text-gray-600 text-lg mb-12 max-w-3xl mx-auto">
              Get a bird's-eye view of your entire inventory on a single, easy-to-understand screen.
            </p>
            <div className="max-w-5xl mx-auto bg-gray-800 rounded-xl p-2 shadow-2xl">
              <div className="flex space-x-1.5 p-2 border-b border-gray-700">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <img
                src="https://img.freepik.com/free-vector/sales-dashboard-template_23-2148993863.jpg?w=1380&t=st=1726980894~exp=1726981494~hmac=b384f88417c8cf4b100e4cd7c2e0b5de975c742c381735467335607b22a27549"
                alt="Inventory Dashboard Preview"
                className="rounded-b-lg w-full"
              />
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-24 bg-blue-50">
          <div className="container mx-auto px-4 grid md:grid-cols-2 items-center gap-16">
            <div className="order-2 md:order-1">
              <h2 className="text-4xl font-bold mb-6">Built For Restaurateurs, By Experts.</h2>
              <ul className="space-y-6">
                {benefits.map((benefit, index) => (
                  <BenefitItem key={index}>{benefit}</BenefitItem>
                ))}
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
                alt="Modern Restaurant Interior"
                className="rounded-xl shadow-2xl w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 text-center bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-4">Take Control of Your Restaurant's Growth.</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Ready to see how better inventory management can boost your bottom line? Get started today.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/admin-login"
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
