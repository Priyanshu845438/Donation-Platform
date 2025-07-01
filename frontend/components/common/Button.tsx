
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

    const variantStyles = {
        primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary-light shadow-lg shadow-primary/20 hover:shadow-primary/30',
        secondary: 'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary-light shadow-lg shadow-secondary/20 hover:shadow-secondary/30',
        outline: 'border border-primary text-primary-light hover:bg-primary/10 focus:ring-primary-light',
        ghost: 'text-primary-light hover:bg-primary/10 focus:ring-primary-light',
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
