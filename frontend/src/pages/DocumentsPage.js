import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { 
  FileText, 
  Mail, 
  Search,
  Download,
  Trash2,
  MoreVertical,
  Calendar,
  Loader2,
  FolderOpen,
  Plus,
  LayoutGrid,
  List,
  Copy
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

const TABS = [
  { id: 'all', label: 'Tous', icon: FolderOpen },
  { id: 'cv', label: 'Mes CV', icon: FileText },
  { id: 'letters', label: 'Mes lettres', icon: Mail },
];

// Mock documents - En réalité, ces données viendraient d'une API
const MOCK_DOCUMENTS = [
  { id: '1', type: 'cv', name: 'CV Développeur Full Stack - Google', company: 'Google', created_at: '2024-01-15', template: 'modern' },
  { id: '2', type: 'letter', name: 'Lettre - Google Software Engineer', company: 'Google', created_at: '2024-01-15', style: 'professional' },
  { id: '3', type: 'cv', name: 'CV Tech Lead - Microsoft', company: 'Microsoft', created_at: '2024-01-10', template: 'tech' },
  { id: '4', type: 'letter', name: 'Lettre - Microsoft Tech Lead', company: 'Microsoft', created_at: '2024-01-10', style: 'dynamic' },
];

const DocumentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    // Simulated API call - replace with actual API
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDocuments(MOCK_DOCUMENTS);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (doc) => {
    toast.success(`Téléchargement de ${doc.name}...`);
    // TODO: Implement actual download
  };

  const handleDuplicate = (doc) => {
    const newDoc = { ...doc, id: Date.now().toString(), name: `${doc.name} (copie)`, created_at: new Date().toISOString() };
    setDocuments(prev => [newDoc, ...prev]);
    toast.success('Document dupliqué !');
  };

  const handleDelete = (doc) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${doc.name}" ?`)) return;
    setDocuments(prev => prev.filter(d => d.id !== doc.id));
    toast.success('Document supprimé');
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'cv' && doc.type === 'cv') ||
                       (activeTab === 'letters' && doc.type === 'letter');
    return matchesSearch && matchesTab;
  });

  const headerActions = (
    <>
      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 w-64"
          data-testid="search-documents-input"
        />
      </div>

      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
          title="Vue grille"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
          title="Vue liste"
        >
          <List className="w-5 h-5" />
        </button>
      </div>
    </>
  );

  if (loading) {
    return (
      <AppLayout title="Mes documents" headerActions={headerActions}>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Mes documents" headerActions={headerActions}>
      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white px-4 lg:px-8">
        <div className="flex gap-1 -mb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = tab.id === 'all' 
              ? documents.length 
              : documents.filter(d => d.type === (tab.id === 'cv' ? 'cv' : 'letter')).length;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-8">
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
              <FolderOpen className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">
              {searchQuery ? 'Aucun résultat' : 'Votre bibliothèque est vide'}
            </h2>
            <p className="text-slate-500 max-w-md mb-6">
              {searchQuery 
                ? `Aucun document ne correspond à "${searchQuery}"`
                : 'Créez votre premier CV professionnel en quelques clics.'
              }
            </p>
            {!searchQuery && (
              <div className="flex gap-3">
                <Button onClick={() => navigate('/creer-cv')} className="btn-primary">
                  <FileText className="w-4 h-4 mr-2" />
                  Créer un CV
                </Button>
                <Button onClick={() => navigate('/creer-lettre')} variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Créer une lettre
                </Button>
              </div>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all group"
              >
                {/* Document Preview */}
                <div className={`h-40 flex items-center justify-center ${
                  doc.type === 'cv' ? 'bg-sky-50' : 'bg-amber-50'
                }`}>
                  {doc.type === 'cv' ? (
                    <FileText className="w-16 h-16 text-sky-300" />
                  ) : (
                    <Mail className="w-16 h-16 text-amber-300" />
                  )}
                </div>
                
                {/* Document Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 truncate" title={doc.name}>
                        {doc.name}
                      </h3>
                      <p className="text-sm text-slate-500">{doc.company}</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(doc)}>
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(doc)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(doc)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Document</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Entreprise</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          doc.type === 'cv' ? 'bg-sky-100' : 'bg-amber-100'
                        }`}>
                          {doc.type === 'cv' ? (
                            <FileText className="w-5 h-5 text-sky-600" />
                          ) : (
                            <Mail className="w-5 h-5 text-amber-600" />
                          )}
                        </div>
                        <span className="font-medium text-slate-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{doc.company}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`badge-status ${doc.type === 'cv' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'}`}>
                        {doc.type === 'cv' ? 'CV' : 'Lettre'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 hidden lg:table-cell">
                      {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(doc)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Floating action button */}
        {filteredDocuments.length > 0 && (
          <div className="fixed bottom-6 right-6 flex gap-2">
            <Button onClick={() => navigate('/creer-cv')} className="btn-primary shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau CV
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DocumentsPage;
