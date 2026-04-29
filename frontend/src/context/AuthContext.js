import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in on page load
        const token = localStorage.getItem('access_token');
        const savedUser = localStorage.getItem('user');
        const savedRole = localStorage.getItem('role');
        const savedStudent = localStorage.getItem('student');

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
                setRole(savedRole);
                setStudent(savedStudent && savedStudent !== 'undefined' ? JSON.parse(savedStudent) : null);
            } catch (e) {
                console.error("Failed to parse auth data", e);
                logout(); // Clear corrupted data
            }
        }
        setLoading(false);
    }, []);

    const login = async (identifier, password) => {
        const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Login failed.');
        }

        const data = await response.json();

        // Save to localStorage
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', data.role);
        localStorage.setItem('student', JSON.stringify(data.student));

        // Update state
        setUser(data.user);
        setRole(data.role);
        setStudent(data.student);

        return data.role;
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('student');
        setUser(null);
        setRole(null);
        setStudent(null);
    };

    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) return null;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/refresh/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('access_token', data.access);
                return data.access;
            } else if (response.status === 401) {
                logout(); // Refresh token expired, force re-login
            }
        } catch (err) {
            console.error("Token refresh failed", err);
        }
        return null;
    };

    const getToken = () => localStorage.getItem('access_token');

    const isAdmin = () => role === 'ADMIN';
    const isStudent = () => role === 'STUDENT';
    const isLoggedIn = () => !!user;

    return (
        <AuthContext.Provider value={{
            user, role, student, loading,
            login, logout, getToken,
            refreshAccessToken, // FIXED: Now exported so components can use it
            isAdmin, isStudent, isLoggedIn,
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}