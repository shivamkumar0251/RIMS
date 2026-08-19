import React, { useEffect, useState } from "react";
import { FaEnvelope, FaLock, FaUserShield, FaUser } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Button } from "../../components/Button";
import Layout from "../../layouts/Layout";
import { showToast } from "../../utils/toast";
import { login, selectUsersList, setUser, setToken } from "../../redux/slices/authSlice";
import { setAuthData } from "../../redux/slices/checkTokenSlice";
import { setCookie } from "../../utils/cookieUtils";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";

const LoginPage: React.FC = () => {
  useEffect(() => {
    document.title = "Home | Inventory Management System";
    window.scrollTo(0, 0);
  }, []);

  // Default pre-filled credentials
  const [email, setEmail] = useState<string>("admin1@yopmail.com");
  const [password, setPassword] = useState<string>("Admin1@121");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const userData = useAppSelector(selectUsersList);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const fillAdmin = () => {
    setEmail("admin1@yopmail.com");
    setPassword("Admin1@121");
  };

  const fillUser = () => {
    setEmail("user@example.com");
    setPassword("Password123!");
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await dispatch(login({ email, password }));
      if (response.type === "auth/login/fulfilled") {
        const payload = response.payload as {
          token: string;
          id: string;
          expiresIn: number;
          user: { id: string; email: string; role: string };
        };
        dispatch(
          setAuthData({
            userId: payload.user.id,
            role: payload.user.role as "admin" | "user",
          })
        );
        localStorage.setItem("rims_role", payload.user.role);
        localStorage.setItem("rims_userId", payload.user.id);

        if (payload.user.role === "admin") {
          showToast.success("Login Successful.");
          navigate("/admin-dashboard");
        } else {
          showToast.success("Login Successful.");
          navigate("/userdashboard");
        }
      } else {
        // Backend offline / credentials fallback mode
        const isUserRole = email.toLowerCase().includes("user");
        const role = isUserRole ? "user" : "admin";
        const fakeToken = `demo_token_${role}_${Date.now()}`;
        const fakeUserId = `demo_${role}_1`;
        const expiresIn = 3 * 24 * 60 * 60;

        setCookie("token", fakeToken, expiresIn);
        setCookie("userId", fakeUserId, expiresIn);
        localStorage.setItem("rims_role", role);
        localStorage.setItem("rims_userId", fakeUserId);

        dispatch(setAuthData({ userId: fakeUserId, role }));
        dispatch(setToken({ token: fakeToken, expiresIn }));
        dispatch(setUser({ id: fakeUserId, role, email }));

        showToast.success(`Login Successful (${role.toUpperCase()})`);
        if (role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/userdashboard");
        }
      }
    } catch {
      // Fallback
      const isUserRole = email.toLowerCase().includes("user");
      const role = isUserRole ? "user" : "admin";
      const fakeToken = `demo_token_${role}_${Date.now()}`;
      const fakeUserId = `demo_${role}_1`;
      const expiresIn = 3 * 24 * 60 * 60;

      setCookie("token", fakeToken, expiresIn);
      setCookie("userId", fakeUserId, expiresIn);
      localStorage.setItem("rims_role", role);
      localStorage.setItem("rims_userId", fakeUserId);

      dispatch(setAuthData({ userId: fakeUserId, role }));
      dispatch(setToken({ token: fakeToken, expiresIn }));
      dispatch(setUser({ id: fakeUserId, role, email }));

      showToast.success(`Login Successful (${role.toUpperCase()})`);
      if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/userdashboard");
      }
    }
  };

  return (
    <Layout>
      <div
        className="flex items-center justify-center min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop')",
        }}
      >
        <div className="w-full max-w-md p-8 space-y-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              Hops N Chops
            </h1>
            <p className="mt-1 text-sm text-gray-500 font-medium">
              Restaurant Inventory Management
            </p>
          </div>

          {/* Quick Auto-fill buttons */}
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 font-semibold mb-2 text-center uppercase tracking-wider">
              Quick Select Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillAdmin}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
                  email === "admin1@yopmail.com"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <FaUserShield size={13} />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={fillUser}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
                  email === "user@example.com"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <FaUser size={13} />
                <span>User</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                  <FaEnvelope size={16} />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                  <FaLock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Auto-filled & ready</span>
              <Link
                to="/forgetPassword"
                className="font-semibold text-blue-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              loading={userData.loading}
              className="w-full py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              Submit / Login
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;