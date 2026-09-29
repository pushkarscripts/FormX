import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FieldError from '../components/FieldError.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import { apiRequest } from '../lib/api.js';

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

  useEffect(() => {
    loadForms();
  }, []);

  async function removeForm(id) {
    if (!window.confirm('Delete this form? All associated questions and responses will be permanently removed.')) return;
    try {
      await apiRequest(`/forms/${id}`, { method: 'DELETE' });
      setForms((current) => current.filter((form) => form._id !== id));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const publishedCount = forms.filter((f) => f.published).length;
  const activeResponsesCount = forms.filter((f) => f.acceptingResponses).length;

  return (
    <div className="space-y-8 py-2">
      {/* Workspace Header */}
      <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-brutal flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5">
              Admin Workspace
            </span>
            <span className="font-mono text-xs text-neutral-500 font-bold uppercase">
              // Control Center
            </span>
          </div>
          <h1 className="font-sans font-black text-3xl sm:text-4xl uppercase tracking-tight text-black">
            Your Forms
          </h1>
          <p className="text-sm text-neutral-600 font-sans">
            Build, configure, publish, and inspect responses for all forms in your account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button to="/forms/new" variant="primary" size="md">
            + Create New Form
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      {!loading && forms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border-2 border-black bg-white p-4 shadow-brutal-sm flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold uppercase text-neutral-500">Total Forms</div>
              <div className="font-mono font-black text-2xl text-black mt-0.5">{forms.length}</div>
            </div>
            <div className="w-10 h-10 border-2 border-black bg-[#fafaf7] flex items-center justify-center font-mono font-black text-lg">
              Σ
            </div>
          </div>

          <div className="border-2 border-black bg-white p-4 shadow-brutal-sm flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold uppercase text-neutral-500">Published Online</div>
              <div className="font-mono font-black text-2xl text-[#00a8b5] mt-0.5">{publishedCount}</div>
            </div>
            <div className="w-10 h-10 border-2 border-black bg-[#00f0ff] flex items-center justify-center font-mono font-black text-lg">
              ●
            </div>
          </div>

          <div className="border-2 border-black bg-white p-4 shadow-brutal-sm flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold uppercase text-neutral-500">Accepting Responses</div>
              <div className="font-mono font-black text-2xl text-[#00b359] mt-0.5">{activeResponsesCount}</div>
            </div>
            <div className="w-10 h-10 border-2 border-black bg-[#00d66c] flex items-center justify-center font-mono font-black text-lg">
              ✓
            </div>
          </div>
        </div>
      )}

      <FieldError>{error}</FieldError>

      {/* Loading state */}
      {loading && (
        <div className="border-2 border-black bg-white p-8 text-center font-mono text-sm shadow-brutal flex items-center justify-center gap-2">
          <span className="inline-block w-3 h-3 bg-[#00f0ff] border border-black animate-pulse" />
          <span>RETRIEVING FORMS FROM DATABASE...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && forms.length === 0 && (
        <div className="border-2 border-dashed border-black bg-white p-10 sm:p-14 text-center shadow-brutal-sm space-y-4">
          <div className="w-16 h-16 border-2 border-black bg-[#00f0ff] flex items-center justify-center font-mono font-black text-3xl mx-auto shadow-brutal">
            +
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="font-sans font-black text-2xl uppercase tracking-tight text-black">
              No Forms Found
            </h2>
            <p className="text-sm text-neutral-600 font-sans">
              You haven't created any forms yet. Construct your first form to start defining question fields and automata regex validation rules.
            </p>
          </div>
          <div className="pt-2">
            <Button to="/forms/new" variant="primary" size="md">
              + Create Your First Form
            </Button>
          </div>
        </div>
      )}

      {/* Forms Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {forms.map((form) => (
          <article
            className="border-2 border-black bg-white p-6 shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg transition-all flex flex-col justify-between"
            key={form._id}
          >
            <div className="space-y-3">
              {/* Badges bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-neutral-100 pb-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={form.published ? 'cyan' : 'gray'} dot={form.published}>
                    {form.published ? 'Published' : 'Draft'}
                  </Badge>
                  <Badge variant={form.acceptingResponses ? 'green' : 'yellow'}>
                    {form.acceptingResponses ? 'Open for Responses' : 'Responses Closed'}
                  </Badge>
                </div>
                <span className="font-mono text-xs text-neutral-500 font-bold">
                  {form.questions?.length || 0} {(form.questions?.length === 1) ? 'QUESTION' : 'QUESTIONS'}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="font-sans font-black text-xl text-black uppercase tracking-tight">
                  {form.title}
                </h2>
                {form.description ? (
                  <p className="mt-1.5 text-xs sm:text-sm text-neutral-600 font-sans line-clamp-2 leading-relaxed">
                    {form.description}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs font-mono text-neutral-400 italic">
                    No description specified.
                  </p>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-6 pt-4 border-t-2 border-black flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <Button to={`/forms/${form._id}/edit`} variant="secondary" size="sm">
                  Edit Form
                </Button>
                <Button to={`/forms/${form._id}/responses`} variant="secondary" size="sm">
                  Responses
                </Button>
                {form.published && (
                  <a
                    href={`/public/forms/${form._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1 font-mono text-xs font-bold uppercase tracking-wider border-2 border-black bg-[#fafaf7] px-2.5 py-1 text-black shadow-brutal-sm hover:bg-[#00f0ff] transition-all"
                  >
                    <span>↗ Public Form</span>
                  </a>
                )}
              </div>

              <Button
                variant="danger"
                size="sm"
                onClick={() => removeForm(form._id)}
              >
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
