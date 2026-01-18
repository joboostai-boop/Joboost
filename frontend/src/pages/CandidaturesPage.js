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
  Plus, 
  Search, 
  LayoutGrid, 
  List,
  Building2,
  MapPin,
  ExternalLink,
  Sparkles,
  Trash2,
  GripVertical,
  Loader2,
  ChevronDown,
  Briefcase,
  Calendar,
  Filter,
  Send,
  FileText
} from 'lucide-react';
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

const STATUSES = [
  { id: 'todo', label: 'À faire', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { id: 'applied', label: 'Postulé', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'interview', label: 'Entretien', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'offer', label: 'Offre', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'rejected', label: 'Refusé', color: 'bg-red-50 text-red-600 border-red-200' },
];

const TABS = [
  { id: 'all', label: 'Toutes' },
  { id: 'spontaneous', label: 'Spontanées' },
  { id: 'responses', label: 'Réponses à offres' },
  { id: 'drafts', label: 'Brouillons' },
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

const CandidaturesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
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
  }, []);

  const fetchData = async () => {
    try {
      const response = await applicationsAPI.getAll();
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Erreur lors du chargement des candidatures');
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
      toast.success('Candidature ajoutée avec succès !');
    } catch (error) {
      console.error('Error adding application:', error);
      toast.error('Erreur lors de l\'ajout de la candidature');
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
      if (selectedApp?.application_id === applicationId) {
        setSelectedApp(prev => ({ ...prev, status: newStatus }));
      }
      toast.success('Statut mis à jour');
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

    const overApp = applications.find(a => a.application_id === over.id);
    const targetStatus = overApp?.status || over.id;

    if (STATUSES.find(s => s.id === targetStatus) && activeApp.status !== targetStatus) {
      handleUpdateStatus(active.id, targetStatus);
    }
  };

  const handleCardClick = (app) => {
    setSelectedApp(app);
    setShowDetailModal(true);
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    // Search filter
    const matchesSearch = 
      app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tab filter
    let matchesTab = true;
    if (activeTab === 'spontaneous') {
      matchesTab = app.type === 'spontaneous';
    } else if (activeTab === 'responses') {
      matchesTab = app.type !== 'spontaneous';
    } else if (activeTab === 'drafts') {
      matchesTab = app.status === 'todo';
    }
    
    return matchesSearch && matchesTab;
  });

  const getApplicationsByStatus = (status) =>
    filteredApplications.filter(app => app.status === status);

  const headerActions = (
    <>
      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 w-64"
          data-testid="search-applications-input"
        />
      </div>

      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setViewMode('kanban')}
          className={`p-2 ${viewMode === 'kanban' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
          data-testid="kanban-view-btn"
          title="Vue Kanban"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
          data-testid="list-view-btn"
          title="Vue Liste"
        >
          <List className="w-5 h-5" />
        </button>
      </div>

      <Button 
        onClick={() => setShowAddModal(true)} 
        className="btn-primary"
        data-testid="add-candidature-btn"
      >
        <Plus className="w-5 h-5 mr-2" />
        <span className="hidden sm:inline">Ajouter</span>
      </Button>
    </>
  );

  if (loading) {
    return (
      <AppLayout title="Mes candidatures" headerActions={headerActions}>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Mes candidatures" headerActions={headerActions}>
      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white px-4 lg:px-8">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-100">
                {tab.id === 'all' 
                  ? applications.length 
                  : filteredApplications.filter(a => {
                      if (tab.id === 'spontaneous') return a.type === 'spontaneous';
                      if (tab.id === 'responses') return a.type !== 'spontaneous';
                      if (tab.id === 'drafts') return a.status === 'todo';
                      return true;
                    }).length
                }
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-8">
        {filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
              <Briefcase className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">
              {searchQuery ? 'Aucun résultat' : 'Aucune candidature'}
            </h2>
            <p className="text-slate-500 max-w-md mb-6">
              {searchQuery 
                ? `Aucune candidature ne correspond à "${searchQuery}"`
                : 'Commencez à postuler aux offres qui vous intéressent ou envoyez une candidature spontanée.'
              }
            </p>
            {!searchQuery && (
              <div className="flex gap-3">
                <Button onClick={() => setShowAddModal(true)} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une candidature
                </Button>
                <Button onClick={() => navigate('/offres')} variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Voir les offres
                </Button>
              </div>
            )}
          </div>
        ) : viewMode === 'kanban' ? (
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
          </div>
        )}
      </div>

      {/* Add Application Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
    </AppLayout>
  );
};

export default CandidaturesPage;
