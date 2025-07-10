
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useToast } from '../components/ui/Toast';
import { apiFetch } from '../utils/api';
import { UserRole } from '../types';
import Button from '../components/common/Button';

const Signup: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: UserRole.USER,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await apiFetch('/auth/register', {
                method: 'POST',
                body: formData,
            });
            addToast('Registration successful! Please log in.', 'success');
            navigate('/login');
        } catch (error: any) {
            addToast(error.message || 'Registration failed. Please try again.', 'error');
            setIsLoading(false);
        }
    };
    
    const inputStyles = "block w-full px-4 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

    return (
        <div className="min-h-screen bg-gray-50 text-text-primary flex items-center justify-center p-4">
             <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-lg p-8 sm:p-10 animate-fade-in">
                <div className="text-center mb-8">
                     <Link to="/" className="text-3xl font-bold font-display text-primary transition hover:opacity-80 mb-2 inline-block">
                        CharityPlus
                    </Link>
                    <h2 className="text-2xl font-bold font-display text-text-primary">
                        Join the Movement
                    </h2>
                    <p className="text-sm text-text-secondary">
                        Create an account to start your journey of giving.
                    </p>
                </div>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                        <input id="fullName" name="fullName" type="text" required value={formData.fullName} onChange={handleChange} className={inputStyles} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                        <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={inputStyles} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Phone Number</label>
                        <input id="phoneNumber" name="phoneNumber" type="tel" required value={formData.phoneNumber} onChange={handleChange} className={inputStyles} />
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                        <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.password} onChange={handleChange} className={inputStyles} />
                         <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 top-6 flex items-center px-3 text-text-secondary hover:text-primary transition-colors focus:outline-none"
                            aria-label="Toggle password visibility"
                        >
                            <ion-icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} className="text-xl"></ion-icon>
                        </button>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">I want to register as</label>
                         <select id="role" name="role" required value={formData.role} onChange={handleChange} className={`${inputStyles} cursor-pointer`}>
                            <option value={UserRole.USER}>I am a Donor</option>
                            <option value={UserRole.NGO}>I represent an NGO</option>
                            <option value={UserRole.COMPANY}>I represent a Company</option>
                        </select>
                    </div>
                
                    <div>
                        <Button type="submit" className="w-full mt-2" size="lg" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Free Account'}
                        </Button>
                    </div>
                </form>

                 <p className="mt-8 text-center text-sm text-text-secondary">
                    Already a member?{' '}
                    <Link to="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
