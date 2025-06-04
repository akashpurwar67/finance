import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X, User, PieChart, DollarSign, Home, BarChart2 } from 'react-feather';

const NavBar = () => {
    const { authUser, logout } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/', label: 'Home', icon: <Home size={18} /> },
        { to: '/add', label: 'Transactions', icon: <DollarSign size={18} /> },
        { to: '/budget', label: 'Budget', icon: <PieChart size={18} /> },
        { to: '/report', label: 'Reports', icon: <BarChart2 size={18} /> },
    ];

    return (
        <>
            {/* Desktop Navigation */}
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-sm shadow-sm'}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <motion.div 
                                whileHover={{ rotate: -15 }}
                                className="h-8 w-8 text-indigo-600"
                            >
                                <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </motion.div>
                            <span className="ml-2 text-xl font-bold text-gray-800">FinTrack</span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex md:items-center md:space-x-8">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.to}
                                    to={link.to}
                                    className="relative group text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                >
                                    {link.label}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            ))}
                        </div>

                        {/* Auth Section */}
                        <div className="flex items-center space-x-4">
                            {authUser ? (
                                <>
                                    <div className="hidden md:flex items-center space-x-2">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <User size={16} />
                                        </div>
                                        <span className="text-gray-700 text-sm font-medium">
                                            {authUser?.fullName?.split(' ')[0] || 'User'}
                                        </span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleLogout}
                                        className="hidden md:block bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                                    >
                                        Logout
                                    </motion.button>
                                </>
                            ) : (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link
                                        to="/login"
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-md"
                                    >
                                        Login
                                    </Link>
                                </motion.div>
                            )}

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden text-gray-700 hover:text-indigo-600 focus:outline-none"
                            >
                                {isMobileMenuOpen ? (
                                    <X size={24} />
                                ) : (
                                    <Menu size={24} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden fixed top-16 left-0 w-full z-40 bg-white shadow-lg"
                    >
                        <div className="px-2 pt-2 pb-4 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                                >
                                    <span className="mr-2">{link.icon}</span>
                                    {link.label}
                                </Link>
                            ))}
                            {authUser && (
                                <>
                                    <div className="border-t border-gray-200 my-2"></div>
                                    <div className="flex items-center px-3 py-2 text-gray-700">
                                        <User size={18} className="mr-2" />
                                        {authUser?.fullName || 'User'}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                                    >
                                        <X size={18} className="mr-2" />
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spacer to account for fixed navbar */}
            <div className="h-16"></div>
        </>
    );
};

export default NavBar;