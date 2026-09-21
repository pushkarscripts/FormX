import express from 'express';
import Form from '../models/Form.js';
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

export default router;
