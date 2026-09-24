import express from 'express';
import mongoose from 'mongoose';
import Form from '../models/Form.js';
import Response from '../models/Response.js';
import requireAuth from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

function formData(body) {
  const allowed = ['title', 'description', 'questions', 'published', 'acceptingResponses'];
  return Object.fromEntries(Object.entries(body ?? {}).filter(([key]) => allowed.includes(key)));
}

router.post('/', async (req, res, next) => {
  try {
    const form = await Form.create({ ...formData(req.body), owner: req.adminId });
    return res.status(201).json({ form });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const forms = await Form.find({ owner: req.adminId }).sort({ createdAt: -1 });
    return res.status(200).json({ forms });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', getOwnedForm);
router.get('/:id/responses/export', exportResponses);
router.get('/:id/responses', listResponses);
router.get('/:id/responses/:responseId', getResponse);
router.patch('/:id', updateOwnedForm);
router.put('/:id', updateOwnedForm);
router.delete('/:id', deleteOwnedForm);

async function getOwnedForm(req, res, next) {
  try {
    const form = await Form.findOne({ _id: req.params.id, owner: req.adminId });
    if (!form) return res.status(404).json({ error: 'Form not found' });
    return res.status(200).json({ form });
  } catch (error) {
    if (error.name === 'CastError') return res.status(404).json({ error: 'Form not found' });
    return next(error);
  }
}

async function updateOwnedForm(req, res, next) {
  try {
    const form = await Form.findOneAndUpdate(
      { _id: req.params.id, owner: req.adminId },
      formData(req.body),
      { new: true, runValidators: true }
    );
    if (!form) return res.status(404).json({ error: 'Form not found' });
    return res.status(200).json({ form });
  } catch (error) {
    if (error.name === 'CastError') return res.status(404).json({ error: 'Form not found' });
    if (error.name === 'ValidationError') return res.status(400).json({ error: error.message });
    return next(error);
  }
}

async function deleteOwnedForm(req, res, next) {
  try {
    const form = await Form.findOneAndDelete({ _id: req.params.id, owner: req.adminId });
    if (!form) return res.status(404).json({ error: 'Form not found' });
    return res.status(204).send();
  } catch (error) {
    if (error.name === 'CastError') return res.status(404).json({ error: 'Form not found' });
    return next(error);
  }
}

async function findOwnedForm(id, adminId) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Form.findOne({ _id: id, owner: adminId });
}

function answerValue(response, questionId) {
  if (response.answers instanceof Map) return response.answers.get(questionId);
  return response.answers?.[questionId];
}

function displayAnswer(value) {
  if (Array.isArray(value)) return value.join(', ');
  if (value === undefined || value === null) return '';
  return String(value);
}

function csvCell(value) {
  let text = displayAnswer(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

async function listResponses(req, res, next) {
  try {
    const form = await findOwnedForm(req.params.id, req.adminId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    const responses = await Response.find({ form: form._id }).sort({ submittedAt: -1 }).lean();
    return res.status(200).json({
      form: { id: form.id, title: form.title },
      responses: responses.map((response) => ({
        id: response._id,
        submittedAt: response.submittedAt,
        answers: response.answers
      }))
    });
  } catch (error) {
    return next(error);
  }
}

async function getResponse(req, res, next) {
  try {
    const form = await findOwnedForm(req.params.id, req.adminId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    if (!mongoose.isValidObjectId(req.params.responseId)) {
      return res.status(404).json({ error: 'Response not found' });
    }
    const response = await Response.findOne({ _id: req.params.responseId, form: form._id }).lean();
    if (!response) return res.status(404).json({ error: 'Response not found' });
    return res.status(200).json({
      form: { id: form.id, title: form.title, questions: form.questions },
      response: { id: response._id, submittedAt: response.submittedAt, answers: response.answers }
    });
  } catch (error) {
    return next(error);
  }
}

async function exportResponses(req, res, next) {
  try {
    const form = await findOwnedForm(req.params.id, req.adminId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    const responses = await Response.find({ form: form._id }).sort({ submittedAt: -1 }).lean();
    const headers = ['Submitted At', ...form.questions.map((question) => question.label)];
    const rows = responses.map((response) => [
      response.submittedAt.toISOString(),
      ...form.questions.map((question) => answerValue(response, question._id.toString()))
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="form-${form.id}-responses.csv"`
    });
    return res.status(200).send(csv);
  } catch (error) {
    return next(error);
  }
}

export default router;
