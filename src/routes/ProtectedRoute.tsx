import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store/store";
import { checkToken } from "../redux/slices/checkTokenSlice";
import { getCookie } from "../utils/cookieUtils";
import MainSpinner from "../components/common/MainSpinner";
import { clearToken } from "../redux/slices/authSlice";

interface ProtectedRouteProps {
  allowedRoles: string[]; // ["admin"] or ["user"]
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, redirectTo = "/login", }) => {
 const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector((state: RootState) => state.checkToken);
  const location = useLocation();

  useEffect(() => {
    const token = getCookie("token");

    // if no token, clear Redux data to force logout
    if (!token) {
      dispatch(clearToken());
      return;
    }

    // if token exists but user data missing (like on refresh)
    if (token && !data) {
      dispatch(checkToken(token));
    }
  }, [dispatch, data]);

  if (loading) return <MainSpinner />;

  // ✅ If no valid token or role not allowed, redirect
  if (!data || !allowedRoles.includes(data.role)) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
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


