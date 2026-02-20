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

    if (!isAuthed) return <Navigate to="/" replace />;

    if (allowRoles?.length && (!role || !allowRoles.includes(role))) {
        const fallback = role === "shelter" ? "/menu" : "/menu";
        return <Navigate to={fallback} replace />;
    }

    return children;
}