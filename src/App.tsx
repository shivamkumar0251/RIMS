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
import AccountSetting from "./pages/admin/AccountSettings";
import AddProductAdvanced from "./pages/admin/AddProduct";
import ProfilePage from "./pages/admin/AdminProfile";
import ProductCategories from "./pages/admin/Categories";
import CompanyBrand from "./pages/admin/CompanyBrand";
import Consumables from "./pages/admin/Consumables";
// import InventoryTabs from "./pages/admin/InventoryTabs";
import KitchenStock from "./pages/admin/KitchenStock";
import OrderManagementPage from "./pages/admin/Ordermanagement";
import ProductTable from "./pages/admin/ProductTable";
import StoreStockComponent from "./pages/admin/StoreStock";
import UserRegistrationForm from "./pages/admin/UserRegistration";
import UserOrderManagementPage from "./pages/user/OrderManagementPage";
import TabbedSettingsUI from "./pages/user/SettingsPage";
import StoreStockPage from "./pages/user/StoreStockPage";
import UserConsumables from "./pages/user/UserConsumables";
import UserProducts from "./pages/user/UserProducts";
import UserPage from "./pages/user/UserProfile";
import { ProtectedRoute, PublicRoute } from "./routes/ProtectedRoute";
import VendorList from "./pages/admin/VendorList";
import VendorsOrder from "./pages/admin/VendorsOrder";
import Purchase from "./pages/admin/Purchase";
import VendorOrderDetails from "./pages/admin/VendorOrderDetails";
function App() {
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
            <Route path="/admin/orders" element={<OrderManagementPage />} />
            <Route path="/storeStock" element={<StoreStockComponent />} />
            <Route path="/admin/categories" element={<ProductCategories />} />
            <Route path="/admin/company" element={<CompanyBrand />} />
            <Route path="/admin/vendorList" element={<VendorList />} />
            <Route path="/admin/vendorsOrder" element={<VendorsOrder />} />
            <Route path="/admin/vendors-orders/:id" element={<VendorOrderDetails />} />
            <Route path="/admin/purchase" element={<Purchase />} />
            <Route path="/admin/products" element={<ProductTable />} />
            {/* <Route path="/assets" element={<InventoryTabs />} /> */}
            <Route path="/admin/setting" element={<AccountSetting />} />
            <Route path="/admin/kitchenStock" element={<KitchenStock />} />
            <Route path="/admin/consumables" element={<Consumables />} />
            <Route path="/addAdminProducts/:categoryName/:subCategoryName" element={<AddProductAdvanced />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/userdashboard" element={<LazyUserDashboard />} />
            <Route path="/user/profile" element={<UserPage />} />
            <Route path="/user/products" element={<UserProducts />} />
            <Route path="/user/orders" element={<UserOrderManagementPage />} />
            <Route path="/user/storestock" element={<StoreStockPage />} />
            <Route path="/user/setting" element={<TabbedSettingsUI />} />
            <Route path="/user/Consumables" element={<UserConsumables />} />
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
