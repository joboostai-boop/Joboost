import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Logo Joboost - Tailles EXTRA LARGES pour visibilité maximale
 * 
 * GUIDE DES TAILLES (Mobile → Tablet → Desktop)
 * ═══════════════════════════════════════════════════════════════
 * Size  │ Mobile    │ Tablet    │ Desktop   │ Usage
 * ═══════════════════════════════════════════════════════════════
 * xs    │ 48px      │ 56px      │ 64px      │ Modals, notifications
 * sm    │ 60px      │ 72px      │ 84px      │ Footer
 * md    │ 72px      │ 88px      │ 100px     │ Sidebar
 * lg    │ 88px      │ 110px     │ 130px     │ Header/Navbar ⭐
 * xl    │ 110px     │ 140px     │ 170px     │ Auth pages
 * 2xl   │ 140px     │ 180px     │ 220px     │ Hero, pages erreur
 * ═══════════════════════════════════════════════════════════════
 */

const SIZE_CLASSES = {
  xs: 'h-12 sm:h-14 md:h-16',                     // 48 → 56 → 64
  sm: 'h-[60px] sm:h-[72px] md:h-[84px]',         // 60 → 72 → 84
  md: 'h-[72px] sm:h-[88px] md:h-[100px]',        // 72 → 88 → 100
  lg: 'h-[88px] sm:h-[110px] md:h-[130px]',       // 88 → 110 → 130 ⭐ HEADER
  xl: 'h-[110px] sm:h-[140px] md:h-[170px]',      // 110 → 140 → 170
  '2xl': 'h-[140px] sm:h-[180px] md:h-[220px]',   // 140 → 180 → 220
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
    xs: 64,
    sm: 84,
    md: 100,
    lg: 130,
    xl: 170,
    '2xl': 220,
  };

  const logoElement = (
    <div className={`flex items-center ${className}`}>
      <img
        src="/images/logo.svg"
        alt="Joboost - CRM de Carrière"
        className={`object-contain w-auto ${responsive ? sizeClasses : ''}`}
        style={{
          ...(responsive ? {} : { height: `${fixedHeights[size] || 130}px` }),
          imageRendering: 'auto',
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
