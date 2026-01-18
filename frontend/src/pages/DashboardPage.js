import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI, statsAPI } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { 
  Sparkles, 
  FileText, 
  Mail, 
  Send, 
  TrendingUp,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Plus,
  User,
  Loader2,
  Building2,
  MapPin,
  Calendar,
  Target,
  Zap
} from 'lucide-react';
import ProgressChart from '../components/ProgressChart';

/**
 * DashboardPage - Vue d'ensemble de l'activité de recherche d'emploi
 * Point d'entrée principal après connexion
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [offers, setOffers] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(30);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appsResponse, statsResponse] = await Promise.all([
        applicationsAPI.getAll(),
        statsAPI.get()
      ]);
      
      const apps = appsResponse.data.applications || [];
      setRecentApplications(apps.slice(0, 5));
      setStats(statsResponse.data.stats);
      
      // Fetch timeline
      try {
        const token = localStorage.getItem('joboost_token');
        const timelineRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stats/timeline`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (timelineRes.ok) {
          const data = await timelineRes.json();
          setTimeline(data.timeline || []);
        }
      } catch (e) {
        console.error('Timeline error:', e);
      }
      
      // Fetch offers
      try {
        const token = localStorage.getItem('joboost_token');
        const offersRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/recommendations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (offersRes.ok) {
          const data = await offersRes.json();
          setOffers((data.offers || []).slice(0, 3));
        }
      } catch (e) {
        console.error('Offers error:', e);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Prêt à décrocher le job de vos rêves ? 🎯",
      "Chaque candidature vous rapproche de votre objectif ! 💪",
      "Continuez comme ça, vous êtes sur la bonne voie ! 🚀",
      "Votre prochain entretien est peut-être au coin de la rue ! ✨"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const STATUSES = [
    { id: 'todo', label: 'À faire', icon: Clock, color: 'text-slate-500 bg-slate-100' },
    { id: 'applied', label: 'Postulé', icon: Send, color: 'text-blue-600 bg-blue-100' },
    { id: 'interview', label: 'Entretien', icon: Calendar, color: 'text-amber-600 bg-amber-100' },
    { id: 'offer', label: 'Offre', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-100' },
  ];

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl p-6 lg:p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl lg:text-3xl font-bold mb-2">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Utilisateur'} 👋
              </h1>
              <p className="text-sky-100 text-lg">{getMotivationalMessage()}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => navigate('/creer-cv')} 
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                data-testid="quick-create-cv-btn"
              >
                <FileText className="w-4 h-4 mr-2" />
                Créer un CV
              </Button>
              <Button 
                onClick={() => navigate('/offres')} 
                className="bg-white text-sky-600 hover:bg-sky-50 border-0"
                data-testid="quick-see-offers-btn"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Voir les offres
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card" data-testid="stat-total">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.total || 0}</p>
                <p className="text-sm text-slate-500">Candidatures totales</p>
              </div>
            </div>
          </div>
          
          {STATUSES.slice(0, 3).map((status) => (
            <div key={status.id} className="stat-card" data-testid={`stat-${status.id}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${status.color} flex items-center justify-center`}>
                  <status.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats?.[status.id] || 0}</p>
                  <p className="text-sm text-slate-500">{status.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Credits Display */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-700 mb-3">Vos crédits IA</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 rounded-lg">
              <FileText className="w-5 h-5 text-sky-600" />
              <span className="text-sky-700 font-medium">{user?.ai_cv_credits || 0} CV</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg">
              <Mail className="w-5 h-5 text-amber-600" />
              <span className="text-amber-700 font-medium">{user?.ai_letter_credits || 0} Lettres</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg">
              <Send className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-700 font-medium">{user?.spontaneous_credits || 0} Spontanées</span>
            </div>
            <Link 
              to="/tarifs" 
              className="ml-auto flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium text-sm"
            >
              <Zap className="w-4 h-4" />
              Obtenir plus de crédits
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Chart */}
            {timeline.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-slate-600" />
                  <h3 className="font-heading font-semibold text-slate-900">Ma progression</h3>
                </div>
                <ProgressChart data={timeline} />
              </div>
            )}

            {/* Recent Applications */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-heading font-semibold text-slate-900">Candidatures récentes</h3>
                <Link 
                  to="/candidatures" 
                  className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
                >
                  Voir tout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              {recentApplications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="font-semibold text-slate-700 mb-2">Aucune candidature</h4>
                  <p className="text-slate-500 text-sm mb-4">Commencez à postuler aux offres qui vous intéressent</p>
                  <Button onClick={() => navigate('/offres')} className="btn-primary">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Découvrir les offres
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentApplications.map((app) => (
                    <Link
                      key={app.application_id}
                      to={`/candidatures`}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                      data-testid={`recent-app-${app.application_id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{app.job_title}</p>
                          <p className="text-sm text-slate-500">{app.company_name}</p>
                        </div>
                      </div>
                      <span className={`badge-status badge-${app.status}`}>
                        {STATUSES.find(s => s.id === app.status)?.label || app.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-heading font-semibold text-slate-900 mb-4">Actions rapides</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/creer-cv')}
                  variant="outline"
                  className="w-full justify-start"
                  data-testid="action-create-cv"
                >
                  <FileText className="w-4 h-4 mr-3 text-sky-500" />
                  Créer un CV
                </Button>
                <Button
                  onClick={() => navigate('/creer-lettre')}
                  variant="outline"
                  className="w-full justify-start"
                  data-testid="action-create-letter"
                >
                  <Mail className="w-4 h-4 mr-3 text-amber-500" />
                  Créer une lettre
                </Button>
                <Button
                  onClick={() => navigate('/candidatures')}
                  variant="outline"
                  className="w-full justify-start"
                  data-testid="action-add-application"
                >
                  <Plus className="w-4 h-4 mr-3 text-emerald-500" />
                  Ajouter une candidature
                </Button>
                <Button
                  onClick={() => navigate('/profil')}
                  variant="outline"
                  className="w-full justify-start"
                  data-testid="action-edit-profile"
                >
                  <User className="w-4 h-4 mr-3 text-indigo-500" />
                  Modifier mon profil
                </Button>
              </div>
            </div>

            {/* Personalized Offers Preview */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-500" />
                  <h3 className="font-heading font-semibold text-slate-900">Offres pour vous</h3>
                </div>
                <Link 
                  to="/offres" 
                  className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                >
                  Voir tout
                </Link>
              </div>
              
              {offers.length === 0 ? (
                <div className="p-6 text-center">
                  <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">
                    Complétez votre profil pour recevoir des offres personnalisées
                  </p>
                  <Button 
                    onClick={() => navigate('/profil')} 
                    variant="link" 
                    className="mt-2 text-sky-600"
                  >
                    Compléter mon profil
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {offers.map((offer, index) => (
                    <Link
                      key={offer.id || index}
                      to="/offres"
                      className="block p-4 hover:bg-slate-50 transition-colors"
                    >
                      <p className="font-medium text-slate-900 line-clamp-1">
                        {offer.title || offer.intitule || 'Offre'}
                      </p>
                      <p className="text-sm text-slate-500 line-clamp-1">
                        {offer.company || offer.entreprise?.nom || 'Entreprise'}
                      </p>
                      {(offer.location || offer.lieuTravail?.libelle) && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                          <MapPin className="w-3 h-3" />
                          {offer.location || offer.lieuTravail?.libelle}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-semibold text-slate-900">Profil</h3>
                <span className="text-sm font-medium text-sky-600">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                <div 
                  className="bg-sky-500 h-2 rounded-full transition-all"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <p className="text-sm text-slate-500 mb-3">
                Un profil complet améliore la pertinence des offres et la qualité des CV générés.
              </p>
              <Button 
                onClick={() => navigate('/profil')} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Compléter mon profil
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
