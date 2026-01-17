import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Logo component for Joboost - Responsive & Scalable
 * 
 * SIZE GUIDE (Mobile-First, hauteurs en px):
 * ─────────────────────────────────────────────────
 * Size     │ Mobile  │ Tablet  │ Desktop │ Usage
 * ─────────────────────────────────────────────────
 * xs       │ 28      │ 32      │ 36      │ Modals, dropdowns
 * sm       │ 36      │ 40      │ 44      │ Footer
 * md       │ 44      │ 50      │ 56      │ Sidebar
 * lg       │ 52      │ 60      │ 68      │ Header/Navbar
 * xl       │ 64      │ 80      │ 96      │ Auth pages
 * 2xl      │ 80      │ 100     │ 120     │ Hero sections
 * ─────────────────────────────────────────────────
 */

// Responsive size classes (Tailwind)
const SIZE_CLASSES = {
  xs: 'h-7 sm:h-8 md:h-9',           // 28px → 32px → 36px
  sm: 'h-9 sm:h-10 md:h-11',         // 36px → 40px → 44px
  md: 'h-11 sm:h-[50px] md:h-14',    // 44px → 50px → 56px
  lg: 'h-[52px] sm:h-[60px] md:h-[68px]',  // 52px → 60px → 68px
  xl: 'h-16 sm:h-20 md:h-24',        // 64px → 80px → 96px
  '2xl': 'h-20 sm:h-[100px] md:h-[120px]', // 80px → 100px → 120px
};

export const Logo = ({
  size = 'lg',
  href,
  className = '',
  responsive = true,
  onClick,
}) => {
  const sizeClasses = responsive 
    ? SIZE_CLASSES[size] || SIZE_CLASSES.lg
    : '';
  
  // Fallback fixed heights for non-responsive mode
  const fixedHeights = {
    xs: 32,
    sm: 40,
    md: 50,
    lg: 60,
    xl: 80,
    '2xl': 100,
  };

  const logoElement = (
    <div className={`flex items-center ${className}`}>
      <img
        src="/images/logo.svg"
        alt="Joboost - CRM de Carrière"
        className={`object-contain w-auto ${responsive ? sizeClasses : ''}`}
        style={!responsive ? { height: `${fixedHeights[size] || 60}px` } : undefined}
        data-testid="logo-image"
      />
    </div>
  );

  if (href) {
    return (
      <Link 
        to={href} 
        className="inline-flex hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded-lg"
        data-testid="logo-link"
      >
        {logoElement}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button 
        onClick={onClick} 
        className="inline-flex cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded-lg"
        data-testid="logo-button"
        type="button"
      >
        {logoElement}
      </button>
    );
  }

  return logoElement;
};

export default Logo;
