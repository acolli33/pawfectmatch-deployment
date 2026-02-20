import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

/**
 * RoleGuard
 * 
 * Higher-order component that protects routes based
 * on authentication status and user roles.
 * 
 * If the user is not authenticated, they are redirected to
 * the home page ("/").
 * 
 * If the user is authenticated but does not have one of the
 * allowed roles, they are redirected to a fallback page. 
 * 
 * @param {{
 *  allowRules: string[]
 *  children: React.ReactNode
 * }} props
 * @returns {JSX.Element}
 */
export default function RoleGuard({ allowRoles, children }) {
  const { isAuthed, role } = useAuth();

  // Not logged in → send to home
  if (!isAuthed) {
    return <Navigate to="/" replace />;
  }

  // Logged in but wrong role → send to correct role menu
  if (allowRoles?.length && (!role || !allowRoles.includes(role))) {
    if (role === "adopter") {
      return <Navigate to="/adopter-menu" replace />;
    }
    if (role === "shelter") {
      return <Navigate to="/shelter-menu" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}