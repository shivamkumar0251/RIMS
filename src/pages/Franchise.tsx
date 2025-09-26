import React, { useState, useEffect } from 'react';
import { FaStore, FaChartLine, FaHandsHelping, FaUtensils, FaPlus, FaMinus } from 'react-icons/fa';
import Layout from '../layouts/Layout';



// --- Data for Page Sections (Unchanged) ---
const whyChooseUsData = [
    {
        icon: <FaStore className="h-10 w-10 text-yellow-500" />,
        title: 'Proven Business Model',
        description: 'Benefit from our established brand, operational excellence, and a business model designed for profitability.'
    },
    {
        icon: <FaUtensils className="h-10 w-10 text-yellow-500" />,
        title: 'Beloved Menu & Supply Chain',
        description: 'Get access to our unique recipes and a high-quality, streamlined supply chain for all your ingredients.'
    },
    {
        icon: <FaHandsHelping className="h-10 w-10 text-yellow-500" />,
        title: 'Comprehensive Support',
        description: 'From site selection and staff training to marketing, our dedicated team will support you at every step.'
    },
    {
        icon: <FaChartLine className="h-10 w-10 text-yellow-500" />,
        title: 'Strong Brand Recognition',
        description: 'Leverage the growing popularity and positive brand image of Hops N Chops to attract customers from day one.'
    }
];

const faqData = [
    {
        question: 'What is the initial investment required?',
        answer: 'The initial investment varies depending on the location, size, and model of the outlet. It typically ranges from ₹25 Lakhs to ₹50 Lakhs. Our team will provide a detailed breakdown after the initial discussion.'
    },
    {
        question: 'Is prior restaurant experience necessary?',
        answer: 'While prior experience is beneficial, it is not mandatory. We are looking for passionate and dedicated partners. We provide comprehensive training to cover all aspects of running a Hops N Chops outlet.'
    },
    {
        question: 'What kind of training and support will I receive?',
        answer: 'You will receive extensive training on our brand standards, recipes, operations, and management systems. Our support includes marketing assistance, supply chain management, and ongoing operational guidance.'
    },
    {
        question: 'How long does it take to open an outlet?',
        answer: 'On average, it takes about 3 to 6 months from signing the franchise agreement to the grand opening. This timeline can vary based on site selection and local regulations.'
    }
];

// --- Main Franchise Page Component ---

const FranchisePage: React.FC = () => {
   useEffect(() => {
        document.title = "Franchise Inquiry | Inventory Management System"
        window.scrollTo(0, 0);
      }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    // 'investment' field removed from state
    message: ''
  });
  
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.name) newErrors.name = 'Full Name is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid.';
    if (!formData.phone) newErrors.phone = 'Phone Number is required.';
    if (!formData.city) newErrors.city = 'Proposed City is required.';
    // 'investment' validation removed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitted(true);
    }
  };
  
  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section */}
        <section 
          className="relative h-[60vh] bg-cover bg-center text-white flex items-center justify-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">Partner With a Growing Brand</h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-gray-200">
              Bring the unique taste and vibrant atmosphere of Hops N Chops to your city. Start your entrepreneurial journey with us.
            </p>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold mb-4">Why Franchise With Hops N Chops?</h2>
                <p className="text-gray-600 text-lg mb-16 max-w-3xl mx-auto">
                    We are more than a business; we are a family. When you join us, you get the recipe for success.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {whyChooseUsData.map((item, index) => (
                        <div key={index} className="bg-white p-8 rounded-xl shadow-md text-center">
                            <div className="mx-auto mb-4 inline-block p-4 bg-yellow-100 rounded-full">{item.icon}</div>
                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                            <p className="text-gray-600">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Inquiry Form Section */}
        <section id="inquiry-form" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold">Ready to Take the Next Step?</h2>
                        <p className="text-gray-600 text-lg mt-4">Fill out the form below, and our franchise team will get in touch with you shortly.</p>
                    </div>

                    {isSubmitted ? (
                        <div className="text-center p-12 bg-green-100 text-green-800 rounded-xl">
                            <h3 className="text-3xl font-bold">Thank You!</h3>
                            <p className="mt-2 text-lg">Your inquiry has been received. Our team will contact you within 2-3 business days.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" noValidate>
                            {/* Form Fields */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" id="name" name="name" onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md focus:ring-yellow-500 focus:border-yellow-500" />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input type="email" id="email" name="email" onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md focus:ring-yellow-500 focus:border-yellow-500" />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input type="tel" id="phone" name="phone" onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md focus:ring-yellow-500 focus:border-yellow-500" />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>
                             <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Proposed City / Location</label>
                                <input type="text" id="city" name="city" onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md focus:ring-yellow-500 focus:border-yellow-500" />
                                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                            </div>
                            
                            {/* Investment Capacity Field has been removed */}

                            <div className="md:col-span-2">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your Message (Optional)</label>
                                <textarea id="message" name="message" rows={4} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-md focus:ring-yellow-500 focus:border-yellow-500"></textarea>
                            </div>
                            <div className="md:col-span-2 text-center">
                                <button type="submit" className="bg-yellow-500 text-black px-10 py-3 rounded-full font-semibold text-lg hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105">
                                    Submit Inquiry
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-4">
                    {faqData.map((faq, index) => (
                         <div key={index} className="border rounded-lg bg-white">
                            <button
                                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                className="w-full flex justify-between items-center p-5 text-left font-semibold text-lg"
                            >
                                <span>{faq.question}</span>
                                {openFaqIndex === index ? <FaMinus className="text-yellow-500" /> : <FaPlus className="text-gray-500" />}
                            </button>
                            {openFaqIndex === index && (
                                <div className="p-5 pt-0 text-gray-600">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
      </div>
    </Layout>
  );
};

export default FranchisePage;