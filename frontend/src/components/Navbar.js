import { Link } from 'react-router-dom';
import logo from '../assets/psu-logo.svg';

function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm flex items-center justify-between px-8 py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
                <div className="flex flex-col leading-none">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logo} alt="PSU Logo" className="h-10 w-auto" />
                    </Link>
                </div>
                <span className="text-2xl font-semibold text-gray-800">Part-time Job Hub</span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-8">
                <Link to="/" className="text-gray-700 hover:text-psu-blue font-medium">
                    Home
                </Link>
                <Link to="/jobs" className="text-gray-700 hover:text-psu-blue font-medium">
                    Jobs
                </Link>
                <div className="flex items-center gap-1 text-gray-700 hover:text-psu-blue font-medium cursor-pointer">
                    About Us <span className="text-xs">▼</span>
                </div>
                <div className="flex items-center gap-1 text-gray-700 hover:text-psu-blue font-medium cursor-pointer">
                    Other <span className="text-xs">▼</span>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                <button className="bg-psu-blue text-white px-5 py-2 rounded-md font-medium hover:bg-psu-blue-dark transition">
                    Sign In
                </button>
                <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100">
                    EN
                </button>
            </div>
        </nav>
    );
}

export default Navbar;