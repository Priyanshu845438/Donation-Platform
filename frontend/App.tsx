
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';

// Layouts and Wrappers
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import AdminLayout from './components/admin/AdminLayout.tsx';
import NgoLayout from './components/ngo/NgoLayout.tsx';
import CompanyLayout from './components/company/CompanyLayout.tsx';
import DonorLayout from './components/donor/DonorLayout.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';
import AuthenticatedRoute from './components/auth/AuthenticatedRoute.tsx';
import AIChatbot from './components/AIChatbot.tsx';
import ToastContainer from './components/ToastContainer.tsx';
import DynamicThemeLoader from './components/DynamicThemeLoader.tsx';
import { FiHeart } from 'react-icons/fi';

// Public Pages (Lazy Loaded)
const HomePage = lazy(() => import('./pages/HomePage.tsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.tsx'));
const ExplorePage = lazy(() => import('./pages/ExplorePage.tsx'));
const CampaignDetailsPage = lazy(() => import('./pages/CampaignDetailsPage.tsx'));
const DonatePage = lazy(() => import('./pages/DonatePage.tsx'));
const JoinUsPage = lazy(() => import('./pages/JoinUsPage.tsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.tsx'));
const LegalPage = lazy(() => import('./pages/LegalPage.tsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.tsx'));
const SignupPage = lazy(() => import('./pages/SignupPage.tsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.tsx'));
const ShareProfilePage = lazy(() => import('./pages/ShareProfilePage.tsx'));
const ShareCampaignPage = lazy(() => import('./pages/ShareCampaignPage.tsx'));
const TaskManagerPage = lazy(() => import('./pages/TaskManagerPage.tsx'));

// Admin Pages (Lazy Loaded)
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage.tsx'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage.tsx'));
const UserProfilePage = lazy(() => import('./pages/admin/UserProfilePage.tsx'));
const CampaignManagementPage = lazy(() => import('./pages/admin/CampaignManagementPage.tsx'));
const CreateCampaignPage = lazy(() => import('./pages/admin/CreateCampaignPage.tsx'));
const EditCampaignPage = lazy(() => import('./pages/admin/EditCampaignPage.tsx'));
const AdminCampaignDetailsPage = lazy(() => import('./pages/admin/AdminCampaignDetailsPage.tsx'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage.tsx'));
const AppearancePage = lazy(() => import('./pages/admin/AppearancePage.tsx'));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage.tsx'));
const CustomizeSharePage = lazy(() => import('./pages/admin/CustomizeSharePage.tsx'));
const NoticeManagementPage = lazy(() => import('./pages/admin/NoticeManagementPage.tsx'));
const CreateNoticePage = lazy(() => import('./pages/admin/CreateNoticePage.tsx'));
const EditNoticePage = lazy(() => import('./pages/admin/EditNoticePage.tsx'));
const TaskCalendarPage = lazy(() => import('./pages/admin/TaskCalendarPage.tsx'));
const DonationManagementPage = lazy(() => import('./pages/admin/DonationManagementPage.tsx'));

// NGO Pages (Lazy Loaded)
const NgoDashboardPage = lazy(() => import('./pages/ngo/DashboardPage.tsx'));
const NgoCampaignManagementPage = lazy(() => import('./pages/ngo/CampaignManagementPage.tsx'));
const NgoCreateCampaignPage = lazy(() => import('./pages/ngo/CreateCampaignPage.tsx'));
const NgoEditCampaignPage = lazy(() => import('./pages/ngo/EditCampaignPage.tsx'));
const CompanyListPage = lazy(() => import('./pages/ngo/CompanyListPage.tsx'));
const UserListPage = lazy(() => import('./pages/ngo/UserListPage.tsx'));
const NgoReportsPage = lazy(() => import('./pages/ngo/ReportsPage.tsx'));
const NgoProfilePage = lazy(() => import('./pages/ngo/ProfilePage.tsx'));
const NgoSettingsPage = lazy(() => import('./pages/ngo/SettingsPage.tsx'));
const NgoVolunteeringPage = lazy(() => import('./pages/ngo/VolunteeringPage.tsx'));

// Company Pages (Lazy Loaded)
const CompanyDashboardPage = lazy(() => import('./pages/company/DashboardPage.tsx'));
const CompanyCampaignListPage = lazy(() => import('./pages/company/CampaignListPage.tsx'));
const CompanyNgoListPage = lazy(() => import('./pages/company/NgoListPage.tsx'));
const CompanyReportsPage = lazy(() => import('./pages/company/ReportsPage.tsx'));
const CompanyProfilePage = lazy(() => import('./pages/company/ProfilePage.tsx'));
const CompanySettingsPage = lazy(() => import('./pages/company/SettingsPage.tsx'));

// Donor Pages (Lazy Loaded)
const DonorDashboardPage = lazy(() => import('./pages/donor/DashboardPage.tsx'));
const DonorCampaignListPage = lazy(() => import('./pages/donor/CampaignListPage.tsx'));
const DonorNgoListPage = lazy(() => import('./pages/donor/NgoListPage.tsx'));
const DonorReportsPage = lazy(() => import('./pages/donor/ReportsPage.tsx'));
const DonorProfilePage = lazy(() => import('./pages/donor/ProfilePage.tsx'));
const DonorSettingsPage = lazy(() => import('./pages/donor/SettingsPage.tsx'));


const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PageLoader = () => (
    <div className="flex justify-center items-center h-full w-full min-h-[calc(100vh-20rem)] bg-brand-light dark:bg-brand-dark">
        <div className="relative flex justify-center items-center">
            <FiHeart className="animate-ping absolute h-12 w-12 text-brand-gold opacity-75" />
            <FiHeart className="relative h-12 w-12 text-brand-gold" />
        </div>
    </div>
);


const MainLayout = () => (
  <div className="flex flex-col min-h-screen bg-brand-light dark:bg-brand-dark">
    <Header />
    <main className="flex-grow">
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
    <AIChatbot />
  </div>
);

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <DynamicThemeLoader />
            <ScrollToTop />
            <ToastContainer />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Public-facing routes */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/explore" element={<ExplorePage />} />
                        <Route path="/campaign/:campaignId" element={<CampaignDetailsPage />} />
                        <Route path="/donate" element={<DonatePage />} />
                        <Route path="/join-us" element={<JoinUsPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/legal" element={<LegalPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/profile/:username" element={<ProfilePage />} />
                    </Route>

                    {/* Admin routes */}
                    <Route 
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="dashboard" element={<AdminDashboardPage />} />
                        <Route path="users" element={<UserManagementPage />} />
                        <Route path="users/:userId" element={<UserProfilePage />} />
                        <Route path="users/:userId/customize" element={<CustomizeSharePage />} />
                        <Route path="campaigns" element={<CampaignManagementPage />} />
                        <Route path="campaigns/new" element={<CreateCampaignPage />} />
                        <Route path="campaigns/:campaignId" element={<AdminCampaignDetailsPage />} />
                        <Route path="campaigns/:campaignId/edit" element={<EditCampaignPage />} />
                        <Route path="donations" element={<DonationManagementPage />} />
                        <Route path="notices" element={<NoticeManagementPage />} />
                        <Route path="notices/new" element={<CreateNoticePage />} />
                        <Route path="notices/:noticeId/edit" element={<EditNoticePage />} />
                        <Route path="tasks" element={<TaskManagerPage />} />
                        <Route path="tasks/calendar" element={<TaskCalendarPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="settings/appearance" element={<AppearancePage />} />
                    </Route>
                    
                    {/* NGO routes */}
                    <Route
                        path="/ngo"
                        element={
                            <ProtectedRoute allowedRoles={['ngo']}>
                                <NgoLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<NgoDashboardPage />} />
                        <Route path="dashboard" element={<NgoDashboardPage />} />
                        <Route path="campaigns" element={<NgoCampaignManagementPage />} />
                        <Route path="campaigns/new" element={<NgoCreateCampaignPage />} />
                        <Route path="campaigns/:campaignId/edit" element={<NgoEditCampaignPage />} />
                        <Route path="companies" element={<CompanyListPage />} />
                        <Route path="users" element={<UserListPage />} />
                        <Route path="reports" element={<NgoReportsPage />} />
                        <Route path="profile" element={<NgoProfilePage />} />
                        <Route path="settings" element={<NgoSettingsPage />} />
                        <Route path="volunteering" element={<NgoVolunteeringPage />} />
                    </Route>

                    {/* Company routes */}
                    <Route
                        path="/company"
                        element={
                            <ProtectedRoute allowedRoles={['company']}>
                                <CompanyLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<CompanyDashboardPage />} />
                        <Route path="dashboard" element={<CompanyDashboardPage />} />
                        <Route path="campaigns" element={<CompanyCampaignListPage />} />
                        <Route path="ngos" element={<CompanyNgoListPage />} />
                        <Route path="reports" element={<CompanyReportsPage />} />
                        <Route path="profile" element={<CompanyProfilePage />} />
                        <Route path="settings" element={<CompanySettingsPage />} />
                    </Route>

                    {/* Donor routes */}
                    <Route
                        path="/donor"
                        element={
                            <ProtectedRoute allowedRoles={['donor']}>
                                <DonorLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<DonorDashboardPage />} />
                        <Route path="dashboard" element={<DonorDashboardPage />} />
                        <Route path="campaigns" element={<DonorCampaignListPage />} />
                        <Route path="ngos" element={<DonorNgoListPage />} />
                        <Route path="reports" element={<DonorReportsPage />} />
                        <Route path="profile" element={<DonorProfilePage />} />
                        <Route path="settings" element={<DonorSettingsPage />} />
                    </Route>


                    {/* Standalone Shared Pages */}
                    <Route path="/share/profile/:shareId" element={<ShareProfilePage />} />
                    <Route path="/share/campaign/:shareId" element={<ShareCampaignPage />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default App;
