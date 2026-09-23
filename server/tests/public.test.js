import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Form from '../src/models/Form.js';
import Response from '../src/models/Response.js';
import { connectToDatabase, disconnectFromDatabase } from '../src/config/database.js';

let mongo;
let form;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ binary: { version: '8.2.6' } });
  await connectToDatabase(mongo.getUri());
});

beforeEach(async () => {
  await Form.deleteMany({});
  await Response.deleteMany({});
  form = await Form.create({
    title: 'Public survey',
    description: 'A test form',
    owner: new mongoose.Types.ObjectId(),
    published: true,
    acceptingResponses: true,
    questions: [
      { label: 'Name', type: 'Short Text', required: true, regex: '[a-zA-Z ]*' },
      { label: 'Age', type: 'Number', required: true },
      { label: 'Color', type: 'Multiple Choice', options: ['Red', 'Blue'] },
      { label: 'Topics', type: 'Checkbox', options: ['Math', 'Theory'] },
      { label: 'Email', type: 'Email', required: true }
    ]
  });
});

afterAll(async () => {
  await disconnectFromDatabase();
  await mongo.stop();
});

function answerSet(overrides = {}) {
  const [name, age, color, topics, email] = form.questions;
  return {
    [name.id]: 'Ada Lovelace',
    [age.id]: 36,
    [color.id]: 'Blue',
    [topics.id]: ['Math'],
    [email.id]: 'ada@example.com',
    ...overrides
  };
}

describe('public forms', () => {
  it('fetches a published form without exposing its owner', async () => {
    const response = await request(app).get(`/api/public/forms/${form.id}`);
    expect(response.status).toBe(200);
    expect(response.body.form.title).toBe('Public survey');
    expect(response.body.form.owner).toBeUndefined();
    expect(response.body.form.questions[0].regex).toBeUndefined();
  });

  it('rejects unpublished forms and closed submissions', async () => {
    await Form.updateOne({ _id: form.id }, { published: false });
    expect((await request(app).get(`/api/public/forms/${form.id}`)).status).toBe(404);

    await Form.updateOne({ _id: form.id }, { published: true, acceptingResponses: false });
    expect((await request(app).post(`/api/public/forms/${form.id}/responses`).send({ answers: answerSet() })).status).toBe(404);
  });

  it('accepts a valid unauthenticated response', async () => {
    const response = await request(app).post(`/api/public/forms/${form.id}/responses`).send({ answers: answerSet() });
    expect(response.status).toBe(201);
    expect(await Response.countDocuments()).toBe(1);
  });

  it('rejects missing, unknown, and invalid answers', async () => {
    const missing = await request(app).post(`/api/public/forms/${form.id}/responses`).send({ answers: answerSet({ [form.questions[0].id]: '' }) });
    expect(missing.status).toBe(400);

    const unknown = await request(app).post(`/api/public/forms/${form.id}/responses`).send({ answers: { ...answerSet(), unknown: 'value' } });
    expect(unknown.status).toBe(400);

    const invalid = await request(app).post(`/api/public/forms/${form.id}/responses`).send({
      answers: answerSet({
        [form.questions[1].id]: Infinity,
        [form.questions[2].id]: 'Green',
        [form.questions[3].id]: ['Theory', 'Other'],
        [form.questions[4].id]: 'not-an-email'
      })
    });
    expect(invalid.status).toBe(400);
    expect(invalid.body.details).toHaveLength(4);
  });

  it('uses the automata DFA for matching and rejects non-matches', async () => {
    const valid = await request(app).post(`/api/public/forms/${form.id}/responses`).send({ answers: answerSet() });
    expect(valid.status).toBe(201);

    const invalid = await request(app).post(`/api/public/forms/${form.id}/responses`).send({
      answers: answerSet({ [form.questions[0].id]: 'Ada123' })
    });
    expect(invalid.status).toBe(400);
    expect(invalid.body.details[0].message).toContain('does not match');
  });

  it('reports invalid regex configuration instead of crashing', async () => {
    await Form.updateOne({ _id: form.id }, { $set: { 'questions.0.regex': '(' } });
    const response = await request(app).post(`/api/public/forms/${form.id}/responses`).send({ answers: answerSet() });
    expect(response.status).toBe(500);
    expect(response.body.error).toContain('invalid regex configuration');
  });
});
