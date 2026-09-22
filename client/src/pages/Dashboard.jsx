import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FieldError from '../components/FieldError.jsx';
import { apiRequest } from '../lib/api.js';

function Status({ children, active }) {
  return <span className={`status ${active ? 'status-on' : 'status-off'}`}>{children}</span>;
}

export default function Dashboard() {
  const [forms, setForms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function loadForms() {
    try {
      const data = await apiRequest('/forms');
      setForms(data.forms);
    } catch (requestError) {
      if (requestError.status === 401) navigate('/login', { replace: true });
      else setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadForms(); }, []);

  async function removeForm(id) {
    if (!window.confirm('Delete this form? This cannot be undone.')) return;
    try {
      await apiRequest(`/forms/${id}`, { method: 'DELETE' });
      setForms((current) => current.filter((form) => form._id !== id));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600">Admin workspace</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Your forms</h1>
        </div>
        <Link className="button-primary" to="/forms/new">Create form</Link>
      </div>
      <FieldError>{error}</FieldError>
      {loading && <p className="text-sm text-slate-500">Loading forms...</p>}
      {!loading && forms.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="font-semibold text-slate-900">No forms yet</h2>
          <p className="mt-2 text-sm text-slate-600">Create your first form to begin configuring questions.</p>
          <Link className="button-secondary mt-5 inline-flex" to="/forms/new">Create your first form</Link>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {forms.map((form) => (
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={form._id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">{form.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{form.questions.length} question{form.questions.length === 1 ? '' : 's'}</p>
              </div>
              <Status active={form.published}>{form.published ? 'Published' : 'Draft'}</Status>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Status active={form.acceptingResponses}>{form.acceptingResponses ? 'Accepting responses' : 'Responses closed'}</Status>
            </div>
            <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
              <Link className="button-secondary" to={`/forms/${form._id}/edit`}>Edit</Link>
              <button className="button-danger" type="button" onClick={() => removeForm(form._id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
