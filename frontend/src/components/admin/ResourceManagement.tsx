import React, { useState, useEffect, useCallback } from 'react';
import db from '../../services/database';
import { Resource } from '../../types';
import Card from '../common/Card';
import ResourceEditModal from './ResourceEditModal';

const ResourceManagement: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchResources = useCallback(async () => {
        const allResources = await db.getResources();
        setResources(allResources);
    }, []);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const handleEdit = (resource: Resource) => {
        setEditingResource(resource);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingResource(null);
        setIsModalOpen(true);
    }

    const handleDelete = async (resourceId: string) => {
        if (window.confirm('Are you sure you want to delete this resource?')) {
            await db.deleteResource(resourceId);
            fetchResources();
        }
    };
    
    const handleSave = async (resourceToSave: Omit<Resource, 'id' | 'uploadedBy'> | Resource) => {
        if ('id' in resourceToSave) {
            await db.updateResource(resourceToSave);
        } else {
            // The backend determines `uploadedBy` from the authenticated user token.
            await db.createResource(resourceToSave);
        }
        setIsModalOpen(false);
        setEditingResource(null);
        fetchResources();
    };
    
    return (
        <>
            <ResourceEditModal resource={editingResource} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
             <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Resource Management</h2>
                    <button onClick={handleAdd} className="bg-brand-teal hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-lg transition">
                        Add Resource
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                        <thead className="bg-gray-900">
                            <tr>
                                <th className="p-3">Title</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Type</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resources.map(resource => (
                                <tr key={resource.id} className="border-b border-gray-700 hover:bg-gray-800">
                                    <td className="p-3"><a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{resource.title}</a></td>
                                    <td className="p-3">{resource.category}</td>
                                    <td className="p-3 capitalize">{resource.type}</td>
                                    <td className="p-3 text-right space-x-4">
                                        <button onClick={() => handleEdit(resource)} className="text-brand-teal hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(resource.id)} className="text-red-500 hover:underline">Delete</button>
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

export default ResourceManagement;
