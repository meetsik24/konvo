import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store/store';
import { AppDispatch, RootState } from './store/store';
import { fetchUserProfile, logout } from './store/slices/authSlice';
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

// Custom Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, status } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Redirect to /login if no token or if profile fetch fails
  if (!token || status === 'failed') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// App Component with Initial Fetch Logic
function App() {
  const { token, status, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  // Fetch user profile on app mount if token exists and user is not loaded
  useEffect(() => {
    if (token && !user && status !== 'loading') {
      dispatch(fetchUserProfile(token)).catch((err) => {
        console.error('Failed to fetch user profile on app mount:', err);
        dispatch(logout());
      });
    }
  }, [token, dispatch, status, user]);

  // Determine the initial redirect based on authentication state
  const initialPath = !token || status === 'failed' ? '/login' : '/dashboard';

  return (
    <Provider store={store}>
      <WorkspaceProvider>
        <ContactsProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={<Navigate to={initialPath} replace />}
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes wrapped in Layout */}
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

              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ContactsProvider>
      </WorkspaceProvider>
    </Provider>
  );
}

export default App;