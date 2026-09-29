import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FieldError from '../components/FieldError.jsx';
import Button from '../components/Button.jsx';
import Badge from '../components/Badge.jsx';
import Card from '../components/Card.jsx';
import { apiRequest, getToken } from '../lib/api.js';

export default function Responses() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    apiRequest(`/forms/${id}/responses`)
      .then(setData)
      .catch((requestError) => {
        if (requestError.status === 401) navigate('/login', { replace: true });
        else setError(requestError.message);
      });
  }, [id, navigate]);

  async function downloadCsv() {
    setExporting(true);
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
    } finally {
      setExporting(false);
    }
  }

  if (!data && !error) {
    return (
      <div className="border-2 border-black bg-white p-8 text-center font-mono text-sm shadow-brutal flex items-center justify-center gap-2 max-w-4xl mx-auto py-12">
        <span className="inline-block w-3 h-3 bg-[#00f0ff] border border-black animate-pulse" />
        <span>LOADING SUBMISSION ARCHIVE...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-brutal flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="font-mono text-xs font-bold text-neutral-600 hover:text-black uppercase flex items-center gap-1 bg-[#fafaf7] px-2 py-0.5 border border-black"
            >
              ← Back to Dashboard
            </Link>
            <span className="font-mono text-xs font-bold uppercase text-neutral-500">
              // Data Workspace
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-sans font-black text-2xl sm:text-3xl uppercase tracking-tight text-black">
              {data?.form.title || 'Form Responses'}
            </h1>
            {data && (
              <Badge variant="cyan">
                {data.responses.length} {data.responses.length === 1 ? 'Submission' : 'Submissions'}
              </Badge>
            )}
          </div>
        </div>

        {/* Export Action */}
        <div className="flex items-center gap-3">
          {data && (
            <Button
              variant="primary"
              size="md"
              type="button"
              onClick={downloadCsv}
              disabled={exporting}
            >
              {exporting ? 'Preparing CSV...' : '⬇ Export CSV Data'}
            </Button>
          )}
        </div>
      </div>

      <FieldError>{error}</FieldError>

      {/* Empty State */}
      {data?.responses.length === 0 && (
        <div className="border-2 border-dashed border-black bg-white p-10 text-center shadow-brutal-sm space-y-3">
          <div className="w-12 h-12 border-2 border-black bg-[#fafaf7] flex items-center justify-center font-mono font-black text-xl mx-auto">
            0
          </div>
          <h2 className="font-sans font-bold text-lg uppercase text-black">
            No Submissions Received Yet
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-sans max-w-md mx-auto">
            When respondents complete and submit your public form, entries will be verified by the automata engine and listed here chronologically.
          </p>
          <div className="pt-2">
            <Button to={`/forms/${id}/edit`} variant="secondary" size="sm">
              Manage Form Settings
            </Button>
          </div>
        </div>
      )}

      {/* Submissions List */}
      {data?.responses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-neutral-600 px-1">
            <span>Chronological Submissions (Newest First)</span>
            <span>Status: Verified DFA</span>
          </div>

          <div className="space-y-3">
            {data.responses.map((response, index) => (
              <Link
                key={response.id}
                to={`/forms/${id}/responses/${response.id}`}
                className="border-2 border-black bg-white p-4 sm:p-5 shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 block group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border-2 border-black bg-[#fafaf7] group-hover:bg-[#00f0ff] flex items-center justify-center font-mono font-black text-xs transition-colors shrink-0 shadow-[1px_1px_0_#000]">
                    #{String(data.responses.length - index).padStart(3, '0')}
                  </div>
                  <div>
                    <div className="font-mono font-black text-sm text-black flex items-center gap-2">
                      <span>SUBMISSION ID: {response.id.slice(-8).toUpperCase()}</span>
                      <span className="text-[10px] bg-[#00d66c] text-black px-1.5 py-0.2 border border-black">
                        ACCEPT
                      </span>
                    </div>
                    <time className="text-xs text-neutral-500 font-mono mt-0.5 block">
                      Submitted on {new Date(response.submittedAt).toLocaleString()}
                    </time>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-black group-hover:underline flex items-center gap-1">
                    <span>Inspect Answers</span>
                    <span>➔</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
