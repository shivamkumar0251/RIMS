import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaBeer, FaUsers, FaMusic } from 'react-icons/fa';
import Layout from '../layouts/Layout';

const welcomeContent = {
  titlePart1: 'Welcome to',
  titlePart2: 'Hops N Chops',
  description: 'Born from a passion for authentic flavors, Hops N Chops is where rustic charm meets modern culinary innovation. We are more than just a cafe; we are a community hub for food lovers, friends, and families to create lasting memories.',
  imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop',
};

const features = [
  {
    icon: <FaLeaf size={32} className="text-yellow-500" />,
    title: 'Farm-Fresh Ingredients',
    description: 'Every dish is crafted with the freshest, locally-sourced ingredients to ensure unparalleled taste and quality.',
  },
  {
    icon: <FaBeer size={32} className="text-yellow-500" />,
    title: 'Craft Beers & Hops',
    description: 'Explore our exclusive selection of craft beers and signature hops that perfectly complement our food menu.',
  },
  {
    icon: <FaUsers size={32} className="text-yellow-500" />,
    title: 'Cozy & Vibrant Ambiance',
    description: 'Our cafe is designed to be the perfect spot for every occasion, from a quiet coffee to a lively get-together.',
  },
  {
    icon: <FaMusic size={32} className="text-yellow-500" />,
    title: 'Live Events & Music',
    description: 'Enjoy live music sessions and special events that make every visit a unique and memorable experience.',
  },
];

const signatureDishes = [
  {
    name: 'Sizzling Lamb Chops',
    description: 'Perfectly grilled lamb chops served on a sizzling platter with our secret house sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1629552258953-9a3b755b7998?q=80&w=1887&auto=format&fit=crop',
  },
  {
    name: 'Craft Beer Battered Fish',
    description: 'Crispy golden fish fillets fried in our signature craft beer batter, served with tartar sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1599924298158-b1243540e115?q=80&w=1887&auto=format&fit=crop',
  },
  {
    name: 'The Hops Burger',
    description: 'A juicy, handcrafted patty topped with caramelized onions, aged cheddar, and a special hoppy mayo.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop',
  },
]


const FeatureCard = ({ icon, title, description }: typeof features[0]) => (
  <div className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-yellow-500/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-transparent hover:border-yellow-500">
    <div className="mb-4 inline-block p-3 bg-yellow-100 rounded-full transition-transform duration-300 group-hover:scale-110">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const DishCard = ({ name, description, imageUrl }: typeof signatureDishes[0]) => (
  <div className="group relative overflow-hidden rounded-xl shadow-lg">
    <img src={imageUrl} alt={name} className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-500" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
    <div className="absolute bottom-0 left-0 p-6">
      <h3 className="text-2xl font-bold text-white">{name}</h3>
      <p className="text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{description}</p>
    </div>
  </div>
);


const Home: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <Layout>
      <div className="bg-white text-gray-800">

        <section
          className="relative min-h-[90vh] flex items-center justify-center text-center text-white px-4 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=2070&auto=format&fit=crop')",
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/70"></div>

          {/* Content above overlay */}
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4">
              Crafted Flavors, Unforgettable Moments.
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              Welcome to Hops N Chops, where every dish is a masterpiece and every visit is a memory.
            </p>

            <div className="flex justify-center gap-4">
              <Link
                to="/"
                className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-8 py-3 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                View Our Menu
              </Link>
              <Link
                to="/outlets"
                className="bg-white text-black px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Find an Outlet
              </Link>
            </div>
          </div>
        </section>




        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-4">
                <span className="text-yellow-500">{welcomeContent.titlePart1}</span> {welcomeContent.titlePart2}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">{welcomeContent.description}</p>
              <Link to="/about" className="mt-6 inline-block text-yellow-600 font-semibold hover:underline">
                Read Our Story &rarr;
              </Link>
            </div>
            <div>
              <img src={welcomeContent.imageUrl} alt="Hops N Chops Interior" className="rounded-xl shadow-2xl w-full h-full object-cover" />
            </div>
          </div>
        </section>

        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">An Unmatched Experience</h2>
            <p className="text-gray-600 text-lg mb-16 max-w-3xl mx-auto">
              We go beyond food. We craft experiences with a blend of great tastes, a cozy atmosphere, and vibrant events.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-gray-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4 text-white">Our Star Attractions</h2>
            <p className="text-gray-400 text-lg mb-16 max-w-3xl mx-auto">
              Taste the passion in our most loved dishes, crafted to perfection by our expert chefs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {signatureDishes.map((dish, index) => (
                <DishCard key={index} {...dish} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 text-center bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-4">Come, Be Our Guest.</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Ready to experience the magic of Hops N Chops? Find your nearest outlet and join us for a meal to remember.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/outlets"
                className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-8 py-3 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Find Your Nearest Outlet
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
