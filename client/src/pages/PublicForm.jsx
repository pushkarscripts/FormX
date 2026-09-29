import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import FieldError from '../components/FieldError.jsx';
import Button from '../components/Button.jsx';
import Badge from '../components/Badge.jsx';
import Card from '../components/Card.jsx';

export default function PublicForm() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [acceptingResponses, setAcceptingResponses] = useState(false);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);

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
    updateAnswer(
      questionId,
      current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current, option]
    );
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
          setErrors(
            Object.fromEntries(data.details.map((error) => [error.questionId, error.message]))
          );
        }
        throw new Error(data.error || 'Submission failed.');
      }
      setMessage(data.message || 'Response submitted successfully');
      setSubmittedSuccessfully(true);
      setAnswers({});
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="border-2 border-black bg-white p-8 text-center font-mono text-sm shadow-brutal flex items-center justify-center gap-2">
          <span className="inline-block w-3 h-3 bg-[#00f0ff] border border-black animate-pulse" />
          <span>LOADING PUBLIC FORM...</span>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="space-y-4 text-center py-10">
          <div className="w-14 h-14 border-2 border-black bg-[#ff3b30] text-white flex items-center justify-center font-mono font-black text-2xl mx-auto shadow-brutal">
            ✕
          </div>
          <h1 className="font-sans font-black text-2xl uppercase tracking-tight text-black">
            Form Unavailable
          </h1>
          <p className="text-sm font-mono text-neutral-600 max-w-md mx-auto">
            {message || 'The requested form could not be loaded or is not published.'}
          </p>
          <div className="pt-2">
            <Button to="/" variant="secondary" size="md">
              Return Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Success Screen
  if (submittedSuccessfully) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="border-2 border-black bg-white p-8 sm:p-12 shadow-brutal-lg text-center space-y-6">
          <div className="w-16 h-16 border-2 border-black bg-[#00d66c] flex items-center justify-center font-mono font-black text-3xl mx-auto shadow-brutal">
            ✓
          </div>

          <div className="space-y-2">
            <Badge variant="green" dot>
              Validation Passed &bull; q ∈ F
            </Badge>
            <h1 className="font-sans font-black text-3xl sm:text-4xl uppercase tracking-tight text-black">
              Response Recorded
            </h1>
            <p className="text-sm text-neutral-700 font-sans max-w-md mx-auto">
              Your submission has been verified against the form's automata rules and securely stored.
            </p>
          </div>

          <div className="border-2 border-black bg-[#fafaf7] p-4 text-xs font-mono text-neutral-700 max-w-sm mx-auto shadow-brutal-sm">
            <div className="font-bold text-black border-b border-black/10 pb-1 mb-1">
              AUTOMATA VERIFICATION STATUS
            </div>
            <div>STATUS: DETERMINISTIC ACCEPTANCE</div>
            <div>FORM: {form.title}</div>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              type="button"
              onClick={() => {
                setSubmittedSuccessfully(false);
                setMessage('');
              }}
            >
              Submit Another Response
            </Button>
            <Button to="/" variant="secondary" size="md">
              Visit FormX
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10">
      <form onSubmit={submit} className="space-y-6">
        {/* Form Header Card */}
        <header className="border-2 border-black bg-white p-6 sm:p-8 shadow-brutal relative overflow-hidden">
          <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 border-2 border-black bg-[#00f0ff] flex items-center justify-center font-mono font-bold text-xs shadow-[1px_1px_0_#000]">
                δ
              </span>
              <span className="font-sans font-bold text-xs uppercase tracking-wider text-black">
                FormX Public Respondent View
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold bg-[#fafaf7] border border-black px-1.5 py-0.5">
              AUTOMATA VERIFIED
            </span>
          </div>

          <h1 className="font-sans font-black text-3xl sm:text-4xl uppercase tracking-tight text-black leading-tight">
            {form.title}
          </h1>

          {form.description && (
            <p className="mt-3 text-sm sm:text-base text-neutral-700 whitespace-pre-wrap leading-relaxed font-sans">
              {form.description}
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-neutral-200 text-xs font-mono text-neutral-500">
            Fields marked with <span className="text-red-600 font-bold">*</span> are required.
          </div>
        </header>

        {/* Question Cards */}
        {form.questions.map((question, index) => (
          <QuestionInput
            key={question.id || question._id || index}
            question={question}
            index={index}
            value={answers[question.id || question._id]}
            error={errors[question.id || question._id]}
            onChange={(value) => updateAnswer(question.id || question._id, value)}
            onToggle={(option) => toggleCheckbox(question.id || question._id, option)}
          />
        ))}

        {/* Global Error Banner */}
        <FieldError>{message}</FieldError>

        {/* Closed or Submit Bar */}
        {!acceptingResponses ? (
          <div className="border-2 border-black bg-[#ffe600] p-4 text-black font-mono font-bold text-sm shadow-brutal flex items-center gap-3">
            <span className="text-lg">⚠</span>
            <span>This form is not currently accepting responses from respondents.</span>
          </div>
        ) : (
          <div className="pt-2 flex items-center justify-end">
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? 'Verifying & Submitting...' : 'Submit Response ➔'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

function QuestionInput({ question, index, value, error, onChange, onToggle }) {
  const questionNumber = String(index + 1).padStart(2, '0');
  const questionId = question.id || question._id;

  return (
    <section
      className={`border-2 border-black bg-white p-5 sm:p-6 shadow-brutal transition-all ${
        error ? 'border-[#ff3b30] shadow-[4px_4px_0_#ff3b30]' : ''
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="w-8 h-8 border-2 border-black bg-black text-white flex items-center justify-center font-mono font-black text-xs shrink-0 mt-0.5 shadow-[1px_1px_0_#00f0ff]">
          {questionNumber}
        </span>
        <label className="block text-base font-bold text-black leading-snug flex-1">
          {question.label}
          {question.required && (
            <span className="ml-1 text-red-600 font-black" aria-label="required">
              *
            </span>
          )}
        </label>
      </div>

      <div className="mt-3 pl-0 sm:pl-11">
        {question.type === 'Long Text' ? (
          <textarea
            className="input min-h-28 text-sm"
            placeholder="Enter your detailed response..."
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : ['Short Text', 'Email'].includes(question.type) ? (
          <input
            className="input text-sm"
            type={question.type === 'Email' ? 'email' : 'text'}
            placeholder={question.type === 'Email' ? 'name@example.com' : 'Your answer'}
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : question.type === 'Number' ? (
          <input
            className="input text-sm"
            type="number"
            placeholder="0"
            value={value ?? ''}
            onChange={(event) =>
              onChange(event.target.value === '' ? '' : Number(event.target.value))
            }
          />
        ) : question.type === 'Multiple Choice' ? (
          <div className="space-y-2">
            {question.options.map((option) => {
              const selected = value === option;
              return (
                <label
                  key={option}
                  className={`flex items-center gap-3 p-3 border-2 border-black cursor-pointer transition-all select-none ${
                    selected ? 'bg-[#00f0ff] font-bold shadow-brutal-sm' : 'bg-white hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={questionId}
                    className="w-4 h-4 accent-black cursor-pointer"
                    checked={selected}
                    onChange={() => onChange(option)}
                  />
                  <span className="text-sm font-medium text-black">{option}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {question.options.map((option) => {
              const selected = (value || []).includes(option);
              return (
                <label
                  key={option}
                  className={`flex items-center gap-3 p-3 border-2 border-black cursor-pointer transition-all select-none ${
                    selected ? 'bg-[#00f0ff] font-bold shadow-brutal-sm' : 'bg-white hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-black rounded-none border-2 border-black cursor-pointer"
                    checked={selected}
                    onChange={() => onToggle(option)}
                  />
                  <span className="text-sm font-medium text-black">{option}</span>
                </label>
              );
            })}
          </div>
        )}

        <FieldError>{error}</FieldError>
      </div>
    </section>
  );
}
