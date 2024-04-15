import React from 'react';
import axios from 'axios';

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      // Call to backend to destroy the session
      //await axios.get('http://localhost:3000/api/logout');
      // Clear any stored authentication data
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      // Redirect or force a reload of the frontend application
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
};

export default LogoutButton;