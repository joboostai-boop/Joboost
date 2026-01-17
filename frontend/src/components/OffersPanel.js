import React from 'react';
import { Sparkles, Building2, MapPin, Flame, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

/**
 * Panneau latéral des offres personnalisées
 * Affiche une liste scrollable d'offres basées sur le profil utilisateur
 */
const OffersPanel = ({ offers, loading, selectedOffer, onSelectOffer }) => {
  const getMatchColor = (score) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  const getMatchLabel = (score) => {
    if (score >= 70) return 'Match élevé';
    if (score >= 50) return 'Match moyen';
    return 'Match faible';
  };

  return (
    <aside className="hidden xl:flex flex-col w-[340px] bg-slate-50 border-r border-slate-200 h-screen sticky top-0">
      {/* Panel Header */}
      <div className="p-5 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-sky-500" />
          <h2 className="font-heading font-semibold text-slate-900 text-lg">
            Offres personnalisées
          </h2>
        </div>
        <p className="text-sm text-slate-500">Basées sur votre profil</p>
      </div>

      {/* Offers List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Chargement des offres...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Sparkles className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm text-center">
              Complétez votre profil pour recevoir des offres personnalisées
            </p>
          </div>
        ) : (
          offers.map((offer, index) => (
            <div
              key={offer.id || index}
              onClick={() => onSelectOffer && onSelectOffer(offer)}
              className={`
                bg-white rounded-xl border p-4 cursor-pointer transition-all duration-200
                hover:shadow-md hover:-translate-y-0.5
                ${selectedOffer?.id === offer.id 
                  ? 'border-sky-500 ring-2 ring-sky-100 shadow-md' 
                  : 'border-slate-200 hover:border-slate-300'
                }
              `}
              data-testid={`offer-card-${index}`}
            >
              {/* Offer Header */}
              <div className="flex justify-between items-start gap-2 mb-3">
                <h3 className="font-medium text-slate-900 text-sm leading-tight line-clamp-2">
                  {offer.title || offer.intitule}
                </h3>
                <span className="shrink-0 bg-sky-100 text-sky-700 px-2 py-0.5 rounded text-xs font-medium">
                  France Travail
                </span>
              </div>

              {/* Company */}
              <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
                <Building2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{offer.company || offer.entreprise?.nom || 'Entreprise'}</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{offer.location || offer.lieuTravail?.libelle || 'France'}</span>
              </div>

              {/* Match Score */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-slate-500">{getMatchLabel(offer.match_score || 50)}</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${getMatchColor(offer.match_score || 50)}`}
                    style={{ width: `${offer.match_score || 50}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {offer.match_score || 50}%
                </span>
              </div>

              {/* Salary if available */}
              {(offer.salary || offer.salaire?.libelle) && (
                <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-2 rounded-lg text-xs mb-3">
                  <Flame className="w-4 h-4 shrink-0" />
                  <span className="line-clamp-1">{offer.salary || offer.salaire?.libelle}</span>
                </div>
              )}

              {/* Action Button */}
              <a
                href={offer.url || offer.origineOffre?.urlOrigine || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm h-9">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir l'offre
                </Button>
              </a>
            </div>
          ))
        )}
      </div>

      {/* Panel Footer */}
      {offers.length > 0 && (
        <div className="p-4 border-t border-slate-200 bg-white">
          <p className="text-xs text-slate-400 text-center">
            {offers.length} offre{offers.length > 1 ? 's' : ''} trouvée{offers.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </aside>
  );
};

export default OffersPanel;
