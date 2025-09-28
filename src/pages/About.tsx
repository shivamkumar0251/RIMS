import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaUsers, FaHeart, FaArrowRight } from 'react-icons/fa';
import Layout from '../layouts/Layout';

// --- Types ---
interface CoreValue {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// --- Data for Sections ---
const coreValues: CoreValue[] = [
  {
    icon: <FaLeaf className="h-8 w-8 text-amber-500" />,
    title: 'Finest Ingredients',
    description:
      'We believe that great food starts with the finest, freshest, and most seasonal ingredients available.',
  },
  {
    icon: <FaUsers className="h-8 w-8 text-amber-500" />,
    title: 'Community First',
    description:
      'Hops N Chops is more than a restaurant; it’s a gathering place for friends, family, and food lovers.',
  },
  {
    icon: <FaHeart className="h-8 w-8 text-amber-500" />,
    title: 'Passion for Culinary Arts',
    description:
      'Our kitchen is driven by a deep passion for the culinary arts, pushing boundaries to create memorable dishes.',
  },
];

const AboutPage: React.FC = () => {
  useEffect(() => {
    document.title = "About | Inventory Management System"
    window.scrollTo(0, 0);
  }, []);
  return (
    <Layout>
      <div className="bg-gray-50 text-gray-800">
        {/* Section 1: Hero */}
        <section
          className="relative h-[60vh] bg-cover bg-center text-white flex items-center justify-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight">Our Story</h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-gray-200">
              From a humble beginning to a culinary landmark.
            </p>
          </div>
        </section>

        {/* Section 2: Introduction */}
        <section className="py-20 px-4 container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Welcome to Hops N Chops</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Hops N Chops was born from a simple yet powerful idea: to create a dining experience that combines rustic
            charm with modern culinary innovation. Our journey began with a passion for authentic flavors and a desire
            to build a community around great food. We are not just serving meals; we are creating memories.
          </p>
        </section>

        {/* Section 3: Our Philosophy */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold">
                More Than a Meal, It's Our Philosophy.
              </h2>
              {coreValues.map((value) => (
                <div key={value.title} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{value.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold">{value.title}</h3>
                    <p className="text-gray-600 mt-1">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1887&auto=format&fit=crop"
                alt="A beautiful dish from Hops N Chops"
                className="rounded-lg shadow-2xl object-cover w-full h-full"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Meet the Chef */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1583394293214-28ded15ee548?q=80&w=1887&auto=format&fit=crop"
                alt="Head Chef of Hops N Chops"
                className="rounded-lg shadow-2xl object-cover w-full h-full grayscale"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">The Heart of Our Kitchen</h2>
              <p className="text-lg text-gray-300 mb-6">
                Our culinary vision is led by our Head Chef, whose innovative approach and dedication to quality are at
                the core of every dish we serve. With years of experience in world-class kitchens, they bring a unique
                blend of tradition and creativity to the Hops N Chops menu.
              </p>
              <Link to="/team" className="inline-flex items-center text-amber-500 font-semibold text-lg hover:text-amber-400 transition-colors">
                Meet The Team
                <FaArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 5: Call to Action */}
        <section className="py-20 bg-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Become a Part of Our Story</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Experience the passion and dedication that goes into every meal. We invite you to join us for an
              unforgettable dining experience.
            </p>
            <Link
              to="/reservations"
              className="bg-amber-600 text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-amber-700 transition-transform duration-300 transform hover:scale-105 inline-block"
            >
              Make a Reservation
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AboutPage;
