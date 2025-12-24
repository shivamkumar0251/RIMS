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

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectTo = "/login",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.checkToken);
  const location = useLocation();
  const token = getCookie("token");

  useEffect(() => {
    // if no token, clear Redux data to force logout
    if (!token) {
      dispatch(clearToken());
      return;
    }

    // if token exists but user data missing (like on refresh)
    if (token && !data && !loading && !error) {
      dispatch(checkToken(token));
    }
  }, [dispatch, data, token, loading, error]);

  // While checking token, show spinner if token exists but no data yet
  if (token && !data && (loading || !error)) {
    return <MainSpinner />;
  }

  // ✅ If no valid token or role not allowed, redirect
  if (!data || !allowedRoles.includes(data.role)) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

interface PublicRouteProps {
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  redirectTo = "/userdashboard",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.checkToken);
  const location = useLocation();
  const token = getCookie("token");

  useEffect(() => {
    if (token && !data && !loading && !error) {
      dispatch(checkToken(token));
    }
  }, [dispatch, token, data, loading, error]);

  // While checking token, show spinner if token exists but no data yet
  if (token && !data && (loading || !error)) {
    return <MainSpinner />;
  }

  // If already logged in, redirect to dashboard or the original location
  if (data) {
    const from = (location.state as any)?.from?.pathname;
    if (from) {
      return <Navigate to={from} replace />;
    }
    // optional: role-based redirect
    if (data.role === "admin") return <Navigate to="/admin-dashboard" replace />;
    if (data.role === "user") return <Navigate to="/userdashboard" replace />;
    return <Navigate to={redirectTo} replace />;
  }

  // Otherwise allow public page (login, register, etc.)
  return <Outlet />;
};


