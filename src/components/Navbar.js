'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import { useTheme } from './ThemeContext';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
    const { resolvedTheme } = useTheme();
    const { user, logout, loading } = useAuth();
    const [isProductsOpen, setIsProductsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            setIsProfileDropdownOpen(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };


    return (
        <>
            <nav className="fixed top-3 left-0 right-0 z-50 w-[98%] mx-auto">
                <div className="glass-effect rounded-2xl">
                    <div className='w-full mx-auto flex justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] items-center py-4 px-4'
                        onMouseLeave={() => setIsProductsOpen(false)}>

                        {/* Logo Section - Left */}
                        <Link href={'/'}>
                            <div className="flex items-center justify-start space-x-3">
                                <Image
                                    src={'/svgs/logo.svg'}
                                    width={30}
                                    height={30}
                                    alt='company-logo'
                                    className={resolvedTheme === 'light' ? 'filter invert' : ''}
                                />
                                <span className="text-lg lg:text-xl font-bold font-geist-mono text-foreground">
                                    Chatrio
                                </span>
                            </div>
                        </Link>

                        {/* Navigation Links - Center */}
                        <ul className='hidden lg:flex items-center justify-center space-x-6 lg:space-x-8 font-jost'>
                            <li className="nav-item">
                                <Link href="#" className="text-sm lg:text-base text-foreground hover-text-gradient font-medium transition-all duration-300">
                                    Chat Agent
                                </Link>
                            </li>
                            <li className="nav-item relative">
                                <button
                                    className="text-sm lg:text-base text-foreground hover-text-gradient font-medium flex items-center space-x-1 transition-all duration-300"
                                    onMouseEnter={() => setIsProductsOpen(true)}
                                >
                                    <span>Products</span>
                                    <svg className={`w-3 h-3 lg:w-4 lg:h-4 transition-transform duration-300 ${isProductsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                <div
                                    className={`absolute top-full left-0 glass-effect-darker mt-2 w-64 rounded-xl shadow-lg ${isProductsOpen
                                        ? 'opacity-100 visible dropdown-enter-active'
                                        : 'opacity-0 invisible dropdown-exit-active'
                                        }`}
                                    onMouseEnter={() => setIsProductsOpen(true)}
                                >
                                    <div className="py-4 px-2">
                                        <Link href="#" className="block px-4 py-3 text-foreground hover-text-gradient rounded-lg transition-all duration-300 hover:bg-muted">
                                            <div className="text-sm lg:text-base font-medium">AI Chatbots</div>
                                            <div className="text-xs lg:text-sm text-muted-foreground">Intelligent conversation automation</div>
                                        </Link>
                                        <Link href="#" className="block px-4 py-3 text-foreground hover-text-gradient rounded-lg transition-all duration-300 hover:bg-muted">
                                            <div className="text-sm lg:text-base font-medium">Live Chat</div>
                                            <div className="text-xs lg:text-sm text-muted-foreground">Real-time customer support</div>
                                        </Link>
                                        <Link href="#" className="block px-4 py-3 text-foreground hover-text-gradient rounded-lg transition-all duration-300 hover:bg-muted">
                                            <div className="text-sm lg:text-base font-medium">Analytics</div>
                                            <div className="text-xs lg:text-sm text-muted-foreground">Conversation insights & metrics</div>
                                        </Link>
                                        <Link href="#" className="block px-4 py-3 text-foreground hover-text-gradient rounded-lg transition-all duration-300 hover:bg-muted">
                                            <div className="text-sm lg:text-base font-medium">Integrations</div>
                                            <div className="text-xs lg:text-sm text-muted-foreground">Connect with your tools</div>
                                        </Link>
                                    </div>
                                </div>
                            </li>
                            <li className="nav-item">
                                <Link href="#" className="text-sm lg:text-base text-foreground hover-text-gradient font-medium transition-all duration-300">
                                    Pricing
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="#" className="text-sm lg:text-base text-foreground hover-text-gradient font-medium transition-all duration-300">
                                    FAQ's
                                </Link>
                            </li>
                        </ul>

                        {/* Right Section - Auth Buttons & Theme Toggle */}
                        <div className='flex items-center justify-end space-x-3 '>
                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Auth Buttons or User Profile */}
                            {!loading && (
                                <>
                                    {user ? (
                                        // User is logged in - Show Profile Button
                                        <div className="hidden sm:flex items-center space-x-3 !mr-0 ">
                                            <div className="relative ">
                                                <button
                                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors duration-300"
                                                >
                                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                                        <span className="text-primary-foreground text-sm font-medium">
                                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-medium text-foreground hidden md:block">
                                                        {user.name}
                                                    </span>
                                                </button>

                                                {/* Profile Dropdown */}
                                                {isProfileDropdownOpen && (
                                                    <div className="absolute right-0 mt-2 w-48 glass-effect-darker rounded-xl shadow-lg py-2 z-50">
                                                        <div className="px-4 py-2 border-b border-border">
                                                            <p className="text-sm font-medium text-foreground">{user.name}</p>
                                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                                        </div>
                                                        <Link
                                                            href="/dashboard"
                                                            className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-300"
                                                            onClick={() => setIsProfileDropdownOpen(false)}
                                                        >
                                                            Dashboard
                                                        </Link>
                                                        <button
                                                            onClick={handleLogout}
                                                            className=" block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-300"
                                                        >
                                                            Sign Out
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        // User is not logged in - Show Auth Buttons
                                        <div className="hidden sm:flex items-center space-x-3 !mr-0">
                                            <Link href={'/signup'} className='sign-in px-4 lg:px-7 py-2 lg:py-3 text-foreground border border-border hover:bg-muted rounded-lg transition-all duration-300 font-medium font-[family-name:var(--font-jost)] text-xs lg:text-sm whitespace-nowrap'>
                                                Sign In
                                            </Link>
                                            <Link href={'/login'} className='login px-4 lg:px-7 py-2 lg:py-3 bg-primary text-primary-foreground hover:scale-105 rounded-lg custom-transition duration-300 font-medium font-[family-name:var(--font-jost)] text-xs lg:text-sm'>
                                                Login
                                            </Link>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors duration-300"
                            >
                                <svg className={`w-5 h-5 lg:w-6 lg:h-6 text-foreground transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="glass-effect-darker px-4 py-6 rounded-b-2xl space-y-6 rounded-2xl mt-2">
                        <nav>
                            <ul className="space-y-4 font-[family-name:var(--font-jost)]">
                                <li>
                                    <Link href="#" className="block py-2 text-base text-foreground hover-text-gradient font-medium transition-all duration-300">
                                        Chat Agent
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="block py-2 text-base text-foreground hover-text-gradient font-medium transition-all duration-300">
                                        Products
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="block py-2 text-base text-foreground hover-text-gradient font-medium transition-all duration-300">
                                        Pricing
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="block py-2 text-base text-foreground hover-text-gradient font-medium transition-all duration-300">
                                        FAQ's
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        <div className="space-y-3 pt-4 border-t border-border">
                            {user ? (
                                // Mobile: User is logged in
                                <>
                                    <div className="flex items-center space-x-3 py-2">
                                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                            <span className="text-primary-foreground text-sm font-medium">
                                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <Link href="/dashboard" className='w-full py-2.5 text-foreground border border-border hover:bg-muted rounded-lg transition-all duration-300 font-medium font-[family-name:var(--font-jost)] text-sm text-center block'>
                                        Dashboard
                                    </Link>
                                    <button onClick={handleLogout} className='w-full py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-all duration-300 font-medium font-[family-name:var(--font-jost)] text-sm'>
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                // Mobile: User is not logged in
                                <>
                                    <Link href={'/signup'} className='w-full py-2.5 text-foreground border border-border hover:bg-muted rounded-lg transition-all duration-300 font-medium font-[family-name:var(--font-jost)] text-sm text-center block'>
                                        Sign In
                                    </Link>
                                    <Link href={'/login'} className='w-full py-2.5 bg-primary text-primary-foreground hover:scale-105 rounded-lg custom-transition duration-300 font-medium font-[family-name:var(--font-jost)] text-sm text-center block'>
                                        Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;