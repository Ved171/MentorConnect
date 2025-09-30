const Resource = require('../models/resourceModel.js');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res) => {
    try {
        const resources = await Resource.find({}).sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new resource
// @route   POST /api/resources
// @access  Private (Admin or Mentor)
const createResource = async (req, res) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Mentor') {
        return res.status(403).json({ message: 'Not authorized to create resources' });
    }
    const { title, type, url, category } = req.body;
    try {
        const newResource = new Resource({
            title,
            type,
            url,
            category,
            uploadedBy: req.user.id,
        });
        const savedResource = await newResource.save();
        res.status(201).json(savedResource);
    } catch (error) {
        res.status(400).json({ message: 'Invalid resource data', error: error.message });
    }
};

// @desc    Update a resource
// @route   PUT /api/resources/:id
// @access  Private (Admin or Owner)
const updateResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        const isOwner = resource.uploadedBy.toString() === req.user.id;
        const isAdmin = req.user.role === 'Admin';

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Not authorized to update this resource' });
        }

        Object.assign(resource, req.body);
        const updatedResource = await resource.save();
        res.json(updatedResource);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin or Owner)
const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        const isOwner = resource.uploadedBy.toString() === req.user.id;
        const isAdmin = req.user.role === 'Admin';

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Not authorized to delete this resource' });
        }

        await resource.deleteOne();
        res.json({ message: 'Resource removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getResources,
    createResource,
    updateResource,
    deleteResource,
};
