import React from 'react';

interface CardProps {
  title?: string;
  headerAction?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, headerAction, className = '', children, footer }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>
      {(title || headerAction) && (
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-xl font-bold">{title}</h2>}
          {headerAction}
        </div>
      )}
      {children}
      {footer && (
        <div className="pt-4">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;