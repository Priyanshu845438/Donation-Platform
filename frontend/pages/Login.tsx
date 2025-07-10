
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiFetch } from '../utils/api';
import { User } from '../types';
import Button from '../components/common/Button';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // The /auth/login endpoint returns both the token and the complete user object.
            // A single API call is now sufficient and more robust.
            const loginResponse = await apiFetch<{ token: string; user: User }>('/auth/login', {
                method: 'POST',
                body: { email, password },
            });

            // Ensure we have a valid token and a user object with a role.
            if (!loginResponse.token || !loginResponse.user || !loginResponse.user.role) {
                throw new Error("Login failed: Incomplete user data received from server.");
            }

            // The login function from AuthContext handles setting the token and user in state and localStorage.
            login(loginResponse.token, loginResponse.user);

            addToast('Login successful! Welcome back.', 'success');

            // Navigate to the correct dashboard based on the user's role.
            navigate(`/dashboard/${loginResponse.user.role}`);

        } catch (error: any) {
            addToast(error.message || 'Login failed. Please check your credentials.', 'error');
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
                        Welcome Back
                    </h2>
                    <p className="text-sm text-text-secondary">
                        Sign in to continue your journey of giving.
                    </p>
                </div>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email address</label>
                        <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyles} />
                    </div>

                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                        <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyles} />
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
                        <Button type="submit" className="w-full mt-2" size="lg" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </div>
                </form>

                <p className="mt-8 text-center text-sm text-text-secondary">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-medium text-primary hover:text-primary-dark transition-colors">
                        Sign up for free
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
