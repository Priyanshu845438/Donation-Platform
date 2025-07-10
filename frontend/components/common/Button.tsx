
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-sm hover:shadow-md';

    const variantStyles = {
        primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
        secondary: 'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary',
        accent: 'bg-accent text-text-primary hover:bg-accent-dark focus:ring-accent',
        outline: 'border border-border text-text-primary bg-surface hover:bg-gray-100 hover:text-primary focus:ring-primary',
        ghost: 'text-primary hover:bg-primary/10 focus:ring-primary shadow-none',
    };

    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-8 py-3 text-lg',
    };

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

    return (
        <button className={combinedClassName} {...props}>
            {children}
        </button>
    );
};

export default Button;