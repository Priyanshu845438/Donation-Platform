import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
        role: UserRole.DONOR,
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
            await apiFetch('/auth/signup', {
                method: 'POST',
                body: {
                    ...formData,
                    // Prevent admin signup from UI, default to DONOR if somehow selected
                    role: formData.role === UserRole.ADMIN ? UserRole.DONOR : formData.role
                },
            });
            addToast('Registration successful! Please log in.', 'success');
            navigate('/login');
        } catch (error: any) {
            addToast(error.message || 'Registration failed. Please try again.', 'error');
            setIsLoading(false);
        }
    };

    const inputStyles = "block py-2.5 px-0 w-full text-base text-copy bg-transparent border-0 border-b-2 border-border appearance-none focus:outline-none focus:ring-0 focus:border-primary-light peer";
    const labelStyles = "absolute text-base text-copy-muted duration-300 transform -translate-y-7 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary-light peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-7";

    return (
        <div className="min-h-screen bg-background text-copy flex items-center justify-center p-4 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-secondary via-background to-primary bg-[length:200%_200%] animate-gradient-bg"></div>
            <div className="absolute top-1/4 -right-24 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-float"></div>
            <div className="absolute -bottom-24 -left-12 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-float" style={{animationDelay: '3s'}}></div>

            {/* Form Card */}
            <div className="relative z-10 max-w-md w-full bg-surface/30 backdrop-blur-xl border border-border/20 rounded-2xl shadow-2xl p-8 sm:p-10 animate-fade-in-up">
                <div className="text-center mb-8">
                     <Link to="/" className="text-4xl font-bold text-primary-light transition hover:opacity-80 mb-2 inline-block">
                        CharityPlus
                    </Link>
                    <h2 className="text-3xl font-bold text-copy">
                        Join the Movement
                    </h2>
                    <p className="text-sm text-copy-muted">
                        Create an account to start your journey of giving.
                    </p>
                </div>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="relative z-0">
                        <input id="fullName" name="fullName" type="text" required value={formData.fullName} onChange={handleChange} className={inputStyles} placeholder=" " />
                        <label htmlFor="fullName" className={labelStyles}>Full Name</label>
                    </div>
                    <div className="relative z-0">
                        <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={inputStyles} placeholder=" " />
                        <label htmlFor="email" className={labelStyles}>Email Address</label>
                    </div>
                     <div className="relative z-0">
                        <input id="phoneNumber" name="phoneNumber" type="tel" required value={formData.phoneNumber} onChange={handleChange} className={inputStyles} placeholder=" " />
                        <label htmlFor="phoneNumber" className={labelStyles}>Phone Number</label>
                    </div>
                    <div className="relative z-0">
                        <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.password} onChange={handleChange} className={inputStyles} placeholder=" " />
                        <label htmlFor="password" className={labelStyles}>Password</label>
                         <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center px-2 text-copy-muted hover:text-primary-light transition-colors focus:outline-none"
                            aria-label="Toggle password visibility"
                        >
                            <ion-icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} className="text-2xl"></ion-icon>
                        </button>
                    </div>
                    
                    <div className="relative z-0 pt-2">
                         <select id="role" name="role" required value={formData.role} onChange={handleChange} className={`${inputStyles} cursor-pointer`}>
                            <option className="bg-surface text-copy" value={UserRole.DONOR}>I am a Donor</option>
                            <option className="bg-surface text-copy" value={UserRole.NGO}>I represent an NGO</option>
                            <option className="bg-surface text-copy" value={UserRole.COMPANY}>I represent a Company</option>
                        </select>
                        <label htmlFor="role" className={labelStyles}>I want to register as</label>
                    </div>
                
                    <div>
                        <Button type="submit" className="w-full mt-4" size="lg" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Free Account'}
                        </Button>
                    </div>
                </form>

                 <p className="mt-8 text-center text-sm text-copy-muted">
                    Already a member?{' '}
                    <Link to="/login" className="font-medium text-primary-light hover:text-primary transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
