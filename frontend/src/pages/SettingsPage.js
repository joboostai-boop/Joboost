import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import {
  User,
  CreditCard,
  Bell,
  Shield,
  LogOut,
  Trash2,
  Sparkles,
  ExternalLink,
  ChevronRight
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
    <AppLayout title="Paramètres" subtitle="Gérez votre compte et vos préférences">
      <div className="p-4 lg:p-8 space-y-6 max-w-3xl">
        {/* Account Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-600" />
              <span className="font-heading font-semibold text-slate-900">Compte</span>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between p-4 hover:bg-slate-50">
              <div>
                <p className="font-medium text-slate-900">Nom</p>
                <p className="text-sm text-slate-500">{user?.name || 'Non défini'}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-slate-50">
              <div>
                <p className="font-medium text-slate-900">Email</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
            <button 
              onClick={() => navigate('/profil')}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-left"
            >
              <div>
                <p className="font-medium text-slate-900">Mon profil maître</p>
                <p className="text-sm text-slate-500">Gérer mes informations pour la génération IA</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
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
                      : user?.subscription_plan === 'ultra'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {user?.subscription_plan === 'pro' ? 'Pro' : user?.subscription_plan === 'ultra' ? 'Ultra' : 'Gratuit'}
                  </span>
                  {(user?.subscription_plan === 'pro' || user?.subscription_plan === 'ultra') && (
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      {user?.subscription_plan === 'ultra' ? 'Tout illimité' : 'Générations étendues'}
                    </span>
                  )}
                </div>
              </div>
              {user?.subscription_plan === 'free' && (
                <Button onClick={() => navigate('/tarifs')} className="btn-sky">
                  Passer au Pro
                </Button>
              )}
            </div>
            
            {user?.subscription_plan === 'free' && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Crédits CV IA</span>
                  <span className="font-semibold text-sky-600">{user?.ai_cv_credits || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-500">Crédits Lettres IA</span>
                  <span className="font-semibold text-amber-600">{user?.ai_letter_credits || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-500">Crédits Spontanées</span>
                  <span className="font-semibold text-emerald-600">{user?.spontaneous_credits || 0}</span>
                </div>
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
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-slate-900">Mot de passe</p>
                <p className="text-sm text-slate-500">Dernière modification: jamais</p>
              </div>
              <Button variant="outline" disabled size="sm">
                Modifier
              </Button>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-slate-900">Authentification à deux facteurs</p>
                <p className="text-sm text-slate-500">Non activée</p>
              </div>
              <Button variant="outline" disabled size="sm">
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
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-slate-900">Notifications par email</p>
                <p className="text-sm text-slate-500">Rappels de deadlines, conseils personnalisés</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-slate-900">Nouvelles offres personnalisées</p>
                <p className="text-sm text-slate-500">Recevez les offres qui matchent votre profil</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Legal Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <span className="font-heading font-semibold text-slate-900">Légal</span>
          </div>
          <div className="divide-y divide-slate-100">
            <a href="#" className="flex items-center justify-between p-4 hover:bg-slate-50">
              <span className="text-slate-700">Conditions d'utilisation</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
            <a href="#" className="flex items-center justify-between p-4 hover:bg-slate-50">
              <span className="text-slate-700">Politique de confidentialité</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
            <a href="#" className="flex items-center justify-between p-4 hover:bg-slate-50">
              <span className="text-slate-700">Gestion des cookies</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
          <div className="p-4 border-b border-red-100 bg-red-50">
            <span className="font-heading font-semibold text-red-700">Zone de danger</span>
          </div>
          <div className="divide-y divide-red-100">
            <div className="flex items-center justify-between p-4">
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
            <div className="flex items-center justify-between p-4">
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
    </AppLayout>
  );
};

export default SettingsPage;
