import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import AnotherPage from './components/AnotherPage';

function App() {
  return (
    <Router>
      <Navigation /> {/* Use the Navigation component */}
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/another-page" element={<AnotherPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;