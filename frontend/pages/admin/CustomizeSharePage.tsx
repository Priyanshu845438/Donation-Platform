import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api.ts';
import type { User } from '../../types.ts';
import Button from '../../components/Button.tsx';
import { FiArrowLeft, FiSave, FiCode, FiEye, FiLoader, FiAlertCircle, FiInfo } from 'react-icons/fi';

const PLACEHOLDERS = [
  { variable: '{{USER_NAME}}', description: "The organization's name." },
  { variable: '{{USER_EMAIL}}', description: "The organization's email." },
  { variable: '{{USER_AVATAR}}', description: 'URL of the avatar/logo.' },
  { variable: '{{PROFILE_DESCRIPTION}}', description: "The organization's description." },
  { variable: '{{PROFILE_WEBSITE}}', description: 'The website URL.' },
  { variable: '{{PROFILE_ADDRESS}}', description: 'The registered address.' },
  { variable: '{{PROFILE_REG_NUMBER}}', description: 'Registration number.' },
  { variable: '{{CAMPAIGNS_HTML}}', description: 'A pre-rendered list of active campaigns.' },
];

const DEFAULT_TEMPLATE = {
    html: `<!-- 
  Welcome to the custom page editor!
  You can use standard HTML and CSS to design this page.
  Use the placeholders below to insert dynamic data.
  They will be replaced with real data on the public page.
-->
<div class="container">
  <header>
    <img src="{{USER_AVATAR}}" alt="Logo" class="logo">
    <h1>{{USER_NAME}}</h1>
  </header>
  <main>
    <h2>About Us</h2>
    <p>{{PROFILE_DESCRIPTION}}</p>
    <a href="{{PROFILE_WEBSITE}}" class="website-link" target="_blank" rel="noopener noreferrer">Visit our Website</a>
    <div class="campaigns-section">
      <h2>Our Campaigns</h2>
      <div id="campaigns-list">
        {{CAMPAIGNS_HTML}}
      </div>
    </div>
  </main>
  <footer>
    <p>Powered by DonationHub</p>
  </footer>
</div>`,
    css: `/* Welcome to the CSS editor! Style your page here. */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f0f2f5;
  color: #333;
  margin: 0;
  line-height: 1.6;
}
.container {
  max-width: 900px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
header {
  background-color: #003f5c;
  color: white;
  padding: 40px 20px;
  text-align: center;
  border-bottom: 5px solid #ffa600;
}
.logo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
  margin-bottom: 20px;
  object-fit: cover;
  background-color: #fff;
}
header h1 {
  margin: 0;
  font-size: 2.5rem;
}
main {
  padding: 30px;
}
main h2 {
  color: #003f5c;
  border-bottom: 2px solid #ffa600;
  padding-bottom: 10px;
  margin-bottom: 20px;
  font-size: 1.8rem;
}
.website-link {
  display: inline-block;
  background-color: #ffa600;
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  margin: 20px 0;
  transition: background-color 0.3s;
}
.website-link:hover {
  background-color: #e69500;
}
.campaigns-section {
  margin-top: 40px;
}
footer {
  text-align: center;
  padding: 20px;
  background-color: #f0f2f5;
  color: #666;
  font-size: 0.9rem;
}
`
};

const CustomizeSharePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [shareId, setShareId] = useState<string>('');
    const [design, setDesign] = useState<{html: string; css: string; additionalData?: any}>({ html: '', css: '', additionalData: {} });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const initialize = useCallback(async () => {
        if (!userId) {
            setError('User ID is missing.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const userData = await adminAPI.getUserById(userId);
            if (!userData || !userData.user.profile?._id) throw new Error('Could not retrieve user profile.');
            setUser(userData.user);

            const profileId = userData.user.profile._id;
            const shareLinkResponse = userData.user.role === 'ngo'
                ? await adminAPI.generateNgoShareLink(profileId)
                : await adminAPI.generateCompanyShareLink(profileId);
            
            const generatedLink = shareLinkResponse.shareLink;
            const id = generatedLink.split('/').pop();
            if (!id) throw new Error('Could not parse Share ID from link.');
            setShareId(id);

            const fetchedDesign = await adminAPI.getShareablePageDesign(id);
            setDesign({
                html: fetchedDesign.html || DEFAULT_TEMPLATE.html,
                css: fetchedDesign.css || DEFAULT_TEMPLATE.css,
                additionalData: fetchedDesign.additionalData || {}
            });

        } catch (err: any) {
            setError(err.message || 'Failed to initialize editor.');
            setDesign({
                html: DEFAULT_TEMPLATE.html,
                css: DEFAULT_TEMPLATE.css,
                additionalData: {}
            });
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        initialize();
    }, [initialize]);

    const handleSave = async () => {
        if (!shareId) {
            setError('Share ID not found. Cannot save.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await adminAPI.updateShareablePageDesign(shareId, design);
        } catch (err: any) {
            setError(err.message || 'Failed to save design.');
        } finally {
            setSaving(false);
        }
    };
    
    const handlePreview = () => {
        const fullHtml = `
            <html>
                <head>
                    <title>Preview: ${user?.name || 'Profile'}</title>
                    <style>${design.css}</style>
                </head>
                <body>${design.html}</body>
            </html>
        `;
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-100 dark:bg-brand-dark">
        <header className="flex-shrink-0 bg-white dark:bg-brand-dark-200 p-3 shadow-md flex justify-between items-center z-10 border-b border-gray-200 dark:border-gray-700">
           <div className="flex items-center gap-4">
              <Link to={`/admin/users/${userId}`} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-gold font-semibold">
                  <FiArrowLeft /> Back
              </Link>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white truncate">
                  Customize for: <span className="text-brand-gold">{user?.name || '...'}</span>
              </h1>
           </div>
           <div className="flex items-center gap-3">
              {error && <div className="text-sm text-red-500 flex items-center gap-2"><FiAlertCircle />{error}</div>}
              <Button onClick={handlePreview} variant="outline" disabled={loading}>
                  <FiEye className="mr-2"/> Preview
              </Button>
              <Button onClick={handleSave} disabled={saving || loading}>
                  {saving ? <><FiLoader className="animate-spin mr-2"/>Saving...</> : <><FiSave className="mr-2"/>Save Design</>}
              </Button>
           </div>
        </header>

        {loading ? (
           <div className="flex-grow flex items-center justify-center">
              <FiLoader className="animate-spin h-10 w-10 text-brand-gold"/>
           </div>
        ) : (
          <div className="flex-grow flex flex-col p-4 gap-4 overflow-y-auto">
            <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2"><FiInfo/>How to Customize</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                Use the editors below to create a custom public page. You can use dynamic placeholders in your HTML to pull in data.
              </p>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                {PLACEHOLDERS.map(p => (
                  <div key={p.variable} title={p.description}>
                    <code className="font-bold text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/80 px-2 py-1 rounded">{p.variable}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4">
               <div className="flex flex-col bg-white dark:bg-brand-dark-200 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                  <h2 className="p-3 text-sm font-semibold bg-gray-50 dark:bg-brand-dark border-b border-gray-200 dark:border-gray-700 flex items-center gap-2"><FiCode/>HTML Editor</h2>
                  <textarea
                      value={design.html}
                      onChange={(e) => setDesign(d => ({...d, html: e.target.value}))}
                      className="flex-grow w-full p-4 font-mono text-sm bg-white dark:bg-brand-dark-200 text-gray-800 dark:text-gray-200 resize-none outline-none"
                      placeholder="Enter your HTML here..."
                  />
               </div>
               <div className="flex flex-col bg-white dark:bg-brand-dark-200 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                  <h2 className="p-3 text-sm font-semibold bg-gray-50 dark:bg-brand-dark border-b border-gray-200 dark:border-gray-700 flex items-center gap-2"><FiCode/>CSS Editor</h2>
                   <textarea
                      value={design.css}
                      onChange={(e) => setDesign(d => ({...d, css: e.target.value}))}
                      className="flex-grow w-full p-4 font-mono text-sm bg-white dark:bg-brand-dark-200 text-gray-800 dark:text-gray-200 resize-none outline-none"
                      placeholder="Enter your CSS here..."
                  />
               </div>
            </div>
          </div>
        )}
      </div>
    );
};

export default CustomizeSharePage;
