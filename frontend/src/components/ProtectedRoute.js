import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Requires login
export function RequireAuth({ children }) {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn()) return <Navigate to="/signin" replace />;
    return children;
}

// Requires admin role
export function RequireAdmin({ children }) {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn()) return <Navigate to="/signin" replace />;
    if (!isAdmin()) return <Navigate to="/" replace />;
    return children;
}

// Redirect logged in users away from signin page
export function RedirectIfLoggedIn({ children }) {
    const { isLoggedIn, isAdmin } = useAuth();
    if (isLoggedIn()) {
        return <Navigate to={isAdmin() ? '/admin/dashboard' : '/'} replace />;
    }
    return children;
}