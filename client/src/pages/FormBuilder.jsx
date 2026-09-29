import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FieldError from '../components/FieldError.jsx';
import Button from '../components/Button.jsx';
import Badge from '../components/Badge.jsx';
import Card from '../components/Card.jsx';
import { apiRequest } from '../lib/api.js';

const TYPES = ['Short Text', 'Long Text', 'Number', 'Multiple Choice', 'Checkbox', 'Email'];
const CHOICE_TYPES = ['Multiple Choice', 'Checkbox'];

function newQuestion() {
  return { label: '', type: 'Short Text', required: false, regex: '', options: [] };
}

function cleanQuestion(question) {
  const value = {
    label: question.label.trim(),
    type: question.type,
    required: Boolean(question.required)
  };
  if (CHOICE_TYPES.includes(question.type)) {
    value.options = question.options.filter((option) => option.trim());
  }
  if (['Short Text', 'Long Text'].includes(question.type) && question.regex.trim()) {
    value.regex = question.regex.trim();
  }
  return value;
}

export default function FormBuilder() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    questions: [],
    published: false,
    acceptingResponses: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!editing) return;
    apiRequest(`/forms/${id}`)
      .then(({ form: savedForm }) =>
        setForm({
          ...savedForm,
          questions: savedForm.questions.map((question) => ({
            options: [],
            regex: '',
            ...question
          }))
        })
      )
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id, editing]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function copyPublicLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/public/forms/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function updateQuestion(index, field, value) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: value } : question
      )
    }));
  }

  function changeType(index, type) {
    updateQuestion(index, 'type', type);
    if (!CHOICE_TYPES.includes(type)) updateQuestion(index, 'options', []);
  }

  function moveQuestion(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= form.questions.length) return;
    const questions = [...form.questions];
    [questions[index], questions[nextIndex]] = [questions[nextIndex], questions[index]];
    updateForm('questions', questions);
  }

  function updateOption(questionIndex, optionIndex, value) {
    const options = [...form.questions[questionIndex].options];
    options[optionIndex] = value;
    updateQuestion(questionIndex, 'options', options);
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    if (!form.title.trim()) {
      setError('A form title is required.');
      return;
    }
    if (form.questions.some((question) => !question.label.trim())) {
      setError('Every question needs a label.');
      return;
    }
    if (
      form.questions.some(
        (question) =>
          CHOICE_TYPES.includes(question.type) &&
          question.options.filter((option) => option.trim()).length === 0
      )
    ) {
      setError('Choice questions need at least one non-empty option.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        questions: form.questions.map(cleanQuestion)
      };
      const data = await apiRequest(editing ? `/forms/${id}` : '/forms', {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify(payload)
      });
      navigate(`/forms/${data.form._id}/edit`, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="border-2 border-black bg-white p-8 text-center font-mono text-sm shadow-brutal flex items-center justify-center gap-2">
        <span className="inline-block w-3 h-3 bg-[#00f0ff] border border-black animate-pulse" />
        <span>LOADING FORM SCHEMA...</span>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-8 py-2">
      {/* Top Header / Actions Bar */}
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
              {editing ? '// Workspace' : '// New Draft'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-sans font-black text-2xl sm:text-3xl uppercase tracking-tight text-black">
              {editing ? (form.title || 'Edit Form') : 'Create Form'}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant={form.published ? 'cyan' : 'gray'} dot={form.published}>
                {form.published ? 'Published' : 'Draft'}
              </Badge>
              <Badge variant={form.acceptingResponses ? 'green' : 'yellow'}>
                {form.acceptingResponses ? 'Accepting Responses' : 'Closed'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {editing && (
            <Button to={`/forms/${id}/responses`} variant="secondary" size="md">
              Responses
            </Button>
          )}

          {editing && form.published && (
            <Button
              variant={copied ? 'yellow' : 'secondary'}
              size="md"
              type="button"
              onClick={copyPublicLink}
            >
              {copied ? '✓ Link Copied!' : 'Copy Public Link'}
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving Form...' : 'Save Form ➔'}
          </Button>
        </div>
      </div>

      <FieldError>{error}</FieldError>

      {/* Form Metadata Section */}
      <Card className="space-y-5">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black bg-black text-white px-2 py-0.5">
              00
            </span>
            <h2 className="font-sans text-lg font-black uppercase tracking-tight text-black">
              Form Configuration &amp; Metadata
            </h2>
          </div>
          <span className="font-mono text-xs text-neutral-500 font-bold uppercase">
            Global Settings
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">
              Form Title <span className="text-red-600">*</span>
            </label>
            <input
              className="input font-sans text-base font-bold"
              placeholder="e.g., Computer Science Course Feedback"
              value={form.title}
              onChange={(event) => updateForm('title', event.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">
              Form Description (Optional)
            </label>
            <textarea
              className="input font-sans min-h-24 text-sm"
              placeholder="Describe the objective, guidelines, or submission instructions for respondents."
              value={form.description}
              onChange={(event) => updateForm('description', event.target.value)}
            />
          </div>

          {/* Toggle Switches */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="border-2 border-black p-3.5 bg-[#fafaf7] flex items-start gap-3 cursor-pointer hover:bg-[#f6fcfe] transition-colors select-none shadow-brutal-sm">
              <input
                type="checkbox"
                className="w-5 h-5 mt-0.5 accent-black rounded-none border-2 border-black cursor-pointer"
                checked={form.published}
                onChange={(event) => updateForm('published', event.target.checked)}
              />
              <div className="flex flex-col">
                <span className="font-sans font-bold text-sm text-black uppercase">
                  Published Online
                </span>
                <span className="text-xs text-neutral-600 font-mono mt-0.5">
                  When enabled, the form can be viewed and submitted via its public link.
                </span>
              </div>
            </label>

            <label className="border-2 border-black p-3.5 bg-[#fafaf7] flex items-start gap-3 cursor-pointer hover:bg-[#f6fcfe] transition-colors select-none shadow-brutal-sm">
              <input
                type="checkbox"
                className="w-5 h-5 mt-0.5 accent-black rounded-none border-2 border-black cursor-pointer"
                checked={form.acceptingResponses}
                onChange={(event) => updateForm('acceptingResponses', event.target.checked)}
              />
              <div className="flex flex-col">
                <span className="font-sans font-bold text-sm text-black uppercase">
                  Accepting Responses
                </span>
                <span className="text-xs text-neutral-600 font-mono mt-0.5">
                  When unchecked, the form is closed to new respondent submissions.
                </span>
              </div>
            </label>
          </div>
        </div>
      </Card>

      {/* Questions Canvas Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-3">
          <div className="flex items-center gap-3">
            <h2 className="font-sans text-2xl font-black uppercase tracking-tight text-black">
              Questions Canvas
            </h2>
            <Badge variant="cyan">
              {form.questions.length} {form.questions.length === 1 ? 'Block' : 'Blocks'}
            </Badge>
          </div>

          <Button
            variant="primary"
            size="sm"
            type="button"
            onClick={() => updateForm('questions', [...form.questions, newQuestion()])}
          >
            + Add Question Block
          </Button>
        </div>

        {form.questions.length === 0 && (
          <div className="border-2 border-dashed border-black bg-white p-8 text-center shadow-brutal-sm space-y-3">
            <p className="font-sans font-bold text-base text-black uppercase">
              No questions configured yet
            </p>
            <p className="text-xs text-neutral-600 font-sans max-w-sm mx-auto">
              Add your first question block above to configure fields and attach automata regex rules.
            </p>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => updateForm('questions', [...form.questions, newQuestion()])}
            >
              + Add First Question
            </Button>
          </div>
        )}

        {/* Question Blocks */}
        <div className="space-y-6">
          {form.questions.map((question, index) => (
            <QuestionEditor
              key={question._id || index}
              question={question}
              index={index}
              total={form.questions.length}
              onChange={updateQuestion}
              onTypeChange={changeType}
              onMove={moveQuestion}
              onRemove={() =>
                updateForm(
                  'questions',
                  form.questions.filter((_, questionIndex) => questionIndex !== index)
                )
              }
              onOptionChange={updateOption}
              onAddOption={() => updateQuestion(index, 'options', [...question.options, ''])}
              onRemoveOption={(optionIndex) =>
                updateQuestion(
                  index,
                  'options',
                  question.options.filter((_, currentIndex) => currentIndex !== optionIndex)
                )
              }
            />
          ))}
        </div>

        {/* Canvas Bottom Save CTA */}
        {form.questions.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t-2 border-black">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => updateForm('questions', [...form.questions, newQuestion()])}
            >
              + Add Another Question
            </Button>

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving Form...' : 'Save Form Changes ➔'}
            </Button>
          </div>
        )}
      </section>
    </form>
  );
}

function QuestionEditor({
  question,
  index,
  total,
  onChange,
  onTypeChange,
  onMove,
  onRemove,
  onOptionChange,
  onAddOption,
  onRemoveOption
}) {
  const questionNumber = String(index + 1).padStart(2, '0');

  return (
    <article className="border-2 border-black bg-white p-5 sm:p-6 shadow-brutal transition-all space-y-5 relative">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border-2 border-black bg-black text-white flex items-center justify-center font-mono font-black text-sm shadow-[2px_2px_0_#00f0ff]">
            {questionNumber}
          </div>
          <span className="font-sans font-bold text-sm uppercase text-black">
            Question Block #{questionNumber}
          </span>
          <span className="font-mono text-[11px] bg-neutral-100 border border-black px-2 py-0.5 font-bold">
            {question.type}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center font-mono font-black text-xs shadow-brutal-sm hover:bg-[#00f0ff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white"
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            title="Move question up"
            aria-label="Move question up"
          >
            ↑
          </button>
          <button
            className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center font-mono font-black text-xs shadow-brutal-sm hover:bg-[#00f0ff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white"
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
            title="Move question down"
            aria-label="Move question down"
          >
            ↓
          </button>
          <button
            className="h-8 px-2.5 border-2 border-black bg-white text-[#ff3b30] font-mono font-bold text-xs uppercase shadow-brutal-sm hover:bg-[#ff3b30] hover:text-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ml-1"
            type="button"
            onClick={onRemove}
          >
            ✕ Delete
          </button>
        </div>
      </div>

      {/* Inputs: Label & Type */}
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-8">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">
            Question Prompt / Label <span className="text-red-600">*</span>
          </label>
          <input
            className="input font-medium"
            placeholder="e.g., What is your full legal name?"
            value={question.label}
            onChange={(event) => onChange(index, 'label', event.target.value)}
            required
          />
        </div>

        <div className="md:col-span-4">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">
            Input Type
          </label>
          <select
            className="input font-bold bg-white cursor-pointer"
            value={question.type}
            onChange={(event) => onTypeChange(index, event.target.value)}
          >
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Required Checkbox */}
      <div>
        <label className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-black cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 accent-black rounded-none border-2 border-black cursor-pointer"
            checked={question.required}
            onChange={(event) => onChange(index, 'required', event.target.checked)}
          />
          <span>Mark as Required Field</span>
        </label>
      </div>

      {/* Regex UI (For Short Text & Long Text) */}
      {['Short Text', 'Long Text'].includes(question.type) && (
        <div className="border-2 border-black bg-[#fafaf7] p-4 shadow-brutal-sm space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-xs font-mono font-black uppercase tracking-wider text-black">
              // Custom Automata Validation Rule (FLAT Regex)
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold bg-[#00f0ff] border border-black px-1.5 py-0.5 text-black">
                REGEX → ε-NFA → DFA
              </span>
              <Link
                to="/docs"
                target="_blank"
                className="font-mono text-[10px] text-neutral-600 hover:text-black underline"
              >
                Supported Syntax ↗
              </Link>
            </div>
          </div>

          <div className="relative">
            <input
              className="input font-mono text-sm bg-white border-2 border-black placeholder:text-neutral-400"
              value={question.regex || ''}
              onChange={(event) => onChange(index, 'regex', event.target.value)}
              placeholder="e.g. [A-Za-z ]* or [0-9][0-9]*"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-600">
            <span>Leave blank for standard freeform input.</span>
            <span className="text-[#008f9c] font-bold">Linear DFA Simulation</span>
          </div>
        </div>
      )}

      {/* Choice Options (For Multiple Choice & Checkbox) */}
      {CHOICE_TYPES.includes(question.type) && (
        <div className="border-2 border-black bg-[#fafaf7] p-4 shadow-brutal-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-black">
              Selectable Options ({question.options.length})
            </p>
            <span className="text-[11px] font-mono text-neutral-500">
              At least one option required
            </span>
          </div>

          <div className="space-y-2">
            {question.options.map((option, optionIndex) => (
              <div className="flex items-center gap-2" key={optionIndex}>
                <span className="w-6 font-mono text-xs font-bold text-neutral-500 text-center">
                  {optionIndex + 1}.
                </span>
                <input
                  className="input font-medium"
                  value={option}
                  onChange={(event) => onOptionChange(index, optionIndex, event.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                />
                <button
                  className="w-10 h-10 border-2 border-black bg-white text-[#ff3b30] flex items-center justify-center font-mono font-bold shadow-brutal-sm hover:bg-[#ff3b30] hover:text-white active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0"
                  type="button"
                  onClick={() => onRemoveOption(optionIndex)}
                  title="Remove option"
                  aria-label="Remove option"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="pt-1">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={onAddOption}
            >
              + Add Choice Option
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
