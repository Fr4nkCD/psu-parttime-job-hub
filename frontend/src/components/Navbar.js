import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/psu-logo.svg';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm px-4 md:px-8 py-3">
            <div className="flex items-center justify-between">
                {/* Logo & Brand */}
                <Link to="/" className="flex items-center gap-2">
                    <img src={logo} alt="PSU Logo" className="h-8 md:h-10 w-auto" />
                    <span className="text-lg md:text-2xl font-semibold text-gray-800">Part-time Job Hub</span>
                </Link>

                {/* Desktop Nav Links - Hidden on Mobile */}
                <div className="hidden md:flex ml-auto mr-8 items-center gap-8">
                    <Link to="/" className="text-gray-700 hover:text-psu-blue font-medium">Home</Link>
                    <Link to="/jobs" className="text-gray-700 hover:text-psu-blue font-medium">Jobs</Link>
                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-psu-blue font-medium">Dashboard</Link>
                    <div className="flex items-center gap-1 text-gray-700 hover:text-psu-blue font-medium cursor-pointer">
                        About Us <span className="text-xs">▼</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-700 hover:text-psu-blue font-medium cursor-pointer">
                        Other <span className="text-xs">▼</span>
                    </div>
                </div>

                {/* Right Side Items */}
                <div className="flex items-center gap-4">
                    {/* Right Side */}
                    {/* <div className="flex items-center gap-4">
                        <button className="bg-psu-blue text-white px-5 py-2 rounded-md font-medium hover:bg-psu-blue-dark transition">
                            Sign In
                        </button>
                        <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100">
                            EN
                        </button>
                    </div> */}

                    <Link to="/profile">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition cursor-pointer">
                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                            </svg>
                        </div>
                    </Link>

                    {/* Hamburger Button - Visible only on Mobile */}
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

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden mt-3 pb-3 border-t border-gray-100 flex flex-col gap-4 pt-4 animate-fadeIn">
                    <Link to="/" onClick={() => setIsOpen(false)} className="text-gray-700 font-medium px-2">Home</Link>
                    <Link to="/jobs" onClick={() => setIsOpen(false)} className="text-gray-700 font-medium px-2">Jobs</Link>
                    <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="text-gray-700 font-medium px-2">Dashboard</Link>
                    <div className="text-gray-700 font-medium px-2">About Us</div>
                    <div className="text-gray-700 font-medium px-2">Other</div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;