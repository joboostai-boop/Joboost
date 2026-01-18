import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

/**
 * AppLayout - Layout wrapper for all authenticated pages
 * Provides consistent sidebar navigation and main content area
 */
const AppLayout = ({ children, title, subtitle, headerActions, className = '' }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={user} onLogout={handleLogout} />
      
      <main className={`flex-1 min-w-0 ${className}`}>
        {/* Header */}
        {(title || headerActions) && (
          <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Space for mobile menu button */}
                <div className="w-11 lg:hidden" />
                <div>
                  {title && (
                    <h1 className="font-heading text-xl lg:text-2xl font-bold text-slate-900">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-sm text-slate-500">{subtitle}</p>
                  )}
                </div>
              </div>
              {headerActions && (
                <div className="flex items-center gap-3">
                  {headerActions}
                </div>
              )}
            </div>
          </header>
        )}

        {/* Content */}
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
