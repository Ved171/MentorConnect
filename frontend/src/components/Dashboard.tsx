import React from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import { UserRole, AnyUser, Mentee, Mentor } from '../types';
import AdminDashboard from './admin/AdminDashboard';
import MenteeDashboard from './dashboard/MenteeDashboard';
import MentorDashboard from './dashboard/MentorDashboard';

const Dashboard: React.FC = () => {
    const { user: currentUser, setUser } = useOutletContext<{ user: AnyUser, setUser: (user: AnyUser) => void }>();

    if (!currentUser) {
       return <Navigate to="/login" />;
    }
    
    const renderDashboard = () => {
        switch(currentUser.role) {
            case UserRole.MENTEE:
                return <MenteeDashboard user={currentUser as Mentee} />;
            case UserRole.MENTOR:
                return <MentorDashboard user={currentUser as Mentor} setUser={setUser} />;
            case UserRole.ADMIN:
                return <AdminDashboard />;
            default:
                return <p>Invalid user role.</p>;
        }
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-white mb-8">Welcome back, {currentUser.name.split(' ')[0]}!</h1>
            {renderDashboard()}
        </div>
    );
};

export default Dashboard;