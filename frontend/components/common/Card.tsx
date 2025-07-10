import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
    const cardClasses = `bg-surface border border-border rounded-xl overflow-hidden transition-all duration-300 group shadow-serene hover:shadow-serene-lg hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''} ${className}`;

    return (
        <div className={cardClasses} onClick={onClick}>
            {children}
        </div>
    );
};

export default Card;