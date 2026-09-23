import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FieldError from '../components/FieldError.jsx';

export default function PublicForm() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [acceptingResponses, setAcceptingResponses] = useState(false);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/public/forms/${id}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'This form is unavailable.');
        return data;
      })
      .then((data) => {
        setForm(data.form);
        setAcceptingResponses(data.acceptingResponses);
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [id]);

  function updateAnswer(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setErrors((current) => ({ ...current, [questionId]: '' }));
  }

  function toggleCheckbox(questionId, option) {
    const current = answers[questionId] || [];
    updateAnswer(questionId, current.includes(option)
      ? current.filter((value) => value !== option)
      : [...current, option]);
  }

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    setErrors({});
    setSubmitting(true);
    try {
      const response = await fetch(`/api/public/forms/${id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.details) {
          setErrors(Object.fromEntries(data.details.map((error) => [error.questionId, error.message])));
        }
        throw new Error(data.error || 'Submission failed.');
      }
      setMessage(data.message);
      setAnswers({});
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading form...</p>;
  if (!form) return <div className="card"><h1 className="text-xl font-bold text-slate-900">Form unavailable</h1><p className="mt-2 text-sm text-red-600">{message}</p></div>;

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={submit} className="space-y-6">
        <header className="card">
          <h1 className="text-3xl font-bold text-slate-900">{form.title}</h1>
          {form.description && <p className="mt-2 whitespace-pre-wrap text-slate-600">{form.description}</p>}
        </header>
        {form.questions.map((question) => (
          <QuestionInput
            key={question.id}
            question={question}
            value={answers[question.id]}
            error={errors[question.id]}
            onChange={(value) => updateAnswer(question.id, value)}
            onToggle={(option) => toggleCheckbox(question.id, option)}
          />
        ))}
        <FieldError>{message}</FieldError>
        {!acceptingResponses ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">This form is not currently accepting responses.</p>
        ) : message === 'Response submitted successfully' ? null : (
          <button className="button-primary" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit response'}</button>
        )}
      </form>
    </div>
  );
}

function QuestionInput({ question, value, error, onChange, onToggle }) {
  const label = <span>{question.label}{question.required && <span className="ml-1 text-red-600" aria-label="required">*</span>}</span>;
  return (
    <section className="card">
      <label className="block text-sm font-medium text-slate-700">{label}
        {question.type === 'Long Text' ? (
          <textarea className="input mt-2 min-h-28" value={value || ''} onChange={(event) => onChange(event.target.value)} />
        ) : ['Short Text', 'Email'].includes(question.type) ? (
          <input className="input mt-2" type={question.type === 'Email' ? 'email' : 'text'} value={value || ''} onChange={(event) => onChange(event.target.value)} />
        ) : question.type === 'Number' ? (
          <input className="input mt-2" type="number" value={value ?? ''} onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))} />
        ) : question.type === 'Multiple Choice' ? (
          <span className="mt-2 block space-y-2">
            {question.options.map((option) => <label className="flex items-center gap-2 font-normal" key={option}><input type="radio" name={question.id} checked={value === option} onChange={() => onChange(option)} />{option}</label>)}
          </span>
        ) : (
          <span className="mt-2 block space-y-2">
            {question.options.map((option) => <label className="flex items-center gap-2 font-normal" key={option}><input type="checkbox" checked={(value || []).includes(option)} onChange={() => onToggle(option)} />{option}</label>)}
          </span>
        )}
      </label>
      <FieldError>{error}</FieldError>
    </section>
  );
}
