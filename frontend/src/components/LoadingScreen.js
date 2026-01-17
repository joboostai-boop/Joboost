import React from 'react';

/**
 * Loading screen with animated Joboost logo
 * Use this component for initial app loading or page transitions
 */
const LoadingScreen = ({ message = 'Chargement...' }) => {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center">
      {/* Animated Logo Container */}
      <div className="relative mb-8">
        {/* Logo with pulse animation */}
        <div className="animate-pulse-slow">
          <img
            src="/images/logo.jpg"
            alt="Joboost"
            className="h-20 w-auto object-contain"
          />
        </div>
        
        {/* Spinning ring around logo */}
        <div className="absolute inset-0 -m-4">
          <svg 
            className="w-full h-full animate-spin-slow" 
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2"
              strokeDasharray="70 200"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Loading Message */}
      <p className="text-slate-500 text-sm font-medium animate-pulse">
        {message}
      </p>

      {/* Progress dots */}
      <div className="flex gap-1 mt-4">
        <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

export default LoadingScreen;
