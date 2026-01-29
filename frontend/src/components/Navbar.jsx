import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiTarget, FiMessageSquare, FiTrendingUp, FiUser, FiLogOut, FiBriefcase, FiSettings, FiShield } from 'react-icons/fi';
import { useAuthStore } from '../utils/store';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const baseNavItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/goals', icon: FiTarget, label: 'Goals' },
    { path: '/portfolios', icon: FiBriefcase, label: 'Portfolios' },
    { path: '/chat', icon: FiMessageSquare, label: 'Chat' },
    { path: '/market', icon: FiTrendingUp, label: 'Market' },
    { path: '/profile', icon: FiUser, label: 'Profile' },
    { path: '/settings', icon: FiSettings, label: 'Settings' }
  ];

  // Add admin link if user is admin
  const navItems = user?.role === 'admin'
    ? [{ path: '/admin', icon: FiShield, label: 'Admin' }, ...baseNavItems]
    : baseNavItems;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Cleva Investment</span>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-800">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-xs text-gray-500">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex justify-around py-2 border-t">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                  isActive(item.path) ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
