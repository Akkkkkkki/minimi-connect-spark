import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser, getCurrentSession } from '@/lib/supabase';
import { Navigate, useLocation } from 'react-router-dom';
const AuthContext = createContext({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
});
export function useAuth() {
    return useContext(AuthContext);
}
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });
        // Check for existing session
        getCurrentSession().then(({ session }) => {
            setSession(session);
            if (session) {
                getCurrentUser().then(({ user }) => {
                    setUser(user);
                });
            }
            setIsLoading(false);
        });
        return () => {
            subscription.unsubscribe();
        };
    }, []);
    const value = {
        user,
        session,
        isLoading,
        isAuthenticated: !!session,
    };
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
// Redirect to login if not authenticated
export const RequireAuth = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    if (isLoading) {
        return _jsx("div", { className: "flex items-center justify-center min-h-screen", children: "Loading..." });
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
// Redirect to home if already authenticated
export const RedirectIfAuthenticated = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return _jsx("div", { className: "flex items-center justify-center min-h-screen", children: "Loading..." });
    }
    if (isAuthenticated) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
