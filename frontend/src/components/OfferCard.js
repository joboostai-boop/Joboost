import React from 'react';
import { Button } from './ui/button';
import { ExternalLink, Building2, MapPin, Briefcase } from 'lucide-react';

const OfferCard = ({ offer }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-sky-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent match';
    if (score >= 60) return 'Bon match';
    if (score >= 40) return 'Match moyen';
    return 'À explorer';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-sky-200 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
            {offer.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <Building2 className="w-4 h-4" />
            <span>{offer.company}</span>
          </div>
        </div>
        <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
          {offer.source}
        </span>
      </div>

      {/* Location */}
      {offer.location && (
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <MapPin className="w-4 h-4" />
          <span>{offer.location}</span>
        </div>
      )}

      {/* Match Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-slate-600">{getScoreLabel(offer.match_score)}</span>
          <span className="font-semibold text-slate-900">{offer.match_score}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getScoreColor(offer.match_score)} transition-all`}
            style={{ width: `${offer.match_score}%` }}
          />
        </div>
      </div>

      {/* Salary if available */}
      {offer.salary && (
        <div className="text-sm text-slate-600 mb-3">
          💰 {offer.salary}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => window.open(offer.url, '_blank')}
          className="flex-1 btn-secondary text-sm"
          data-testid={`view-offer-${offer.title.substring(0, 10)}`}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Voir l'offre
        </Button>
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-sky-500"
          onClick={() => {/* TODO: Save to applications */}}
        >
          <Briefcase className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default OfferCard;
