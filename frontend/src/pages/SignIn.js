import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion'; // Added motion
import { useAuth } from '../context/AuthContext';
import bgImage from '../assets/home-bg-1.jpg';
import logo from '../assets/psu-logo.svg';

function SignIn() {
    const location = useLocation();
    const successMessage = location.state?.message;
    const navigate = useNavigate();
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const role = await login(identifier, password);
            if (role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background with subtle zoom entry */}
            <motion.div 
                initial={{ scale: 1.15, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 blur-lg"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <div className="absolute inset-0 bg-black/40" />

            {/* Card with Slide-Up Animation */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/30">

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <img src={logo} alt="PSU Logo" className="h-16 w-auto mb-3 drop-shadow-sm" />
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Part-time Job Hub</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Sign in to continue</p>
                    </div>

                    {successMessage && (
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-green-50 border border-green-100 text-green-700 text-xs font-bold px-4 py-3 rounded-xl mb-4 text-center uppercase tracking-wider"
                        >
                            {successMessage}
                        </motion.div>
                    )}

                    {error && (
                        <motion.div 
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-3 rounded-xl mb-4 text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                Student ID or Email
                            </label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="e.g. 6630613009"
                                required
                                className="w-full border border-gray-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent/50 bg-white/50 transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full border border-gray-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-psu-accent/50 bg-white/50 transition-all"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-psu-blue hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all mt-2 disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </motion.button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6 font-medium">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-psu-accent hover:text-blue-700 transition-colors font-bold">
                            Register
                        </Link>
                    </p>

                </div>
            </motion.div>
        </div>
    );
}

export default SignIn;