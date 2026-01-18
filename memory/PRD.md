# JoBoost - Product Requirements Document

## Overview
JoBoost est une plateforme SaaS "Production-Ready" pour l'organisation de la recherche d'emploi sur le marché français. L'application est positionnée comme un "CRM de Carrière" haut de gamme, avec une interface rassurante, ultra-organisée et responsive.

## Target User
**Ismael Elasri** (eismael.pro@gmail.com), candidat en recherche d'emploi IT à Paris.

## Tech Stack
- **Frontend**: React, React Router, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI, Python
- **Database**: MongoDB
- **Authentication**: JWT, Google OAuth (Emergent-managed)
- **AI**: Emergent LLM Key (GPT-5.2 pour génération CV/Lettres)
- **Payments**: Stripe (clé test)
- **Job API**: France Travail (OAuth2)

---

## Implemented Features (as of January 18, 2025)

### ✅ Phase 1: Architecture de Navigation (COMPLETED)
Date: January 18, 2025

#### 1.1 Sidebar Navigation Refactorée
- Ordre logique des items : Dashboard → Offres → Candidatures → Créer CV → Créer Lettre → Documents → Profil → Tarifs → Paramètres
- Badge "IA" sur les offres personnalisées
- État actif avec barre bleue à gauche
- Section utilisateur en bas avec déconnexion
- Responsive mobile avec menu burger

#### 1.2 Routes Unifiées (kebab-case français)
| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | DashboardPage | Vue d'ensemble |
| `/offres` | OffresPage | Offres personnalisées |
| `/candidatures` | CandidaturesPage | Mes candidatures |
| `/creer-cv` | GenerateCVPage | Créer un CV |
| `/creer-lettre` | GenerateLetterPage | Créer une lettre |
| `/documents` | DocumentsPage | Mes documents |
| `/profil` | ProfilePage | Mon profil |
| `/tarifs` | PricingPage | Plans & Tarifs |
| `/parametres` | SettingsPage | Paramètres |

#### 1.3 Redirections Legacy
- `/profile` → `/profil`
- `/settings` → `/parametres`
- `/spontaneous` → `/candidatures`
- `/generer` → `/creer-cv`

### ✅ Phase 2: Dashboard Refactorisé
- Message d'accueil personnalisé avec heure (Bonjour/Bon après-midi/Bonsoir)
- Stats cards : Total, À faire, Postulé, Entretien
- Crédits IA affichés (CV, Lettres, Spontanées)
- Actions rapides (4 boutons)
- Preview des offres personnalisées
- Candidatures récentes
- Barre de progression du profil

### ✅ Phase 3: Page Candidatures
- 4 onglets : Toutes, Spontanées, Réponses à offres, Brouillons
- Vue Kanban avec drag-and-drop
- Vue Liste tabulaire
- Modal d'ajout de candidature
- Modal de détail avec changement de statut
- États vides avec CTA

### ✅ Phase 4: Pages Créer CV/Lettre
- Flow en 2 étapes (Template/Style → Offre)
- 4 templates CV : Moderne, Classique, Créatif, Tech
- 4 styles Lettre : Professionnel, Dynamique, Créatif, Concis
- Affichage des crédits disponibles
- Modal d'ajout de nouvelle candidature

### ✅ Phase 5: Profile & Settings avec Sidebar
- ProfilePage avec sidebar intégrée
- 5 sections collapsibles (Info, Expériences, Formation, Compétences, Langues)
- Barre de complétion du profil
- SettingsPage avec sections Compte, Abonnement, Sécurité, Notifications

### ✅ Phase 6: Page Offres Améliorée
- Header avec icône et compteur
- Filtres (localisation, contrat, expérience)
- Vue grille et liste
- Modal de détail d'offre
- Score de matching affiché

### ✅ Phase 7: Page Documents
- 3 onglets : Tous, Mes CV, Mes lettres
- Vue grille et liste
- Actions : Télécharger, Dupliquer, Supprimer

---

## Authentication
- ✅ JWT-based custom auth (email/password)
- ✅ Emergent-managed Google OAuth
- ⏳ LinkedIn OAuth (planned)

## Payments
- ✅ Stripe integration (test key)
- ⏳ PayPal (planned)

## AI Features
- ✅ CV Generation with AI (Emergent LLM Key)
- ✅ Cover Letter Generation with AI
- ⏳ ATS Score Check (planned)

---

## Backlog / Upcoming Tasks

### P1 - High Priority
- [ ] Intégrer PayPal comme option de paiement
- [ ] Implémenter l'authentification OAuth avec LinkedIn
- [ ] Export PDF du contenu généré par l'IA

### P2 - Medium Priority
- [ ] Flux de réinitialisation de mot de passe
- [ ] Configurer CORS proprement côté backend (withCredentials)
- [ ] Vérifier et corriger la persistance de session au rechargement
- [ ] Refactoriser server.py en plusieurs routeurs

### P3 - Low Priority
- [ ] Renforcement de la sécurité (CSRF)
- [ ] Onboarding guidé pour nouveaux utilisateurs
- [ ] Banner RGPD / Gestion des cookies
- [ ] Pages CGU et Politique de confidentialité

---

## Known Issues
1. **CORS Workaround**: `withCredentials: true` a été supprimé de la config axios pour contourner un problème CORS. Solution propre à implémenter.
2. **Session Persistence**: À vérifier si l'utilisateur reste connecté après un rechargement de page.

---

## Test Credentials
- Email: `audituser2@test.com`
- Password: `TestPass123!`

---

## File Structure
```
/app/
├── backend/
│   ├── lib/
│   ├── .env
│   ├── requirements.txt
│   └── server.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppLayout.js (NEW)
│   │   │   ├── Sidebar.js
│   │   │   ├── Logo.js
│   │   │   ├── LoadingScreen.js
│   │   │   ├── ConfirmModal.js
│   │   │   └── ProgressChart.js
│   │   ├── pages/
│   │   │   ├── DashboardPage.js (REFACTORED)
│   │   │   ├── CandidaturesPage.js (NEW)
│   │   │   ├── OffresPage.js (REFACTORED)
│   │   │   ├── GenerateCVPage.js (NEW)
│   │   │   ├── GenerateLetterPage.js (NEW)
│   │   │   ├── DocumentsPage.js (NEW)
│   │   │   ├── ProfilePage.js (REFACTORED)
│   │   │   ├── SettingsPage.js (REFACTORED)
│   │   │   └── ...
│   │   ├── App.js (REFACTORED)
│   │   └── index.css
└── memory/
    └── PRD.md
```
