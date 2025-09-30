import React, { useState, useEffect } from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import Card from './common/Card';
import db from '../services/database';
import { AnyUser, AvailabilityStatus, Mentor, UserRole } from '../types';
import Avatar from './common/Avatar';
import CameraIcon from './icons/CameraIcon';

const Profile: React.FC = () => {
    const { user: currentUser, setUser } = useOutletContext<{ user: AnyUser | null, setUser: (user: AnyUser) => void }>();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<AnyUser | null>(currentUser);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Effect to revoke the object URL to avoid memory leaks
    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    if (!currentUser || !formData) {
        return <Navigate to="/login" />;
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const skills = e.target.value.split(',');
        setFormData(prev => prev ? { ...prev, skills } : null);
    }
    
    const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const interests = e.target.value.split(',');
        setFormData(prev => prev ? { ...prev, interests } : null);
    }

    const handleSave = async () => {
        if (!formData) return;
    
        let userAfterAvatarUpdate = formData;
    
        if (avatarFile) {
            try {
                // This API call uploads the avatar and returns the updated user object
                userAfterAvatarUpdate = await db.uploadAvatar(avatarFile);
            } catch (error) {
                console.error("Avatar upload failed:", error);
                // Optionally, display an error message to the user
                return;
            }
        }
    
        const cleanedData = {
            ...formData, // Start with form data for text fields
            ...userAfterAvatarUpdate, // Overwrite with data from avatar update (especially new avatarUrl)
            id: currentUser.id, // Ensure the ID is correct
            skills: formData.skills.map(s => s.trim()).filter(Boolean),
            interests: formData.interests.map(i => i.trim()).filter(Boolean),
        };
    
        const finalUpdatedUser = await db.updateUser(cleanedData);
    
        setUser(finalUpdatedUser);
        setFormData(finalUpdatedUser); // Sync local form state with the final saved data
        setAvatarFile(null);
        setAvatarPreview(null);
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setFormData(currentUser);
        setAvatarFile(null);
        setAvatarPreview(null);
        setIsEditing(false);
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto">
                <Card className="!p-0 overflow-hidden">
                    <div className="bg-gray-800 p-8 md:flex items-center gap-8">
                        <div className="relative flex-shrink-0 text-center md:text-left mb-6 md:mb-0">
                            <Avatar src={avatarPreview} user={currentUser} className="w-32 h-32 mx-auto border-4 border-brand-accent shadow-lg" />
                             {isEditing && (
                                <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-brand-accent p-2 rounded-full cursor-pointer hover:bg-brand-accent-dark transition-all duration-300 transform hover:scale-110">
                                    <CameraIcon className="w-6 h-6 text-white" />
                                    <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                </label>
                            )}
                        </div>
                        <div className="flex-grow">
                            <h1 className="text-3xl font-bold text-white">{currentUser.name}</h1>
                            <p className="text-brand-accent">{currentUser.role}</p>
                            <p className="text-gray-400">{currentUser.department}</p>
                        </div>
                         <div className="flex-shrink-0 mt-6 md:mt-0">
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="bg-brand-teal hover:bg-teal-500 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={handleCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Cancel</button>
                                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Save</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-8 space-y-8">
                        {currentUser.role === UserRole.MENTOR && (
                           <div>
                                <h2 className="text-xl font-bold text-white mb-2">About Me</h2>
                                {isEditing ? (
                                    <textarea name="bio" value={(formData as Mentor).bio} onChange={handleInputChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white" rows={4}></textarea>
                                ) : (
                                    <p className="text-gray-300">{(currentUser as Mentor).bio || 'No bio provided.'}</p>
                                )}
                           </div>
                        )}

                        {currentUser.role !== UserRole.ADMIN && (
                            <>
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-3">Skills</h2>
                                    {isEditing ? (
                                        <input type="text" name="skills" value={formData.skills.join(', ')} onChange={handleSkillsChange} placeholder="Comma-separated skills" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white" />
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {currentUser.skills.length > 0 ? currentUser.skills.map(skill => <span key={skill} className="bg-gray-700 text-gray-300 text-sm font-medium px-3 py-1 rounded-full">{skill}</span>) : <p className="text-gray-400 text-sm">No skills listed.</p>}
                                        </div>
                                    )}
                                </div>
                                
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-3">Interests</h2>
                                    {isEditing ? (
                                        <input type="text" name="interests" value={formData.interests.join(', ')} onChange={handleInterestsChange} placeholder="Comma-separated interests" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white" />
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {currentUser.interests.length > 0 ? currentUser.interests.map(interest => <span key={interest} className="bg-gray-700 text-gray-300 text-sm font-medium px-3 py-1 rounded-full">{interest}</span>) : <p className="text-gray-400 text-sm">No interests listed.</p>}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}


                         {currentUser.role === UserRole.MENTOR && (
                           <div>
                                <h2 className="text-xl font-bold text-white mb-2">Availability</h2>
                                {isEditing ? (
                                     <select name="availability" value={(formData as Mentor).availability} onChange={handleInputChange} className="w-full md:w-1/2 bg-gray-900 border border-gray-600 rounded-lg p-2 text-white">
                                        {Object.values(AvailabilityStatus).map(status => <option key={status} value={status}>{status}</option>)}
                                    </select>
                                ) : (
                                    <p className="text-gray-300">{(currentUser as Mentor).availability}</p>
                                )}
                           </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Profile;