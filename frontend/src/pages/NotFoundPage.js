import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Logo from '../components/Logo';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 opacity-70">
        <Logo size="xl" href="/" />
      </div>

      {/* Error Content */}
      <div className="text-center max-w-md">
        <h1 className="font-heading text-8xl font-bold text-slate-200 mb-4">404</h1>
        <h2 className="font-heading text-2xl font-bold text-slate-900 mb-4">
          Page introuvable
        </h2>
        <p className="text-slate-500 mb-8">
          Oups ! La page que vous recherchez n'existe pas ou a été déplacée. 
          Vérifiez l'URL ou retournez à l'accueil.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button className="btn-primary" data-testid="go-home-btn">
              <Home className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            data-testid="go-back-btn"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Page précédente
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} Joboost. Tous droits réservés.</p>
      </div>
    </div>
  );
};

export default NotFoundPage;
