# FormX

FormX is a simple form creation and response collection platform whose primary academic purpose is to demonstrate **Formal Language and Automata Theory**.

The platform enables form creators to define custom validation rules on form input fields backed by a custom, standalone automata engine that translates regular expressions into Finite State Machines (NFA & DFA) without relying on JavaScript's built-in `RegExp` engine.

> **Status:** Tag 1 of 8 — Initial project structure, development environment, and monorepo scaffolding.

---

## Tech Stack

- **Frontend (`client/`):** React 18, JavaScript, Vite, Tailwind CSS, React Router
- **Backend (`server/`):** Node.js, Express, JavaScript, CORS, dotenv (Mongoose ready for future tags)
- **Automata Engine (`automata/`):** Standalone pure JavaScript package
- **Testing:** Vitest test runner
- **Monorepo:** npm workspaces

---

## Repository Structure

```text
FormX/
├── .gitignore               # Root git ignore rules
├── package.json             # Root npm workspace configuration & scripts
├── README.md                # Project documentation and developer setup
├── AGENTS.md                # Guidelines, architecture principles, and constraints
├── client/                  # Frontend single-page application
│   ├── index.html           # HTML entry point
│   ├── vite.config.js       # Vite configuration with proxy to server API
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── postcss.config.js    # PostCSS configuration
│   ├── package.json         # Client dependencies and scripts
│   └── src/
│       ├── main.jsx         # React root with BrowserRouter
│       ├── App.jsx          # App layout and route structure
│       ├── index.css        # Tailwind directives and global styles
│       └── pages/
│           └── Home.jsx     # Overview page showing service status
├── server/                  # Backend Express REST API
│   ├── .env.example         # Environment template
│   ├── package.json         # Server dependencies and scripts
│   └── src/
│       ├── index.js         # Server entrypoint and port listener
│       ├── app.js           # Express app setup and middleware
│       └── routes/
│           └── health.js    # GET /api/health endpoint
└── automata/                # Standalone Automata & Formal Languages Engine
    ├── package.json         # Automata package definition and test script
    ├── src/
    │   └── index.js         # Engine entrypoint and metadata
    └── tests/
        └── index.test.js    # Vitest suite verifying the engine test setup
```

---

## Prerequisites

- **Node.js:** v18.0.0 or later (v20+ or v24+ recommended)
- **npm:** v9.0.0 or later (supports npm workspaces)

---

## Getting Started

### 1. Install Dependencies

Install all dependencies across all workspaces (`client`, `server`, `automata`) from the project root:

```bash
npm install
```

### 2. Configure Environment

Copy the server environment template (optional for Tag 1 as defaults are used):

```bash
cp server/.env.example server/.env
```

### 3. Run Development Servers

You can run both client and server concurrently from the root:

```bash
npm run dev
```

Or run individual services:

- **Frontend (Vite dev server):**
  ```bash
  npm run dev:client
  # Available at: http://localhost:5173
  ```

- **Backend (Express API server):**
  ```bash
  npm run dev:server
  # Available at: http://localhost:5000
  ```

### 4. Verify API Health

With the server running, access the health-check endpoint:

```bash
curl http://localhost:5000/api/health
```

Expected JSON response:

```json
{
  "status": "ok",
  "message": "FormX API is healthy",
  "timestamp": "2026-09-28T..."
}
```

### 5. Run Automata Tests

Run the test suite for the standalone automata package:

```bash
npm test
# or
npm run test:automata
```

To run tests in watch mode:

```bash
npm run test:watch -w automata
```

---

## Development Milestones Roadmap

1. **Tag 1 (Current):** Project Scaffolding & Development Environment
2. **Tag 2:** Automata Engine Core (Regex Parser, Thompson's Construction NFA)
3. **Tag 3:** Automata Engine Completion (Epsilon-Closure, Subset Construction DFA, String Simulation)
4. **Tag 4:** Backend Models & Authentication (JWT, bcrypt, MongoDB)
5. **Tag 5:** Form Creation & Custom Regex Validation Configuration
6. **Tag 6:** Public Form Links & Response Collection
7. **Tag 7:** Response Management, Dashboard & CSV Export
8. **Tag 8:** Integration Polish, UI Refinements & Documentation
