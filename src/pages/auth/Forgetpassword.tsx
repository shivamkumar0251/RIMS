import React, { useEffect, useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store/store";
import Layout from "../../layouts/Layout";
import { Button } from "../../components/Button";

const ForgetPassword: React.FC = () => {
   useEffect(() => {
      document.title = "Forget-Password | Inventory Management System"
      window.scrollTo(0, 0);
    }, []);


  const [email, setEmail] = useState<string>("");

  const userData = useSelector((state: RootState) => state.auth);
  // const dispatch = useDispatch<AppDispatch>();
  // const navigate = useNavigate();

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // const response = await dispatch(login({ email }));

    // if (response.type === "auth/login/fulfilled") {
    //   const payload = response.payload as {
    //     token: string;
    //     id: string;
    //     expiresIn: number;
    //     user: { id: string; email: string; role: string };
    //   };
    //   if (payload.user.role === "admin") {
    //     showToast.success("Login Successful.");
    //     navigate("/admin-dashboard");
    //   } else if (payload.user.role === "user") {
    //     showToast.success("Login Successful.");
    //     navigate("/userdashboard");
    //   }
    // } else {
    //   showToast.error("Login Error.");
    //   console.log("response false", response);
    // }
  };

  return (
    <Layout>
      <div
        className="flex items-center justify-center min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/dmoqhod45/image/upload/v1758688612/forgot-password-concept-isolated-white_263070-194_ygv4jr.avif')",
        }}
      >
        <div className="w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Hops N Chops</h1>
            <p className="mt-2 text-gray-600">Forget Password</p>
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

            <Button
              type="submit"
              loading={userData.loading}
              className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ForgetPassword;
