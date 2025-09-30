import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import db from '../services/database';
import { Resource, AnyUser, UserRole } from '../types';
import Card from './common/Card';
import BookOpenIcon from './icons/BookOpenIcon';
import ResourceEditModal from './admin/ResourceEditModal';

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
    const typeIcons = {
        'link': '🔗',
        'article': '📄',
        'document': '📁'
    };
    
    // Use relative URLs for uploaded files, which will be handled by the server/proxy.
    let resourceUrl = resource.url;
    if (!/^https?:\/\//i.test(resourceUrl)) {
        // Keep existing absolute '/uploads/...' paths as-is
        if (!resourceUrl.startsWith('/uploads/')) {
            resourceUrl = `/uploads/${resourceUrl.replace(/^\/+/, '')}`;
        }
    }

    return (
        <Card className="flex flex-col group">
            <a href={resourceUrl} target="_blank" rel="noopener noreferrer" className="flex-grow">
                <div className="flex items-start gap-4">
                    <span className="text-2xl">{typeIcons[resource.type]}</span>
                    <div>
                        <p className="text-sm text-brand-teal font-semibold">{resource.category}</p>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:underline">{resource.title}</h3>
                    </div>
                </div>
            </a>
            <p className="text-xs text-gray-500 mt-4 capitalize">Type: {resource.type}</p>
        </Card>
    )
}

const Resources: React.FC = () => {
    const { user: currentUser } = useOutletContext<{ user: AnyUser }>();
    const [resources, setResources] = useState<Resource[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchResources = useCallback(async () => {
        const allResources = await db.getResources();
        setResources(allResources);
        const uniqueCategories = ['All', ...new Set(allResources.map(r => r.category))];
        setCategories(uniqueCategories);
    }, []);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const handleSave = async (resourceToSave: Omit<Resource, 'id' | 'uploadedBy'>) => {
        try {
            await db.createResource(resourceToSave);
            setIsModalOpen(false);
            fetchResources();
        } catch (error) {
            console.error("Failed to save resource", error);
        }
    };

    const filteredResources = selectedCategory === 'All' 
        ? resources 
        : resources.filter(r => r.category === selectedCategory);

    const canAddResources = currentUser && (currentUser.role === UserRole.MENTOR || currentUser.role === UserRole.ADMIN);

    return (
        <>
        <ResourceEditModal
            resource={null}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
        />
        <div className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
                <BookOpenIcon className="w-16 h-16 text-brand-accent mx-auto mb-4" />
                <h1 className="text-4xl font-bold text-white">Learning Resources</h1>
                <p className="text-lg text-gray-400 mt-2">A curated library of documents and links to help you on your journey.</p>
                 {canAddResources && (
                    <div className="mt-6">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-brand-teal hover:bg-teal-500 text-white font-bold py-2 px-6 rounded-lg transition duration-300 transform hover:scale-105"
                        >
                            Add New Resource
                        </button>
                    </div>
                )}
            </div>

             <div className="flex justify-center flex-wrap gap-2 mb-8">
                {categories.map(category => (
                    <button 
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                            selectedCategory === category
                                ? 'bg-brand-accent text-white'
                                : 'bg-brand-secondary-dark text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredResources.length > 0 ? filteredResources.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                )) : (
                    <p className="text-gray-400 col-span-full text-center">No resources found for this category.</p>
                )}
            </div>
        </div>
        </>
    );
};

export default Resources;