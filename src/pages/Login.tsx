import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'; // ⭐ Eye और EyeOff आइकॉन इम्पोर्ट किए

const LoginPage: React.FC = () => {

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  // ⭐ पासवर्ड को दिखाने/छिपाने के लिए नया स्टेट
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const loginData = {
      email: email,
      password: password,
    };
    console.log('Login Data for API:', loginData);
    
    alert(`Login data console mein log ho gaya hai!\nEmail: ${email}`);
  };

  return (
    // Background container (इसे आप अपने App.tsx में भी रख सकते हैं)
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Hops N Chops</h1>
          <p className="mt-2 text-gray-600">Admin Login</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-6">
      
          {/* Email Input */}
          <div className="relative">
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
              <Mail size={20} />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
              <Lock size={20} />
            </div>
            <input
              // ⭐ इनपुट का type अब state पर निर्भर करेगा
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              // ⭐ दाईं ओर पैडिंग (pr-10) बढ़ाई ताकि आइकॉन ओवरलैप न हो
              className="w-full pl-10 pr-10 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            />
            {/* ⭐ पासवर्ड टॉगल करने के लिए बटन */}
            <button
              type="button" // यह ज़रूरी है ताकि फॉर्म सबमिट न हो
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="text-right">
            <a href="#" className="text-sm font-medium text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;