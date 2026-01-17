import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Send, 
  Plus, 
  Search, 
  Filter,
  Building2, 
  MapPin,
  Mail,
  Calendar,
  Sparkles,
  FileText,
  Loader2,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Upload,
  Globe,
  User
} from 'lucide-react';

const SECTEURS = [
  'Tech', 'Finance', 'Santé', 'E-commerce', 'Conseil', 
  'Industrie', 'Marketing', 'RH', 'Éducation', 'Autre'
];

const STATUT_CONFIG = {
  envoye: { label: 'Envoyé', color: 'bg-blue-100 text-blue-700', icon: Send },
  relance: { label: 'Relancé', color: 'bg-orange-100 text-orange-700', icon: RefreshCw },
  entretien: { label: 'Entretien', color: 'bg-green-100 text-green-700', icon: Calendar },
  offre: { label: 'Offre', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  refuse: { label: 'Refusé', color: 'bg-red-100 text-red-700', icon: XCircle },
  sans_reponse: { label: 'Sans réponse', color: 'bg-slate-100 text-slate-600', icon: Clock },
};

const SpontaneousPageNew = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
  const [candidatures, setCandidatures] = useState([]);
  const [stats, setStats] = useState({ total: 0, envoye: 0, relance: 0, entretien: 0, offre: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [filterSecteur, setFilterSecteur] = useState('tous');
  
  // New application wizard state
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    entreprise_nom: '',
    entreprise_url: '',
    secteur: 'Tech',
    poste_vise: '',
    email_destination: '',
    nom_contact: '',
    pourquoi_entreprise: '',
    points_cles: '',
    ton: 'chaleureux',
    lettre_objet: '',
    lettre_corps: '',
    cv_filename: ''
  });

  // Detail modal
  const [selectedCandidature, setSelectedCandidature] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchCandidatures();
  }, [filterStatut, filterSecteur]);

  const fetchCandidatures = async () => {
    try {
      const token = localStorage.getItem('joboost_token');
      const params = new URLSearchParams();
      if (filterStatut !== 'tous') params.append('statut', filterStatut);
      if (filterSecteur !== 'tous') params.append('secteur', filterSecteur);
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/spontaneous/applications?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCandidatures(data.candidatures || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching candidatures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLetter = async () => {
    if (!formData.entreprise_nom || !formData.poste_vise || !formData.email_destination) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setGenerating(true);
    try {
      const token = localStorage.getItem('joboost_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/spontaneous/generate-letter`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entreprise_nom: formData.entreprise_nom,
          poste_vise: formData.poste_vise,
          secteur: formData.secteur,
          nom_contact: formData.nom_contact,
          pourquoi_entreprise: formData.pourquoi_entreprise,
          points_cles: formData.points_cles,
          ton: formData.ton
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          lettre_objet: data.objet,
          lettre_corps: data.corps
        }));
        toast.success('Lettre générée avec succès !');
        setStep(3);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Erreur lors de la génération');
      }
    } catch (error) {
      console.error('Generate error:', error);
      toast.error('Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendApplication = async () => {
    setSending(true);
    try {
      const token = localStorage.getItem('joboost_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/spontaneous/applications`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entreprise_nom: formData.entreprise_nom,
          entreprise_url: formData.entreprise_url,
          secteur: formData.secteur,
          poste_vise: formData.poste_vise,
          email_destination: formData.email_destination,
          nom_contact: formData.nom_contact,
          lettre_objet: formData.lettre_objet,
          lettre_corps: formData.lettre_corps,
          cv_filename: formData.cv_filename
        })
      });
      
      if (response.ok) {
        toast.success('🎉 Candidature envoyée avec succès !');
        setActiveTab('list');
        setStep(1);
        setFormData({
          entreprise_nom: '', entreprise_url: '', secteur: 'Tech', poste_vise: '',
          email_destination: '', nom_contact: '', pourquoi_entreprise: '',
          points_cles: '', ton: 'chaleureux', lettre_objet: '', lettre_corps: '', cv_filename: ''
        });
        fetchCandidatures();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (candidatureId, newStatus) => {
    try {
      const token = localStorage.getItem('joboost_token');
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/spontaneous/applications/${candidatureId}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatus })
      });
      toast.success('Statut mis à jour');
      fetchCandidatures();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredCandidatures = candidatures.filter(c => 
    c.entreprise_nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.poste_vise?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={user} onLogout={handleLogout} />
      
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 lg:hidden" />
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-xl lg:text-2xl font-bold text-slate-900">
                  Candidatures spontanées
                </h1>
                <p className="text-sm text-slate-500">Contactez directement les entreprises qui vous intéressent</p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mes candidatures
              </button>
              <button
                onClick={() => { setActiveTab('new'); setStep(1); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'new' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-4 h-4" />
                Nouvelle
              </button>
            </div>
          </div>
        </header>

        {activeTab === 'list' ? (
          /* === LIST VIEW === */
          <div className="p-4 lg:p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {[
                { label: 'Total', value: stats.total, color: 'bg-slate-100 text-slate-700' },
                { label: 'Envoyées', value: stats.envoye, color: 'bg-blue-50 text-blue-700' },
                { label: 'Relancées', value: stats.relance, color: 'bg-orange-50 text-orange-700' },
                { label: 'Entretiens', value: stats.entretien, color: 'bg-green-50 text-green-700' },
                { label: 'Offres', value: stats.offre, color: 'bg-emerald-50 text-emerald-700' },
              ].map((stat, i) => (
                <div key={i} className={`${stat.color} rounded-xl p-4`}>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm opacity-80">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher une entreprise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="tous">Tous les statuts</option>
                {Object.entries(STATUT_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
              <select
                value={filterSecteur}
                onChange={(e) => setFilterSecteur(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="tous">Tous les secteurs</option>
                {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Applications List */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
              </div>
            ) : filteredCandidatures.length === 0 ? (
              <div className="text-center py-20">
                <Send className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucune candidature</h3>
                <p className="text-slate-500 mb-6">Envoyez votre première candidature spontanée</p>
                <Button onClick={() => setActiveTab('new')} className="btn-primary">
                  <Plus className="w-5 h-5 mr-2" />
                  Nouvelle candidature
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Entreprise</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Contact</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Date</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Statut</th>
                        <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCandidatures.map((c) => {
                        const StatusIcon = STATUT_CONFIG[c.statut]?.icon || Clock;
                        return (
                          <tr key={c.candidature_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-4">
                              <div className="font-medium text-slate-900">{c.entreprise_nom}</div>
                              <div className="text-sm text-slate-500">{c.poste_vise}</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-slate-600">{c.email_destination}</div>
                              {c.nom_contact && <div className="text-xs text-slate-400">{c.nom_contact}</div>}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-600">
                              {formatDate(c.date_envoi)}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUT_CONFIG[c.statut]?.color || 'bg-slate-100 text-slate-600'}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {STATUT_CONFIG[c.statut]?.label || c.statut}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => { setSelectedCandidature(c); setShowDetailModal(true); }}
                                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Voir détails"
                                >
                                  <Eye className="w-4 h-4 text-slate-500" />
                                </button>
                                <select
                                  value={c.statut}
                                  onChange={(e) => handleUpdateStatus(c.candidature_id, e.target.value)}
                                  className="text-xs border border-slate-200 rounded px-2 py-1"
                                >
                                  {Object.entries(STATUT_CONFIG).map(([key, cfg]) => (
                                    <option key={key} value={key}>{cfg.label}</option>
                                  ))}
                                </select>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* === NEW APPLICATION WIZARD === */
          <div className="p-4 lg:p-8 max-w-3xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              {[
                { num: 1, label: 'Entreprise' },
                { num: 2, label: 'Lettre IA' },
                { num: 3, label: 'Envoi' }
              ].map((s, i) => (
                <React.Fragment key={s.num}>
                  <div className={`flex items-center gap-2 ${step >= s.num ? 'text-sky-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      step >= s.num ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {s.num}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">{s.label}</span>
                  </div>
                  {i < 2 && <div className={`w-12 sm:w-20 h-0.5 mx-2 ${step > s.num ? 'bg-sky-500' : 'bg-slate-200'}`} />}
                </React.Fragment>
              ))}
            </div>

            {/* Step 1: Company Info */}
            {step === 1 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Informations sur l'entreprise</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom de l'entreprise *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Ex: Google France"
                          value={formData.entreprise_nom}
                          onChange={(e) => setFormData(prev => ({ ...prev, entreprise_nom: e.target.value }))}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secteur d'activité *</Label>
                      <select
                        value={formData.secteur}
                        onChange={(e) => setFormData(prev => ({ ...prev, secteur: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      >
                        {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Site web de l'entreprise</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="https://www.exemple.com"
                        value={formData.entreprise_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, entreprise_url: e.target.value }))}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Poste visé *</Label>
                    <Input
                      placeholder="Ex: Développeur Full-Stack"
                      value={formData.poste_vise}
                      onChange={(e) => setFormData(prev => ({ ...prev, poste_vise: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email de destination *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="email"
                          placeholder="recrutement@entreprise.com"
                          value={formData.email_destination}
                          onChange={(e) => setFormData(prev => ({ ...prev, email_destination: e.target.value }))}
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-slate-500">Adresse email du service RH ou recrutement</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Nom du contact (optionnel)</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Ex: Marie Dupont"
                          value={formData.nom_contact}
                          onChange={(e) => setFormData(prev => ({ ...prev, nom_contact: e.target.value }))}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.entreprise_nom || !formData.poste_vise || !formData.email_destination}
                    className="btn-primary"
                  >
                    Continuer
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Generate Letter */}
            {step === 2 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Génération de la lettre</h2>
                <p className="text-sm text-slate-500 mb-6">Personnalisez votre lettre de motivation avec l'IA</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pourquoi cette entreprise ? (recommandé)</Label>
                    <Textarea
                      placeholder="Ex: J'admire votre travail sur l'innovation dans le cloud computing..."
                      value={formData.pourquoi_entreprise}
                      onChange={(e) => setFormData(prev => ({ ...prev, pourquoi_entreprise: e.target.value }))}
                      rows={3}
                    />
                    <p className="text-xs text-slate-500">Plus vous donnez de contexte, plus la lettre sera personnalisée</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Points clés à mettre en avant</Label>
                    <Textarea
                      placeholder="Ex: Mes 5 ans d'expérience en React, ma passion pour l'UX..."
                      value={formData.points_cles}
                      onChange={(e) => setFormData(prev => ({ ...prev, points_cles: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ton de la lettre</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'formel', label: 'Formel', desc: 'Classique et respectueux' },
                        { value: 'chaleureux', label: 'Chaleureux', desc: 'Pro et enthousiaste' },
                        { value: 'moderne', label: 'Moderne', desc: 'Dynamique, startup' },
                      ].map(t => (
                        <button
                          key={t.value}
                          onClick={() => setFormData(prev => ({ ...prev, ton: t.value }))}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            formData.ton === t.value 
                              ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-medium text-sm text-slate-900">{t.label}</div>
                          <div className="text-xs text-slate-500">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Retour
                  </Button>
                  <Button
                    onClick={handleGenerateLetter}
                    disabled={generating}
                    className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Générer ma lettre avec l'IA
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Preview & Send */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Récapitulatif</h2>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Entreprise :</span>
                      <span className="ml-2 font-medium text-slate-900">{formData.entreprise_nom}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Poste :</span>
                      <span className="ml-2 font-medium text-slate-900">{formData.poste_vise}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Email :</span>
                      <span className="ml-2 font-medium text-slate-900">{formData.email_destination}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Contact :</span>
                      <span className="ml-2 font-medium text-slate-900">{formData.nom_contact || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Letter Preview */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">Lettre de motivation</h2>
                    <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Régénérer
                    </Button>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-slate-500 mb-1">Objet :</p>
                    <p className="font-medium text-slate-900">{formData.lettre_objet}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Corps de la lettre</Label>
                    <Textarea
                      value={formData.lettre_corps}
                      onChange={(e) => setFormData(prev => ({ ...prev, lettre_corps: e.target.value }))}
                      rows={12}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Retour
                  </Button>
                  <Button
                    onClick={handleSendApplication}
                    disabled={sending}
                    className="btn-primary"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Envoyer ma candidature
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Détail de la candidature</DialogTitle>
          </DialogHeader>
          {selectedCandidature && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Entreprise</span>
                  <p className="font-medium text-slate-900">{selectedCandidature.entreprise_nom}</p>
                </div>
                <div>
                  <span className="text-slate-500">Poste</span>
                  <p className="font-medium text-slate-900">{selectedCandidature.poste_vise}</p>
                </div>
                <div>
                  <span className="text-slate-500">Email</span>
                  <p className="font-medium text-slate-900">{selectedCandidature.email_destination}</p>
                </div>
                <div>
                  <span className="text-slate-500">Date d'envoi</span>
                  <p className="font-medium text-slate-900">{formatDate(selectedCandidature.date_envoi)}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-slate-900 mb-2">Lettre de motivation</h3>
                <div className="bg-slate-50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                  <p className="font-medium mb-2">{selectedCandidature.lettre_objet}</p>
                  {selectedCandidature.lettre_corps}
                </div>
              </div>

              {selectedCandidature.historique?.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-slate-900 mb-2">Historique</h3>
                  <div className="space-y-2">
                    {selectedCandidature.historique.map((h, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                        <span className="text-slate-500">{formatDate(h.date)}</span>
                        <span className="text-slate-700">{h.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpontaneousPageNew;
