import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import FieldError from '../components/FieldError.jsx';
import { useAuth } from '../context/AuthContext.jsx';

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
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{isLogin ? 'Admin login' : 'Create admin account'}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {isLogin ? 'Sign in to manage your forms.' : 'Create an account to start building forms.'}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input className="input mt-1" type="email" name="email" value={form.email} onChange={update} required />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input className="input mt-1" type="password" name="password" value={form.password} onChange={update} minLength="8" required />
            {!isLogin && <span className="mt-1 block text-xs font-normal text-slate-500">At least 8 characters.</span>}
          </label>
          <FieldError>{error}</FieldError>
          <button className="button-primary w-full" type="submit" disabled={saving}>
            {saving ? 'Working...' : isLogin ? 'Log in' : 'Register'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          {isLogin ? 'Need an account? ' : 'Already registered? '}
          <Link className="font-medium text-indigo-600 hover:text-indigo-500" to={isLogin ? '/register' : '/login'}>
            {isLogin ? 'Register' : 'Log in'}
          </Link>
        </p>
      </div>
    </div>
  );
}
