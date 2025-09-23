import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import MainSpinner from "./components/common/MainSpinner";
import AboutPage from "./pages/About";
import LoginPage from "./pages/Login";
import Home from "./pages/Home";

function App() {
  // const dispatch = useDispatch();
  // useEffect(() => {
  // dispatch(fetchUserDetails());
  // }, []);
  return (
    <>
      <Suspense fallback={<MainSpinner  />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutPage />} />
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