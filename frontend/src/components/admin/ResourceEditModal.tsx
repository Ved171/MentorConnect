import React, { useState, useEffect } from 'react';
import { Resource } from '../../types';
import db from '../../services/database';

interface ResourceEditModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (resource: Omit<Resource, 'id' | 'uploadedBy'> | Resource) => void;
}

const ResourceEditModal: React.FC<ResourceEditModalProps> = ({ resource, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
      title: '',
      url: '',
      type: 'link' as Resource['type'],
      category: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (resource) {
            setFormData({
                title: resource.title,
                url: resource.url,
                type: resource.type,
                category: resource.category,
            });
        } else {
            // Reset for new resource
            setFormData({ title: '', url: '', type: 'link', category: '' });
        }
        setSelectedFile(null);
        setError('');
        setIsLoading(false);
    }
  }, [resource, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newState = { ...prev, [name]: value };
        // If type is changed, reset file and potentially URL
        if (name === 'type') {
            setSelectedFile(null);
            if (value === 'document') {
                newState.url = '';
            }
        }
        return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.type === 'document' && !selectedFile && !resource) {
        setError('Please select a file to upload for document resources.');
        return;
    }
    
    setIsLoading(true);

    let finalUrl = formData.url;

    try {
        if (formData.type === 'document' && selectedFile) {
            const uploadResponse = await db.uploadResourceFile(selectedFile);
            finalUrl = uploadResponse.url;
        }

        const payload = { ...formData, url: finalUrl };

        if (resource) {
            onSave({ ...resource, ...payload });
        } else {
            onSave(payload);
        }
    } catch (err: any) {
        setError(err.message || 'An error occurred. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-brand-secondary-dark rounded-lg shadow-lg w-full max-w-lg border border-gray-700">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">{resource ? 'Edit' : 'Add'} Resource</h2>
             {error && <p className="bg-red-500/20 text-red-400 text-center p-2 rounded-lg mb-4 text-sm">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="title">Title</label>
                <input required type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="type">Type</label>
                <select name="type" id="type" value={formData.type} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white">
                    <option value="link">Link</option>
                    <option value="article">Article</option>
                    <option value="document">Document</option>
                </select>
              </div>

              {formData.type === 'document' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">File</label>
                  {selectedFile ? (
                     <div className="flex items-center justify-between bg-gray-800 p-2 rounded-lg">
                        <span className="text-sm text-gray-300 truncate">{selectedFile.name}</span>
                        <button type="button" onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-400 text-xs font-semibold ml-2">Remove</button>
                    </div>
                  ) : (
                    <>
                    <input required={!resource} type="file" onChange={handleFileChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-accent/20 file:text-brand-accent hover:file:bg-brand-accent/30" />
                    {resource?.url && <p className="text-xs text-gray-500 mt-1">Current file: {resource.url}. Upload a new file to replace it.</p>}
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="url">URL</label>
                  <input required type="url" name="url" id="url" value={formData.url} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white" />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="category">Category</label>
                <input required type="text" name="category" id="category" value={formData.category} onChange={handleChange} placeholder="e.g., Programming, Career Advice" className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition">Cancel</button>
            <button type="submit" disabled={isLoading} className="bg-brand-accent hover:bg-brand-accent-dark text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50">
                {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceEditModal;