import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SparklesIcon from './icons/SparklesIcon';
import db from '../services/database';
import { AnyUser, UserRole } from '../types';

interface AuthProps {
  mode: 'login' | 'register';
  onAuth: (user: AnyUser, token: string) => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(UserRole.MENTEE);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const { user, token } = await db.login(email, password);
        onAuth(user, token);
      } else {
        if (!email.endsWith('@indusuni.ac.in')) {
          setError('Please use a valid university email address (e.g., user@indusuni.ac.in).');
          setIsLoading(false);
          return;
        }
        const { user, token } = await db.register({ name, email, password, role });
        onAuth(user, token);
      }
    } catch (err: any) {
        setError(err.message || `An error occurred during ${mode}.`);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark p-4">
      <div className="w-full max-w-md">
        <div className="bg-brand-secondary-dark border border-gray-700 rounded-2xl p-8 shadow-2xl shadow-brand-accent/10">
          <div className="text-center mb-8">
            <Link to="/" className="flex justify-center items-center gap-2 text-3xl font-bold text-white mb-2">
              <SparklesIcon className="w-8 h-8 text-brand-accent" />
              <h1>MentorConnect</h1>
            </Link>
            <p className="text-gray-400">{isLogin ? 'Welcome back!' : 'Create your account'}</p>
          </div>

          {error && <p className="bg-red-500/20 text-red-400 text-center p-3 rounded-lg mb-6">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
             {!isLogin && (
              <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">Register as</label>
                 <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                 >
                    <option value={UserRole.MENTEE}>Mentee (Student)</option>
                    <option value={UserRole.MENTOR}>Mentor (Senior Student/Faculty)</option>
                 </select>
              </div>
            )}
            <button type="submit" disabled={isLoading} className="w-full bg-brand-accent hover:bg-brand-accent-dark text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Link to={isLogin ? '/register' : '/login'} className="font-medium text-brand-accent hover:underline">
                {isLogin ? 'Sign Up' : 'Log In'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
