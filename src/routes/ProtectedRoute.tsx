import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store/store";
import { checkToken } from "../redux/slices/checkTokenSlice";
import { getCookie } from "../utils/cookieUtils";
import MainSpinner from "../components/common/MainSpinner";

interface ProtectedRouteProps {
  allowedRoles: string[]; // ["admin"] or ["user"]
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectTo = "/login",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector((state: RootState) => state.checkToken);

  useEffect(() => {
      const token = getCookie('token');
      if (token) {
          dispatch(checkToken(token));
        }
    }, [dispatch]);
  if (loading) return <MainSpinner />;
  if (!data) return <Navigate to={redirectTo} replace />;
  if (!allowedRoles.includes(data.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
interface PublicRouteProps {
  redirectTo?: string; 
}
export const PublicRoute: React.FC<PublicRouteProps> = ({ redirectTo = "/userdashboard" }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector((state: RootState) => state.checkToken);

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      dispatch(checkToken(token));
    }
  }, [dispatch]);

  if (loading) return <MainSpinner />;

  // If already logged in, redirect to dashboard
  if (data) {
    // optional: role-based redirect
    if (data.role === "admin") return <Navigate to="/admin-dashboard" replace />;
    if (data.role === "user") return <Navigate to="/userdashboard" replace />;
    return <Navigate to={redirectTo} replace />;
  }

  // Otherwise allow public page (login, register, etc.)
  return <Outlet />;
};


export default ProtectedRoute;
