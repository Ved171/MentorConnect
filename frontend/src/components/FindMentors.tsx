import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import db from '../services/database';
import { Mentor, AvailabilityStatus } from '../types';
import Card from './common/Card';
import MagnifyingGlassIcon from './icons/MagnifyingGlassIcon';
import Avatar from './common/Avatar';

const MentorCard: React.FC<{ mentor: Mentor }> = ({ mentor }) => {
    const availabilityColor = {
        [AvailabilityStatus.AVAILABLE]: 'bg-green-500',
        [AvailabilityStatus.BUSY]: 'bg-yellow-500',
        [AvailabilityStatus.NOT_ACCEPTING]: 'bg-red-500',
    };

    return (
        <Card className="flex flex-col text-center items-center transform hover:-translate-y-2 transition-transform duration-300">
            <Avatar user={mentor} className="w-24 h-24 mb-4 border-4 border-gray-600" />
            <h3 className="text-xl font-bold text-white">{mentor.name}</h3>
            <p className="text-brand-accent text-sm">{mentor.position || `Year ${mentor.year}`}</p>
            <p className="text-gray-400 mb-4">{mentor.department}</p>
            <div className="flex items-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${availabilityColor[mentor.availability]}`}></div>
                <span className="text-xs text-gray-300">{mentor.availability}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-4 min-h-[26px]">
                {mentor.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">{skill}</span>
                ))}
            </div>
            <Link to={`/mentors/${mentor.id}`} className="mt-auto w-full bg-brand-accent hover:bg-brand-accent-dark text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-center">
                View Profile
            </Link>
        </Card>
    );
};


const FindMentors: React.FC = () => {
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [availabilityFilter, setAvailabilityFilter] = useState('All');
    
    useEffect(() => {
        const fetchMentors = async () => {
            const allMentors = await db.getMentors();
            setMentors(allMentors as Mentor[]);
        };
        fetchMentors();
    }, []);
    
    const filteredMentors = mentors.filter(mentor => {
        const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) || mentor.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesDept = departmentFilter === 'All' || mentor.department === departmentFilter;
        const matchesAvailability = availabilityFilter === 'All' || mentor.availability === availabilityFilter;
        return matchesSearch && matchesDept && matchesAvailability;
    });

    const departments = ['All', ...new Set(mentors.map(m => m.department))];
    const availabilities = ['All', ...Object.values(AvailabilityStatus)];

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">Find Your Mentor</h1>
            
            <div className="bg-brand-secondary-dark p-6 rounded-lg mb-8 sticky top-20 z-40 border border-gray-700">
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="relative">
                        <input 
                            type="text"
                            placeholder="Search by name or skill..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        />
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <select
                         value={departmentFilter}
                         onChange={(e) => setDepartmentFilter(e.target.value)}
                         className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    >
                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                    <select
                        value={availabilityFilter}
                        onChange={(e) => setAvailabilityFilter(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    >
                        {availabilities.map(avail => <option key={avail} value={avail}>{avail}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredMentors.map(mentor => (
                    <MentorCard key={mentor.id} mentor={mentor} />
                ))}
            </div>
        </div>
    );
};

export default FindMentors;