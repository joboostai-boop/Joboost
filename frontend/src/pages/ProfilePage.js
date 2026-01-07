import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import {
  Briefcase,
  ArrowLeft,
  User,
  GraduationCap,
  Wrench,
  Globe,
  Plus,
  Trash2,
  Loader2,
  Save,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    info: true,
    experiences: true,
    education: true,
    skills: true,
    languages: true
  });
  
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.get();
      if (response.data.profile) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileAPI.save({
        ...profile,
        user_id: user?.user_id
      });
      toast.success('Profil enregistré avec succès !');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  const SectionHeader = ({ icon: Icon, title, section }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-slate-600" />
        <span className="font-heading font-semibold text-slate-900">{title}</span>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-slate-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-slate-400" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-heading text-xl font-bold text-slate-900">Mon Profil Maître</h1>
              <p className="text-sm text-slate-500">Vos informations pour la génération IA</p>
            </div>
          </div>
          
          <Button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            data-testid="save-profile-btn"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 lg:px-8 space-y-6">
        {/* Info Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <SectionHeader icon={User} title="Informations personnelles" section="info" />
          {expandedSections.info && (
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Titre professionnel</Label>
                <Input
                  placeholder="Ex: Développeur Full Stack, Chef de projet..."
                  value={profile.title || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Résumé professionnel</Label>
                <Textarea
                  placeholder="Décrivez brièvement votre parcours et vos objectifs..."
                  value={profile.summary || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, summary: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    placeholder="+33 6 12 34 56 78"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Localisation</Label>
                  <Input
                    placeholder="Paris, France"
                    value={profile.location || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input
                    placeholder="https://linkedin.com/in/..."
                    value={profile.linkedin_url || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Portfolio</Label>
                  <Input
                    placeholder="https://..."
                    value={profile.portfolio_url || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, portfolio_url: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Experiences Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <SectionHeader icon={Briefcase} title="Expériences professionnelles" section="experiences" />
          {expandedSections.experiences && (
            <div className="p-6 space-y-4">
              {profile.experiences?.map((exp, index) => (
                <div key={exp.id || index} className="p-4 border border-slate-200 rounded-lg space-y-4 bg-slate-50">
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
                        value={exp.title || ''}
                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Entreprise</Label>
                      <Input
                        placeholder="Nom de l'entreprise"
                        value={exp.company || ''}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date de début</Label>
                      <Input
                        type="month"
                        value={exp.start_date || ''}
                        onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date de fin</Label>
                      <Input
                        type="month"
                        value={exp.end_date || ''}
                        onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                        disabled={exp.current}
                      />
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={exp.current || false}
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
                      value={exp.description || ''}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addExperience} className="w-full border-dashed">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une expérience
              </Button>
            </div>
          )}
        </div>

        {/* Education Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <SectionHeader icon={GraduationCap} title="Formation" section="education" />
          {expandedSections.education && (
            <div className="p-6 space-y-4">
              {profile.education?.map((edu, index) => (
                <div key={edu.id || index} className="p-4 border border-slate-200 rounded-lg space-y-4 bg-slate-50">
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
                        value={edu.degree || ''}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Établissement</Label>
                      <Input
                        placeholder="Université de..."
                        value={edu.institution || ''}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date de début</Label>
                      <Input
                        type="month"
                        value={edu.start_date || ''}
                        onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date de fin</Label>
                      <Input
                        type="month"
                        value={edu.end_date || ''}
                        onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addEducation} className="w-full border-dashed">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une formation
              </Button>
            </div>
          )}
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <SectionHeader icon={Wrench} title="Compétences" section="skills" />
          {expandedSections.skills && (
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter une compétence..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-sm"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-sky-900">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Languages Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <SectionHeader icon={Globe} title="Langues" section="languages" />
          {expandedSections.languages && (
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Langue"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage(prev => ({ ...prev, name: e.target.value }))}
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
                <Button onClick={addLanguage}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {profile.languages?.map((lang, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
