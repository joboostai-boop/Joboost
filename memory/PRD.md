# Joboost - Product Requirements Document

## Original Problem Statement
Plateforme SaaS professionnelle d'organisation de recherche d'emploi pour le marché français - "CRM de Carrière" haut de gamme.

## Architecture
- **Backend**: FastAPI (Python) avec MongoDB
- **Frontend**: React avec Tailwind CSS, Shadcn UI
- **Auth**: JWT + Google OAuth (Emergent-managed)
- **AI**: OpenAI GPT-4o via Emergent LLM key
- **Payments**: Stripe
- **External APIs**: France Travail (OAuth2)

## User Personas
1. **Chercheurs d'emploi français** - Organisation méthodique
2. **Professionnels en reconversion** - Besoin de CV/lettres adaptés
3. **Jeunes diplômés** - Premier emploi

## Core Requirements (Static)
- Interface 100% en français
- Style Notion-like / Linear épuré
- Mobile-First responsive
- Mode Focus pour rédaction documents
- Export PDF côté client

## What's Been Implemented

### Phase 1 - MVP (2025-01-11)
- ✅ Authentication JWT + Google OAuth
- ✅ Master Profile / CV Builder (wizard multi-étapes)
- ✅ Job Tracker (Kanban drag-and-drop + vue liste)
- ✅ Générateur IA CV & Lettres de motivation
- ✅ Système de paiement Stripe
- ✅ Export PDF côté client

### Phase 2 - Nouvelles fonctionnalités (2025-01-11)
- ✅ Candidatures spontanées (France Travail API)
- ✅ Offres personnalisées (France Travail API + scoring)
- ✅ 3 Plans (Gratuit/Pro/Ultra) avec crédits séparés
- ✅ Graphique de progression (Chart.js)

### Phase 3 - Branding & UX (2026-01-17)
- ✅ Intégration du logo Joboost partout dans l'app
  - Header/Navbar (Landing, Dashboard, Auth pages)
  - Hero section (Landing page)
  - Sidebar (Dashboard)
  - Footer
  - Pages de paiement (succès/erreur)
  - Onboarding
- ✅ Favicon et métadonnées OG pour partage social
- ✅ Responsive logo sizing (mobile/tablet/desktop)
- ✅ Animation fade-in sur le hero logo

## Prioritized Backlog

### P0 - Critical
- [ ] PayPal intégration (alternative paiement)

### P1 - High Priority  
- [ ] LinkedIn OAuth
- [ ] Notifications email deadlines
- [ ] Mode Focus amélioré pour rédaction

### P2 - Medium Priority
- [ ] Statistiques avancées
- [ ] Import CV existant
- [ ] Partage de profil public

## Files Structure
```
/app/backend/
├── server.py (main API)
├── lib/
│   ├── labonneboite.py (spontaneous search)
│   └── jobs_api.py (job recommendations)
└── .env

/app/frontend/src/
├── pages/ (10 pages)
├── components/
│   ├── ui/ (Shadcn)
│   ├── OfferCard.js
│   └── ProgressChart.js
├── context/AuthContext.js
└── lib/api.js
```

## Environment Variables
```
MONGO_URL, DB_NAME, JWT_SECRET
EMERGENT_LLM_KEY, STRIPE_API_KEY
LABONNEBOITE_API_KEY (optional)
JOOBLE_API_KEY (optional)
```
