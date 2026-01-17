import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI, statsAPI } from '../lib/api';
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
import Logo from '../components/Logo';
import OffersPanel from '../components/OffersPanel';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List,
  Settings,
  User,
  LogOut,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  Sparkles,
  Trash2,
  GripVertical,
  BarChart3,
  Loader2,
  ChevronDown,
  Menu,
  Send,
  FileText,
  TrendingUp,
  Briefcase,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ProgressChart from '../components/ProgressChart';
import OfferCard from '../components/OfferCard';

const STATUSES = [
  { id: 'todo', label: 'À faire', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { id: 'applied', label: 'Postulé', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'interview', label: 'Entretien', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'offer', label: 'Offre', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'rejected', label: 'Refusé', color: 'bg-red-50 text-red-600 border-red-200' },
];

// Sortable Job Card Component
const SortableJobCard = ({ application, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.application_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card-job group"
      onClick={() => onClick(application)}
      data-testid={`job-card-${application.application_id}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 cursor-grab"
      >
        <GripVertical className="w-4 h-4 text-slate-400" />
      </div>
      <h4 className="font-semibold text-slate-900 pr-6">{application.job_title}</h4>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Building2 className="w-4 h-4" />
        <span>{application.company_name}</span>
      </div>
      {application.location && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <MapPin className="w-3 h-3" />
          <span>{application.location}</span>
        </div>
      )}
      {application.deadline && (
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
          <Calendar className="w-3 h-3" />
          <span>Deadline: {new Date(application.deadline).toLocaleDateString('fr-FR')}</span>
        </div>
      )}
    </div>
  );
};

// Kanban Column Component
const KanbanColumn = ({ status, applications, onCardClick }) => {
  return (
    <div className="kanban-column">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-700">{status.label}</h3>
        <span className="text-sm text-slate-400 bg-white px-2 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>
      <SortableContext
        items={applications.map(a => a.application_id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 min-h-[200px]">
          {applications.map((app) => (
            <SortableJobCard
              key={app.application_id}
              application={app}
              onClick={onCardClick}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchData();
    fetchTimeline();
    fetchOffers();
  }, []);

  const fetchTimeline = async () => {
    try {
      const token = localStorage.getItem('joboost_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stats/timeline`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTimeline(data.timeline || []);
      }
    } catch (error) {
      console.error('Timeline error:', error);
    }
  };

  const fetchOffers = async () => {
    setOffersLoading(true);
    try {
      const token = localStorage.getItem('joboost_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/recommendations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOffers(data.offers || []);
      }
    } catch (error) {
      console.error('Offers error:', error);
    } finally {
      setOffersLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [appsResponse, statsResponse] = await Promise.all([
        applicationsAPI.getAll(),
        statsAPI.get()
      ]);
      setApplications(appsResponse.data.applications || []);
      setStats(statsResponse.data.stats);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
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
      toast.success('Candidature ajoutée !');
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error adding application:', error);
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      await applicationsAPI.updateStatus(applicationId, newStatus);
      setApplications(prev =>
        prev.map(app =>
          app.application_id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) return;

    try {
      await applicationsAPI.delete(applicationId);
      setApplications(prev => prev.filter(app => app.application_id !== applicationId));
      setShowDetailModal(false);
      setSelectedApp(null);
      toast.success('Candidature supprimée');
      fetchData();
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeApp = applications.find(a => a.application_id === active.id);
    if (!activeApp) return;

    // Determine which column was dropped into
    const overApp = applications.find(a => a.application_id === over.id);
    const targetStatus = overApp?.status || over.id;

    if (STATUSES.find(s => s.id === targetStatus) && activeApp.status !== targetStatus) {
      handleUpdateStatus(active.id, targetStatus);
    }
  };

  const filteredApplications = applications.filter(app =>
    app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.job_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getApplicationsByStatus = (status) =>
    filteredApplications.filter(app => app.status === status);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleCardClick = (app) => {
    setSelectedApp(app);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Principale */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 w-64 h-screen bg-white border-r border-slate-200 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-100">
            <Logo size="lg" href="/dashboard" />
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <Link to="/dashboard" className="sidebar-link active">
              <Home className="w-5 h-5" />
              Dashboard
            </Link>
            <Link to="/spontaneous" className="sidebar-link">
              <Send className="w-5 h-5" />
              Candidatures spontanées
            </Link>
            <Link to="/profile" className="sidebar-link">
              <User className="w-5 h-5" />
              Mon Profil
            </Link>
            <Link to="/pricing" className="sidebar-link">
              <Sparkles className="w-5 h-5" />
              Plans & Tarifs
            </Link>
            <Link to="/settings" className="sidebar-link">
              <Settings className="w-5 h-5" />
              Paramètres
            </Link>
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{user?.name}</p>
                <p className="text-sm text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 hover:text-red-600"
              onClick={handleLogout}
              data-testid="logout-btn"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Panneau Offres Personnalisées (visible sur grand écran) */}
      <OffersPanel 
        offers={offers} 
        loading={offersLoading}
        selectedOffer={selectedOffer}
        onSelectOffer={setSelectedOffer}
      />

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="font-heading text-xl lg:text-2xl font-bold text-slate-900">
                Mes candidatures
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                  data-testid="search-input"
                />
              </div>

              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 ${viewMode === 'kanban' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}
                  data-testid="kanban-view-btn"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}
                  data-testid="list-view-btn"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <Button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
                data-testid="add-application-btn"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Ajouter</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        {stats && (
          <div className="px-4 lg:px-8 py-6">
            {/* Credits Display */}
            <div className="mb-4 flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-700 rounded-full">
                <FileText className="w-4 h-4" />
                CV: {user?.ai_cv_credits || 0}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full">
                <Sparkles className="w-4 h-4" />
                Lettres: {user?.ai_letter_credits || 0}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                <Send className="w-4 h-4" />
                Spontanées: {user?.spontaneous_credits || 0}
              </span>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="stat-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                    <p className="text-sm text-slate-500">Total</p>
                  </div>
                </div>
              </div>
              {STATUSES.slice(0, 4).map((status) => (
                <div key={status.id} className="stat-card">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats[status.id] || 0}</p>
                    <p className="text-sm text-slate-500">{status.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Chart */}
        {timeline.length > 0 && (
          <div className="px-4 lg:px-8 pb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-slate-600" />
                <h3 className="font-heading font-semibold text-slate-900">Ma progression</h3>
              </div>
              <ProgressChart data={timeline} />
            </div>
          </div>
        )}

        {/* Personalized Offers */}
        {offers.length > 0 && (
          <div className="px-4 lg:px-8 pb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-500" />
                  <h3 className="font-heading font-semibold text-slate-900">Offres personnalisées</h3>
                </div>
                <span className="text-sm text-slate-500">Basées sur votre profil</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.slice(0, 6).map((offer, index) => (
                  <OfferCard key={index} offer={offer} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-4 lg:px-8 pb-8">
          {viewMode === 'kanban' ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-4 overflow-x-auto pb-4">
                {STATUSES.map((status) => (
                  <KanbanColumn
                    key={status.id}
                    status={status}
                    applications={getApplicationsByStatus(status.id)}
                    onCardClick={handleCardClick}
                  />
                ))}
              </div>
            </DndContext>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Poste</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Entreprise</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 hidden md:table-cell">Localisation</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Statut</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 hidden lg:table-cell">Date</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map((app) => (
                    <tr
                      key={app.application_id}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => handleCardClick(app)}
                      data-testid={`table-row-${app.application_id}`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900">{app.job_title}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{app.company_name}</td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{app.location || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`badge-status ${STATUSES.find(s => s.id === app.status)?.color}`}>
                          {STATUSES.find(s => s.id === app.status)?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 hidden lg:table-cell">
                        {new Date(app.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm">
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredApplications.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Aucune candidature pour le moment</p>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 btn-secondary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter votre première candidature
                  </Button>
                </div>
              )}
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
                placeholder="Copiez-collez la description du poste ici..."
                value={newApp.job_description}
                onChange={(e) => setNewApp(prev => ({ ...prev, job_description: e.target.value }))}
                rows={4}
                data-testid="new-app-description-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes personnelles</Label>
              <Textarea
                placeholder="Vos notes sur cette candidature..."
                value={newApp.notes}
                onChange={(e) => setNewApp(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
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

      {/* Application Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl flex items-center gap-3">
                  {selectedApp.job_title}
                  <span className={`badge-status ${STATUSES.find(s => s.id === selectedApp.status)?.color}`}>
                    {STATUSES.find(s => s.id === selectedApp.status)?.label}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex items-center gap-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    <span className="font-medium">{selectedApp.company_name}</span>
                  </div>
                  {selectedApp.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedApp.location}</span>
                    </div>
                  )}
                </div>

                {selectedApp.job_url && (
                  <a
                    href={selectedApp.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sky-500 hover:text-sky-600"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Voir l'offre originale
                  </a>
                )}

                <div className="space-y-2">
                  <Label className="text-slate-500">Changer le statut</Label>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((status) => (
                      <button
                        key={status.id}
                        onClick={() => handleUpdateStatus(selectedApp.application_id, status.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedApp.status === status.id
                            ? status.color + ' ring-2 ring-offset-2 ring-sky-500'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedApp.job_description && (
                  <div className="space-y-2">
                    <Label className="text-slate-500">Description du poste</Label>
                    <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {selectedApp.job_description}
                    </div>
                  </div>
                )}

                {selectedApp.notes && (
                  <div className="space-y-2">
                    <Label className="text-slate-500">Notes</Label>
                    <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700">
                      {selectedApp.notes}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4">
                  <Button
                    onClick={() => navigate(`/generator/${selectedApp.application_id}`)}
                    className="w-full btn-sky"
                    data-testid="generate-ai-btn"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Générer CV & Lettre adaptés
                  </Button>
                </div>
              </div>
              <DialogFooter className="flex justify-between">
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteApplication(selectedApp.application_id)}
                  data-testid="delete-app-btn"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Fermer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
