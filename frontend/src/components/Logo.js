import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Logo Joboost - Composant haute qualité avec tailles optimisées
 * 
 * GUIDE DES TAILLES (Mobile → Tablet → Desktop)
 * ═══════════════════════════════════════════════════════════════
 * Size  │ Mobile    │ Tablet    │ Desktop   │ Usage
 * ═══════════════════════════════════════════════════════════════
 * xs    │ 36px      │ 40px      │ 44px      │ Modals, notifications
 * sm    │ 44px      │ 52px      │ 60px      │ Footer, menu compact
 * md    │ 56px      │ 64px      │ 72px      │ Sidebar
 * lg    │ 68px      │ 80px      │ 92px      │ Header/Navbar ⭐
 * xl    │ 80px      │ 100px     │ 120px     │ Auth pages
 * 2xl   │ 100px     │ 130px     │ 160px     │ Hero, pages erreur
 * ═══════════════════════════════════════════════════════════════
 */

const SIZE_CLASSES = {
  xs: 'h-9 sm:h-10 md:h-11',                    // 36 → 40 → 44
  sm: 'h-11 sm:h-[52px] md:h-[60px]',           // 44 → 52 → 60
  md: 'h-14 sm:h-16 md:h-[72px]',               // 56 → 64 → 72
  lg: 'h-[68px] sm:h-20 md:h-[92px]',           // 68 → 80 → 92 ⭐ HEADER
  xl: 'h-20 sm:h-[100px] md:h-[120px]',         // 80 → 100 → 120
  '2xl': 'h-[100px] sm:h-[130px] md:h-[160px]', // 100 → 130 → 160
};

export const Logo = ({
  size = 'lg',
  href,
  className = '',
  responsive = true,
  onClick,
}) => {
  const sizeClasses = responsive ? SIZE_CLASSES[size] || SIZE_CLASSES.lg : '';
  
  // Tailles fixes pour mode non-responsive
  const fixedHeights = {
    xs: 44,
    sm: 60,
    md: 72,
    lg: 92,
    xl: 120,
    '2xl': 160,
  };

  const logoElement = (
    <div className={`flex items-center ${className}`}>
      <img
        src="/images/logo.svg"
        alt="Joboost - CRM de Carrière"
        className={`object-contain w-auto ${responsive ? sizeClasses : ''}`}
        style={{
          ...(responsive ? {} : { height: `${fixedHeights[size] || 92}px` }),
          imageRendering: 'auto',
          WebkitFontSmoothing: 'antialiased',
        }}
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
