import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiFetch } from '../utils/api';
import { User, UserRole } from '../types';
import Button from '../components/common/Button';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.DONOR);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await apiFetch<{ token: string, user: User }>('/auth/login', {
                method: 'POST',
                body: { email, password, role },
            });
            login(response.token, response.user);
            addToast('Login successful! Welcome back.', 'success');
            navigate(`/dashboard`);
        } catch (error: any) {
            addToast(error.message || 'Login failed. Please check your credentials.', 'error');
            setIsLoading(false);
        }
    };

    const inputStyles = "block py-2.5 px-0 w-full text-base text-copy bg-transparent border-0 border-b-2 border-border appearance-none focus:outline-none focus:ring-0 focus:border-primary-light peer";
    const labelStyles = "absolute text-base text-copy-muted duration-300 transform -translate-y-7 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary-light peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-7";

    return (
        <div className="min-h-screen bg-background text-copy flex items-center justify-center p-4 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary via-background to-secondary bg-[length:200%_200%] animate-gradient-bg"></div>
            <div className="absolute top-1/4 -left-24 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-float"></div>
            <div className="absolute -bottom-24 -right-12 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-float" style={{animationDelay: '3s'}}></div>

            {/* Form Card */}
            <div className="relative z-10 max-w-md w-full bg-surface/30 backdrop-blur-xl border border-border/20 rounded-2xl shadow-2xl p-8 sm:p-10 animate-fade-in-up">
                <div className="text-center mb-8">
                    <Link to="/" className="text-4xl font-bold text-primary-light transition hover:opacity-80 mb-2 inline-block">
                        CharityPlus
                    </Link>
                    <h2 className="text-3xl font-bold text-copy">
                        Welcome Back
                    </h2>
                    <p className="text-sm text-copy-muted">
                        Sign in to continue your journey of giving.
                    </p>
                </div>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="relative z-0">
                        <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyles} placeholder=" " />
                        <label htmlFor="email" className={labelStyles}>Email address</label>
                    </div>

                    <div className="relative z-0">
                        <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyles} placeholder=" " />
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
                        <select id="role" name="role" required value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={`${inputStyles} cursor-pointer`}>
                            {Object.values(UserRole).map(r => <option key={r} value={r} className="bg-surface text-copy">{r}</option>)}
                        </select>
                        <label htmlFor="role" className={labelStyles}>Sign in as</label>
                    </div>

                    <div>
                        <Button type="submit" className="w-full mt-4" size="lg" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </div>
                </form>

                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-border/50"></div>
                    <span className="flex-shrink mx-4 text-copy-muted text-sm">Or continue with</span>
                    <div className="flex-grow border-t border-border/50"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="bg-white/5 border-white/20 hover:bg-white/10 backdrop-blur-sm">
                        <ion-icon name="logo-google" className="mr-2 text-xl"></ion-icon>
                        Google
                    </Button>
                     <Button variant="outline" className="bg-white/5 border-white/20 hover:bg-white/10 backdrop-blur-sm">
                        <ion-icon name="logo-facebook" className="mr-2 text-xl"></ion-icon>
                        Facebook
                    </Button>
                </div>
                
                <p className="mt-8 text-center text-sm text-copy-muted">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-medium text-primary-light hover:text-primary transition-colors">
                        Sign up for free
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;