import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Admin from '../src/models/Admin.js';
import { connectToDatabase, disconnectFromDatabase } from '../src/config/database.js';

process.env.JWT_SECRET = 'test-only-jwt-secret';

let mongo;
let first;
let second;

async function register(email) {
  const response = await request(app).post('/api/auth/register').send({
    email,
    password: 'correct horse battery staple'
  });
  return response.body;
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ binary: { version: '8.2.6' } });
  await connectToDatabase(mongo.getUri());
});

beforeEach(async () => {
  await Admin.deleteMany({});
  await mongoose.connection.collection('forms').deleteMany({});
  first = await register('first@example.com');
  second = await register('second@example.com');
});

afterAll(async () => {
  await disconnectFromDatabase();
  await mongo.stop();
});

describe('authentication', () => {
  it('registers with a hash and rejects duplicate accounts', async () => {
    const admin = await Admin.findOne({ email: 'first@example.com' }).select('+password');
    expect(admin.password).not.toBe('correct horse battery staple');
    const duplicate = await request(app).post('/api/auth/register').send({
      email: 'FIRST@example.com',
      password: 'correct horse battery staple'
    });
    expect(duplicate.status).toBe(409);
  });

  it('logs in with the password and rejects invalid credentials', async () => {
    const login = await request(app).post('/api/auth/login').send({
      email: 'first@example.com',
      password: 'correct horse battery staple'
    });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTypeOf('string');

    const invalid = await request(app).post('/api/auth/login').send({
      email: 'first@example.com',
      password: 'wrong password'
    });
    expect(invalid.status).toBe(401);
  });

  it('rejects missing and invalid JWTs', async () => {
    expect((await request(app).get('/api/forms')).status).toBe(401);
    expect((await request(app).get('/api/forms').set('Authorization', 'Bearer invalid')).status).toBe(401);
  });
});

describe('form CRUD and ownership', () => {
  it('creates, lists, retrieves, updates, and deletes an owned form', async () => {
    const payload = {
      title: 'Contact form',
      description: 'Tell us about yourself',
      questions: [
        { label: 'Name', type: 'Short Text', required: true, regex: '[a-zA-Z ]*' },
        { label: 'Role', type: 'Multiple Choice', options: ['Student', 'Teacher'] }
      ]
    };
    const created = await request(app).post('/api/forms').set('Authorization', `Bearer ${first.token}`).send(payload);
    expect(created.status).toBe(201);
    const id = created.body.form._id;

    const list = await request(app).get('/api/forms').set('Authorization', `Bearer ${first.token}`);
    expect(list.body.forms).toHaveLength(1);
    expect((await request(app).get(`/api/forms/${id}`).set('Authorization', `Bearer ${first.token}`)).status).toBe(200);

    const updated = await request(app).patch(`/api/forms/${id}`).set('Authorization', `Bearer ${first.token}`).send({ published: true });
    expect(updated.status).toBe(200);
    expect(updated.body.form.published).toBe(true);

    expect((await request(app).delete(`/api/forms/${id}`).set('Authorization', `Bearer ${first.token}`)).status).toBe(204);
    expect((await request(app).get(`/api/forms/${id}`).set('Authorization', `Bearer ${first.token}`)).status).toBe(404);
  });

  it('does not expose forms to another admin', async () => {
    const created = await request(app).post('/api/forms').set('Authorization', `Bearer ${first.token}`).send({ title: 'Private' });
    const response = await request(app).get(`/api/forms/${created.body.form._id}`).set('Authorization', `Bearer ${second.token}`);
    expect(response.status).toBe(404);
  });

  it('rejects invalid form data', async () => {
    const response = await request(app).post('/api/forms').set('Authorization', `Bearer ${first.token}`).send({
      title: '',
      questions: [{ label: 'Bad', type: 'Multiple Choice' }]
    });
    expect(response.status).toBe(400);
  });
});
