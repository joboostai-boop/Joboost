import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Logo component for Joboost
 * @param {object} props
 * @param {'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'} props.size - Size of the logo
 * @param {string} props.href - Link destination (optional)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showText - Show "Joboost" text next to logo
 * @param {function} props.onClick - Click handler
 */

const SIZE_MAP = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 50,
  xl: 80,
  '2xl': 100,
};

export const Logo = ({
  size = 'md',
  href,
  className = '',
  showText = false,
  onClick,
}) => {
  const heightSize = SIZE_MAP[size] || SIZE_MAP.md;

  const logoElement = (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/images/logo.jpg"
        alt="Joboost - CRM de Carrière"
        height={heightSize}
        className="object-contain"
        style={{ height: `${heightSize}px`, width: 'auto' }}
      />
      {showText && (
        <span className="font-heading font-bold text-slate-900" style={{ fontSize: heightSize > 40 ? '1.5rem' : '1.25rem' }}>
          Joboost
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link 
        to={href} 
        className="inline-block hover:opacity-90 transition-opacity"
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
        className="inline-block cursor-pointer hover:opacity-90 transition-opacity"
        data-testid="logo-button"
      >
        {logoElement}
      </button>
    );
  }

  return logoElement;
};

export default Logo;
