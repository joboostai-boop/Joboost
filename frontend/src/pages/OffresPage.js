import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import OfferCard from '../components/OfferCard';
import { Sparkles, Loader2, Search, Filter, MapPin } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const OffresPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredOffers = offers.filter(offer => 
    (offer.title || offer.intitule || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (offer.company || offer.entreprise?.nom || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-xl lg:text-2xl font-bold text-slate-900">
                  Offres personnalisées
                </h1>
                <p className="text-sm text-slate-500">Basées sur votre profil et vos compétences</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
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
              <Sparkles className="w-16 h-16 text-slate-300 mb-4" />
              <h2 className="text-xl font-semibold text-slate-700 mb-2">Aucune offre trouvée</h2>
              <p className="text-slate-500 max-w-md">
                Complétez votre profil pour recevoir des offres personnalisées correspondant à vos compétences.
              </p>
              <Button onClick={() => navigate('/profile')} className="mt-4 btn-primary">
                Compléter mon profil
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredOffers.map((offer, index) => (
                <OfferCard key={offer.id || index} offer={offer} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OffresPage;
