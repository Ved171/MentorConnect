import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-brand-secondary-dark p-6 rounded-lg border border-gray-700 hover:border-brand-accent transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
