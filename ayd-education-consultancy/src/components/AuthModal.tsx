import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { signInWithGoogle } from '../firebase';
import { UserProfile } from '../types';

interface AuthModalProps {
  role: 'student' | 'agent';
  onClose: () => void;
  onAuthSuccess: (profile: UserProfile) => void;
}

export default function AuthModal({ role, onClose, onAuthSuccess }: AuthModalProps) {
  const [agencyName, setAgencyName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorError(null);
    try {
      const { profile } = await signInWithGoogle(role, role === 'agent' ? agencyName : undefined);
      onAuthSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setErrorError(err.message || 'Google Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorError(null);

    // Provide a beautiful mock simulation of password sign-in that gracefully registers them 
    // and returns a correct mock profile, while prioritizing Google Sign-In for real Workspace data.
    setTimeout(() => {
      const mockProfile: UserProfile = {
        uid: `pwd-${Date.now()}`,
        email: emailInput || 'student@example.com',
        displayName: emailInput ? emailInput.split('@')[0] : (role === 'student' ? 'Demo Student' : 'Demo Agent'),
        role: role,
        agencyName: role === 'agent' ? (agencyName || 'Independent Agency') : undefined,
        createdAt: new Date().toISOString()
      };
      setIsLoading(false);
      onAuthSuccess(mockProfile);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full filter blur-2xl"></div>

        {/* Header */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Secure portal access
            </p>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
              {role === 'student' ? 'Student Portal' : 'Agent Portal'}
            </h3>
            <p className="text-xs text-gray-400">
              Access your personalized admissions workspace
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2.5 items-start mb-5 relative z-10">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handlePasswordSignIn} className="space-y-4 relative z-10">
          
          {role === 'agent' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Agency Name *</label>
              <input
                type="text"
                required
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-400"
                placeholder="e.g. AYD Toronto Advisory"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-400"
              placeholder="e.g. name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Password *</label>
            <input
              type="password"
              required
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-amber-400"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              `Log in as ${role === 'student' ? 'Student' : 'Agent'}`
            )}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">Or authenticate securely</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Real Google Sign-In popup with Workspace authorization scopes */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-800 hover:border-slate-750 bg-slate-950 text-white hover:bg-slate-900 transition cursor-pointer text-xs font-semibold"
          >
            <svg className="w-4 h-4" viewBox="0 0 48 48" width="48px" height="48px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            <span>Authorize Google & Sign In</span>
          </button>

        </form>

      </div>
    </div>
  );
}
