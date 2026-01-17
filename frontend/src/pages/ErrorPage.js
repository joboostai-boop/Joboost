import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Logo from '../components/Logo';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

const ErrorPage = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 opacity-70">
        <Logo size="xl" href="/" />
      </div>

      {/* Error Content */}
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="font-heading text-6xl font-bold text-slate-200 mb-4">500</h1>
        <h2 className="font-heading text-2xl font-bold text-slate-900 mb-4">
          Erreur serveur
        </h2>
        <p className="text-slate-500 mb-8">
          Une erreur inattendue s'est produite. Notre équipe a été notifiée. 
          Veuillez réessayer dans quelques instants.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            onClick={handleRefresh}
            className="btn-primary"
            data-testid="refresh-btn"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Réessayer
          </Button>
          <Link to="/">
            <Button variant="outline" data-testid="go-home-btn">
              <Home className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>

      {/* Support Info */}
      <div className="mt-12 text-center">
        <p className="text-sm text-slate-400 mb-2">
          Le problème persiste ?
        </p>
        <a 
          href="mailto:support@joboost.fr" 
          className="text-sky-500 hover:text-sky-600 text-sm font-medium"
        >
          Contactez le support
        </a>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} Joboost. Tous droits réservés.</p>
      </div>
    </div>
  );
};

export default ErrorPage;
