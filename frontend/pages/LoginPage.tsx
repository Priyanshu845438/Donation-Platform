
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SectionWrapper from '../components/SectionWrapper.tsx';
import Button from '../components/Button.tsx';
import { AuthContext } from '../context/AuthContext.tsx';
import { FiLogIn } from 'react-icons/fi';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // If user is already logged in, redirect them
    if (user) {
        const redirectPath = user.role === 'admin' ? '/admin' : from;
        navigate(redirectPath, {replace: true});
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser) {
          // Redirect to intended page or dashboard based on role
          const redirectPath = loggedInUser.role === 'admin' ? '/admin' : from;
          navigate(redirectPath, { replace: true });
      } else {
        // The login function in AuthContext now throws specific errors
        setError('Invalid email or password.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-warm-gray dark:bg-brand-dark-200 font-sans min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SectionWrapper className="max-w-md w-full">
        <div className="bg-white dark:bg-brand-dark p-8 rounded-xl shadow-2xl space-y-8 backdrop-blur-lg bg-opacity-80 dark:bg-opacity-80 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <FiLogIn className="mx-auto h-12 w-12 text-brand-gold" />
            <h2 className="mt-6 text-3xl font-extrabold text-navy-blue dark:text-white font-serif">
              Login to Your Account
            </h2>
            <p className="mt-2 text-sm text-warm-gray-600 dark:text-gray-400">
              Welcome back! Please enter your details.
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-transparent placeholder-gray-500 dark:placeholder-gray-400 text-warm-gray-900 dark:text-white focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                   value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-transparent placeholder-gray-500 dark:placeholder-gray-400 text-warm-gray-900 dark:text-white focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <a href="#" className="font-medium text-brand-gold hover:text-brand-deep-blue dark:hover:text-brand-gold/80">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
          <p className="text-center text-sm text-warm-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-brand-gold hover:text-brand-deep-blue dark:hover:text-brand-gold/80">
              Sign up
            </Link>
          </p>
        </div>
      </SectionWrapper>
    </div>
  );
};

export default LoginPage;