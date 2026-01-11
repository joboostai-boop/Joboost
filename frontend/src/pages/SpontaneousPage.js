import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Briefcase,
  Search,
  Building2,
  MapPin,
  ExternalLink,
  Send,
  Loader2,
  CheckCircle,
  Users,
  TrendingUp
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SpontaneousPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [location, setLocation] = useState('');
  const [sector, setSector] = useState('M1805');
  const [radius, setRadius] = useState(10);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searched, setSearched] = useState(false);

  const sectors = [
    { code: 'M1805', label: 'Développement informatique' },
    { code: 'M1607', label: 'Secrétariat / Assistanat' },
    { code: 'M1802', label: 'Expertise technique' },
    { code: 'E1101', label: 'Animation de site web' },
    { code: 'H1206', label: 'Management de projet' },
    { code: 'M1806', label: 'Conseil en organisation' },
  ];

  const handleSearch = async () => {
    if (!location.trim()) {
      toast.error('Veuillez entrer une ville');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const token = localStorage.getItem('joboost_token');
      const response = await fetch(`${API}/spontaneous/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ location, rome: sector, radius })
      });

      if (!response.ok) throw new Error('Erreur lors de la recherche');
      
      const data = await response.json();
      setCompanies(data.companies || []);
      setSelectedCompanies([]);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const toggleCompany = (companyId) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleSendApplications = async () => {
    if (selectedCompanies.length === 0) {
      toast.error('Sélectionnez au moins une entreprise');
      return;
    }

    if ((user?.spontaneous_credits || 0) < selectedCompanies.length) {
      toast.error('Crédits insuffisants. Passez au plan supérieur.');
      navigate('/pricing');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('joboost_token');
      const response = await fetch(`${API}/spontaneous/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ company_ids: selectedCompanies })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Erreur lors de l\'envoi');
      }

      toast.success(`${selectedCompanies.length} candidature(s) spontanée(s) envoyée(s) !`);
      setSelectedCompanies([]);
    } catch (error) {
      console.error('Send error:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-heading text-xl font-bold text-slate-900">
                Candidatures spontanées
              </h1>
              <p className="text-sm text-slate-500">
                Trouvez des entreprises qui recrutent dans votre secteur
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              Crédits: <span className="font-semibold text-sky-500">{user?.spontaneous_credits || 0}</span>
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-8 px-4 lg:px-8">
        {/* Search Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="font-heading text-lg font-semibold text-slate-900 mb-4">
            Rechercher des entreprises
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input
                placeholder="Paris, Lyon, Marseille..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                data-testid="spontaneous-location-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Secteur d'activité</Label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
              >
                {sectors.map(s => (
                  <option key={s.code} value={s.code}>{s.label}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Rayon (km)</Label>
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="w-full btn-primary"
                data-testid="search-companies-btn"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Rechercher
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <>
            {/* Selected Actions */}
            {selectedCompanies.length > 0 && (
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                <span className="text-sky-700">
                  <CheckCircle className="w-5 h-5 inline mr-2" />
                  {selectedCompanies.length} entreprise(s) sélectionnée(s)
                </span>
                <Button
                  onClick={handleSendApplications}
                  disabled={sending}
                  className="btn-sky"
                  data-testid="send-spontaneous-btn"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  Envoyer les candidatures
                </Button>
              </div>
            )}

            {/* Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all ${
                    selectedCompanies.includes(company.id)
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 hover:border-sky-200'
                  }`}
                  onClick={() => toggleCompany(company.id)}
                  data-testid={`company-card-${company.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{company.name}</h3>
                        <p className="text-sm text-slate-500">{company.sector}</p>
                      </div>
                    </div>
                    {selectedCompanies.includes(company.id) && (
                      <CheckCircle className="w-5 h-5 text-sky-500" />
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{company.address || company.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{company.headcount} employés</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Score embauche: <strong className="text-emerald-600">{company.hiring_score}%</strong></span>
                    </div>
                  </div>
                  
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-sm text-sky-500 hover:text-sky-600 mt-3"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Voir le site
                    </a>
                  )}
                </div>
              ))}
            </div>

            {companies.length === 0 && !loading && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Aucune entreprise trouvée pour cette recherche</p>
              </div>
            )}
          </>
        )}

        {!searched && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-sky-500" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">
              Recherchez des entreprises
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Entrez une ville et un secteur d'activité pour découvrir les entreprises 
              susceptibles de recruter dans votre domaine.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpontaneousPage;
