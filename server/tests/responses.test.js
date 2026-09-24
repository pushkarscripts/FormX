import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Admin from '../src/models/Admin.js';
import Form from '../src/models/Form.js';
import Response from '../src/models/Response.js';
import { connectToDatabase, disconnectFromDatabase } from '../src/config/database.js';

process.env.JWT_SECRET = 'test-only-jwt-secret';

let mongo;
let owner;
let other;
let form;
let token;
let otherToken;

async function register(email) {
  const result = await request(app).post('/api/auth/register').send({
    email,
    password: 'correct horse battery staple'
  });
  return result.body;
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ binary: { version: '8.2.6' } });
  await connectToDatabase(mongo.getUri());
});

beforeEach(async () => {
  await Admin.deleteMany({});
  await Form.deleteMany({});
  await Response.deleteMany({});
  const first = await register('response-owner@example.com');
  const second = await register('response-other@example.com');
  owner = await Admin.findOne({ email: 'response-owner@example.com' });
  other = await Admin.findOne({ email: 'response-other@example.com' });
  token = first.token;
  otherToken = second.token;
  form = await Form.create({
    title: 'Export, "quotes" and\nnewlines',
    owner: owner._id,
    published: true,
    acceptingResponses: true,
    questions: [
      { label: 'Name', type: 'Short Text', required: true },
      { label: 'Topics', type: 'Checkbox', options: ['Math', 'Theory'] },
      { label: 'Optional', type: 'Short Text' }
    ]
  });
});

afterAll(async () => {
  await disconnectFromDatabase();
  await mongo.stop();
});

async function addResponse(answers = {}) {
  return Response.create({ form: form._id, answers });
}

describe('admin response management', () => {
  it('rejects unauthenticated requests and prevents cross-admin access', async () => {
    expect((await request(app).get(`/api/forms/${form.id}/responses`)).status).toBe(401);
    expect((await request(app).get(`/api/forms/${form.id}/responses`).set('Authorization', `Bearer ${otherToken}`)).status).toBe(404);
  });

  it('lists and retrieves owned responses newest first', async () => {
    const first = await addResponse({ [form.questions[0].id]: 'First' });
    await new Promise((resolve) => setTimeout(resolve, 5));
    const second = await addResponse({ [form.questions[0].id]: 'Second' });
    const list = await request(app).get(`/api/forms/${form.id}/responses`).set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.responses.map((response) => response.id)).toEqual([second.id, first.id]);

    const detail = await request(app).get(`/api/forms/${form.id}/responses/${first.id}`).set('Authorization', `Bearer ${token}`);
    expect(detail.status).toBe(200);
    expect(detail.body.form.owner).toBeUndefined();
    expect(detail.body.response.answers[form.questions[0].id]).toBe('First');
  });

  it('keeps responses accessible after form closure', async () => {
    const response = await addResponse({ [form.questions[0].id]: 'Saved' });
    await Form.updateOne({ _id: form.id }, { acceptingResponses: false });
    const result = await request(app).get(`/api/forms/${form.id}/responses/${response.id}`).set('Authorization', `Bearer ${token}`);
    expect(result.status).toBe(200);
  });

  it('exports escaped CSV with optional blanks, checkbox values, and formula protection', async () => {
    await addResponse({
      [form.questions[0].id]: '=SUM(A1)',
      [form.questions[1].id]: ['Math', 'Theory'],
      [form.questions[2].id]: 'Export, "quotes" and\nnewlines'
    });
    const result = await request(app).get(`/api/forms/${form.id}/responses/export`).set('Authorization', `Bearer ${token}`);
    expect(result.status).toBe(200);
    expect(result.headers['content-type']).toContain('text/csv');
    expect(result.headers['content-disposition']).toContain(`form-${form.id}-responses.csv`);
    expect(result.text).toContain('"Submitted At","Name","Topics","Optional"');
    expect(result.text).toContain("'=SUM(A1)");
    expect(result.text).toContain('"Math, Theory"');
    expect(result.text).toContain('"Export, ""quotes"" and\nnewlines"');
  });

  it('exports a form with no responses as headers only', async () => {
    const result = await request(app).get(`/api/forms/${form.id}/responses/export`).set('Authorization', `Bearer ${token}`);
    expect(result.status).toBe(200);
    expect(result.text).toBe('"Submitted At","Name","Topics","Optional"\r\n');
  });

  it('returns 404 for a response that is not attached to the form', async () => {
    const response = await addResponse();
    const unrelatedForm = await Form.create({
      title: 'Other form',
      owner: owner._id,
      questions: []
    });
    const result = await request(app).get(`/api/forms/${unrelatedForm.id}/responses/${response.id}`).set('Authorization', `Bearer ${token}`);
    expect(result.status).toBe(404);
  });
});
