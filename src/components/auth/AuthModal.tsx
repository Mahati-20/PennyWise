import React, { useState } from 'react';
import { api } from '../../services/api';
import { Icon } from '../common/Icon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onAuthSuccess: (user: any, profile: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signup',
  onAuthSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<'campus' | 'pro'>('campus');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (authMode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setLoading(true);

    try {
      if (authMode === 'signup') {
        const response = await api.auth.signup({
          email: email.trim(),
          password,
          name: name.trim(),
          mode: selectedPersona,
        });
        onAuthSuccess(response.user, response.profile);
      } else {
        const response = await api.auth.login({
          email: email.trim(),
          password,
        });
        onAuthSuccess(response.user, response.profile);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-[#151E38] border border-white/10 p-6 md:p-8 shadow-2xl relative text-[#F1F3FA]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#A7B0C8] hover:text-[#F1F3FA] rounded-xl hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <Icon name="X" size={18} />
        </button>

        {/* Modal Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-turquoise to-lavender p-0.5 shadow-glow-turquoise">
            <div className="w-full h-full bg-[#10172E] rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-xs bg-gradient-to-r from-turquoise to-lavender bg-clip-text text-transparent">
                PW
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {authMode === 'signup' ? 'Create your Pennywise Account' : 'Welcome back to Pennywise'}
            </h3>
            <p className="text-xs text-[#A7B0C8]">
              {authMode === 'signup'
                ? 'Your personal finance companion'
                : 'Sign in to access your personal finances'}
            </p>
          </div>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 mb-5 rounded-2xl bg-[#10172E] border border-white/5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              authMode === 'signup'
                ? 'bg-[#1B2645] text-turquoise font-bold shadow'
                : 'text-[#A7B0C8] hover:text-[#F1F3FA]'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              authMode === 'login'
                ? 'bg-[#1B2645] text-turquoise font-bold shadow'
                : 'text-[#A7B0C8] hover:text-[#F1F3FA]'
            }`}
          >
            Log In
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-semantic-error/15 border border-semantic-error/30 text-xs text-semantic-error flex items-center gap-2">
            <Icon name="AlertCircle" size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Sign Up: Name */}
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-[#A7B0C8] mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Maya Chen"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#10172E] border border-white/10 text-[#F1F3FA] text-xs focus:border-turquoise focus:outline-none transition-colors"
                required
                autoFocus
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-[#A7B0C8] mb-1">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#10172E] border border-white/10 text-[#F1F3FA] text-xs focus:border-turquoise focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Password with Show/Hide toggle */}
          <div>
            <label className="block text-xs font-medium text-[#A7B0C8] mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#10172E] border border-white/10 text-[#F1F3FA] text-xs focus:border-turquoise focus:outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7B0C8] hover:text-[#F1F3FA]"
                tabIndex={-1}
              >
                <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={15} />
              </button>
            </div>
          </div>

          {/* Sign Up: Confirm Password */}
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-[#A7B0C8] mb-1">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-type your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#10172E] border border-white/10 text-[#F1F3FA] text-xs focus:border-turquoise focus:outline-none transition-colors"
                required
              />
            </div>
          )}

          {/* Sign Up: Mode Selection */}
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-[#A7B0C8] mb-1.5">
                Which experience fits you best?
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedPersona('campus')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPersona === 'campus'
                      ? 'border-turquoise bg-turquoise/15 text-turquoise font-semibold'
                      : 'border-white/10 bg-[#10172E] text-[#A7B0C8] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span>🎓</span>
                    <span className="font-bold text-xs text-[#F1F3FA]">Campus</span>
                  </div>
                  <span className="text-[10px] block text-[#A7B0C8]">Student & allowance</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPersona('pro')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPersona === 'pro'
                      ? 'border-lavender bg-lavender/15 text-lavender font-semibold'
                      : 'border-white/10 bg-[#10172E] text-[#A7B0C8] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span>💼</span>
                    <span className="font-bold text-xs text-[#F1F3FA]">Pro</span>
                  </div>
                  <span className="text-[10px] block text-[#A7B0C8]">Salary & wealth</span>
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-turquoise to-[#35C2B9] text-[#10172E] font-bold text-xs hover:shadow-glow-turquoise transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-[#10172E] border-t-transparent animate-spin" />
                  <span>Processing...</span>
                </>
              ) : authMode === 'signup' ? (
                <>
                  <span>Create Account & Continue</span>
                  <Icon name="ArrowRight" size={14} />
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <Icon name="LogIn" size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-5 pt-4 border-t border-white/5 text-center text-xs text-[#A7B0C8]">
          {authMode === 'signup' ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError(null);
                }}
                className="text-turquoise font-semibold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New to Pennywise?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError(null);
                }}
                className="text-turquoise font-semibold hover:underline"
              >
                Create an account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

