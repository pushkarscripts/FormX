import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FieldError from '../components/FieldError.jsx';
import Button from '../components/Button.jsx';
import Badge from '../components/Badge.jsx';
import Card from '../components/Card.jsx';
import { apiRequest } from '../lib/api.js';

function answerFor(answers, id) {
  return answers instanceof Map ? answers.get(id) : answers?.[id];
}

function displayAnswer(value) {
  if (Array.isArray(value)) {
    return value.length ? value : [];
  }
  return value === undefined || value === null || value === '' ? null : String(value);
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

  if (!data && !error) {
    return (
      <div className="border-2 border-black bg-white p-8 text-center font-mono text-sm shadow-brutal flex items-center justify-center gap-2 max-w-3xl mx-auto py-12">
        <span className="inline-block w-3 h-3 bg-[#00f0ff] border border-black animate-pulse" />
        <span>LOADING SUBMISSION DETAILS...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      {/* Header Card */}
      <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-brutal space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <Link
            to={`/forms/${id}/responses`}
            className="font-mono text-xs font-bold text-neutral-600 hover:text-black uppercase flex items-center gap-1 bg-[#fafaf7] px-2 py-0.5 border border-black"
          >
            ← Back to Responses
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="green" dot>
              q ∈ F (ACCEPTED)
            </Badge>
          </div>
        </div>

        <div>
          <div className="font-mono text-xs font-bold uppercase text-neutral-500">
            Form Submission Record
          </div>
          <h1 className="font-sans font-black text-2xl sm:text-3xl uppercase tracking-tight text-black mt-1">
            {data?.form.title || 'Response Detail'}
          </h1>
        </div>

        {data && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-200 text-xs font-mono text-neutral-600">
            <div>
              <span className="font-bold text-black">ID:</span>{' '}
              <code className="bg-neutral-100 px-1.5 py-0.5 border border-black text-black">
                {responseId}
              </code>
            </div>
            <div>
              <span className="font-bold text-black">SUBMITTED:</span>{' '}
              {new Date(data.response.submittedAt).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      <FieldError>{error}</FieldError>

      {/* Answers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-neutral-600 px-1">
          <span>Recorded Answers ({data?.form.questions.length || 0})</span>
          <span>DFA Validated</span>
        </div>

        {data?.form.questions.map((question, index) => {
          const rawAnswer = answerFor(data.response.answers, question._id);
          const formatted = displayAnswer(rawAnswer);
          const isArray = Array.isArray(formatted);
          const isEmpty = formatted === null || (isArray && formatted.length === 0);
          const questionNumber = String(index + 1).padStart(2, '0');

          return (
            <article
              key={question._id}
              className="border-2 border-black bg-white p-5 shadow-brutal space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 border-2 border-black bg-black text-white flex items-center justify-center font-mono font-black text-xs shrink-0 mt-0.5 shadow-[1px_1px_0_#00f0ff]">
                    {questionNumber}
                  </span>
                  <div>
                    <h2 className="font-sans font-bold text-base text-black leading-snug">
                      {question.label}
                    </h2>
                    {question.required && (
                      <span className="font-mono text-[10px] text-red-600 uppercase font-bold">
                        [Required Field]
                      </span>
                    )}
                  </div>
                </div>

                <span className="font-mono text-[10px] bg-neutral-100 border border-black px-1.5 py-0.5 text-neutral-600 font-bold shrink-0">
                  {question.type}
                </span>
              </div>

              {/* Answer Content */}
              <div className="mt-2 pl-0 sm:pl-10">
                {isEmpty ? (
                  <div className="font-mono text-xs text-neutral-400 italic bg-neutral-50 p-2.5 border border-dashed border-neutral-300">
                    No answer provided for this field.
                  </div>
                ) : isArray ? (
                  <div className="flex flex-wrap gap-2">
                    {formatted.map((option, optIdx) => (
                      <span
                        key={optIdx}
                        className="inline-flex items-center gap-1.5 border-2 border-black bg-[#00f0ff] px-2.5 py-1 text-xs font-mono font-bold text-black shadow-brutal-sm"
                      >
                        <span>✓</span>
                        <span>{option}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-black bg-[#fafaf7] p-3 text-sm font-medium text-black whitespace-pre-wrap font-sans shadow-brutal-sm">
                    {formatted}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Bottom Back Button */}
      <div className="pt-2 flex justify-start">
        <Button to={`/forms/${id}/responses`} variant="secondary" size="md">
          ← Return to All Responses
        </Button>
      </div>
    </div>
  );
}
