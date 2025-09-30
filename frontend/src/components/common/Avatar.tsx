import React from 'react';
import { AnyUser } from '../../types';
import UserCircleIcon from '../icons/UserCircleIcon';

interface AvatarProps {
    user?: (Partial<AnyUser> & { name: string }) | null;
    src?: string | null;
    alt?: string;
    className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ user, src, alt, className = 'w-12 h-12' }) => {
    // Determine source and alt text from props
    const avatarSrc = src ?? user?.avatarUrl;
    const altText = alt ?? user?.name ?? 'User Avatar';
    
    // Use relative paths. The Vite proxy will handle this in development,
    // and in production, the frontend and backend share the same origin.
    const finalSrc = avatarSrc;

    if (finalSrc) {
        return <img src={finalSrc} alt={altText} className={`${className} rounded-full object-cover`} />;
    }
    
    // Fallback to icon
    return <UserCircleIcon className={`${className} text-gray-500 bg-gray-800 rounded-full p-1 border-2 border-gray-700`} />;
};

export default Avatar;