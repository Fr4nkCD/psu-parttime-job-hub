import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/psu-logo.svg';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const [aboutOpen, setAboutOpen] = useState(false);
    // const [otherOpen, setOtherOpen] = useState(false); // Hidden per requirement 1
    const [isOpen, setIsOpen] = useState(false); // Mobile Hamburger
    const [dropdownOpen, setDropdownOpen] = useState(false); // Desktop Profile Dropdown
    const { isLoggedIn, isAdmin, student, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
        setDropdownOpen(false);
        setIsOpen(false);
    };

    // Requirement: Fix overlaps by closing menus when navigating
    useEffect(() => {
        setIsOpen(false);
        setAboutOpen(false);
        setDropdownOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = () => {
            setAboutOpen(false);
            setDropdownOpen(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Requirement: Enhanced hover background and color visibility
    const navLinkStyle = "text-gray-700 hover:text-psu-blue hover:bg-slate-200 px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-1";

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm px-4 md:px-6 py-3">
            <div className="flex items-center justify-between max-w-full mx-auto">

                {/* Logo & Brand: Requirement - font-semibold thickness */}
                <Link to="/" className="flex items-center gap-2 shrink-0">
                    <img src={logo} alt="PSU Logo" className="h-8 md:h-10 w-auto" />
                    <span className="text-lg md:text-2xl font-semibold text-gray-800 tracking-tight">Part-time Hub</span>
                </Link>

                {/* Right Side Logic */}
                <div className="flex items-center md:gap-4 ml-auto">
                    
                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-2 mr-4">
                        <Link to="/" className={navLinkStyle}>Home</Link>
                        <Link to="/jobs" className={navLinkStyle}>Jobs</Link>
                        {isLoggedIn() && isAdmin() && (
                            <Link to="/admin/dashboard" className={navLinkStyle}>Dashboard</Link>
                        )}
                        
                        {/* Requirement 2: About Us Dropdown with Collision Fix */}
                        <div className="relative">
                            <button
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setAboutOpen(!aboutOpen); 
                                    setDropdownOpen(false); // Close profile if about is clicked
                                }}
                                className={navLinkStyle}
                            >
                                About Us <span className="text-[10px] transition-transform duration-300">{aboutOpen ? "▲" : "▼"}</span>
                            </button>
                            <AnimatePresence>
                                {aboutOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-12 left-0 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                                    >
                                        <Link to="/about" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 font-medium">📋 About This Project</Link>
                                        <Link to="/about/personnel" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 font-medium">👥 Personnel</Link>
                                        <Link to="/about/student-organization" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 font-medium">🏫 Student Organization</Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* "Other" button hidden per requirement 1 */}
                    </div>

                    {/* Requirement 3: Desktop PFP (hidden on mobile header) */}
                    {isLoggedIn() ? (
                        <div className="relative hidden md:block">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDropdownOpen(!dropdownOpen);
                                    setAboutOpen(false); // Close about if profile is clicked
                                }}
                                className="w-10 h-10 rounded-full bg-psu-blue text-white flex items-center justify-center font-bold shadow-md border-2 border-white transition-all"
                            >
                                {student?.first_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
                            </motion.button>
                            
                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50"
                                    >
                                        <div className="px-4 py-3 border-b border-gray-50 mb-1 select-none">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isAdmin() ? 'Staff Account' : 'Student Account'}</p>
                                            <p className="text-sm font-bold text-gray-800 truncate">
                                                {student ? `${student.first_name} ${student.last_name}` : user?.username}
                                            </p>
                                        </div>

                                        <Link to={isAdmin() ? "/admin/dashboard" : "/profile"} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-semibold">
                                            {isAdmin() ? '🏠 Dashboard' : '👤 My Profile'}
                                        </Link>
                                        <hr className="my-1 border-gray-50" />
                                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-bold transition-colors">
                                            🚪 Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/signin')} className="hidden md:block bg-psu-blue text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-900 transition-all shadow-md">Sign In</button>
                    )}

                    {/* Hamburger Button (Mobile Only) */}
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Requirement 3 & 4: Mobile Drawer with Integrated Profile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden overflow-hidden border-t border-gray-100 mt-2"
                    >
                        <div className="flex flex-col gap-1 py-4">
                            {isLoggedIn() && (
                                <div className="px-4 py-3 bg-gray-50 rounded-xl mx-2 mb-2">
                                    <p className="text-[10px] font-bold text-psu-blue/60 uppercase">Active Session</p>
                                    <p className="text-base font-bold text-gray-800">{student ? `${student.first_name} ${student.last_name}` : user?.username}</p>
                                    <p className="text-xs text-gray-500">{student?.student_id}</p>
                                </div>
                            )}

                            <Link to="/" className="px-4 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors">🏠 Home</Link>
                            <Link to="/jobs" className="px-4 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors">🔍 Browse Jobs</Link>
                            
                            {isLoggedIn() ? (
                                <>
                                    <Link to={isAdmin() ? "/admin/dashboard" : "/profile"} className="px-4 py-3 text-gray-700 font-bold hover:bg-gray-100 rounded-xl">
                                        {isAdmin() ? '📈 Dashboard' : '👤 My Profile'}
                                    </Link>
                                    <button onClick={handleLogout} className="px-4 py-3 text-red-500 font-semibold text-left hover:bg-red-50 rounded-xl transition-colors">🚪 Sign Out</button>
                                </>
                            ) : (
                                <button onClick={() => navigate('/signin')} className="px-4 py-3 text-psu-blue font-semibold text-left hover:bg-psu-blue/5 rounded-xl">🔑 Sign In</button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

export default Navbar;