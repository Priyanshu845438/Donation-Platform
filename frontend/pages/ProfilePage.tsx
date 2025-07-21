



import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SectionWrapper from '../components/SectionWrapper.tsx';
import Button from '../components/Button.tsx';
import { getProfileByUsername } from '../services/api.ts';
import type { User, Campaign } from '../types.ts';
import { AuthContext } from '../context/AuthContext.tsx';
import { FiMail, FiGlobe, FiMapPin, FiEdit, FiFileText, FiDownload } from 'react-icons/fi';
import CampaignCard from '../components/CampaignCard.tsx';

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: loggedInUser } = useContext(AuthContext);

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) return;
    const fetchProfile = async () => {
      try {
        const { user, campaigns } = await getProfileByUsername(username);
        setProfileUser(user);
        setUserCampaigns(campaigns);
      } catch (err: any) {
        setError(err.message || 'Could not find user profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return <div className="text-center py-20">Loading profile...</div>;
  }

  if (error || !profileUser) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-navy-blue dark:text-white">{error || 'User not found'}</h2>
        <p className="mt-4 text-warm-gray-600 dark:text-gray-400">The profile you are looking for does not exist.</p>
        <div className="mt-6">
          <Button to="/">Back to Home</Button>
        </div>
      </div>
    );
  }
  
  const isOwner = loggedInUser?._id === profileUser._id;

  return (
    <div className="bg-warm-gray dark:bg-brand-dark-200 font-sans">
      <div className="bg-white dark:bg-brand-dark shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-12 flex flex-col md:flex-row items-center gap-8">
                <img className="h-32 w-32 rounded-full object-cover ring-4 ring-brand-gold shadow-lg" src={profileUser.avatar} alt={profileUser.name} />
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold font-serif text-navy-blue dark:text-white">{profileUser.name}</h1>
                    <p className="text-xl text-warm-gray-600 dark:text-gray-300 capitalize">{profileUser.role}</p>
                    <div className="mt-4 flex items-center justify-center md:justify-start space-x-4 text-warm-gray-600 dark:text-gray-400">
                        {profileUser.profile?.address && <span className="flex items-center"><FiMapPin className="mr-2"/>{profileUser.profile.address}</span>}
                        <a href={`mailto:${profileUser.email}`} className="flex items-center hover:text-brand-gold"><FiMail className="mr-2"/>Email</a>
                        {profileUser.profile?.website && <a href={profileUser.profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-brand-gold"><FiGlobe className="mr-2"/>Website</a>}
                    </div>
                </div>
                {isOwner && (
                    <div className="md:ml-auto">
                        <Button to={`/admin/users/${profileUser._id}`} variant="outline"><FiEdit className="mr-2"/>Edit Profile</Button>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionWrapper>
          <div className="bg-white dark:bg-brand-dark p-8 rounded-lg shadow-lg">
             <h2 className="text-2xl font-bold font-serif text-navy-blue dark:text-white mb-4">About</h2>
             <p className="text-lg text-warm-gray-700 dark:text-gray-300 leading-relaxed">
                {profileUser.profile?.description || 'This user has not yet provided a description.'}
             </p>
          </div>
        </SectionWrapper>
        
        {profileUser.role === 'company' && profileUser.profile?.documents && profileUser.profile.documents.length > 0 && (
          <SectionWrapper className="mt-16">
            <div className="bg-white dark:bg-brand-dark p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold font-serif text-navy-blue dark:text-white mb-4 flex items-center gap-3">
                <FiFileText/> Company Documents
              </h2>
              <ul className="space-y-2">
                {profileUser.profile.documents.map((doc, i) => (
                  <li key={i}>
                    <a href={doc} target="_blank" rel="noopener noreferrer" className="flex items-center text-brand-gold hover:underline">
                        <FiDownload className="mr-2"/>
                        {doc.split('/').pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </SectionWrapper>
        )}

        {profileUser.role === 'ngo' && userCampaigns.length > 0 && (
            <SectionWrapper className="mt-16">
                <h2 className="text-3xl font-bold font-serif text-navy-blue dark:text-white mb-8">Campaigns by {profileUser.name}</h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {userCampaigns.map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                </div>
            </SectionWrapper>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;