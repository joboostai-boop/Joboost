import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  CreditCard,
  Bell,
  Shield,
  LogOut,
  Trash2,
  Sparkles
} from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Déconnexion réussie');
    navigate('/');
  };

  const handleDeleteAccount = () => {
    toast.error('Cette fonctionnalité n\'est pas encore disponible');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-heading text-xl font-bold text-slate-900">Paramètres</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-8 px-4 lg:px-8 space-y-6">
        {/* Account Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-600" />
              <span className="font-heading font-semibold text-slate-900">Compte</span>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Nom</p>
                <p className="text-sm text-slate-500">{user?.name || 'Non défini'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Email</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-slate-600" />
              <span className="font-heading font-semibold text-slate-900">Abonnement</span>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Plan actuel</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge-status ${
                    user?.subscription_plan === 'pro' 
                      ? 'bg-sky-50 text-sky-700 border-sky-200' 
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {user?.subscription_plan === 'pro' ? 'Pro' : 'Gratuit'}
                  </span>
                  {user?.subscription_plan === 'pro' && (
                    <span className="text-sm text-slate-500">
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      Générations illimitées
                    </span>
                  )}
                </div>
              </div>
              {user?.subscription_plan !== 'pro' && (
                <Button onClick={() => navigate('/pricing')} className="btn-sky">
                  Passer au Pro
                </Button>
              )}
            </div>
            
            {user?.subscription_plan !== 'pro' && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Crédits IA restants: <span className="font-semibold text-sky-500">{user?.ai_credits || 0}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-600" />
              <span className="font-heading font-semibold text-slate-900">Sécurité</span>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Mot de passe</p>
                <p className="text-sm text-slate-500">Dernière modification: jamais</p>
              </div>
              <Button variant="outline" disabled>
                Modifier
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Authentification à deux facteurs</p>
                <p className="text-sm text-slate-500">Non activée</p>
              </div>
              <Button variant="outline" disabled>
                Activer
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="font-heading font-semibold text-slate-900">Notifications</span>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Notifications par email</p>
                <p className="text-sm text-slate-500">Rappels de deadlines, conseils</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
          <div className="p-4 border-b border-red-100 bg-red-50">
            <span className="font-heading font-semibold text-red-700">Zone de danger</span>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Se déconnecter</p>
                <p className="text-sm text-slate-500">Déconnexion de votre compte</p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-slate-600"
                data-testid="settings-logout-btn"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <p className="font-medium text-red-600">Supprimer mon compte</p>
                <p className="text-sm text-slate-500">Cette action est irréversible</p>
              </div>
              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
