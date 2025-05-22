import { ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
interface AuthContextProps {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}
export declare function useAuth(): AuthContextProps;
interface AuthProviderProps {
    children: ReactNode;
}
export declare const AuthProvider: ({ children }: AuthProviderProps) => import("react/jsx-runtime").JSX.Element;
export declare const RequireAuth: ({ children }: {
    children: ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export declare const RedirectIfAuthenticated: ({ children }: {
    children: ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export {};
