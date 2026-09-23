import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FieldError from '../components/FieldError.jsx';
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
  if (CHOICE_TYPES.includes(question.type)) value.options = question.options.filter((option) => option.trim());
  if (['Short Text', 'Long Text'].includes(question.type) && question.regex.trim()) value.regex = question.regex.trim();
  return value;
}

export default function FormBuilder() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', questions: [], published: false, acceptingResponses: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!editing) return;
    apiRequest(`/forms/${id}`)
      .then(({ form: savedForm }) => setForm({
        ...savedForm,
        questions: savedForm.questions.map((question) => ({ options: [], regex: '', ...question }))
      }))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id, editing]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function copyPublicLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/public/forms/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function updateQuestion(index, field, value) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: value } : question)
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
    if (form.questions.some((question) => CHOICE_TYPES.includes(question.type) && question.options.filter((option) => option.trim()).length === 0)) {
      setError('Choice questions need at least one option.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, title: form.title.trim(), questions: form.questions.map(cleanQuestion) };
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

  if (loading) return <p className="text-sm text-slate-500">Loading form...</p>;

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link className="text-sm text-indigo-600 hover:text-indigo-500" to="/dashboard">← Back to dashboard</Link>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{editing ? 'Edit form' : 'Create form'}</h1>
        </div>
        <button className="button-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save form'}</button>
        {editing && form.published && <button className="button-secondary" type="button" onClick={copyPublicLink}>{copied ? 'Copied' : 'Copy public link'}</button>}
      </div>
      <FieldError>{error}</FieldError>
      <section className="card space-y-4">
        <h2 className="section-title">Form details</h2>
        <label className="block text-sm font-medium text-slate-700">
          Title
          <input className="input mt-1" value={form.title} onChange={(event) => updateForm('title', event.target.value)} required />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Description
          <textarea className="input mt-1 min-h-24" value={form.description} onChange={(event) => updateForm('description', event.target.value)} />
        </label>
        <div className="flex flex-wrap gap-5 text-sm text-slate-700">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.published} onChange={(event) => updateForm('published', event.target.checked)} /> Published</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.acceptingResponses} onChange={(event) => updateForm('acceptingResponses', event.target.checked)} /> Accepting responses</label>
        </div>
      </section>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Questions</h2>
          <button className="button-secondary" type="button" onClick={() => updateForm('questions', [...form.questions, newQuestion()])}>Add question</button>
        </div>
        {form.questions.length === 0 && <div className="card text-sm text-slate-500">No questions yet. Add one to build the form.</div>}
        {form.questions.map((question, index) => (
          <QuestionEditor
            key={question._id || index}
            question={question}
            index={index}
            total={form.questions.length}
            onChange={updateQuestion}
            onTypeChange={changeType}
            onMove={moveQuestion}
            onRemove={() => updateForm('questions', form.questions.filter((_, questionIndex) => questionIndex !== index))}
            onOptionChange={updateOption}
            onAddOption={() => updateQuestion(index, 'options', [...question.options, ''])}
            onRemoveOption={(optionIndex) => updateQuestion(index, 'options', question.options.filter((_, currentIndex) => currentIndex !== optionIndex))}
          />
        ))}
      </section>
    </form>
  );
}

function QuestionEditor({ question, index, total, onChange, onTypeChange, onMove, onRemove, onOptionChange, onAddOption, onRemoveOption }) {
  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Question {index + 1}</h3>
        <div className="flex gap-1">
          <button className="icon-button" type="button" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label="Move question up">↑</button>
          <button className="icon-button" type="button" onClick={() => onMove(index, 1)} disabled={index === total - 1} aria-label="Move question down">↓</button>
          <button className="button-danger" type="button" onClick={onRemove}>Remove</button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Label
          <input className="input mt-1" value={question.label} onChange={(event) => onChange(index, 'label', event.target.value)} required />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Type
          <select className="input mt-1" value={question.type} onChange={(event) => onTypeChange(index, event.target.value)}>
            {TYPES.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={question.required} onChange={(event) => onChange(index, 'required', event.target.checked)} /> Required
      </label>
      {['Short Text', 'Long Text'].includes(question.type) && (
        <label className="block text-sm font-medium text-slate-700">
          Optional custom regex
          <input className="input mt-1 font-mono" value={question.regex || ''} onChange={(event) => onChange(index, 'regex', event.target.value)} placeholder="Example: [a-zA-Z ]*" />
        </label>
      )}
      {CHOICE_TYPES.includes(question.type) && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Options</p>
          {question.options.map((option, optionIndex) => (
            <div className="flex gap-2" key={optionIndex}>
              <input className="input" value={option} onChange={(event) => onOptionChange(index, optionIndex, event.target.value)} placeholder={`Option ${optionIndex + 1}`} />
              <button className="button-danger" type="button" onClick={() => onRemoveOption(optionIndex)}>Remove</button>
            </div>
          ))}
          <button className="button-secondary" type="button" onClick={onAddOption}>Add option</button>
        </div>
      )}
    </div>
  );
}
