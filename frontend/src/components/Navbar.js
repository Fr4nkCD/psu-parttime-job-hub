import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/psu-logo.svg';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { isLoggedIn, isAdmin, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
        setDropdownOpen(false);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm px-4 md:px-8 py-3">
            <div className="flex items-center justify-between">

                {/* Logo & Brand */}
                <Link to="/" className="flex items-center gap-2">
                    <img src={logo} alt="PSU Logo" className="h-8 md:h-10 w-auto" />
                    <span className="text-lg md:text-2xl font-semibold text-gray-800">Part-time Job Hub</span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex ml-auto mr-8 items-center gap-8">
                    <Link to="/" className="text-gray-700 hover:text-psu-blue font-medium">Home</Link>
                    <Link to="/jobs" className="text-gray-700 hover:text-psu-blue font-medium">Jobs</Link>
                    {isLoggedIn() && isAdmin() && (
                        <Link to="/admin/dashboard" className="text-gray-700 hover:text-psu-blue font-medium">Dashboard</Link>
                    )}
                    <div className="flex items-center gap-1 text-gray-700 hover:text-psu-blue font-medium cursor-pointer">
                        About Us <span className="text-xs">▼</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-700 hover:text-psu-blue font-medium cursor-pointer">
                        Other <span className="text-xs">▼</span>
                    </div>
                </div>

                {/* Right Side Items */}
                <div className="flex items-center gap-4">

                    {/* Auth Section */}
                    {isLoggedIn() ? (
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-9 h-9 rounded-full bg-psu-blue text-white flex items-center justify-center font-semibold text-sm hover:bg-psu-blue-dark transition"
                            >
                                {user?.username?.charAt(0).toUpperCase()}
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                    <button
                                        onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        👤 My Profile
                                    </button>
                                    {isAdmin() && (
                                        <button
                                            onClick={() => { navigate('/admin/dashboard'); setDropdownOpen(false); }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            🏠 Dashboard
                                        </button>
                                    )}
                                    <hr className="my-1 border-gray-100" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/signin')}
                            className="bg-psu-blue text-white px-5 py-2 rounded-md font-medium hover:bg-psu-blue-dark transition"
                        >
                            Sign In
                        </button>
                    )}

                    {/* Language Button */}
                    <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100">
                        EN
                    </button>

                    {/* Hamburger Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-gray-600 focus:outline-none"
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden mt-3 pb-3 border-t border-gray-100 flex flex-col gap-4 pt-4">
                    <Link to="/" onClick={() => setIsOpen(false)} className="text-gray-700 font-medium px-2">Home</Link>
                    <Link to="/jobs" onClick={() => setIsOpen(false)} className="text-gray-700 font-medium px-2">Jobs</Link>
                    {isLoggedIn() && isAdmin() && (
                        <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="text-gray-700 font-medium px-2">Dashboard</Link>
                    )}
                    {isLoggedIn() && !isAdmin() && (
                        <Link to="/profile" onClick={() => setIsOpen(false)} className="text-gray-700 font-medium px-2">My Profile</Link>
                    )}
                    <div className="text-gray-700 font-medium px-2">About Us</div>
                    <div className="text-gray-700 font-medium px-2">Other</div>
                    {isLoggedIn() && (
                        <button
                            onClick={handleLogout}
                            className="text-left text-red-500 font-medium px-2"
                        >
                            Sign Out
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}

export default Navbar;