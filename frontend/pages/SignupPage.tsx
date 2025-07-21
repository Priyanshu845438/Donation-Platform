



import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SectionWrapper from '../components/SectionWrapper.tsx';
import Button from '../components/Button.tsx';
import { AuthContext } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { FiUserPlus } from 'react-icons/fi';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'donor' | 'ngo' | 'company'>('donor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signup } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    if (password.length < 6) {
        const msg = "Password must be at least 6 characters long.";
        setError(msg);
        addToast(msg, 'error');
        setLoading(false);
        return;
    }
    
    try {
      const userData = { fullName: name, email, password, phoneNumber, role };
      const newUser = await signup(userData);
      if (newUser) {
        addToast('Registration successful!', 'success');
        setSuccess(true);
      } else {
         addToast('An unexpected error occurred. The user might already exist.', 'error');
      }
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred. Please try again.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
      return (
           <div className="bg-warm-gray dark:bg-brand-dark font-sans min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
               <SectionWrapper className="max-w-md w-full text-center">
                   <div className="bg-white dark:bg-brand-dark-200 p-8 rounded-xl shadow-2xl space-y-6">
                        <FiUserPlus className="mx-auto h-12 w-12 text-green-500" />
                        <h2 className="text-3xl font-extrabold text-navy-blue dark:text-white font-serif">
                          Registration Successful!
                        </h2>
                        <p className="text-warm-gray-600 dark:text-gray-300">
                          Thank you for registering. Your account is now pending approval from our administration team. You will be notified via email once your account is activated.
                        </p>
                        <Button onClick={() => navigate('/login')}>Back to Login</Button>
                   </div>
               </SectionWrapper>
           </div>
      );
  }

  return (
    <div className="bg-warm-gray dark:bg-brand-dark-200 font-sans min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SectionWrapper className="max-w-md w-full">
        <div className="bg-white dark:bg-brand-dark-200 p-8 rounded-xl shadow-2xl space-y-8 backdrop-blur-lg bg-opacity-80 dark:bg-opacity-80 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <FiUserPlus className="mx-auto h-12 w-12 text-brand-gold" />
            <h2 className="mt-6 text-3xl font-extrabold text-navy-blue dark:text-white font-serif">
              Create an Account
            </h2>
            <p className="mt-2 text-sm text-warm-gray-600 dark:text-gray-400">
              Join our community of changemakers.
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
            
            <div className="space-y-4">
               <input id="name" name="name" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name or Organization Name" className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-transparent rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"/>
               <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-transparent rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"/>
               <input id="phone" name="phone" type="tel" required value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Phone Number" className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-transparent rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"/>
               <input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-transparent rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold"/>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-warm-gray-700 dark:text-gray-300">I am a...</label>
              <select id="role" name="role" value={role} onChange={(e) => setRole(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-3 border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-dark-200 text-warm-gray-900 dark:text-white focus:outline-none focus:ring-brand-gold focus:border-brand-gold rounded-md">
                <option value="donor">Donor</option>
                <option value="ngo">NGO</option>
                <option value="company">Company</option>
              </select>
            </div>
            
            <p className="text-xs text-warm-gray-600 dark:text-gray-400">For NGOs and Companies, you will be required to upload verification documents after signup.</p>

            <div>
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </div>
          </form>
          <p className="text-center text-sm text-warm-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-gold hover:text-brand-deep-blue dark:hover:text-brand-gold/80">
              Login
            </Link>
          </p>
        </div>
      </SectionWrapper>
    </div>
  );
};

export default SignupPage;