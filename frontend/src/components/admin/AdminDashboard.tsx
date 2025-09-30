import React, { useState } from 'react';
import UserManagement from './UserManagement';
import ResourceManagement from './ResourceManagement';
import SystemStats from './SystemStats';

type AdminTab = 'stats' | 'users' | 'resources';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('stats');

    const renderTabContent = () => {
        switch(activeTab) {
            case 'stats':
                return <SystemStats />;
            case 'users':
                return <UserManagement />;
            case 'resources':
                return <ResourceManagement />;
            default:
                return null;
        }
    };
    
    const TabButton: React.FC<{tabName: AdminTab; label: string;}> = ({ tabName, label }) => {
        const isActive = activeTab === tabName;
        return (
            <button
                onClick={() => setActiveTab(tabName)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                        ? 'bg-brand-accent text-white shadow-md'
                        : 'text-gray-300 hover:bg-brand-secondary-dark'
                }`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="space-y-8">
            <div className="bg-brand-secondary-dark p-2 rounded-lg border border-gray-700 flex justify-center md:justify-start space-x-2">
                <TabButton tabName="stats" label="System Stats" />
                <TabButton tabName="users" label="User Management" />
                <TabButton tabName="resources" label="Resource Management" />
            </div>
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
}

export default AdminDashboard;
