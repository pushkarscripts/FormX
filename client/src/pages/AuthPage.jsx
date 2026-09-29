import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import FieldError from '../components/FieldError.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import Badge from '../components/Badge.jsx';
import AutomataDiagram from '../components/AutomataDiagram.jsx';

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await (isLogin ? login(form) : register(form));
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="py-6 sm:py-12 max-w-4xl mx-auto">
      <div className="border-2 border-black bg-white shadow-brutal-lg grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left Branding & Automata Panel */}
        <div className="md:col-span-5 bg-[#121212] text-white p-6 sm:p-8 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-black relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 border-2 border-black bg-[#00f0ff] flex items-center justify-center font-mono font-bold text-base text-black shadow-[2px_2px_0_#fff]">
                δ
              </span>
              <span className="font-sans font-black text-2xl tracking-tighter uppercase text-white">
                FormX
              </span>
            </div>

            <div className="space-y-2">
              <Badge variant="cyan" dot>
                FLAT Admin Portal
              </Badge>
              <h2 className="font-sans font-black text-xl sm:text-2xl uppercase tracking-tight text-white leading-tight">
                {isLogin ? 'Access Automata Workspace' : 'Initialize Admin Account'}
              </h2>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                Design forms, formulate custom regular expressions, and validate respondent submissions via deterministic finite automata.
              </p>
            </div>

            {/* Embedded Compact Automata Motif */}
            <div className="pt-2">
              <AutomataDiagram variant="compact" />
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-neutral-800 text-[11px] font-mono text-neutral-400 space-y-1 relative z-10">
            <div>&bull; Thompson's Construction (ε-NFA)</div>
            <div>&bull; Powerset Subset Construction</div>
            <div>&bull; Linear O(n) DFA Simulator</div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-500">
              {isLogin ? '// Authentication' : '// Account Registration'}
            </span>
            <h1 className="font-sans font-black text-3xl uppercase tracking-tight text-black mt-1">
              {isLogin ? 'Log In' : 'Create Account'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-600 font-sans">
              {isLogin
                ? 'Sign in to access your forms and response archives.'
                : 'Register an administrator credential to construct new forms.'}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">
                Admin Email Address
              </label>
              <input
                className="input font-mono"
                type="email"
                name="email"
                placeholder="admin@formx.edu"
                value={form.email}
                onChange={update}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">
                Password
              </label>
              <input
                className="input font-mono"
                type="password"
                name="password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={update}
                minLength="8"
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              {!isLogin && (
                <span className="mt-1 block text-xs font-mono text-neutral-500">
                  Password must be at least 8 characters.
                </span>
              )}
            </div>

            <FieldError>{error}</FieldError>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                type="submit"
                className="w-full"
                disabled={saving}
              >
                {saving ? 'Processing...' : isLogin ? 'Log In ➔' : 'Register Account ➔'}
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-4 border-t-2 border-black/10 text-center text-xs font-mono text-neutral-600">
            {isLogin ? 'Need an administrator account? ' : 'Already registered? '}
            <Link
              className="font-bold text-black underline hover:text-[#00c4d4] decoration-2"
              to={isLogin ? '/register' : '/login'}
            >
              {isLogin ? 'Create one here ➔' : 'Log in here ➔'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
