import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken, removeToken } from '../utils/storage';
import axiosInstance from '../api/axiosInstance';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface AccessFlags {
    create?: boolean;
    update?: boolean;
    delete?: boolean;
    read?: boolean;
    print?: boolean;
}

export interface RoleAccessItem {
    id: string;
    master: string;
    subModule: string;
    access: AccessFlags | null;
}

export interface Department {
    id: string;
    role: string;
    departmentType: string[];
    othersAccess?: boolean;
    roleAccess: RoleAccessItem[];
}

export interface UserProfile {
    id: string;
    employeeName: string | null;
    employeeId: string | null;
    departmentId: string | null;
    department: Department | null;
}

export interface FullUser {
    id: string;
    phone: string | null;
    email: string | null;
    profilePicture: string | null;
    status: boolean | null;
    employee: boolean | null;
    profile: UserProfile | null;
    // Convenience accessors populated by context
    employeeName?: string;
    role?: string;
}

interface AuthContextType {
    user: FullUser | null;
    loading: boolean;
    login: (token: string, userData: any) => void;
    logout: () => void;
    refreshCredentials: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FullUser | null>(null);
    const [loading, setLoading] = useState(true);

    const buildUserWithAccessors = (raw: any): FullUser => ({
        ...raw,
        employeeName: raw.profile?.employeeName ?? null,
        role: raw.profile?.department?.role ?? null,
    });

    const refreshCredentials = async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await axiosInstance.get('/auth/loginCredentials');
            if (res.data?.data) {
                const full = buildUserWithAccessors(res.data.data);
                setUser(full);
                localStorage.setItem('user', JSON.stringify(full));
            }
        } catch {
            // Token likely expired — let the 401 interceptor handle redirect
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = getToken();
            if (token) {
                // Try to restore from localStorage first (instant render)
                const saved = localStorage.getItem('user');
                if (saved) setUser(JSON.parse(saved));
                // Then refresh from server for fresh data
                await refreshCredentials();
            }
            setLoading(false);
        };
        initAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (token: string, userData: any) => {
        setToken(token);
        const full = buildUserWithAccessors(userData);
        setUser(full);
        localStorage.setItem('user', JSON.stringify(full));
        // Immediately fetch full credentials safely
        await refreshCredentials();
    };

    const logout = () => {
        removeToken();
        setUser(null);
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshCredentials }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
