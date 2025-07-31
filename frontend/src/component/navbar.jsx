import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X, User, PieChart, DollarSign, Home, BarChart2, LogOut } from 'react-feather';

const NavBar = () => {
    const { authUser, logout } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isHoveringUser, setIsHoveringUser] = useState(false);
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
        { to: '/trip', label: 'Trips', icon: <BarChart2 size={18} /> },
    ];

    return (
        <>
            {/* Desktop Navigation */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-md'
                    } border-b border-gray-100`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0 flex items-center group">
                            <motion.div
                                whileHover={{ rotate: -15 }}
                                className="h-9 w-9 text-indigo-600 flex items-center justify-center"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </motion.div>
                            <motion.span
                                className="ml-2 text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors"
                                whileHover={{ x: 2 }}
                            >
                                FinTrack
                            </motion.span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex md:items-center md:space-x-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="relative group px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                >
                                    <div className="flex items-center text-gray-600 group-hover:text-indigo-600">

                                        {link.label}
                                    </div>
                                    <motion.span
                                        className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-indigo-600"
                                        initial={{ width: 0, x: '-50%' }}
                                        whileHover={{ width: '80%' }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    />
                                </Link>
                            ))}
                        </div>

                        {/* Auth Section */}
                        <div className="flex items-center space-x-4">
                            {authUser ? (
                                <div className="flex items-center space-x-4">
                                    <motion.div
                                        className="relative"
                                        onHoverStart={() => setIsHoveringUser(true)}
                                        onHoverEnd={() => setIsHoveringUser(false)}
                                        onClick={() => setIsHoveringUser(!isHoveringUser)}
                                    >
                                        <div className="flex items-center space-x-2 cursor-pointer">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 shadow-inner">
                                                <User size={16} />
                                            </div>
                                            <span className="text-gray-700 text-sm font-medium hidden md:block">
                                                {authUser?.fullName?.split(' ')[0] || 'User'}
                                            </span>
                                        </div>

                                        <AnimatePresence>
                                            {isHoveringUser && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100"
                                                >
                                                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                                        {authUser.email}
                                                    </div>
                                                    <div
                                                        className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                                                        onClick={() => navigate('/find')}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            Statement Analyzer
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                                                        onClick={() => navigate('/change')}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            Change Password
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        <LogOut size={14} className="mr-2" />
                                                        Sign out
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </div>
                            ) : (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link
                                        to="/login"
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                                    >
                                        <User size={16} className="mr-2" />
                                        Login
                                    </Link>
                                </motion.div>
                            )}

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? (
                                    <X size={20} />
                                ) : (
                                    <Menu size={20} />
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
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="md:hidden fixed inset-0 z-40 pt-16"
                    >
                        <div
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <div className="relative bg-white shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
                            <div className="px-4 pt-2 pb-6 space-y-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                    >
                                        <span className="mr-3 text-indigo-500">{link.icon}</span>
                                        {link.label}
                                    </Link>
                                ))}

                                {authUser && (
                                    <>
                                        <div className="border-t border-gray-200 my-1"></div>
                                        <div className="px-4 py-3 text-gray-500 text-sm">
                                            Signed in as
                                        </div>
                                        <div className="flex items-center px-4 py-3 rounded-lg bg-gray-50 text-gray-700">
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <div className="font-medium">{authUser?.fullName || 'User'}</div>
                                                <div className="text-xs text-gray-500">{authUser.email}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="w-full flex items-center px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut size={16} className="mr-3 text-red-500" />
                                            Sign out
                                        </button>
                                    </>
                                )}
                            </div>
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