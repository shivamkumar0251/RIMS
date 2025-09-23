import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import MainSpinner from "./components/common/MainSpinner";

const LazyHome = lazy(() => import('./pages/Home'));
const LazyLogin = lazy(() => import('./pages/Login'));
const LazyAboutPage = lazy(() => import('./pages/About'));


function App() {
  // const dispatch = useDispatch();
  // useEffect(() => {
  // dispatch(fetchUserDetails());
  // }, []);
  return (
    <>
      <Suspense fallback={<MainSpinner  />}>
        <Routes>
          <Route path="/" element={<LazyHome />} />
          <Route path="/login" element={<LazyLogin />} />
          <Route path="/about" element={<LazyAboutPage />} />
          {/* <Route element={<ProtectedRoute />}> */}
            {/* <Route path="/profile" element={<Profile />} /> */}
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
  )
}

export default App;