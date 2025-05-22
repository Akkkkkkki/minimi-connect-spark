export declare const signInWithEmail: (email: string, password: string) => Promise<{
    user: import("@supabase/auth-js").User;
    session: import("@supabase/auth-js").Session;
    error: any;
} | {
    user: any;
    session: any;
    error: any;
}>;
export declare const signUpWithEmail: (email: string, password: string, userData: {
    first_name: string;
    last_name: string;
    gender: string;
    birth_month: string;
    birth_year: string;
}) => Promise<{
    user: import("@supabase/auth-js").User;
    session: import("@supabase/auth-js").Session;
    error: any;
} | {
    user: any;
    session: any;
    error: any;
}>;
export declare const createUserProfile: (userId: string, profileData: {
    first_name: string;
    last_name: string;
    gender: string;
    birth_month: string | number | null;
    birth_year: string | number | null;
}) => Promise<{
    success: boolean;
    error: any;
}>;
export declare const signOut: () => Promise<{
    error: any;
}>;
export declare const getCurrentUser: () => Promise<{
    user: import("@supabase/auth-js").User;
    error: any;
} | {
    user: any;
    error: any;
}>;
export declare const getCurrentSession: () => Promise<{
    session: import("@supabase/auth-js").Session;
    error: any;
} | {
    session: any;
    error: any;
}>;
