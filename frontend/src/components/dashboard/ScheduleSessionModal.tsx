import React, { useState } from 'react';
import { Mentee } from '../../types';
import db from '../../services/database';

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionRequested: () => void;
  mentee: Mentee | null;
  mentorId: string;
}

const ScheduleSessionModal: React.FC<ScheduleSessionModalProps> = ({ isOpen, onClose, onSessionRequested, mentee, mentorId }) => {
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !mentee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !date || !time) {
        setError('All fields are required.');
        return;
    }
    setError('');

    const dateTimeString = `${date}T${time}`;
    const startTime = new Date(dateTimeString);
    
    if (isNaN(startTime.getTime())) {
        setError('Invalid date or time format.');
        return;
    }

    if (startTime < new Date()) {
        setError('Cannot schedule a session in the past.');
        return;
    }

    try {
        await db.requestSession({
            mentorId: mentorId,
            menteeId: mentee.id,
            startTime,
            topic
        });
        onSessionRequested();
        handleClose();
    } catch (err) {
        setError('Failed to request session. Please try again.');
        console.error(err);
    }
  };
  
  const handleClose = () => {
    // Reset state on close
    setTopic('');
    setDate('');
    setTime('');
    setError('');
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-brand-secondary-dark rounded-lg shadow-lg w-full max-w-lg border border-gray-700">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Schedule Session with <span className="text-brand-accent">{mentee.name}</span></h2>
            {error && <p className="bg-red-500/20 text-red-400 text-center p-2 rounded-lg mb-4 text-sm">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="topic">Topic</label>
                <input required type="text" name="topic" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Project Discussion" className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="date">Date</label>
                    <input required type="date" name="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="time">Time</label>
                    <input required type="time" name="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
            <button type="button" onClick={handleClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition">Cancel</button>
            <button type="submit" className="bg-brand-accent hover:bg-brand-accent-dark text-white font-bold py-2 px-4 rounded-lg transition">Send Request</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleSessionModal;
