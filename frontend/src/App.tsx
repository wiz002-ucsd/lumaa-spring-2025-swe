import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Tasks from './components/Tasks';

const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/tasks" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/tasks" />} />
        <Route path="/tasks" element={isAuthenticated ? <Tasks /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/tasks" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App;
