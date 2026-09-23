import express from 'express';
import mongoose from 'mongoose';
import Form from '../models/Form.js';
import Response from '../models/Response.js';
import { validateAnswers } from '../validation/responses.js';

const router = express.Router();

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function publicForm(form) {
  return {
    id: form._id,
    title: form.title,
    description: form.description,
    questions: form.questions.map((question) => ({
      id: question._id,
      label: question.label,
      type: question.type,
      required: question.required,
      ...(question.options ? { options: question.options } : {})
    }))
  };
}

router.get('/forms/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Form not found' });
  try {
    const form = await Form.findOne({ _id: req.params.id, published: true });
    if (!form) return res.status(404).json({ error: 'Form not found or unpublished' });
    return res.status(200).json({ form: publicForm(form), acceptingResponses: form.acceptingResponses });
  } catch (error) {
    return next(error);
  }
});

router.post('/forms/:id/responses', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Form not found' });
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      published: true,
      acceptingResponses: true
    });
    if (!form) return res.status(404).json({ error: 'Form not found or not accepting responses' });

    const result = validateAnswers(form, req.body?.answers);
    if (result.configurationError) {
      return res.status(500).json({ error: result.errors[0].message });
    }
    if (result.errors.length > 0) {
      return res.status(400).json({ error: 'Response validation failed', details: result.errors });
    }

    const response = await Response.create({ form: form._id, answers: req.body.answers });
    return res.status(201).json({ message: 'Response submitted successfully', id: response.id });
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ error: error.message });
    return next(error);
  }
});

export default router;
