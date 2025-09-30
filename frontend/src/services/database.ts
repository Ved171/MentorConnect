import api from './api';
import { AnyUser, Message, Resource, Goal, Session, MentorshipRequest, Mentor } from '../types';

// This file is a wrapper around our backend API.
// The name `db` is kept for minimal changes in the components that use it.

const db = {
    // --- Auth ---
    login: async (email, password): Promise<{user: AnyUser, token: string}> => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    },
    register: async (userData: Partial<AnyUser>): Promise<{user: AnyUser, token: string}> => {
        try {
            const { data } = await api.post('/auth/register', userData);
            return data;
        } catch (error: any) {
             throw new Error(error.response?.data?.message || 'Registration failed');
        }
    },

    // --- Users ---
    getUsers: async (): Promise<AnyUser[]> => {
        const { data } = await api.get('/users');
        return data;
    },
    findUserById: async (id: string): Promise<AnyUser | undefined> => {
        const { data } = await api.get(`/users/${id}`);
        return data;
    },
    getMentors: async (): Promise<AnyUser[]> => {
        const { data } = await api.get('/users/mentors');
        return data;
    },
    updateUser: async (updatedUser: AnyUser): Promise<AnyUser> => {
        const { data } = await api.put(`/users/${updatedUser.id}`, updatedUser);
        return data;
    },
    deleteUser: async (userId: string): Promise<void> => {
        await api.delete(`/users/${userId}`);
    },
    uploadAvatar: async (file: File): Promise<AnyUser> => {
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            const { data } = await api.post('/users/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Avatar upload failed');
        }
    },

    // --- Messages ---
    getMessages: async (): Promise<Message[]> => {
        const { data } = await api.get('/messages');
        return data;
    },
    sendMessage: async (receiverId: string, text: string): Promise<Message> => {
        const { data } = await api.post(`/messages/send/${receiverId}`, { text });
        return data;
    },
    markMessagesAsRead: async (senderId: string): Promise<void> => {
        await api.post(`/messages/read/${senderId}`);
    },

    // --- Requests ---
    sendMentorshipRequest: async (toId: string, message: string): Promise<MentorshipRequest> => {
        const { data } = await api.post('/requests', { toId, message });
        return data;
    },
    getRequests: async (): Promise<MentorshipRequest[]> => {
        const { data } = await api.get('/requests');
        return data;
    },
    updateRequestStatus: async (requestId: string, status: 'Accepted' | 'Declined'): Promise<{ request: MentorshipRequest, updatedMentor?: Mentor }> => {
        const { data } = await api.put(`/requests/${requestId}`, { status });
        return data;
    },

    // --- Resources ---
    getResources: async (): Promise<Resource[]> => {
        const { data } = await api.get('/resources');
        return data;
    },
    createResource: async (resourceData: Omit<Resource, 'id' | 'uploadedBy'>): Promise<Resource> => {
        const { data } = await api.post('/resources', resourceData);
        return data;
    },
    updateResource: async (updatedResource: Resource): Promise<Resource> => {
        const { data } = await api.put(`/resources/${updatedResource.id}`, updatedResource);
        return data;
    },
    deleteResource: async (resourceId: string): Promise<void> => {
        await api.delete(`/resources/${resourceId}`);
    },
    uploadResourceFile: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { data } = await api.post('/resources/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'File upload failed');
        }
    },

    // --- Goals ---
    getGoalsForMentee: async (menteeId: string): Promise<Goal[]> => {
        const { data } = await api.get(`/goals/mentee/${menteeId}`);
        return data;
    },
    addGoal: async (goalData: { menteeId: string, text: string }): Promise<Goal> => {
        const { data } = await api.post('/goals', goalData);
        return data;
    },
    updateGoal: async (updatedGoal: Goal): Promise<Goal> => {
        const { data } = await api.put(`/goals/${updatedGoal.id}`, updatedGoal);
        return data;
    },
    deleteGoal: async (goalId: string): Promise<void> => {
        await api.delete(`/goals/${goalId}`);
    },

    // --- Sessions ---
    getSessionsForUser: async (): Promise<Session[]> => {
        const { data } = await api.get('/sessions');
        return data;
    },
    requestSession: async (sessionData: Omit<Session, 'id' | 'status' | 'endTime' | 'requestedBy'>): Promise<Session> => {
        const { data } = await api.post('/sessions', sessionData);
        return data;
    },
    updateSessionStatus: async (sessionId: string, status: Session['status']): Promise<Session> => {
        const { data } = await api.put(`/sessions/${sessionId}/status`, { status });
        return data;
    },
};

export default db;