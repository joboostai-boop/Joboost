import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { 
  LayoutDashboard, 
  Sparkles, 
  ClipboardList,
  FileText, 
  Mail, 
  FolderOpen,
  User, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

/**
 * Sidebar Navigation - JoBoost (Audit V2)
 * Architecture de navigation optimisée selon les standards SaaS
 * 
 * ORDRE LOGIQUE :
 * 1. Dashboard (point d'entrée)
 * 2. Offres personnalisées (cœur de l'app)
 * 3. Mes candidatures (suivi unifié)
 * 4. Créer un CV (outil)
 * 5. Créer une lettre (outil)
 * 6. Mes documents (bibliothèque)
 * 7. Mon profil (compte)
 * 8. Plans & Tarifs (upsell)
 * 9. Paramètres (config)
 */

const NAV_ITEMS = [
  { 
    path: '/dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
  },
  { 
    path: '/offres', 
    label: 'Offres personnalisées', 
    icon: Sparkles,
    badge: 'IA'
  },
  { 
    path: '/candidatures', 
    label: 'Mes candidatures', 
    icon: ClipboardList,
  },
  { 
    path: '/creer-cv', 
    label: 'Créer un CV', 
    icon: FileText,
  },
  { 
    path: '/creer-lettre', 
    label: 'Créer une lettre', 
    icon: Mail,
  },
  { 
    path: '/documents', 
    label: 'Mes documents', 
    icon: FolderOpen,
  },
  { 
    path: '/profil', 
    label: 'Mon profil', 
    icon: User,
  },
  { 
    path: '/tarifs', 
    label: 'Plans & Tarifs', 
    icon: CreditCard,
  },
  { 
    path: '/parametres', 
    label: 'Paramètres', 
    icon: Settings,
  },
];

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <>
      {/* Bouton Menu Mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-11 h-11 bg-white rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
        aria-label="Ouvrir le menu"
        data-testid="mobile-menu-btn"
      >
        <Menu className="w-5 h-5 text-slate-700" />
      </button>

      {/* Overlay Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen bg-white border-r border-slate-200
          flex flex-col
          w-[280px] lg:w-[260px]
          transform transition-transform duration-300 ease-out
          lg:translate-x-0 lg:sticky
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        data-testid="sidebar"
      >
        {/* Header - Logo */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <Logo size="lg" href="/dashboard" />
          
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation principale */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                  font-medium text-sm transition-all duration-200
                  ${active 
                    ? 'bg-sky-50 text-sky-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
                data-testid={`nav-${item.path.replace('/', '')}`}
              >
                {/* Barre active */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-sky-500 rounded-r-full" />
                )}
                
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="truncate">{item.label}</span>
                
                {/* Badge IA */}
                {item.badge && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Section Utilisateur */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 p-2 rounded-lg mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shrink-0">
              <span className="text-white font-semibold text-sm uppercase">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Utilisateur'} 👋
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email || 'email@example.com'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-sm font-medium"
            data-testid="sidebar-logout-btn"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
