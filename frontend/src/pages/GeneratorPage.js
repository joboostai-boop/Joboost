import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI, aiAPI, profileAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Briefcase,
  ArrowLeft,
  Sparkles,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

const GeneratorPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('cover_letter');
  const [coverLetter, setCoverLetter] = useState('');
  const [cv, setCv] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, [applicationId]);

  const fetchData = async () => {
    try {
      const [appResponse, profileResponse] = await Promise.all([
        applicationsAPI.get(applicationId),
        profileAPI.get()
      ]);
      setApplication(appResponse.data.application);
      setProfile(profileResponse.data.profile);
      
      // Load existing generated content
      if (appResponse.data.application.generated_cover_letter) {
        setCoverLetter(appResponse.data.application.generated_cover_letter);
      }
      if (appResponse.data.application.generated_cv) {
        setCv(appResponse.data.application.generated_cv);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (type) => {
    if (!profile) {
      toast.error('Veuillez d\'abord compléter votre profil maître');
      navigate('/onboarding');
      return;
    }

    if (user?.subscription_plan !== 'pro' && user?.ai_credits <= 0) {
      toast.error('Crédits IA épuisés. Passez au plan Pro pour des générations illimitées.');
      navigate('/pricing');
      return;
    }

    setGenerating(true);
    try {
      const response = await aiAPI.generate(applicationId, type);
      if (type === 'cover_letter') {
        setCoverLetter(response.data.content);
      } else {
        setCv(response.data.content);
      }
      toast.success('Contenu généré avec succès !');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    const content = activeTab === 'cover_letter' ? coverLetter : cv;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copié dans le presse-papiers');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const handleExportPDF = async () => {
    const content = activeTab === 'cover_letter' ? coverLetter : cv;
    const title = activeTab === 'cover_letter' 
      ? `Lettre_Motivation_${application.company_name}` 
      : `CV_${application.company_name}`;

    try {
      const doc = new jsPDF();
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - 2 * margin;
      
      doc.setFont('helvetica');
      doc.setFontSize(11);
      
      // Split text into lines that fit the page width
      const lines = doc.splitTextToSize(content, maxWidth);
      
      let y = margin;
      const lineHeight = 6;
      
      lines.forEach((line) => {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });
      
      doc.save(`${title}.pdf`);
      toast.success('PDF exporté avec succès !');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  const currentContent = activeTab === 'cover_letter' ? coverLetter : cv;
  const hasContent = currentContent && currentContent.trim().length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-heading text-lg font-semibold text-slate-900">
                Générateur IA
              </h1>
              <p className="text-sm text-slate-500">
                {application?.job_title} chez {application?.company_name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user?.subscription_plan !== 'pro' && (
              <span className="text-sm text-slate-500">
                Crédits IA: <span className="font-semibold text-sky-500">{user?.ai_credits}</span>
              </span>
            )}
            {user?.subscription_plan === 'pro' && (
              <span className="badge-status bg-emerald-50 text-emerald-700 border border-emerald-200">
                Pro - Illimité
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto py-8 px-4 lg:px-8">
        {/* No Profile Warning */}
        {!profile && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-amber-800 font-medium">Profil incomplet</p>
              <p className="text-amber-700 text-sm">
                Pour générer des documents personnalisés, complétez d'abord votre profil maître.
              </p>
            </div>
            <Link to="/onboarding">
              <Button className="btn-secondary">Compléter mon profil</Button>
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('cover_letter')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'cover_letter'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            data-testid="tab-cover-letter"
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Lettre de motivation
          </button>
          <button
            onClick={() => setActiveTab('cv')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'cv'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            data-testid="tab-cv"
          >
            <Briefcase className="w-4 h-4 inline mr-2" />
            CV adapté
          </button>
        </div>

        {/* Generation Button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-slate-900">
              {activeTab === 'cover_letter' ? 'Lettre de motivation' : 'CV optimisé'}
            </h2>
            <p className="text-sm text-slate-500">
              {activeTab === 'cover_letter'
                ? 'Une lettre personnalisée qui fait le pont entre votre profil et le poste'
                : 'Un CV restructuré mettant en avant les compétences pertinentes'
              }
            </p>
          </div>
          
          <Button
            onClick={() => handleGenerate(activeTab)}
            disabled={generating || !profile}
            className="btn-sky"
            data-testid="generate-btn"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : hasContent ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                Regénérer
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Générer avec l'IA
              </>
            )}
          </Button>
        </div>

        {/* Editor / Content Area */}
        <div className="focus-mode rounded-xl border border-slate-200 overflow-hidden">
          {hasContent ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-end gap-2 p-4 border-b border-slate-100 bg-slate-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  data-testid="copy-btn"
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-2 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? 'Copié !' : 'Copier'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportPDF}
                  data-testid="export-pdf-btn"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter PDF
                </Button>
              </div>

              {/* Content Editor */}
              <div className="focus-content">
                <Textarea
                  value={currentContent}
                  onChange={(e) => {
                    if (activeTab === 'cover_letter') {
                      setCoverLetter(e.target.value);
                    } else {
                      setCv(e.target.value);
                    }
                  }}
                  className="focus-mode-editor resize-none"
                  placeholder="Le contenu généré apparaîtra ici..."
                  data-testid="content-editor"
                />
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Prêt à générer
              </h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                Cliquez sur "Générer avec l'IA" pour créer un{' '}
                {activeTab === 'cover_letter' ? 'une lettre de motivation' : 'un CV'}{' '}
                personnalisé(e) pour cette candidature.
              </p>
              <Button
                onClick={() => handleGenerate(activeTab)}
                disabled={generating || !profile}
                className="btn-sky"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Générer maintenant
              </Button>
            </div>
          )}
        </div>

        {/* Job Description Reference */}
        {application?.job_description && (
          <div className="mt-8">
            <h3 className="font-heading text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Description du poste (référence)
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 max-h-48 overflow-y-auto whitespace-pre-wrap">
              {application.job_description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratorPage;
