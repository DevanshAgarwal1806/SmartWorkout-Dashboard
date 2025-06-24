import React from 'react';
import Navbar from './Navbar';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout-container">
      {/* Navigation */}
      <Navbar />
      
      {/* Main content */}
      <main className="layout-main">
        <div className="layout-content">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="layout-footer">
        <div className="layout-footer-content">
          <div className="layout-footer-text">
            <p>&copy; 2024 FitTrack. Built with ❤️ for your fitness journey.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;