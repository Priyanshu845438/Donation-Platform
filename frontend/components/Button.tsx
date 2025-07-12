
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ButtonProps {
  to?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  className?: string;
  type?: 'submit' | 'reset' | 'button';
  disabled?: boolean;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({ to, onClick, children, variant = 'primary', fullWidth = false, className = '', type = 'button', disabled = false, title }) => {
  const baseClasses = "inline-flex items-center justify-center px-6 py-3 border text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-brand-dark transition-all duration-200";
  
  const variantClasses = {
    primary: 'border-transparent text-white bg-brand-gold hover:bg-brand-gold/90 focus:ring-brand-gold disabled:bg-gray-400',
    secondary: 'border-transparent text-white bg-brand-deep-blue hover:bg-brand-deep-blue/90 focus:ring-brand-deep-blue disabled:bg-gray-400',
    outline: 'border-brand-gold text-brand-gold bg-transparent hover:bg-brand-gold/10 focus:ring-brand-gold disabled:border-gray-400 disabled:text-gray-400',
    ghost: 'border-transparent text-gray-700 dark:text-gray-200 bg-transparent hover:bg-gray-500/10 focus:ring-brand-gold disabled:text-gray-400',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const finalClassName = `${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`;

  const MotionButton = motion.button;
  const MotionLink = motion(Link);

  const animationProps = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  };

  if (to && !disabled) {
    return (
      <MotionLink to={to} className={finalClassName} {...animationProps} title={title}>
        {children}
      </MotionLink>
    );
  }

  return (
    <MotionButton onClick={onClick} className={finalClassName} type={type} disabled={disabled} {...animationProps} title={title}>
      {children}
    </MotionButton>
  );
};

export default Button;
