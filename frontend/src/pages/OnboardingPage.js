import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import Logo from '../components/Logo';
import { 
  Briefcase, 
  User, 
  GraduationCap, 
  Wrench, 
  Globe,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Loader2,
  Check
} from 'lucide-react';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    title: '',
    summary: '',
    phone: '',
    location: '',
    linkedin_url: '',
    portfolio_url: '',
    experiences: [],
    education: [],
    skills: [],
    languages: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState({ name: '', level: 'Intermédiaire' });

  const steps = [
    { id: 'info', title: 'Informations', icon: <User className="w-5 h-5" /> },
    { id: 'experience', title: 'Expériences', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'education', title: 'Formation', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'skills', title: 'Compétences', icon: <Wrench className="w-5 h-5" /> },
    { id: 'languages', title: 'Langues', icon: <Globe className="w-5 h-5" /> },
  ];

  const addExperience = () => {
    setProfile(prev => ({
      ...prev,
      experiences: [...prev.experiences, {
        id: Date.now().toString(),
        title: '',
        company: '',
        start_date: '',
        end_date: '',
        current: false,
        description: ''
      }]
    }));
  };

  const updateExperience = (index, field, value) => {
    setProfile(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index) => {
    setProfile(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now().toString(),
        degree: '',
        institution: '',
        start_date: '',
        end_date: '',
        description: ''
      }]
    }));
  };

  const updateEducation = (index, field, value) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.name.trim()) {
      setProfile(prev => ({
        ...prev,
        languages: [...prev.languages, { ...newLanguage, name: newLanguage.name.trim() }]
      }));
      setNewLanguage({ name: '', level: 'Intermédiaire' });
    }
  };

  const removeLanguage = (index) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await profileAPI.save({
        ...profile,
        user_id: user?.user_id
      });
      
      updateUser({ onboarding_completed: true });
      toast.success('Profil enregistré avec succès !');
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile save error:', error);
      toast.error('Erreur lors de l\'enregistrement du profil');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'info':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Titre professionnel</Label>
              <Input
                placeholder="Ex: Développeur Full Stack, Chef de projet..."
                value={profile.title}
                onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                data-testid="profile-title-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Résumé professionnel</Label>
              <Textarea
                placeholder="Décrivez brièvement votre parcours et vos objectifs professionnels..."
                value={profile.summary}
                onChange={(e) => setProfile(prev => ({ ...prev, summary: e.target.value }))}
                rows={4}
                data-testid="profile-summary-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  placeholder="+33 6 12 34 56 78"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  data-testid="profile-phone-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Localisation</Label>
                <Input
                  placeholder="Paris, France"
                  value={profile.location}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  data-testid="profile-location-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  placeholder="https://linkedin.com/in/..."
                  value={profile.linkedin_url}
                  onChange={(e) => setProfile(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  data-testid="profile-linkedin-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Portfolio / Site web</Label>
                <Input
                  placeholder="https://..."
                  value={profile.portfolio_url}
                  onChange={(e) => setProfile(prev => ({ ...prev, portfolio_url: e.target.value }))}
                  data-testid="profile-portfolio-input"
                />
              </div>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-6">
            {profile.experiences.map((exp, index) => (
              <div key={exp.id} className="p-4 border border-slate-200 rounded-lg space-y-4 bg-white">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">Expérience {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Poste</Label>
                    <Input
                      placeholder="Développeur Web"
                      value={exp.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Entreprise</Label>
                    <Input
                      placeholder="Nom de l'entreprise"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date de début</Label>
                    <Input
                      type="month"
                      value={exp.start_date}
                      onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de fin</Label>
                    <Input
                      type="month"
                      value={exp.end_date}
                      onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                      disabled={exp.current}
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      Poste actuel
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Décrivez vos responsabilités et réalisations..."
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addExperience}
              className="w-full border-dashed"
              data-testid="add-experience-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une expérience
            </Button>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-6">
            {profile.education.map((edu, index) => (
              <div key={edu.id} className="p-4 border border-slate-200 rounded-lg space-y-4 bg-white">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">Formation {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Diplôme</Label>
                    <Input
                      placeholder="Master en..."
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Établissement</Label>
                    <Input
                      placeholder="Université de..."
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date de début</Label>
                    <Input
                      type="month"
                      value={edu.start_date}
                      onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de fin</Label>
                    <Input
                      type="month"
                      value={edu.end_date}
                      onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addEducation}
              className="w-full border-dashed"
              data-testid="add-education-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une formation
            </Button>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter une compétence..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                data-testid="skill-input"
              />
              <Button onClick={addSkill} data-testid="add-skill-btn">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-sm"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="hover:text-sky-900"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            {profile.skills.length === 0 && (
              <p className="text-slate-500 text-center py-8">
                Ajoutez vos compétences clés (ex: JavaScript, Gestion de projet, Excel...)
              </p>
            )}
          </div>
        );

      case 'languages':
        return (
          <div className="space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="Langue (ex: Anglais)"
                value={newLanguage.name}
                onChange={(e) => setNewLanguage(prev => ({ ...prev, name: e.target.value }))}
                data-testid="language-input"
              />
              <select
                value={newLanguage.level}
                onChange={(e) => setNewLanguage(prev => ({ ...prev, level: e.target.value }))}
                className="px-3 py-2 border border-slate-200 rounded-md"
              >
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
                <option value="Natif">Natif</option>
              </select>
              <Button onClick={addLanguage} data-testid="add-language-btn">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {profile.languages.map((lang, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg"
                >
                  <div>
                    <span className="font-medium text-slate-900">{lang.name}</span>
                    <span className="ml-2 text-sm text-slate-500">- {lang.level}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            {profile.languages.length === 0 && (
              <p className="text-slate-500 text-center py-8">
                Ajoutez les langues que vous maîtrisez
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="xl" href="/" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">
            Créez votre Profil Maître
          </h1>
          <p className="text-slate-500">
            Remplissez vos informations une seule fois. Elles seront utilisées pour générer vos CV et lettres de motivation.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  index === currentStep
                    ? 'bg-slate-900 text-white'
                    : index < currentStep
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {index < currentStep ? <Check className="w-4 h-4" /> : step.icon}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${
                  index < currentStep ? 'bg-emerald-300' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="font-heading text-xl font-semibold text-slate-900 mb-6">
            {steps[currentStep].title}
          </h2>
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            data-testid="prev-step-btn"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} className="btn-primary" data-testid="next-step-btn">
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="btn-sky"
              disabled={loading}
              data-testid="submit-profile-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  Terminer
                  <Check className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Skip Button */}
        <div className="text-center mt-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-slate-500"
          >
            Passer cette étape
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
