import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { MarqueeLogos } from '../components/MarqueeLogos';
import { 
  Briefcase, 
  FileText, 
  BarChart3, 
  Sparkles, 
  Check,
  ArrowRight,
  LayoutGrid,
  Target,
  Zap
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <LayoutGrid className="w-6 h-6" />,
      title: "Vue Kanban intuitive",
      description: "Organisez vos candidatures avec un tableau de bord visuel de type drag & drop."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Profil Maître unique",
      description: "Saisissez vos informations une seule fois. Réutilisez-les pour chaque candidature."
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Génération IA Premium",
      description: "CV et lettres de motivation personnalisés, adaptés à chaque offre d'emploi."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Suivi précis",
      description: "Ne perdez plus jamais de vue une opportunité. Deadlines, notes, historique."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Statistiques claires",
      description: "Analysez votre taux de réponse et optimisez votre stratégie de recherche."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Export PDF",
      description: "Exportez vos documents générés en PDF professionnel en un clic."
    }
  ];

  const plans = [
    {
      name: "Gratuit",
      price: "0€",
      period: "pour toujours",
      description: "Parfait pour commencer",
      features: [
        "Organisation illimitée des candidatures",
        "Vue Kanban et liste",
        "Profil Maître complet",
        "1 génération IA offerte",
        "Notes et suivi"
      ],
      cta: "Commencer gratuitement",
      highlighted: false
    },
    {
      name: "Pro",
      price: "9,99€",
      period: "/mois",
      description: "Pour les chercheurs d'emploi actifs",
      features: [
        "Tout le plan Gratuit",
        "Générations IA illimitées",
        "Export PDF premium",
        "Support prioritaire",
        "Statistiques avancées"
      ],
      cta: "Passer au Pro",
      highlighted: true
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-slate-900">Joboost</span>
            </Link>
            
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button className="btn-primary" data-testid="go-to-dashboard-btn">
                    Tableau de bord
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900" data-testid="login-link">
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="btn-primary" data-testid="register-btn">
                      Commencer
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6">
              Votre recherche d'emploi,{' '}
              <span className="text-sky-500">organisée et optimisée</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
              Joboost est votre CRM de carrière personnel. Centralisez vos candidatures, 
              générez des documents percutants avec l'IA, et décrochez le poste de vos rêves.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button className="btn-primary text-lg px-8 py-3" data-testid="hero-cta-btn">
                  Créer mon compte gratuit
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="#features" className="text-slate-600 hover:text-slate-900 font-medium">
                En savoir plus
              </Link>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="p-6 grid grid-cols-4 gap-4">
                {['À faire', 'Postulé', 'Entretien', 'Offre'].map((col, i) => (
                  <div key={col} className="bg-white rounded-lg p-4 border border-slate-200">
                    <h3 className="font-semibold text-slate-700 mb-3">{col}</h3>
                    {[...Array(i === 1 ? 3 : i === 2 ? 2 : 1)].map((_, j) => (
                      <div key={j} className="bg-slate-50 rounded p-3 mb-2 border border-slate-100">
                        <div className="h-3 bg-slate-200 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-slate-100 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Des outils puissants pour organiser, optimiser et réussir votre recherche d'emploi.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-slate-100 hover:border-sky-200 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center text-sky-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Tarification simple et transparente
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Commencez gratuitement, passez au Pro quand vous êtes prêt.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 border-2 transition-all ${
                  plan.highlighted
                    ? 'border-sky-500 bg-white shadow-xl shadow-sky-100'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {plan.highlighted && (
                  <span className="inline-block bg-sky-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    Recommandé
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
                    <li key={i} className="flex items-center gap-3 text-slate-600">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to={isAuthenticated ? "/pricing" : "/register"}>
                  <Button
                    className={`w-full ${plan.highlighted ? 'btn-sky' : 'btn-secondary'}`}
                    data-testid={`pricing-${plan.name.toLowerCase()}-btn`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            Prêt à booster votre recherche d'emploi ?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Rejoignez des milliers de chercheurs d'emploi qui ont optimisé leur stratégie avec Joboost.
          </p>
          <Link to="/register">
            <Button className="btn-sky text-lg px-8 py-3" data-testid="cta-bottom-btn">
              Créer mon compte gratuit
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-slate-900">Joboost</span>
            </div>
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Joboost. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
