# FormX

FormX is a simple form creation and response collection platform whose primary academic purpose is to demonstrate **Formal Language and Automata Theory**.

The platform enables form creators to define custom validation rules on form input fields backed by a custom, standalone automata engine that translates regular expressions into Finite State Machines (NFA & DFA) without relying on JavaScript's built-in `RegExp` engine.

> **Status:** Tag 3 of 8 — DFA Subset Construction and Simulation (ε-NFA to DFA conversion, powerset construction, and deterministic string simulation).

---

## Tech Stack

- **Frontend (`client/`):** React 18, JavaScript, Vite, Tailwind CSS, React Router
- **Backend (`server/`):** Node.js, Express, JavaScript, CORS, dotenv (Mongoose ready for future tags)
- **Automata Engine (`automata/`):** Standalone pure JavaScript package (zero external runtime dependencies)
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
    │   ├── errors.js        # AutomataError and RegexSyntaxError
    │   ├── tokenizer.js     # Regex Tokenizer and CharacterClass parser
    │   ├── parser.js        # Syntax validation, implicit concat, Shunting-Yard postfix, and AST
    │   ├── nfa.js           # State, Transition, NFA classes, and EPSILON constant
    │   ├── thompson.js      # Thompson's construction (literal, class, concat, union, star)
    │   ├── epsilon-closure.js # ε-closure computation with cycle prevention
    │   ├── dfa.js           # DFAState, DFA, subset construction, and DFA simulation
    │   └── index.js         # Public API exports
    └── tests/
        ├── index.test.js    # Package initialization test
        ├── tokenizer.test.js # Tokenizer, character classes, escapes, and syntax error tests
        ├── parser.test.js   # Precedence, implicit concat, postfix, AST, and validation tests
        ├── nfa.test.js      # NFA, State, Transition, and alphabet extraction tests
        ├── thompson.test.js # Thompson construction structure and simulation tests
        ├── epsilon-closure.test.js # ε-closure, multi-state sets, and cycle safety tests
        ├── subset-construction.test.js # Subset construction structural properties and determinism
        └── dfa-simulation.test.js # DFA simulation, edge cases, and NFA vs DFA equivalence tests
```

---

## Automata Engine

The `automata` package is a standalone, zero-dependency theoretical engine implementing formal language algorithms from scratch.

### 1. Supported Regex Syntax

| Syntax | Description | Example |
| :--- | :--- | :--- |
| **Literal** | Alphanumeric characters and permitted symbols | `a`, `b`, `1`, `_` |
| **Concatenation** | Implicit sequence of expressions | `ab`, `a(bc)`, `[a-z]0` |
| **Union** | Alternation between two branches | `a\|b`, `0\|1` |
| **Kleene Star** | Zero or more repetitions of preceding atom | `a*`, `(ab)*` |
| **Grouping** | Parentheses for overriding precedence | `(a\|b)*c` |
| **Character Class** | Set of characters or ranges | `[abc]`, `[a-z]`, `[0-9]`, `[a-zA-Z0-9_]` |
| **Escapes** | Backslash escape to treat metacharacters as literals | `\*`, `\|`, `\(`, `\)`, `\[`, `\]`, `\\` |

#### Operator Precedence Order
1. **Parentheses / Grouping:** `(...)` (highest)
2. **Kleene Star:** `*` (unary postfix)
3. **Concatenation:** implicit (left-associative)
4. **Union:** `|` (lowest, left-associative)

---

### 2. Processing Pipeline

```text
Regex Pattern String
       │
       ▼
1. Tokenize (tokenizer.js)
   - Scans literals, escapes, character classes [a-z], and operators
   - Rejects unsupported operators and malformed syntax with character position indicators
       │
       ▼
2. Parse & Validate (parser.js)
   - Validates balanced parentheses, non-empty groups, and operator placement
   - Inserts explicit concatenation tokens (·)
   - Converts infix tokens to postfix notation using Dijkstra's Shunting-Yard algorithm
   - Constructs AST nodes (LiteralNode, CharClassNode, ConcatNode, UnionNode, StarNode)
       │
       ▼
3. Thompson's Construction (thompson.js)
   - Evaluates postfix tokens using an NFA fragment stack
   - Generates exact textbook ε-NFA fragments:
     * Literal symbol: s0 ──(char)──> s1 (accept)
     * Character class: s0 ──(c_i)──> s1 for each c_i ∈ class
     * Concatenation: A.accept ──(ε)──> B.start
     * Union: newStart ──(ε)──> {A.start, B.start}, {A.accept, B.accept} ──(ε)──> newAccept
     * Kleene star: loop and bypass ε-transitions
       │
       ▼
4. ε-Closure (epsilon-closure.js)
   - Computes all states reachable via zero or more ε-transitions
   - Cycle-safe traversal prevents infinite loops
       │
       ▼
5. Subset Construction (dfa.js)
   - Converts ε-NFA into an equivalent DFA via powerset construction
   - Maps each DFA state to a unique subset of NFA states
   - Computes deterministic transition table over input alphabet Σ
       │
       ▼
6. DFA Simulation (dfa.js)
   - Validates candidate input strings in O(n) time by following DFA transitions
   - Rejects missing transitions or out-of-alphabet symbols; accepts on final accept state
```

---

### 3. Subset Construction Algorithm

The subset construction algorithm (powerset construction) translates an $\epsilon$-NFA into an equivalent Deterministic Finite Automaton (DFA) where each DFA state corresponds to a subset of NFA states:

1. **Initial State:** The DFA start state $D_0$ is defined as the $\epsilon$-closure of the NFA start state:
   $$D_0 = \epsilon\text{-closure}(s_0)$$
2. **Alphabet Derivation:** The input alphabet $\Sigma$ is derived by collecting all non-$\epsilon$ transition symbols present in the NFA.
3. **Reachable State Discovery:** A worklist queue explores reachable state subsets:
   For each discovered DFA state subset $T$ and each input symbol $a \in \Sigma$:
   $$\text{move}(T, a) = \bigcup_{s \in T} \{ s' \mid s \xrightarrow{a} s' \}$$
   $$U = \epsilon\text{-closure}(\text{move}(T, a))$$
   If $U \neq \emptyset$:
   - If $U$ has not been seen before, assign it a new DFA state and add it to the worklist.
   - Add deterministic transition $T \xrightarrow{a} U$.
4. **Accepting State Marking:** A DFA state is marked as accepting if and only if its subset contains at least one NFA state that is an accepting state:
   $$\text{isAccept}(D) \iff \exists s \in D \text{ such that } s \in F_{\text{NFA}}$$
5. **State Identification & Collision Safety:** Subsets are uniquely keyed using canonically sorted state IDs (`getStateSetKey`). Sorting ensures identity is independent of JavaScript `Set` insertion or iteration order.
6. **Missing Transition Handling:** When $\text{move}(T, a) = \emptyset$, no transition is added to the DFA state's transition table (partial transition function). This avoids generating redundant, unreachable trap/sink states. During simulation, any missing transition immediately rejects the input.

---

### 4. API Usage: Constructing and Simulating DFAs

#### Example: Construct a DFA from a Regex and Validate Strings

```javascript
import { subsetConstruction, simulateDFA, thompson } from '@formx/automata';

// 1. Construct DFA directly from a regex pattern string
const dfa = subsetConstruction('(ab)*c');

// 2. Validate candidate strings against the DFA
console.log(simulateDFA(dfa, 'c'));      // true
console.log(simulateDFA(dfa, 'abc'));    // true
console.log(simulateDFA(dfa, 'ababc'));  // true
console.log(simulateDFA(dfa, 'ab'));     // false (missing 'c')
console.log(simulateDFA(dfa, 'x'));      // false (unknown symbol)

// Alternatively, use convenience methods on the DFA instance:
console.log(dfa.accepts('abc'));         // true
console.log(dfa.simulate('abc'));        // true
```

#### Example: Inspecting DFA States and Subsets

```javascript
import { subsetConstruction } from '@formx/automata';

const dfa = subsetConstruction('a|b');

console.log(`DFA State Count: ${dfa.states.size}`);
console.log(`Input Alphabet: ${Array.from(dfa.alphabet).join(', ')}`);

for (const state of dfa.states) {
  const nfaIds = Array.from(state.nfaStates).map(s => s.id).join(', ');
  console.log(`State ${state.name}: NFA subset {${nfaIds}}, isAccept=${state.isAccept}`);
}
```

---

### 5. Important Limitations (Milestone Boundaries)

- **Strictly No Native RegExp:** JavaScript's built-in `RegExp` engine is not used for validation.
- **Unsupported Operators:** `+` (one-or-more), `?` (optional), `{n,m}` (bounded repetitions), `^`/`$` (anchors), and `.` (wildcard) are rejected with clear syntax errors unless explicitly escaped.
- **No Negated Character Classes:** `[^...]` is rejected.
- **DFA Minimization:** Hopcroft's DFA minimization algorithm is deferred to future optimization milestones; the current DFA is exact and minimal in reachable states.

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

Copy the server environment template:

```bash
cp server/.env.example server/.env
```

### 3. Run Development Servers

Run both client and server concurrently from the root:

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

Run all unit tests across the automata engine:

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

1. **Tag 1:** Project Scaffolding & Development Environment *(Complete)*
2. **Tag 2:** Automata Engine Core, Part 1 — Regex Tokenizer, Parser, Thompson's Construction ε-NFA & ε-Closure *(Complete)*
3. **Tag 3 (Current):** Automata Engine Core, Part 2 — Subset Construction (ε-NFA -> DFA) & DFA String Simulation *(Complete)*
4. **Tag 4:** Backend Models & Authentication (JWT, bcrypt, MongoDB)
5. **Tag 5:** Form Creation & Custom Regex Validation Configuration
6. **Tag 6:** Public Form Links & Response Collection
7. **Tag 7:** Response Management, Dashboard & CSV Export
8. **Tag 8:** Integration Polish, UI Refinements & Documentation
