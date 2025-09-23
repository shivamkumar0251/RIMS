import React, { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // for password toggle
import { Button } from "../components/Button";
import Layout from "../layouts/Layout";
import { showToast } from "../utils/toast";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/slices/authSlice";
import type { AppDispatch, RootState } from "../redux/store/store";
import { useNavigate } from "react-router";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const userData = useSelector((state: RootState) => state.auth);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await dispatch(login({ email, password }))
    if (response.type === 'auth/login/fulfilled') {
      const payload = response.payload as {
        token: string;
        id: string;
        expiresIn: number;
        user: { id: string; email: string; role: string };
      };
      if (payload.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (payload.user.role === 'user') {
        showToast.success('Login Successful.');
        navigate('/user-dashboard');
      }
    } else {
      showToast.error('Login Error.');
      console.log('response false', response);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Hops N Chops</h1>
            <p className="mt-2 text-gray-600">Admin Login</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
                <FaEnvelope size={18} />
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

            {/* Password */}
            <div className="relative">
              <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
                <FaLock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Forgot Password?
              </a>
            </div>
            <Button type="submit" loading={userData.loading} className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105" >submit</Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
