import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import MagnifyingGlassIcon from './icons/MagnifyingGlassIcon';
import CalendarIcon from './icons/CalendarIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import { AnyUser, UserRole } from '../types';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-gray-800/50 p-8 rounded-xl border-2 border-transparent hover:border-brand-accent/50 transition-all duration-300 group text-center backdrop-blur-sm shadow-lg hover:shadow-glow-purple">
        <div className="flex justify-center mb-4">
            <div className="bg-gray-900 p-4 rounded-full border-2 border-brand-accent/30 group-hover:border-brand-accent transition-all duration-300">
                {icon}
            </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

const StatCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className="bg-brand-secondary-dark/50 backdrop-blur-lg rounded-lg p-6 text-center border border-gray-700">
        <p className="text-4xl font-bold text-brand-accent">{value}</p>
        <p className="text-gray-400 mt-1">{label}</p>
    </div>
);

const Home: React.FC = () => {
    const { user: currentUser } = useOutletContext<{ user: AnyUser }>();

    return (
        <div className="text-white min-h-screen">
            <main className="container mx-auto px-6 py-16 md:py-24">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
                            Connect with Mentors, <br /> Accelerate Your Learning
                        </h1>
                        <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto md:mx-0">
                            Join thousands of students connecting with professors and senior students for personalized mentorship and academic guidance.
                        </p>
                        <div className="flex justify-center md:justify-start gap-4">
                            <Link to="/dashboard" className="bg-brand-teal hover:bg-teal-500 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg shadow-teal-500/20">
                                Get Started
                            </Link>
                            {currentUser?.role === UserRole.MENTEE && (
                                <Link to="/mentors" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105">
                                    Find a Mentor
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <StatCard value="100+" label="Expert Mentors" />
                        <StatCard value="1000+" label="Students Connected" />
                        <StatCard value="95%" label="Success Rate" />
                    </div>
                </div>

                <section className="py-24 md:py-32">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Why Choose MentorConnect?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<MagnifyingGlassIcon className="w-8 h-8 text-brand-accent" />}
                            title="Smart Matching"
                            description="Find the ideal match for your academic and career goals."
                        />
                        <FeatureCard 
                            icon={<CalendarIcon className="w-8 h-8 text-brand-accent" />}
                            title="Easy Scheduling"
                            description="Book sessions with mentors based on their real-time availability."
                        />
                        <FeatureCard 
                            icon={<BookOpenIcon className="w-8 h-8 text-brand-accent" />}
                            title="Curated Resources"
                            description="Access a library of resources hand-picked by mentors and admins."
                        />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
