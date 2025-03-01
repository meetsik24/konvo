import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import NotFound from './pages/NotFound';
import SendSMS from './pages/SendSMS';
import SendEmail from './pages/SendEmail';
import Voice from './pages/Voice';
import Chatbot from './pages/Chatbot';
import ApiKeys from './pages/apikeys';
import Logs from './pages/Logs';
import Verify from './pages/Verify';
import Subscription from './pages/subscription';
import SenderID from './pages/SenderID';
import Contacts from './pages/Contacts';
import { ContactsProvider } from './components/ContactsContext'; // Updated import path

function App() {
  return (
    <Provider store={store}>
      <ContactsProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            <Route element={<Layout />}>
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/send-sms" element={<SendSMS />} />
                <Route path="/send-email" element={<SendEmail />} />
                <Route path="/voice" element={<Voice />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/account" element={<Account />} />
                <Route path="/apikeys" element={<ApiKeys />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/senderid" element={<SenderID />} />
                <Route path="/contacts" element={<Contacts />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ContactsProvider>
    </Provider>
  );
}

export default App;