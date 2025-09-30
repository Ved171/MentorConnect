import React from 'react';
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

    return (
        <header className="bg-brand-secondary-dark/80 backdrop-blur-sm sticky top-0 z-50">
            <nav className="flex items-center justify-between px-6 py-4">
                <NavLink to="/" className="flex items-center gap-2 text-2xl font-bold text-white flex-shrink-0">
                    <SparklesIcon className="w-7 h-7 text-brand-accent" />
                    <h1>MentorConnect</h1>
                </NavLink>
                
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
        </header>
    );
};

export default Header;
