import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Dumbbell, 
  BarChart3, 
  Brain, 
  User,
  Menu,
  X,
  Calculator,
  Flag,
  Utensils
} from 'lucide-react';
import type { NavItem } from '../../types';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Workouts', href: '/workouts', icon: Dumbbell },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'AI Coach', href: '/ai', icon: Brain },
    { name: 'Body Metrics', href: '/weight-calories', icon: Calculator },
    { name: 'Personalized Workout', href: '/personalized-workout', icon: Dumbbell },
    { name: 'Diet Plan', href: '/diet-plan', icon: Utensils },
    { name: 'Set Goals', href: '/goals', icon: Flag },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="navbar navbar-fullwidth">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo and brand */}
          <div className="navbar-brand">
            <div className="navbar-logo">
              <Dumbbell className="navbar-logo-icon" style={{ marginRight: '0.3rem' }} />
              <span className="navbar-logo-text" style={{ marginLeft: '0.2rem' }}>FitTrack</span>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="navbar-desktop">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              
              // Make Personalized Workout icon larger
              const iconClass = item.name === 'Personalized Workout' ? 'navbar-item-icon navbar-item-icon-large' : 'navbar-item-icon';
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`navbar-item ${isActive ? 'navbar-item-active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className={iconClass} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="navbar-mobile-toggle">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="navbar-toggle-button"
            >
              {isMobileMenuOpen ? (
                <X className="navbar-toggle-icon" />
              ) : (
                <Menu className="navbar-toggle-icon" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="navbar-mobile-menu">
            <div className="navbar-mobile-content">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;
                
                // Make Personalized Workout icon larger
                const iconClass = item.name === 'Personalized Workout' ? 'navbar-mobile-item-icon navbar-item-icon-large' : 'navbar-mobile-item-icon';
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`navbar-mobile-item ${isActive ? 'navbar-mobile-item-active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className={iconClass} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;