import React, { useState, useEffect } from 'react';
import { AnyUser, UserRole } from '../../types';

interface UserEditModalProps {
  user: AnyUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: AnyUser) => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<AnyUser | null>(user);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-brand-secondary-dark rounded-lg shadow-lg w-full max-w-lg border border-gray-700">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Edit User: {user?.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="name">Full Name</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">Email</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="department">Department</label>
                <input type="text" name="department" id="department" value={formData.department} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="role">Role</label>
                <select name="role" id="role" value={formData.role} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white">
                  {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition">Cancel</button>
            <button type="submit" className="bg-brand-accent hover:bg-brand-accent-dark text-white font-bold py-2 px-4 rounded-lg transition">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
