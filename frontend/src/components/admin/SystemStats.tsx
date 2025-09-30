import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import db from '../../services/database';
import { AnyUser, UserRole } from '../../types';
import Card from '../common/Card';

const SystemStats: React.FC = () => {
    const [users, setUsers] = useState<AnyUser[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const allUsers = await db.getUsers();
            setUsers(allUsers);
        };
        fetchUsers();
    }, []);

    const userGrowthChartData = useMemo(() => {
        if (users.length === 0) return [];

        const monthCounts: { [key: string]: { count: number, date: Date } } = {};

        users.forEach(user => {
            if (user.createdAt) {
                const date = new Date(user.createdAt);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (monthCounts[monthKey]) {
                    monthCounts[monthKey].count++;
                } else {
                    monthCounts[monthKey] = { count: 1, date: new Date(date.getFullYear(), date.getMonth(), 1) };
                }
            }
        });

        const sortedData = Object.entries(monthCounts)
            .sort(([, a], [, b]) => a.date.getTime() - b.date.getTime())
            .slice(-6); 

        return sortedData.map(([, data]) => ({
            name: data.date.toLocaleString('default', { month: 'short', year: 'numeric' }),
            'New Users': data.count,
        }));

    }, [users]);

    const totalUsers = users.length;
    const totalMentors = users.filter(u => u.role === UserRole.MENTOR).length;
    const totalMentees = users.filter(u => u.role === UserRole.MENTEE).length;

    const pieChartData = [
        { name: 'Mentors', value: totalMentors },
        { name: 'Mentees', value: totalMentees },
    ];
    
    const PIE_CHART_COLORS = ['#8b5cf6', '#14b8a6'];


    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center"><p className="text-4xl font-bold text-brand-accent">{totalUsers}</p><p className="text-gray-400">Total Users</p></Card>
                <Card className="text-center"><p className="text-4xl font-bold text-brand-accent">{totalMentors}</p><p className="text-gray-400">Total Mentors</p></Card>
                <Card className="text-center"><p className="text-4xl font-bold text-brand-accent">{totalMentees}</p><p className="text-gray-400">Total Mentees</p></Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                 <Card className="lg:col-span-3">
                    <h2 className="text-2xl font-bold text-white mb-4">User Growth (Last 6 Months)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={userGrowthChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                            <XAxis dataKey="name" stroke="#a0aec0" />
                            <YAxis stroke="#a0aec0" allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4a5568' }} />
                            <Legend />
                            <Bar dataKey="New Users" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                 <Card className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-white mb-4">User Roles</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4a5568' }}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default SystemStats;
