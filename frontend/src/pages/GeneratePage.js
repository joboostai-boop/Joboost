import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI } from '../lib/api';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { 
  FileText, 
  Mail, 
  Plus, 
  Sparkles, 
  Building2, 
  MapPin,
  ExternalLink,
  Loader2,
  ArrowRight
} from 'lucide-react';

const GeneratePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newApp, setNewApp] = useState({
    company_name: '',
    job_title: '',
    job_url: '',
    job_description: '',
    location: '',
    deadline: '',
    salary_range: '',
    notes: '',
    status: 'todo'
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await applicationsAPI.getAll();
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddApplication = async () => {
    if (!newApp.company_name || !newApp.job_title) {
      toast.error('Veuillez remplir au moins le nom de l\'entreprise et le poste');
      return;
    }

    try {
      const response = await applicationsAPI.create(newApp);
      setApplications(prev => [response.data.application, ...prev]);
      setShowAddModal(false);
      setNewApp({
        company_name: '',
        job_title: '',
        job_url: '',
        job_description: '',
        location: '',
        deadline: '',
        salary_range: '',
        notes: '',
        status: 'todo'
      });
      toast.success('Candidature ajoutée ! Vous pouvez maintenant générer vos documents.');
    } catch (error) {
      console.error('Error adding application:', error);
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={user} onLogout={handleLogout} />
      
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 lg:hidden" />
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-xl lg:text-2xl font-bold text-slate-900">
                  Générer CV & Lettre
                </h1>
                <p className="text-sm text-slate-500">Créez des documents adaptés à chaque offre</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              data-testid="add-application-btn"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter une candidature
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {/* Credits */}
          <div className="mb-6 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-700 rounded-full">
              <FileText className="w-4 h-4" />
              CV disponibles: {user?.ai_cv_credits || 0}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full">
              <Mail className="w-4 h-4" />
              Lettres disponibles: {user?.ai_letter_credits || 0}
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
              <p className="text-slate-500">Chargement...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-700 mb-2">Aucune candidature</h2>
              <p className="text-slate-500 max-w-md mb-6">
                Ajoutez une candidature pour commencer à générer des CV et lettres de motivation personnalisés.
              </p>
              <Button onClick={() => setShowAddModal(true)} className="btn-primary">
                <Plus className="w-5 h-5 mr-2" />
                Ajouter ma première candidature
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {applications.map((app) => (
                <div
                  key={app.application_id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 line-clamp-2">{app.job_title}</h3>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Building2 className="w-4 h-4" />
                      <span>{app.company_name}</span>
                    </div>
                    {app.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="w-4 h-4" />
                        <span>{app.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate(`/generator/${app.application_id}?type=cv`)}
                      className="flex-1 bg-sky-500 hover:bg-sky-600 text-white text-sm"
                      size="sm"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      CV
                    </Button>
                    <Button
                      onClick={() => navigate(`/generator/${app.application_id}?type=letter`)}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm"
                      size="sm"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Lettre
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Application Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Nouvelle candidature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Entreprise *</Label>
                <Input
                  placeholder="Nom de l'entreprise"
                  value={newApp.company_name}
                  onChange={(e) => setNewApp(prev => ({ ...prev, company_name: e.target.value }))}
                  data-testid="new-app-company-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Poste *</Label>
                <Input
                  placeholder="Titre du poste"
                  value={newApp.job_title}
                  onChange={(e) => setNewApp(prev => ({ ...prev, job_title: e.target.value }))}
                  data-testid="new-app-title-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Localisation</Label>
                <Input
                  placeholder="Paris, Remote..."
                  value={newApp.location}
                  onChange={(e) => setNewApp(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Date limite</Label>
                <Input
                  type="date"
                  value={newApp.deadline}
                  onChange={(e) => setNewApp(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL de l'offre</Label>
              <Input
                placeholder="https://..."
                value={newApp.job_url}
                onChange={(e) => setNewApp(prev => ({ ...prev, job_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description du poste</Label>
              <Textarea
                placeholder="Copiez-collez la description du poste ici pour une meilleure personnalisation..."
                value={newApp.job_description}
                onChange={(e) => setNewApp(prev => ({ ...prev, job_description: e.target.value }))}
                rows={4}
                data-testid="new-app-description-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddApplication} className="btn-primary" data-testid="submit-new-app-btn">
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GeneratePage;
