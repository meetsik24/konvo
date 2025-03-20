import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store/store';
import { AppDispatch, RootState } from './store/store';
import { fetchUserProfile, logout } from './store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

// Landing Page Components
import Navbar from './landing/components/Navbar';
import Footer from './landing/components/Footer';
import Home from './landing/pages/Home';
import Contact from './landing/pages/Contact';


// Dashboard Components
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import NotFound from './pages/NotFound';
import SendSMS from './pages/SendSMS';
import SendEmail from './pages/SendEmail';
import Voice from './pages/Voice';
import Chatbot from './pages/Chatbot';
import SMSCampaigns from './pages/campaigns';
import Logs from './pages/Logs';
import Subscription from './pages/subscription';
import SenderID from './pages/SenderID';
import Contacts from './pages/Contacts';

import { ContactsProvider } from './components/ContactsContext';
import { WorkspaceProvider } from './pages/WorkspaceContext';

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

  // Initial redirect path (removed unused variable)

  return (
    <Provider store={store}>
      <WorkspaceProvider>
        <ContactsProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Landing Page Routes */}
                  <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
                  <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />

                  {/* Authentication Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

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
                  </Route>

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