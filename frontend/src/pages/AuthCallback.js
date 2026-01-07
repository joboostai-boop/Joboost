import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleOAuthSession } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use useRef to prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processCallback = async () => {
      try {
        // Extract session_id from URL fragment (hash)
        const hash = location.hash || window.location.hash;
        const sessionIdMatch = hash.match(/session_id=([^&]+)/);
        
        if (sessionIdMatch && sessionIdMatch[1]) {
          const sessionId = sessionIdMatch[1];
          
          // Exchange session_id for user data
          const user = await handleOAuthSession(sessionId);
          
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
          
          // Redirect based on onboarding status
          if (!user.onboarding_completed) {
            navigate('/onboarding', { replace: true, state: { user } });
          } else {
            navigate('/dashboard', { replace: true, state: { user } });
          }
        } else {
          // No session_id found, redirect to login
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login?error=auth_failed', { replace: true });
      }
    };

    processCallback();
  }, [location.hash, handleOAuthSession, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Authentification en cours...</p>
        <p className="text-slate-400 text-sm mt-2">Veuillez patienter</p>
      </div>
    </div>
  );
};

export default AuthCallback;
