import React, { useState, useMemo } from 'react';
import { 
  Code2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User as UserIcon, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  Check, 
  KeyRound,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { UserRole } from '../../types/auth';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const { setNavView, addToast } = useProject();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('User');
  const [adminSecret, setAdminSecret] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live password validation rules
  const passwordCriteria = useMemo(() => {
    return {
      length: password.length >= 6,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /\d/.test(password),
      match: password.length > 0 && password === confirmPassword
    };
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Validation
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreedTerms) {
      setErrorMsg('You must agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    if (selectedRole === 'Admin' && !adminSecret.trim()) {
      setErrorMsg('An Admin Setup Key is required to create an Administrator account.');
      return;
    }

    setIsLoading(true);
    const result = await signup(
      fullName, 
      email, 
      password, 
      selectedRole, 
      selectedRole === 'Admin' ? adminSecret : undefined,
      true
    );
    setIsLoading(false);

    if (result.success && result.user) {
      addToast(`Account created successfully! Welcome to CodeForge, ${result.user.fullName}!`, 'success');
      if (result.user.role === 'Admin') {
        setNavView('admin');
      } else {
        setNavView('editor');
      }
    } else {
      setErrorMsg(result.error || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-slate-950 relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-cyan-600/10 via-blue-600/15 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-6">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-[2px] shadow-xl shadow-cyan-500/20 mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Code2 className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>Create your</span>
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              CodeForge
            </span>
            <span>Account</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build, run, and execute code across 14 languages in seconds
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Role selector tabs */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('User');
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  selectedRole === 'User'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>User (Developer)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('Admin');
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  selectedRole === 'Admin'
                    ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Administrator</span>
              </button>
            </div>
          </div>

          {/* Error notification */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-11 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full pl-10 pr-11 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Validation Checklist */}
            {password.length > 0 && (
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] grid grid-cols-2 gap-1.5 animate-fadeIn">
                <span className={`flex items-center gap-1.5 ${passwordCriteria.length ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <Check className="w-3 h-3" />
                  <span>At least 6 chars</span>
                </span>
                <span className={`flex items-center gap-1.5 ${passwordCriteria.hasLetter ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <Check className="w-3 h-3" />
                  <span>Contains letter</span>
                </span>
                <span className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <Check className="w-3 h-3" />
                  <span>Contains number</span>
                </span>
                <span className={`flex items-center gap-1.5 ${passwordCriteria.match ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <Check className="w-3 h-3" />
                  <span>Passwords match</span>
                </span>
              </div>
            )}

            {/* Admin Security Key Input (Only when role === 'Admin') */}
            {selectedRole === 'Admin' && (
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 animate-fadeIn">
                <div className="flex items-center gap-2 mb-1.5">
                  <KeyRound className="w-4 h-4 text-indigo-400" />
                  <label className="text-xs font-semibold text-indigo-300">
                    Administrator Setup Secret Key
                  </label>
                </div>
                <input
                  type="password"
                  required
                  value={adminSecret}
                  onChange={e => setAdminSecret(e.target.value)}
                  placeholder="Enter administrator passkey"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-indigo-500/40 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                  🛡️ Public registration creates standard <strong>User</strong> accounts. Administrator privileges require an authorized secret key provided by your server administrator.
                </p>
              </div>
            )}

            {/* Terms & Conditions Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer select-none leading-relaxed">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={e => setAgreedTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                />
                <span>
                  I agree to the <span className="text-cyan-400 hover:underline">Terms of Service</span> and acknowledge the <span className="text-cyan-400 hover:underline">Privacy Policy</span>.
                </span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-slate-950 font-semibold text-sm shadow-lg shadow-cyan-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create {selectedRole} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer: Login Link */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Already have an account?{' '}
          <button
            onClick={() => setNavView('login')}
            className="text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-2 transition-colors ml-1"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
