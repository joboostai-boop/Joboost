import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentsAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, XCircle, Sparkles } from 'lucide-react';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateUser, checkAuth } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      pollPaymentStatus(sessionId);
    } else {
      setStatus('error');
    }
  }, [searchParams]);

  const pollPaymentStatus = async (sessionId, attempt = 0) => {
    const maxAttempts = 10;
    const pollInterval = 2000;

    if (attempt >= maxAttempts) {
      setStatus('error');
      toast.error('Vérification du paiement expirée. Veuillez contacter le support.');
      return;
    }

    try {
      const response = await paymentsAPI.getStatus(sessionId);
      
      if (response.data.payment_status === 'paid') {
        setStatus('success');
        updateUser({ subscription_plan: 'pro', ai_credits: 999999 });
        await checkAuth(); // Refresh user data
        toast.success('Paiement confirmé ! Bienvenue dans le plan Pro !');
        return;
      } else if (response.data.status === 'expired') {
        setStatus('error');
        toast.error('Session de paiement expirée.');
        return;
      }

      // Continue polling
      setAttempts(attempt + 1);
      setTimeout(() => pollPaymentStatus(sessionId, attempt + 1), pollInterval);
    } catch (error) {
      console.error('Payment status error:', error);
      setAttempts(attempt + 1);
      setTimeout(() => pollPaymentStatus(sessionId, attempt + 1), pollInterval);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">
              Vérification du paiement...
            </h1>
            <p className="text-slate-500 mb-4">
              Nous vérifions votre paiement. Veuillez patienter.
            </p>
            <p className="text-sm text-slate-400">
              Tentative {attempts + 1}/10
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">
              Paiement réussi !
            </h1>
            <p className="text-slate-500 mb-6">
              Félicitations ! Vous avez maintenant accès à toutes les fonctionnalités Pro.
            </p>
            
            <div className="bg-sky-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-sky-700 font-medium mb-2">
                <Sparkles className="w-5 h-5" />
                Plan Pro activé
              </div>
              <p className="text-sm text-sky-600">
                Générations IA illimitées • Export PDF • Support prioritaire
              </p>
            </div>
            
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full btn-primary"
              data-testid="go-to-dashboard-btn"
            >
              Aller au tableau de bord
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">
              Erreur de paiement
            </h1>
            <p className="text-slate-500 mb-6">
              Une erreur est survenue lors de la vérification de votre paiement. 
              Si vous avez été débité, veuillez contacter notre support.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/pricing')}
                className="w-full btn-primary"
              >
                Réessayer
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Retour au tableau de bord
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
