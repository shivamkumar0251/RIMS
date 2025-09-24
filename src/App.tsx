import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import MainSpinner from "./components/common/MainSpinner";

const LazyHome = lazy(() => import('./pages/Home'));
const LazyLogin = lazy(() => import('./pages/Login'));
const LazyAboutPage = lazy(() => import('./pages/About'));
const LazyUserDashboard = lazy(() => import('./pages/UserDashboard'));
const LazyAdmindashboard = lazy(() => import('./pages/Admin'));

import FranchisePage from "./pages/Franchise";
import OurOutlets from "./pages/Outlet";
import ProtectedRoute, { PublicRoute } from "./routes/ProtectedRoute";
import NotFound from "./pages/NotFound";

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
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin-dashboard" element={<LazyAdmindashboard />} />
            {/* <Route path="/admin/profile" element={<Profile />} /> */}
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/userdashboard" element={<LazyUserDashboard />} />
            {/* <Route path="/user/profile" element={<Profile />} /> */}
          </Route>
          <Route path="*" element={<NotFound />} />
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
