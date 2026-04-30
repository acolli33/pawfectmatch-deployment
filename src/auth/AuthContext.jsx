import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

/**
 *  AuthProvider
 * 
 * Provides authentications state and helper functions
 * to all child components via React Context API.
 * 
 * To:
 * - Store authenticated user and role
 * - Persist session data in localStorage
 * - Expose login/logout functions
 * 
 * @param {{ children: React.ReactNode}} props
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem("pm_user");
        return raw ? JSON.parse(raw) : null;
    });

    const [token, setToken] = useState(() => localStorage.getItem("pm_token"));

    /**
     * setSession
     * 
     * Stores authenticated user and session token
     * in both React state and localStorage.
     * 
     * @param {AuthUser |null} nextUser 
     * @param {string |null} nextToken 
     */
    function setSession(nextUser, nextToken) {
        setUser(nextUser);
        setToken(nextToken);

        if (nextUser) localStorage.setItem("pm_user", JSON.stringify(nextUser));
        else localStorage.removeItem("pm_user");

        if (nextToken) localStorage.setItem("pm_token", nextToken);
        else localStorage.removeItem("pm_token");
    }

    /**
     * logout
     * 
     * Clears authentication state and removes
     * session data from localStorage.
     */
    function logout() {
        setSession(null, null);
    }

    const value = useMemo(
        () => ({
            user,
            token,
            isAuthed: !!user,
            role: user?.role ?? null,
            setSession,
            logout,
        }),
        [user, token]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth
 * 
 * Custom hook for accessing authentication context.
 * @returns {{
 *  user: AuthUser | null,
 *  token: string | null,
 *  isAuthed: boolean,
 *  role: string | null,
 *  setSession: Function,
 *  logout: Function
 * }}
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
