import { useEffect } from 'react'; // Added useEffect
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import bgImage from '../assets/home-bg-3.jpg';

function AdminLayout() {
    const location = useLocation();
    const hasAnimated = sessionStorage.getItem('sidebar_animated');

    // 1. Properly handle the session storage side-effect
    useEffect(() => {
        if (!hasAnimated) {
            sessionStorage.setItem('sidebar_animated', 'true');
        }
    }, [hasAnimated]);

    const sidebarVariants = {
        hidden: { opacity: 0 },
        visible: (i) => ({
            opacity: 1,
            transition: {
                delay: hasAnimated ? 0 : 0.2 + i * 0.05,
                duration: 0.3,
            }
        })
    };

    const navLinks = [
        { to: "/admin/dashboard", icon: "🏠", label: "Dashboard" },
        { to: "/admin/jobs", icon: "≡", label: "Job Management" },
    ];

    return (
        <div className="relative min-h-screen">
            {/* 2. FIXED BACKGROUND: Changed to motion.div and ensured it is truly fixed */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-0 overflow-hidden" // Added z-0
            >
                <div
                    className="absolute inset-0 blur-lg scale-105"
                    style={{
                        backgroundImage: `url(${bgImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                {/* Black overlay - also z-0 or z-10 */}
                <div className="absolute inset-0 bg-black/30" />
            </motion.div>

            {/* 3. Main Layout Wrapper */}
            <div className="relative z-20 flex min-h-screen pt-16">

                {/* Sidebar */}
                <motion.div
                    initial={{ x: hasAnimated ? 0 : "-100%" }}
                    animate={{ x: 0 }}
                    transition={{
                        type: "tween",
                        ease: "easeOut",
                        duration: 0.5
                    }}
                    className="w-56 bg-white/80 backdrop-blur-md shadow-sm flex-shrink-0 flex flex-col p-4 gap-2 fixed top-16 left-0 h-full z-30 border-r border-white/20"
                >
                    {navLinks.map((link, i) => (
                        <motion.div
                            key={link.to}
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            variants={sidebarVariants}
                        >
                            <NavLink
                                to={link.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                                        ? 'bg-psu-blue text-white shadow-md'
                                        : 'text-gray-600 hover:bg-white/50 hover:pl-5'
                                    }`
                                }
                            >
                                <span>{link.icon}</span> {link.label}
                            </NavLink>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Page Content: The only part that "swaps" */}
                <div className="ml-56 flex-1 p-8 relative">
                    <motion.div
                        key={location.pathname} // Triggers entry/exit for the sub-page
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }} // SMOOTH EXIT
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <Outlet />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;