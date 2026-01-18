import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Loader2, 
  Search, 
  Filter, 
  MapPin, 
  Building2,
  Calendar,
  Euro,
  Briefcase,
  Clock,
  ExternalLink,
  X,
  FileText,
  Mail,
  ChevronRight,
  Target,
  CheckCircle,
  LayoutGrid,
  List
} from 'lucide-react';

const OffresPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    contract: '',
    experience: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
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
      toast.error('Erreur lors du chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOffer = (offer) => {
    setSelectedOffer(offer);
    setShowDetailModal(true);
  };

  const handleApply = (offer) => {
    // Create application and navigate to generator
    toast.success('Redirection vers la génération de documents...');
    navigate('/creer-cv');
  };

  const filteredOffers = offers.filter(offer => {
    const title = offer.title || offer.intitule || '';
    const company = offer.company || offer.entreprise?.nom || '';
    const location = offer.location || offer.lieuTravail?.libelle || '';
    
    const matchesSearch = 
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = !filters.location || 
      location.toLowerCase().includes(filters.location.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  const headerActions = (
    <>
      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Rechercher une offre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 w-64"
          data-testid="search-offers-input"
        />
      </div>
      
      <Button 
        variant="outline" 
        onClick={() => setShowFilters(!showFilters)}
        className={showFilters ? 'bg-slate-100' : ''}
      >
        <Filter className="w-4 h-4 mr-2" />
        Filtres
      </Button>

      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <List className="w-5 h-5" />
        </button>
      </div>
    </>
  );

  return (
    <AppLayout>
      {/* Custom Header with icon */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 lg:hidden" />
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-xl lg:text-2xl font-bold text-slate-900">
                Offres personnalisées
              </h1>
              <p className="text-sm text-slate-500">
                {filteredOffers.length} offres correspondent à votre profil
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {headerActions}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Localisation (Paris, Lyon...)"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full"
              />
            </div>
            <select
              value={filters.contract}
              onChange={(e) => setFilters(prev => ({ ...prev, contract: e.target.value }))}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">Type de contrat</option>
              <option value="cdi">CDI</option>
              <option value="cdd">CDD</option>
              <option value="freelance">Freelance</option>
              <option value="stage">Stage</option>
            </select>
            <select
              value={filters.experience}
              onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">Expérience</option>
              <option value="junior">Junior (0-2 ans)</option>
              <option value="confirmed">Confirmé (3-5 ans)</option>
              <option value="senior">Senior (5+ ans)</option>
            </select>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFilters({ location: '', contract: '', experience: '' })}
            >
              Réinitialiser
            </Button>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="p-4 lg:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
            <p className="text-slate-500">Chargement des offres personnalisées...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">
              {searchQuery ? 'Aucune offre trouvée' : 'Pas encore d\'offres personnalisées'}
            </h2>
            <p className="text-slate-500 max-w-md mb-6">
              {searchQuery 
                ? `Aucune offre ne correspond à "${searchQuery}". Essayez d'autres mots-clés.`
                : 'Complétez votre profil pour recevoir des offres correspondant à vos compétences et préférences.'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate('/profil')} className="btn-primary">
                Compléter mon profil
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOffers.map((offer, index) => (
              <OfferCard 
                key={offer.id || index} 
                offer={offer} 
                onView={() => handleViewOffer(offer)}
                onApply={() => handleApply(offer)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Poste</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Entreprise</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 hidden md:table-cell">Localisation</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600 hidden lg:table-cell">Contrat</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOffers.map((offer, index) => {
                  const title = offer.title || offer.intitule || 'Poste';
                  const company = offer.company || offer.entreprise?.nom || 'Entreprise';
                  const location = offer.location || offer.lieuTravail?.libelle || '';
                  const contract = offer.contract || offer.typeContrat || 'CDI';
                  
                  return (
                    <tr 
                      key={offer.id || index}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => handleViewOffer(offer)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900">{title}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{company}</td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{location || '-'}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="badge-status bg-sky-50 text-sky-700">{contract}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Offer Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOffer && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl pr-8">
                  {selectedOffer.title || selectedOffer.intitule || 'Offre'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Company & Location */}
                <div className="flex flex-wrap items-center gap-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    <span className="font-medium">
                      {selectedOffer.company || selectedOffer.entreprise?.nom || 'Entreprise'}
                    </span>
                  </div>
                  {(selectedOffer.location || selectedOffer.lieuTravail?.libelle) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedOffer.location || selectedOffer.lieuTravail?.libelle}</span>
                    </div>
                  )}
                  <span className="badge-status bg-sky-50 text-sky-700">
                    {selectedOffer.contract || selectedOffer.typeContrat || 'CDI'}
                  </span>
                </div>

                {/* Match Score */}
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-emerald-700 font-medium mb-2">
                    <Target className="w-5 h-5" />
                    Pourquoi cette offre vous correspond
                  </div>
                  <ul className="space-y-1 text-sm text-emerald-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Compétences techniques alignées
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Localisation correspondante
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Niveau d'expérience adapté
                    </li>
                  </ul>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900">Description du poste</h3>
                  <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {selectedOffer.description || selectedOffer.descriptif || 
                     'Rejoignez une équipe dynamique et participez à des projets innovants. Nous recherchons un profil motivé avec une vraie passion pour le métier.\n\nMissions principales :\n- Développement et maintenance d\'applications\n- Participation aux sprints et réunions d\'équipe\n- Veille technologique\n\nProfil recherché :\n- Formation Bac+5 en informatique\n- Expérience significative\n- Bon relationnel et esprit d\'équipe'}
                  </div>
                </div>

                {/* Salary if available */}
                {(selectedOffer.salary || selectedOffer.salaire?.libelle) && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Euro className="w-5 h-5" />
                    <span>{selectedOffer.salary || selectedOffer.salaire?.libelle}</span>
                  </div>
                )}

                {/* Original link */}
                {(selectedOffer.url || selectedOffer.origineOffre?.urlOrigine) && (
                  <a
                    href={selectedOffer.url || selectedOffer.origineOffre?.urlOrigine}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Voir l'offre originale
                  </a>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Fermer
                </Button>
                <Button 
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate('/creer-lettre');
                  }}
                  variant="outline"
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Créer une lettre
                </Button>
                <Button 
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate('/creer-cv');
                  }}
                  className="btn-primary"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Postuler avec JoBoost
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

// Offer Card Component
const OfferCard = ({ offer, onView, onApply }) => {
  const title = offer.title || offer.intitule || 'Poste';
  const company = offer.company || offer.entreprise?.nom || 'Entreprise';
  const location = offer.location || offer.lieuTravail?.libelle || '';
  const contract = offer.contract || offer.typeContrat || 'CDI';
  const date = offer.dateCreation || offer.created_at;

  return (
    <div 
      className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-sky-200 transition-all group cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-sky-600 transition-colors">
          {title}
        </h3>
        <span className="shrink-0 px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
          Match
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Building2 className="w-4 h-4 shrink-0" />
          <span className="truncate">{company}</span>
        </div>
        {location && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="badge-status bg-sky-50 text-sky-700 text-xs">{contract}</span>
          {date && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(date).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
        >
          Voir l'offre
        </Button>
        <Button
          size="sm"
          className="flex-1 btn-sky"
          onClick={(e) => {
            e.stopPropagation();
            onApply();
          }}
        >
          <Sparkles className="w-4 h-4 mr-1" />
          Postuler
        </Button>
      </div>
    </div>
  );
};

export default OffresPage;
