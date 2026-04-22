import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from './PageTransition';

function AdminLayout({ children }) {
    // Check if we've already seen the sidebar in this session
    const hasAnimated = sessionStorage.getItem('sidebar_animated');

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

    // Mark as animated once the component mounts
    if (!hasAnimated) {
        sessionStorage.setItem('sidebar_animated', 'true');
    }

    return (
        <div className="flex min-h-screen pt-16">
            {/* Sidebar */}
            <motion.div 
                // If already animated, start at 0, otherwise start off-screen
                initial={{ x: hasAnimated ? 0 : "-100%" }}
                animate={{ x: 0 }}
                transition={{ 
                    type: "tween",    // Pure mathematical movement
                    ease: "easeOut",  // Zero overshoot
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
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                                    isActive
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

            {/* Page Content */}
            <div className="ml-56 flex-1 p-8">
                <PageTransition>
                    {children}
                </PageTransition>
            </div>
        </div>
    );
}

export default AdminLayout;