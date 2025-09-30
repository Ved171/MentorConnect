import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, Navigate, useNavigate } from 'react-router-dom';
import db from '../services/database';
import { getSocket } from '../services/socket';
import { Mentor, Mentee, UserRole, RequestStatus } from '../types';
import Card from './common/Card';
import Avatar from './common/Avatar';
import ScheduleSessionModal from './dashboard/ScheduleSessionModal';

const MentorProfile: React.FC = () => {
    const { mentorId } = useParams<{ mentorId: string }>();
    const { user: currentUser } = useOutletContext<{ user: Mentee }>();
    const navigate = useNavigate();
    const [mentor, setMentor] = useState<Mentor | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [requestMessage, setRequestMessage] = useState('');
    const [isAlreadyMentor, setIsAlreadyMentor] = useState(false);
    const [hasPendingRequest, setHasPendingRequest] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [sessionMessage, setSessionMessage] = useState('');

    useEffect(() => {
        const fetchMentorData = async () => {
            if (!mentorId || !currentUser) {
                setLoading(false);
                return;
            };

            setIsAlreadyMentor(currentUser.mentorIds.includes(mentorId));

            const requests = await db.getRequests();
            setHasPendingRequest(requests.some(r => r.toId === mentorId && r.fromId === currentUser.id && r.status === RequestStatus.PENDING));

            const mentorData = await db.findUserById(mentorId);
            if (mentorData && mentorData.role === UserRole.MENTOR) {
                setMentor(mentorData as Mentor);
            }
            setLoading(false);
        };
        fetchMentorData();

        // Real-time updates for request status on this mentor profile
        const socket = getSocket();
        const handler = (payload?: { request?: { id: string; fromId: string; toId: string; status: RequestStatus } }) => {
            const updated = payload?.request;
            if (!updated || !mentorId || !currentUser) return;
            if (updated.toId === mentorId && updated.fromId === currentUser.id) {
                if (updated.status === RequestStatus.ACCEPTED) {
                    setHasPendingRequest(false);
                    setIsAlreadyMentor(true);
                    setMessage('Your mentorship request was accepted!');
                    setTimeout(() => setMessage(''), 4000);
                } else if (updated.status === RequestStatus.DECLINED) {
                    setHasPendingRequest(false);
                    setMessage('Your mentorship request was declined.');
                    setTimeout(() => setMessage(''), 4000);
                } else {
                    setHasPendingRequest(true);
                }
            }
        };
        socket.on('request:updated', handler);
        return () => {
            socket.off('request:updated', handler);
        };
    }, [mentorId, currentUser]);
    
    const handleSendRequest = async () => {
        if (!mentor || !requestMessage.trim()) return;
        
        try {
            await db.sendMentorshipRequest(mentor.id, requestMessage.trim());
            setMessage(`Mentorship request sent to ${mentor.name}!`);
            setHasPendingRequest(true);
            setRequestMessage('');
            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            console.error("Failed to send request", error);
            setMessage("Failed to send request. Please try again.");
            setTimeout(() => setMessage(''), 5000);
        }
    };
    
    const handleSessionRequested = () => {
        setIsScheduling(false);
        setSessionMessage('Session requested successfully! Check your schedule for updates.');
        setTimeout(() => setSessionMessage(''), 5000);
    };


    if (loading) return <div className="text-center p-12 text-white">Loading profile...</div>;
    if (!mentor) return <div className="text-center p-12 text-white">Mentor not found.</div>;
    if (!currentUser) return <Navigate to="/login" />;

    return (
        <>
        {isScheduling && mentor && (
             <ScheduleSessionModal
                isOpen={isScheduling}
                onClose={() => setIsScheduling(false)}
                onSessionRequested={handleSessionRequested}
                mentee={currentUser}
                mentorId={mentor.id}
            />
        )}
        <div className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto">
                <Card className="!p-0 overflow-hidden mb-8">
                     <div className="bg-gray-800 p-8 md:flex items-center gap-8">
                        <div className="flex-shrink-0 text-center md:text-left mb-6 md:mb-0">
                            <Avatar user={mentor} className="w-32 h-32 mx-auto border-4 border-brand-accent shadow-lg" />
                        </div>
                        <div className="flex-grow">
                            <h1 className="text-3xl font-bold text-white">{mentor.name}</h1>
                            <p className="text-brand-accent">{mentor.position || `Year ${mentor.year}`}</p>
                            <p className="text-gray-400">{mentor.department}</p>
                        </div>
                    </div>
                     <div className="p-8 space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">About</h2>
                            <p className="text-gray-300">{mentor.bio}</p>
                        </div>
                         <div>
                            <h2 className="text-xl font-bold text-white mb-3">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {mentor.skills.length > 0 ? mentor.skills.map(skill => <span key={skill} className="bg-gray-700 text-gray-300 text-sm font-medium px-3 py-1 rounded-full">{skill}</span>) : <p className="text-gray-400 text-sm">No skills listed.</p>}
                            </div>
                        </div>
                    </div>
                </Card>

                {currentUser.role === UserRole.MENTEE && (
                    <Card>
                        <h2 className="text-2xl font-bold text-white mb-4">Become a Mentee</h2>
                        {message && <p className="bg-green-500/20 text-green-300 text-center p-3 rounded-lg mb-4">{message}</p>}
                        {sessionMessage && <p className="bg-green-500/20 text-green-300 text-center p-3 rounded-lg mb-4">{sessionMessage}</p>}
                        
                        {isAlreadyMentor ? (
                            <div className='flex gap-4'>
                                <button onClick={() => setIsScheduling(true)} className="bg-brand-teal hover:bg-teal-500 text-white font-bold py-2 px-6 rounded-lg transition duration-300">Schedule Session</button>
                                <button onClick={() => navigate('/messages', { state: { recipientId: mentor.id } })} className="bg-brand-accent hover:bg-brand-accent-dark text-white font-bold py-2 px-6 rounded-lg transition duration-300">Message</button>
                            </div>
                        ) : hasPendingRequest ? (
                            <p className="bg-yellow-500/20 text-yellow-300 text-center p-3 rounded-lg">Request Pending</p>
                        ) : (
                            <div className='space-y-4'>
                                <textarea 
                                    value={requestMessage}
                                    onChange={(e) => setRequestMessage(e.target.value)}
                                    placeholder={`Write a brief message to ${mentor.name} explaining why you'd like them to be your mentor...`}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                                    rows={3}
                                />
                                <button onClick={handleSendRequest} disabled={!requestMessage.trim()} className="w-full bg-brand-accent hover:bg-brand-accent-dark text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Send Mentorship Request
                                </button>
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </div>
        </>
    );
};

export default MentorProfile;