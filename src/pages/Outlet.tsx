import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { FaMapMarkerAlt, FaPhone, FaClock, FaSearch, FaBeer } from 'react-icons/fa';

// --- TypeScript Interface for Outlet Data ---
interface Outlet {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  imageUrl: string;
  googleMapsUrl: string;
  features: string[];
}

// --- Sample Data (Aap ise baad mein API se la sakte hain) ---
const outletsData: Outlet[] = [
  {
    id: 1,
    name: 'Hops N Chops - Koramangala',
    address: '123, 5th Block, Koramangala, Bengaluru',
    phone: '+91 98765 43210',
    hours: '11:00 AM - 11:00 PM',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop',
    googleMapsUrl: 'https://maps.app.goo.gl/m3T9y4gYv1eX5Z6z7',
    features: ['Craft Beer', 'Live Music'],
  },
  {
    id: 2,
    name: 'Hops N Chops - Bandra',
    address: '456, Linking Road, Bandra West, Mumbai',
    phone: '+91 98765 11223',
    hours: '12:00 PM - 1:00 AM',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop',
    googleMapsUrl: 'https://maps.app.goo.gl/m3T9y4gYv1eX5Z6z7',
    features: ['Rooftop Seating'],
  },
  {
    id: 3,
    name: 'Hops N Chops - Connaught Place',
    address: '789, Inner Circle, Connaught Place, New Delhi',
    phone: '+91 98765 55667',
    hours: '11:30 AM - 12:30 AM',
    imageUrl: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?q=80&w=1950&auto=format&fit=crop',
    googleMapsUrl: 'https://maps.app.goo.gl/m3T9y4gYv1eX5Z6z7',
    features: ['Craft Beer', 'Family Friendly'],
  },
   {
    id: 4,
    name: 'Hops N Chops - Cyber Hub',
    address: '101, DLF Cyber Hub, Gurugram',
    phone: '+91 98765 88990',
    hours: '12:00 PM - 12:00 AM',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop',
    googleMapsUrl: 'https://maps.app.goo.gl/m3T9y4gYv1eX5Z6z7',
    features: ['Rooftop Seating', 'Live Music'],
  },
];

// --- Reusable Outlet Card Component ---
const OutletCard: React.FC<{ outlet: Outlet }> = ({ outlet }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 transform hover:-translate-y-2">
    <img src={outlet.imageUrl} alt={outlet.name} className="w-full h-56 object-cover" />
    <div className="p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{outlet.name}</h3>
      <div className="space-y-3 text-gray-600">
        <p className="flex items-start"><FaMapMarkerAlt className="mr-3 mt-1 text-yellow-500 flex-shrink-0" /> {outlet.address}</p>
        <p className="flex items-center"><FaPhone className="mr-3 text-yellow-500" /> {outlet.phone}</p>
        <p className="flex items-center"><FaClock className="mr-3 text-yellow-500" /> {outlet.hours}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {outlet.features.map(feature => (
          <span key={feature} className="bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
            {feature}
          </span>
        ))}
      </div>
      <a
        href={outlet.googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 w-full inline-block text-center bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors duration-300"
      >
        Get Directions
      </a>
    </div>
  </div>
);


// --- Main Outlets Page Component ---
const OurOutlets: React.FC = () => {
  useEffect(() => {
  // Yeh function page ko top (0, 0) position par scroll kar dega
  window.scrollTo(0, 0);
}, []);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOutlets = outletsData.filter(outlet =>
    outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    outlet.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="bg-gray-50">
        {/* Hero Section */}
        <section className="relative h-[50vh] bg-cover bg-center text-white flex items-center justify-center"
                 style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=2070&auto=format&fit=crop')" }}>
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">Find Your Nearest Hops N Chops</h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-gray-200">
              Your next favorite meal is just around the corner.
            </p>
          </div>
        </section>

        {/* Search and Outlets Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-16">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or city (e.g., Koramangala, Mumbai...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg bg-white border-2 border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Outlets Grid */}
            {filteredOutlets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredOutlets.map(outlet => (
                        <OutletCard key={outlet.id} outlet={outlet} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-600">
                    <h3 className="text-2xl font-bold">No Outlets Found</h3>
                    <p className="mt-2">Try a different search term. We are expanding soon!</p>
                </div>
            )}
          </div>
        </section>

        {/* Franchise CTA Section */}
        <section className="py-20 bg-gray-900 text-white text-center">
            <div className="container mx-auto px-4">
                <FaBeer className="text-yellow-500 text-5xl mx-auto mb-4" />
                <h2 className="text-4xl font-bold mb-4">Want to Join the Family?</h2>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                    Bring the magic of Hops N Chops to your city. We are looking for passionate partners to grow with us.
                </p>
                <Link
                    to="/franchise"
                    className="bg-yellow-500 text-black px-8 py-3 rounded-full font-semibold text-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105"
                >
                    Learn About Franchise
                </Link>
            </div>
        </section>
      </div>
    </Layout>
  );
};

export default OurOutlets;