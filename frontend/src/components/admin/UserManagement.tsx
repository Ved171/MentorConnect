import React, { useState, useEffect, useCallback } from 'react';
import db from '../../services/database';
import { AnyUser } from '../../types';
import Card from '../common/Card';
import UserEditModal from './UserEditModal';
import Avatar from '../common/Avatar';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<AnyUser[]>([]);
    const [editingUser, setEditingUser] = useState<AnyUser | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        const allUsers = await db.getUsers();
        setUsers(allUsers);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleEdit = (user: AnyUser) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            await db.deleteUser(userId);
            fetchUsers();
        }
    };
    
    const handleSaveUser = async (updatedUser: AnyUser) => {
        await db.updateUser(updatedUser);
        setIsModalOpen(false);
        setEditingUser(null);
        fetchUsers();
    };
    
    return (
        <>
            <UserEditModal user={editingUser} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveUser} />
             <Card>
                <h2 className="text-2xl font-bold text-white mb-4">User Management</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                        <thead className="bg-gray-900">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Role</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-800">
                                    <td className="p-3 flex items-center gap-3">
                                        <Avatar user={user} className="w-8 h-8" /> 
                                        {user.name}
                                    </td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3">{user.role}</td>
                                    <td className="p-3 text-right space-x-4">
                                        <button onClick={() => handleEdit(user)} className="text-brand-teal hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </>
    );
};

export default UserManagement;