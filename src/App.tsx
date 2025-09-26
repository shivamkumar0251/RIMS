import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import MainSpinner from "./components/common/MainSpinner";
import ForgetPassword from './pages/auth/Forgetpassword';
import ResetPassword from "./pages/auth/Resetpassword";

const LazyUserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const LazyAdmindashboard = lazy(() => import('./pages/admin/AdminDashBoard'));
const LazyHome = lazy(() => import("./pages/Home"));
const LazyLogin = lazy(() => import("./pages/auth/Login"));
const LazyAboutPage = lazy(() => import("./pages/About"));

import FranchisePage from "./pages/Franchise";
import NotFound from "./pages/NotFound";
import OurOutlets from "./pages/Outlet";

import ProfilePage from "./pages/admin/AdminProfile";
import UserPage from "./pages/user/UserProfile";
import { ProtectedRoute, PublicRoute } from "./routes/ProtectedRoute";
// import UserRegistrationFor from "./pages/Registration";
import UserRegistrationForm from "./pages/UserRegistration";
function App() {
  // const dispatch = useDispatch();
  // useEffect(() => {
  // dispatch(fetchUserDetails());
  // }, []);
  return (
    <>
      <Suspense fallback={<MainSpinner />}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<LazyHome />} />
            <Route path="/login" element={<LazyLogin />} />
            <Route path="/about" element={<LazyAboutPage />} />
            <Route path="/outlets" element={<OurOutlets />} />
            <Route path="/franchise" element={<FranchisePage />} />
            <Route path="/forgetPassword" element={<ForgetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin-dashboard" element={<LazyAdmindashboard />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
            <Route path="/userRegistrationForm" element={<UserRegistrationForm />} />

          </Route>
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/userdashboard" element={<LazyUserDashboard />} />
            <Route path="/user/profile" element={<UserPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />


          {/* <Route element={<ProtectedRoute />}> */}
          {/* <Route element={<ProtectedRoute />}> */}
          {/* <Route path="/profile" element={<Profile />} /> */}
          {/* <Route path="/profile" element={<Profile />} /> */}
          {/* </Route> */}
          {/* </Route> */}
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
