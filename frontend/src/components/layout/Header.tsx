import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import SparklesIcon from '../icons/SparklesIcon';
import { AnyUser, UserRole } from '../../types';

interface HeaderProps {
    onLogout: () => void;
    user: AnyUser | null;
    unreadCount: number;
}

const Header: React.FC<HeaderProps> = ({ onLogout, user, unreadCount }) => {
    const activeLinkStyle = {
        color: '#8b5cf6',
        textShadow: '0 0 10px rgba(139, 92, 246, 0.7)'
    };

    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="bg-brand-secondary-dark/80 backdrop-blur-sm sticky top-0 z-50">
            <nav className="relative flex items-center justify-between px-6 py-4">
                <NavLink to="/" className="flex items-center gap-2 text-2xl font-bold text-white flex-shrink-0">
                    <SparklesIcon className="w-7 h-7 text-brand-accent" />
                    <h1>MentorConnect</h1>
                </NavLink>
                
                {/* Mobile menu button */}
                <button
                    aria-label="Toggle menu"
                    className="md:hidden ml-auto inline-flex items-center justify-center w-11 h-11 text-white focus:outline-none focus:ring-2 focus:ring-white rounded-lg z-50 bg-brand-accent border-2 border-white/30 shadow-glow-purple"
                    onClick={() => setMobileOpen((prev) => !prev)}
                >
                    {mobileOpen ? (
                        // Close icon
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        // Hamburger icon
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>

                <div className="hidden md:flex items-center gap-8">
                    <NavLink
                        to="/"
                        end
                        className="text-gray-300 hover:text-brand-accent transition-colors duration-300"
                        style={({ isActive }) => isActive ? activeLinkStyle : {}}
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/dashboard"
                        className="text-gray-300 hover:text-brand-accent transition-colors duration-300"
                        style={({ isActive }) => isActive ? activeLinkStyle : {}}
                    >
                        Dashboard
                    </NavLink>
                    {user?.role === UserRole.MENTEE && (
                        <NavLink
                            to="/mentors"
                            className="text-gray-300 hover:text-brand-accent transition-colors duration-300"
                            style={({ isActive }) => isActive ? activeLinkStyle : {}}
                        >
                            Find Mentors
                        </NavLink>
                    )}
                    <NavLink
                        to="/schedule"
                        className="text-gray-300 hover:text-brand-accent transition-colors duration-300"
                        style={({ isActive }) => isActive ? activeLinkStyle : {}}
                    >
                        Schedule
                    </NavLink>
                    <NavLink
                        to="/resources"
                        className="text-gray-300 hover:text-brand-accent transition-colors duration-300"
                        style={({ isActive }) => isActive ? activeLinkStyle : {}}
                    >
                        Resources
                    </NavLink>
                     <NavLink
                        to="/messages"
                        className="relative text-gray-300 hover:text-brand-accent transition-colors duration-300"
                            style={({ isActive }) => isActive ? activeLinkStyle : {}}
                    >
                        Messages
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-4 flex h-5 w-5 items-center justify-center rounded-full bg-brand-accent text-xs text-white ring-2 ring-brand-secondary-dark">{unreadCount}</span>
                        )}
                    </NavLink>
                    <NavLink
                        to="/profile"
                        className="text-gray-300 hover:text-brand-accent transition-colors duration-300"
                         style={({ isActive }) => isActive ? activeLinkStyle : {}}
                    >
                        Profile
                    </NavLink>
                    <button onClick={onLogout} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-sm">
                        Logout
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden absolute left-0 right-0 top-full bg-brand-secondary-dark/95 backdrop-blur-md border-t border-gray-700 px-6 pb-4 pt-3 space-y-3 shadow-xl">
                    <NavLink
                        to="/"
                        end
                        className="block text-gray-200 hover:text-brand-accent transition-colors duration-300"
                        style={({ isActive }) => isActive ? activeLinkStyle : {}}
                        onClick={() => setMobileOpen(false)}
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/dashboard"
                        className="block text-gray-200 hover:text-brand-accent transition-colors duration-300"
                        style={({ isActive }) => isActive ? activeLinkStyle : {}}
                        onClick={() => setMobileOpen(false)}
                    >
                        Dashboard
                    </NavLink>
                    {user?.role === UserRole.MENTEE && (
                        <NavLink
                            to="/mentors"
                            className="block text-gray-200 hover:text-brand-accent transition-colors duration-300"
                            style={({ isActive }) => isActive ? activeLinkStyle : {}}
                            onClick={() => setMobileOpen(false)}
                        >
                            Find Mentors
                        </NavLink>
                    )}
                    <NavLink
                        to="/schedule"
                        className="block text-gray-200 hover:text-brand-accent transition-colors duration-300"
                        style={({ isActive }) => isActive ? activeLinkStyle : {}}
                        onClick={() => setMobileOpen(false)}
                    >
                        Schedule
                    </NavLink>
                    <NavLink
                        to="/resources"
                        className="block text-gray-200 hover:text-brand-accent transition-colors duration-300"
                        style={({ isActive }) => isActive ? activeLinkStyle : {}}
                        onClick={() => setMobileOpen(false)}
                    >
                        Resources
                    </NavLink>
                    <NavLink
                        to="/messages"
                        className="relative block text-gray-200 hover:text-brand-accent transition-colors duration-300"
                        style={({ isActive }) => isActive ? activeLinkStyle : {}}
                        onClick={() => setMobileOpen(false)}
                    >
                        Messages
                        {unreadCount > 0 && (
                            <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-accent px-1 text-xs text-white ring-2 ring-brand-secondary-dark">
                                {unreadCount}
                            </span>
                        )}
                    </NavLink>
                    <NavLink
                        to="/profile"
                        className="block text-gray-200 hover:text-brand-accent transition-colors duration-300"
                        style={({ isActive }) => isActive ? activeLinkStyle : {}}
                        onClick={() => setMobileOpen(false)}
                    >
                        Profile
                    </NavLink>
                    <button
                        onClick={() => { setMobileOpen(false); onLogout(); }}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-sm"
                    >
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header;
