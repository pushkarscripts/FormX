import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FieldError from '../components/FieldError.jsx';
import { apiRequest } from '../lib/api.js';

function answerFor(answers, id) {
  return answers instanceof Map ? answers.get(id) : answers?.[id];
}

function displayAnswer(value) {
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'No selections';
  return value === undefined || value === null || value === '' ? 'No answer' : String(value);
}

export default function ResponseDetail() {
  const { id, responseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest(`/forms/${id}/responses/${responseId}`)
      .then(setData)
      .catch((requestError) => {
        if (requestError.status === 401) navigate('/login', { replace: true });
        else setError(requestError.message);
      });
  }, [id, responseId, navigate]);

  if (!data && !error) return <p className="text-sm text-slate-500">Loading response...</p>;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link className="text-sm text-indigo-600 hover:text-indigo-500" to={`/forms/${id}/responses`}>← Back to responses</Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{data?.form.title || 'Response'}</h1>
        {data && <p className="mt-1 text-sm text-slate-500">Submitted {new Date(data.response.submittedAt).toLocaleString()}</p>}
      </div>
      <FieldError>{error}</FieldError>
      {data?.form.questions.map((question) => (
        <section className="card" key={question._id}>
          <h2 className="text-sm font-semibold text-slate-900">{question.label}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{displayAnswer(answerFor(data.response.answers, question._id))}</p>
        </section>
      ))}
    </div>
  );
}
