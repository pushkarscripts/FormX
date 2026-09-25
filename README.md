# FormX

FormX is a form creation and response collection platform built as a
university capstone project for demonstrating practical applications of
Formal Language and Automata Theory (FLAT). Form responses can be validated
with a custom regular-expression engine that constructs finite automata and
simulates a DFA instead of using JavaScript's native `RegExp` engine.

## Features

- Admin registration, login, JWT authentication, and logout
- Form creation, editing, publication, and response closure
- Public forms available through shareable links without respondent accounts
- Custom Short Text and Long Text validation using DFA simulation
- Admin response management and CSV export

## Tech stack

- **Frontend:** React 18, React Router, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Mongoose, bcryptjs, JSON Web Tokens
- **Database:** MongoDB
- **Automata engine:** Standalone JavaScript package implementing tokenization,
  parsing, Thompson ε-NFA construction, ε-closure, subset construction, and
  DFA simulation
- **Testing:** Vitest, Supertest, and MongoDB Memory Server

## Prerequisites

- Node.js 18 or later
- npm 9 or later
- MongoDB running locally or a reachable MongoDB deployment
- Git

The repository uses npm workspaces for `client/`, `server/`, and `automata/`.

## Local setup

1. Clone the repository and enter its directory:

   ```bash
   git clone REPOSITORY_URL
   cd RegX_Form
   ```

2. Install all workspace dependencies from the repository root:

   ```bash
   npm install
   ```

3. Create the server environment file from the provided template:

   ```bash
   cp server/.env.example server/.env
   ```

   Configure these values in `server/.env`:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/formx
   JWT_SECRET=replace-with-a-long-random-secret
   ```

   Use a long, random value for `JWT_SECRET`. Do not commit `server/.env`.

4. Start MongoDB locally, or set `MONGODB_URI` to the connection string for
   your MongoDB deployment. The default local database is `formx`.

5. Start both development servers from the repository root:

   ```bash
   npm run dev
   ```

   The frontend runs at `http://localhost:5173` and the backend runs at
   `http://localhost:5000`.

   To start them separately:

   ```bash
   npm run dev:server
   npm run dev:client
   ```

6. Check the backend health endpoint:

   ```bash
   curl http://localhost:5000/api/health
   ```

## Testing and build

Run the complete automata and backend test suites:

```bash
npm test
```

Run only one workspace's tests:

```bash
npm run test:automata
npm run test:server
```

Build the production frontend:

```bash
npm run build:client
```

## Regex support

Custom patterns support literals, implicit concatenation, union (`|`),
Kleene star (`*`), grouping, character classes such as `[a-z]`, and escaped
metacharacters. The engine rejects unsupported operators including `+`, `?`,
bounded repetition, anchors, wildcard `.`, and negated character classes.

## API overview

Authentication endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`

Authenticated admin endpoints require `Authorization: Bearer <token>`:

- `GET|POST /api/forms`
- `GET|PATCH|PUT|DELETE /api/forms/:id`
- `GET /api/forms/:id/responses`
- `GET /api/forms/:id/responses/:responseId`
- `GET /api/forms/:id/responses/export`

Public endpoints do not require authentication:

- `GET /api/public/forms/:id`
- `POST /api/public/forms/:id/responses`

Only published forms are publicly accessible. Responses can be submitted
only while a form is accepting responses; existing responses remain available
to the owning admin after a form is closed.
