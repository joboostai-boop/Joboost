import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentsAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import {
  Briefcase,
  Check,
  Sparkles,
  ArrowLeft,
  Loader2,
  CreditCard,
  Shield
} from 'lucide-react';

const PricingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0€',
      period: 'pour toujours',
      description: 'Parfait pour commencer votre recherche',
      features: [
        'Organisation illimitée des candidatures',
        'Vue Kanban et vue liste',
        'Profil Maître complet',
        '1 CV + 1 Lettre IA',
        '5 candidatures spontanées',
        'Notes et suivi'
      ],
      cta: user?.subscription_plan === 'free' ? 'Plan actuel' : 'Commencer gratuitement',
      highlighted: false,
      disabled: user?.subscription_plan === 'free'
    },
    {
      id: 'pro_monthly',
      name: 'Pro',
      price: '9,99€',
      period: '/mois',
      description: 'Pour les chercheurs actifs',
      features: [
        'Tout le plan Gratuit',
        '100 CV IA par mois',
        '100 Lettres IA par mois',
        '500 candidatures spontanées',
        'Export PDF premium',
        'Support prioritaire'
      ],
      cta: user?.subscription_plan === 'pro' ? 'Plan actuel' : 'Passer au Pro',
      highlighted: true,
      disabled: user?.subscription_plan === 'pro',
      badge: 'Recommandé'
    },
    {
      id: 'ultra_monthly',
      name: 'Ultra',
      price: '14,99€',
      period: '/mois',
      description: 'Pour les professionnels exigeants',
      savings: 'TOUT ILLIMITÉ',
      features: [
        'Tout le plan Pro',
        'CV IA ILLIMITÉS',
        'Lettres IA ILLIMITÉES',
        'Spontanées ILLIMITÉES',
        'Offres personnalisées prioritaires',
        'Support VIP'
      ],
      cta: user?.subscription_plan === 'ultra' ? 'Plan actuel' : 'Passer à Ultra',
      highlighted: false,
      disabled: user?.subscription_plan === 'ultra'
    }
  ];

  const handleSelectPlan = async (planId) => {
    if (planId === 'free') {
      if (!isAuthenticated) {
        navigate('/register');
      }
      return;
    }

    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    setLoadingPlan(planId);
    try {
      const originUrl = window.location.origin;
      const response = await paymentsAPI.createCheckout(planId, originUrl);
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la création du paiement');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-slate-900">Joboost</span>
            </Link>
            
            {isAuthenticated ? (
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au tableau de bord
              </Button>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login">
                  <Button variant="ghost">Connexion</Button>
                </Link>
                <Link to="/register">
                  <Button className="btn-primary">Commencer</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold text-slate-900 mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Commencez gratuitement et passez au Pro quand vous êtes prêt à booster votre recherche d'emploi.
          </p>
        </div>

        {/* Current Plan Badge */}
        {isAuthenticated && user?.subscription_plan && (
          <div className="text-center mb-8">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              user.subscription_plan === 'pro' 
                ? 'bg-sky-100 text-sky-700' 
                : 'bg-slate-100 text-slate-700'
            }`}>
              <Sparkles className="w-4 h-4" />
              Plan actuel: {user.subscription_plan === 'pro' ? 'Pro' : 'Gratuit'}
            </span>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 border-2 transition-all ${
                plan.highlighted
                  ? 'border-sky-500 bg-white shadow-xl shadow-sky-100 scale-105'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              
              {plan.savings && (
                <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {plan.savings}
                </span>
              )}
              
              <h3 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-slate-500 mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-500">{plan.period}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={plan.disabled || loadingPlan === plan.id}
                className={`w-full ${
                  plan.disabled
                    ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                    : plan.highlighted
                    ? 'btn-sky'
                    : 'btn-secondary'
                }`}
                data-testid={`select-plan-${plan.id}`}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  plan.cta
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-8 text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">Stripe & PayPal</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">Annulation facile</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-slate-900 text-center mb-8">
            Questions fréquentes
          </h2>
          
          <div className="space-y-4">
            {[
              {
                q: "Puis-je annuler mon abonnement à tout moment ?",
                a: "Oui, vous pouvez annuler votre abonnement Pro à tout moment. Vous conserverez l'accès jusqu'à la fin de votre période de facturation."
              },
              {
                q: "Qu'est-ce que la génération IA ?",
                a: "Notre IA analyse la description du poste et votre profil pour créer des lettres de motivation et CV personnalisés, adaptés à chaque candidature."
              },
              {
                q: "Mes données sont-elles sécurisées ?",
                a: "Absolument. Vos données sont chiffrées et stockées de manière sécurisée. Nous ne partageons jamais vos informations avec des tiers."
              },
              {
                q: "Puis-je essayer le Pro gratuitement ?",
                a: "Le plan gratuit inclut 1 génération IA pour vous permettre de tester la fonctionnalité avant de passer au Pro."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
