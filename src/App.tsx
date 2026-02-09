import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store/store';
import { AppDispatch, RootState } from './store/store';
import { fetchUserProfile, logout } from './store/slices/authSlice';
import { AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Landing Page Components
import Home from './landing/pages/Home';
import Features from './landing/pages/Features';
import Pricing from './landing/pages/Pricing';
import Navbar from './landing/components/Navbar';
import { Footer } from './landing/components/Footer';
import BlogSection from './landing/pages/blog';

// Documentation Pages
// import DocumentationHome from './Karibu/pages/Home';
// import OtherEndpoints from './Karibu/pages/OtherEndpoints';
// import SendSMSAPI from './Karibu/pages/SendSMS';

// // Documentation Components
// import CodeEditor from './Karibu/components/CodeEditor';
// import JsonView from './Karibu/components/JsonView';
// import EndpointCard from './Karibu/components/EndpointCard';
// import DocumentationLayout from './Karibu/components/Layout';
// import DocumentationNavbar from './Karibu/components/Navbar';
// import DocSidebar from './Karibu/components/Sidebar';

// Dashboard Compone
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import LoginLegacy from './pages/LoginLegacy';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Account from './pages/Account';
import NotFound from './pages/NotFound';
import SendSMS from './pages/SendSMS'; // Renamed to avoid conflict
import SendEmail from './pages/SendEmail';
import Voice from './pages/Voice';
import Chatbot from './pages/Chatbot';
import SMSCampaigns from './pages/campaigns';
import Logs from './pages/Logs';
import Subscription from './pages/subscription';
import SenderID from './pages/SenderID';
import Contacts from './pages/Contacts';
import ApiKeys from './pages/apikeys';
import WhatsApp from './pages/WhatsApp';

// Admin Components
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSenderIds from './pages/admin/AdminSenderIds';
import AdminWorkspaces from './pages/admin/AdminWorkspaces';
import AdminFinancials from './pages/admin/AdminFinancials';
import AdminPackages from './pages/admin/AdminPackages';
import AdminServices from './pages/admin/AdminServices';
import AdminApiKeys from './pages/admin/AdminApiKeys';
import AdminMessages from './pages/admin/AdminMessages';
import AdminOTPs from './pages/admin/AdminOTPs';



// Terms of Service and Privacy Policy Pages
import TermsOfService from './landing/pages/Terms';
import PrivacyPolicy from './landing/pages/Privacy';

import { ContactsProvider } from './components/ContactsContext';
import { WorkspaceProvider } from './pages/WorkspaceContext';
import LearnWithBriq from './landing/pages/LearnwithBriq';

gsap.registerPlugin(ScrollTrigger);

// New Landing Component combining Home, Features, Pricing, Navbar, and Footer
const Landing = () => {
  useGSAP(() => {
    gsap.fromTo(
      '.fade-in',
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.fade-in',
          start: 'top 80%',
        },
      }
    );
  });

  return (
    <div className="bg-gray-50">
      <Navbar />
      <div id="home">
        <Home />
      </div>
      <div id="services">
        <Features />
      </div>
      <div id="learn">
        <LearnWithBriq />
      </div>
      <div id="pricing">
        <Pricing />
      </div>
      <div id="blog">
        <BlogSection />
      </div>
      <div id="footer">
        <Footer />
      </div>
    </div>
  );
};

// // New Documentation Component for API Documentation Pages
// const Documentation = () => {
//   const location = useLocation();
//   const showSidebar = !location.pathname.endsWith('/home'); // Hide sidebar on /documentation/home

//   return (
//     <DocumentationLayout>
//       <DocumentationNavbar />
//       <div className="flex min-h-[calc(100vh-80px)] transition-all duration-300">
//         {showSidebar && <DocSidebar />}
//         <div className={`flex - 1 ${ showSidebar ? 'p-4 sm:p-6' : '' } `}>
//           <Routes>
//             <Route path="/" element={<Navigate to="https://docs.briq.tz/" replace />} />
//           </Routes>
//         </div>
//       </div>
//     </DocumentationLayout>
//   );
// };

// Protected Route for Dashboard Pages
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, status } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!token || status === 'failed') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Main App Component
function App() {
  const { token, status, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  // Fetch user profile if authenticated
  useEffect(() => {
    if (token && !user && status !== 'loading') {
      dispatch(fetchUserProfile(token)).catch((err) => {
        console.error('Failed to fetch user profile:', err);
        dispatch(logout());
      });
    }
  }, [token, dispatch, status, user]);

  return (
    <Provider store={store}>
      <WorkspaceProvider>
        <ContactsProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Landing Page Route */}
                  <Route path="/" element={<Landing />} />

                  {/* Documentation Routes */}
                  {/* <Route path="/documentation/*" element={<Documentation />} /> */}

                  {/* Terms of Service and Privacy Policy Routes */}
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />

                  {/* Authentication Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/loginLegacy" element={<LoginLegacy />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/ResetPassword" element={<ResetPassword />} />

                  {/* Dashboard Protected Routes */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/send-sms" element={<SendSMS />} />
                    <Route path="/campaigns" element={<SMSCampaigns />} />
                    <Route path="/send-email" element={<SendEmail />} />
                    <Route path="/voice" element={<Voice />} />
                    <Route path="/chatbot" element={<Chatbot />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/logs" element={<Logs />} />
                    <Route path="/subscription" element={<Subscription />} />
                    <Route path="/senderid" element={<SenderID />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/apikeys" element={<ApiKeys />} />
                    <Route path="/whatsapp" element={<WhatsApp />} />
                  </Route>

                  {/* Admin Protected Routes */}
                  <Route
                    element={
                      <AdminProtectedRoute>
                        <AdminLayout />
                      </AdminProtectedRoute>
                    }
                  >
                    <Route path="/orange/dashboard" element={<AdminDashboard />} />
                    <Route path="/orange/users" element={<AdminUsers />} />
                    <Route path="/orange/sender-ids" element={<AdminSenderIds />} />
                    <Route path="/orange/workspaces" element={<AdminWorkspaces />} />
                    <Route path="/orange/financials" element={<AdminFinancials />} />
                    <Route path="/orange/packages" element={<AdminPackages />} />
                    <Route path="/orange/services" element={<AdminServices />} />
                    <Route path="/orange/api-keys" element={<AdminApiKeys />} />
                    <Route path="/orange/messages" element={<AdminMessages />} />
                    <Route path="/orange/otps" element={<AdminOTPs />} />
                    {/* Fallback for admin if route doesn't exist */}
                    <Route path="/orange/*" element={<Navigate to="/orange/dashboard" replace />} />
                  </Route>
                  <Route path="/admin/*" element={<Navigate to="/orange/dashboard" replace />} />

                  {/* Catch-All 404 Page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </div>
          </Router>
        </ContactsProvider>
      </WorkspaceProvider>
    </Provider>
  );
}

export default App;