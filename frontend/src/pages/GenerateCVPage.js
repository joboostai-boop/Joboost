import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI } from '../lib/api';
import AppLayout from '../components/AppLayout';
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
  Plus, 
  Sparkles, 
  Building2, 
  MapPin,
  Loader2,
  ArrowRight,
  CheckCircle,
  Layout,
  Layers
} from 'lucide-react';

// Templates de CV prédéfinis
const CV_TEMPLATES = [
  { id: 'modern', name: 'Moderne', description: 'Design épuré et contemporain', color: 'from-sky-500 to-blue-600' },
  { id: 'classic', name: 'Classique', description: 'Format traditionnel professionnel', color: 'from-slate-600 to-slate-800' },
  { id: 'creative', name: 'Créatif', description: 'Pour les métiers artistiques', color: 'from-purple-500 to-pink-500' },
  { id: 'tech', name: 'Tech', description: 'Optimisé pour les profils IT', color: 'from-emerald-500 to-teal-600' },
];

const GenerateCVPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [step, setStep] = useState(1); // 1: choose template, 2: choose application
  const [newApp, setNewApp] = useState({
    company_name: '',
    job_title: '',
    job_url: '',
    job_description: '',
    location: '',
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
      const response = await applicationsAPI.create({ ...newApp, status: 'todo' });
      setApplications(prev => [response.data.application, ...prev]);
      setShowAddModal(false);
      setNewApp({
        company_name: '',
        job_title: '',
        job_url: '',
        job_description: '',
        location: '',
      });
      toast.success('Candidature ajoutée !');
      
      // Navigate to generator
      navigate(`/generator/${response.data.application.application_id}?type=cv&template=${selectedTemplate || 'modern'}`);
    } catch (error) {
      console.error('Error adding application:', error);
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleSelectApplication = (app) => {
    navigate(`/generator/${app.application_id}?type=cv&template=${selectedTemplate || 'modern'}`);
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    setStep(2);
  };

  return (
    <AppLayout 
      title="Créer un CV" 
      subtitle="Générez un CV adapté à chaque offre"
    >
      <div className="p-4 lg:p-8">
        {/* Credits */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 rounded-lg">
            <FileText className="w-5 h-5 text-sky-600" />
            <span className="text-sky-700 font-medium">Crédits CV disponibles: {user?.ai_cv_credits || 0}</span>
          </div>
          {user?.ai_cv_credits === 0 && (
            <Button onClick={() => navigate('/tarifs')} variant="outline" size="sm">
              Obtenir plus de crédits
            </Button>
          )}
        </div>

        {/* Steps indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-sky-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-sky-500 text-white' : 'bg-slate-200'}`}>
                {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className="font-medium">Choisir un template</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200">
              <div className={`h-full bg-sky-500 transition-all ${step > 1 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-sky-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-sky-500 text-white' : 'bg-slate-200'}`}>
                2
              </div>
              <span className="font-medium">Sélectionner l'offre</span>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Choisissez un template</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CV_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`relative group p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                    selectedTemplate === template.id 
                      ? 'border-sky-500 bg-sky-50' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                  data-testid={`template-${template.id}`}
                >
                  <div className={`w-full h-32 rounded-lg bg-gradient-to-br ${template.color} mb-4 flex items-center justify-center`}>
                    <Layout className="w-12 h-12 text-white/80" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{template.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{template.description}</p>
                  
                  <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedTemplate === template.id 
                      ? 'border-sky-500 bg-sky-500' 
                      : 'border-slate-300'
                  }`}>
                    {selectedTemplate === template.id && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Sélectionnez une candidature</h2>
              <Button variant="ghost" onClick={() => setStep(1)} size="sm">
                ← Changer de template
              </Button>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
                <p className="text-slate-500">Chargement...</p>
              </div>
            ) : (
              <>
                {/* Add new application button */}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full mb-4 p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-sky-400 hover:bg-sky-50 transition-colors flex items-center justify-center gap-2 text-slate-600 hover:text-sky-600"
                  data-testid="add-new-application-btn"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Créer une nouvelle candidature</span>
                </button>

                {applications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-slate-200">
                    <Layers className="w-12 h-12 text-slate-300 mb-4" />
                    <h3 className="font-semibold text-slate-700 mb-2">Aucune candidature existante</h3>
                    <p className="text-slate-500 max-w-md mb-4">
                      Créez une candidature pour générer un CV personnalisé pour cette offre.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {applications.map((app) => (
                      <button
                        key={app.application_id}
                        onClick={() => handleSelectApplication(app)}
                        className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-sky-200 transition-all text-left group"
                        data-testid={`select-app-${app.application_id}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-sky-600 transition-colors">
                            {app.job_title}
                          </h3>
                          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-sky-500 transition-colors" />
                        </div>
                        
                        <div className="space-y-2">
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
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

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
                />
              </div>
              <div className="space-y-2">
                <Label>Poste *</Label>
                <Input
                  placeholder="Titre du poste"
                  value={newApp.job_title}
                  onChange={(e) => setNewApp(prev => ({ ...prev, job_title: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Localisation</Label>
              <Input
                placeholder="Paris, Remote..."
                value={newApp.location}
                onChange={(e) => setNewApp(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description du poste</Label>
              <Textarea
                placeholder="Copiez-collez la description pour une meilleure personnalisation..."
                value={newApp.job_description}
                onChange={(e) => setNewApp(prev => ({ ...prev, job_description: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddApplication} className="btn-primary">
              <Sparkles className="w-4 h-4 mr-2" />
              Créer et générer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default GenerateCVPage;
