import { subsetConstruction, simulateDFA } from 'automata';

const TEXT_TYPES = new Set(['Short Text', 'Long Text']);

function isEmpty(value) {
  return value === undefined || value === null ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0);
}

function isEmail(value) {
  if (typeof value !== 'string') return false;
  const at = value.indexOf('@');
  const dot = value.lastIndexOf('.');
  return at > 0 && dot > at + 1 && dot < value.length - 1 &&
    !value.includes(' ') && value.indexOf('@') === at;
}

function invalid(question, message) {
  return { questionId: question._id.toString(), message: `${question.label}: ${message}` };
}

export function validateAnswers(form, submittedAnswers) {
  if (!submittedAnswers || typeof submittedAnswers !== 'object' ||
    Array.isArray(submittedAnswers)) {
    return { errors: [{ message: 'Answers must be an object keyed by question ID' }] };
  }

  const questionIds = new Set(form.questions.map((question) => question._id.toString()));
  const unknownId = Object.keys(submittedAnswers).find((id) => !questionIds.has(id));
  if (unknownId) {
    return { errors: [{ questionId: unknownId, message: 'Unknown question ID' }] };
  }

  const errors = [];
  for (const question of form.questions) {
    const questionId = question._id.toString();
    const value = submittedAnswers[questionId];

    if (isEmpty(value)) {
      if (question.required) errors.push(invalid(question, 'an answer is required'));
      continue;
    }

    if (question.type === 'Short Text' || question.type === 'Long Text') {
      if (typeof value !== 'string') {
        errors.push(invalid(question, 'must be text'));
      } else if (question.regex) {
        try {
          const dfa = subsetConstruction(question.regex);
          if (!simulateDFA(dfa, value)) errors.push(invalid(question, 'does not match the configured pattern'));
        } catch {
          return {
            configurationError: true,
            errors: [{ questionId, message: `${question.label}: invalid regex configuration` }]
          };
        }
      }
    } else if (question.type === 'Number') {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        errors.push(invalid(question, 'must be a finite number'));
      }
    } else if (question.type === 'Multiple Choice') {
      if (typeof value !== 'string' || !question.options.includes(value)) {
        errors.push(invalid(question, 'must be one configured option'));
      }
    } else if (question.type === 'Checkbox') {
      if (!Array.isArray(value) || value.some((option) => typeof option !== 'string' || !question.options.includes(option))) {
        errors.push(invalid(question, 'contains an invalid option'));
      }
    } else if (question.type === 'Email' && !isEmail(value)) {
      errors.push(invalid(question, 'must be a valid email address'));
    }
  }

  return { errors };
}
