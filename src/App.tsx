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

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;