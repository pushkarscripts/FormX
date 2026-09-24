import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FieldError from '../components/FieldError.jsx';
import { apiRequest, getToken } from '../lib/api.js';

export default function Responses() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest(`/forms/${id}/responses`)
      .then(setData)
      .catch((requestError) => {
        if (requestError.status === 401) navigate('/login', { replace: true });
        else setError(requestError.message);
      });
  }, [id, navigate]);

  async function downloadCsv() {
    try {
      const response = await fetch(`/api/forms/${id}/responses/export`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!response.ok) throw new Error('Could not export responses.');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `form-${id}-responses.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (!data && !error) return <p className="text-sm text-slate-500">Loading responses...</p>;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link className="text-sm text-indigo-600 hover:text-indigo-500" to="/dashboard">← Back to dashboard</Link>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{data?.form.title || 'Responses'}</h1>
          {data && <p className="mt-1 text-sm text-slate-600">{data.responses.length} submission{data.responses.length === 1 ? '' : 's'}</p>}
        </div>
        {data && <button className="button-secondary" type="button" onClick={downloadCsv}>Export CSV</button>}
      </div>
      <FieldError>{error}</FieldError>
      {data?.responses.length === 0 && <div className="card text-center text-sm text-slate-600">No responses have been submitted yet.</div>}
      <div className="space-y-3">
        {data?.responses.map((response) => (
          <Link className="card block hover:border-indigo-300" to={`/forms/${id}/responses/${response.id}`} key={response.id}>
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-slate-900">Submission {response.id.slice(-8)}</span>
              <time className="text-sm text-slate-500">{new Date(response.submittedAt).toLocaleString()}</time>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
