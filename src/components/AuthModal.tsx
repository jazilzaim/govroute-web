import React, { useEffect, useState } from 'react';
import {
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Mail,
  Lock,
  User as UserIcon,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { trackEvent } from '../lib/firebase';

export type AuthModalMode = 'login' | 'signup';

interface AuthModalProps {
  open: boolean;
  initialMode?: AuthModalMode;
  defaultSector?: string;
  onClose: () => void;
  onAuthenticated: () => void;
}

export function AuthModal({
  open,
  initialMode = 'login',
  defaultSector = 'Defense',
  onClose,
  onAuthenticated,
}: AuthModalProps) {
  const { signIn, signUp, isConfigured } = useAuth();

  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [fullName, setFullName] = useState('');
  const [sector, setSector] = useState(defaultSector);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setSector(defaultSector);
      setError(null);
      setConfirmationEmail(null);
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
    }
  }, [open, initialMode, defaultSector]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const switchMode = (nextMode: AuthModalMode) => {
    setMode(nextMode);
    setError(null);
    setConfirmationEmail(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);

    if (!isConfigured) {
      setError(
        'Supabase credentials are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file and restart the dev server.'
      );
      return;
    }

    if (mode === 'signup') {
      if (fullName.trim().length < 2) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setSubmitting(true);
      const result = await signUp({ email, password, fullName, sector });
      setSubmitting(false);

      if (result.error) {
        setError(result.error);
        return;
      }

      trackEvent('auth_signup', { sector });

      if (result.needsEmailConfirmation) {
        setConfirmationEmail(email.trim().toLowerCase());
        return;
      }

      onAuthenticated();
      return;
    }

    // Login flow
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    trackEvent('auth_login', {});
    onAuthenticated();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0C0C0E] border border-white/15 rounded-3xl max-w-md w-full p-8 relative shadow-[0_30px_100px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmationEmail ? (
          <div className="py-5 text-center space-y-4">
            <div className="w-11 h-11 rounded-full bg-white text-black mx-auto flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-neutral-500 uppercase">
              VERIFY YOUR ACCOUNT
            </div>
            <h3 className="font-serif-editorial text-3xl text-white font-normal">
              Check your inbox
            </h3>
            <p className="text-sm text-neutral-400 font-light leading-relaxed">
              We sent a confirmation link to{' '}
              <span className="text-white font-normal">{confirmationEmail}</span>. Confirm your
              email to activate your GovRoute workspace, then log in.
            </p>
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono text-xs font-semibold uppercase tracking-[0.16em] transition-colors cursor-pointer"
              >
                Back to Log In
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-white/15 hover:border-white/30 text-neutral-300 hover:text-white font-mono text-[11px] uppercase tracking-[0.16em] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="font-mono text-[10px] tracking-[0.2em] text-neutral-500 uppercase">
                GOVROUTE ACCESS · SUPABASE AUTH
              </div>
              <h3 className="font-serif-editorial text-3xl text-white font-normal mt-2">
                {mode === 'login' ? 'Sign in to GovRoute' : 'Create your account'}
              </h3>
              <p className="text-xs text-neutral-400 font-light leading-relaxed mt-1.5">
                {mode === 'login'
                  ? 'Access your unit inventory workspace, check equipment in or out, and manage shift logs.'
                  : 'Set up your operator credentials to launch your GovRoute inventory workspace.'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#141417] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2 rounded-lg font-mono text-[11px] uppercase tracking-[0.16em] transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-black font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`py-2 rounded-lg font-mono text-[11px] uppercase tracking-[0.16em] transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-black font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Missing config warning */}
            {!isConfigured && (
              <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-3.5 text-xs text-amber-200/90 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-amber-200 font-semibold">
                    Supabase Not Configured
                  </div>
                  <p className="mt-1 text-[11px] text-amber-100/80">
                    Add <code className="font-mono text-white">VITE_SUPABASE_URL</code> and{' '}
                    <code className="font-mono text-white">VITE_SUPABASE_ANON_KEY</code> to{' '}
                    <code className="font-mono text-white">.env.local</code> to enable live
                    authentication.
                  </p>
                </div>
              </div>
            )}

            {/* Inline error alert */}
            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3.5 text-xs text-red-200 flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label
                      htmlFor="auth-fullname"
                      className="block font-mono text-[10px] tracking-widest uppercase text-neutral-400 mb-2"
                    >
                      FULL NAME / RANK
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="auth-fullname"
                        type="text"
                        required
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Sgt. J. Mercer"
                        className="w-full bg-[#141417] border border-white/10 rounded-xl pl-9 pr-3.5 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="auth-sector"
                      className="block font-mono text-[10px] tracking-widest uppercase text-neutral-400 mb-2"
                    >
                      INDUSTRY SECTOR
                    </label>
                    <select
                      id="auth-sector"
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full bg-[#141417] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-white/30"
                    >
                      <option value="Defense">Defense (Military Units, Armories & Base Ops)</option>
                      <option value="Law Enforcement">
                        Law Enforcement (Police Precincts, Patrol & SWAT)
                      </option>
                      <option value="Aviation">
                        Aviation (Hangar Tool Cribs, Flight Line & MRO)
                      </option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block font-mono text-[10px] tracking-widest uppercase text-neutral-400 mb-2"
                >
                  WORK EMAIL
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@organization.gov"
                    className="w-full bg-[#141417] border border-white/10 rounded-xl pl-9 pr-3.5 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="block font-mono text-[10px] tracking-widest uppercase text-neutral-400 mb-2"
                >
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'login' ? 'Enter your password' : 'Minimum 6 characters'}
                    className="w-full bg-[#141417] border border-white/10 rounded-xl pl-9 pr-10 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="auth-confirm-password"
                    className="block font-mono text-[10px] tracking-widest uppercase text-neutral-400 mb-2"
                  >
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full bg-[#141417] border border-white/10 rounded-xl pl-9 pr-3.5 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !isConfigured}
                className="w-full py-3.5 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-45 disabled:cursor-not-allowed text-black font-mono text-xs font-semibold tracking-[0.16em] uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>
                  {submitting
                    ? mode === 'login'
                      ? 'Signing In...'
                      : 'Creating Account...'
                    : mode === 'login'
                      ? 'Sign In to Workspace'
                      : 'Create Account'}
                </span>
                {!submitting && <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2]" />}
              </button>
            </form>

            {/* Footer switch link */}
            <div className="pt-3 border-t border-white/[0.08] text-center text-xs text-neutral-500">
              {mode === 'login' ? (
                <>
                  New to GovRoute?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="text-white hover:underline underline-offset-4 cursor-pointer"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-white hover:underline underline-offset-4 cursor-pointer"
                  >
                    Log in
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
