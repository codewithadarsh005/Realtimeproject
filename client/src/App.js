import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Home from './pages/Home';
import UrlScanner from './pages/UrlScanner';
import MessageChecker from './pages/MessageChecker';
import ThreatDashboard from './pages/ThreatDashboard';
import About from './pages/About';
import './styles/layout.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app-layout">
        <Sidebar />
        <div className="app-body">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/scan-url" element={<UrlScanner />} />
              <Route path="/check-message" element={<MessageChecker />} />
              <Route path="/dashboard" element={<ThreatDashboard />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
