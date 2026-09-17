/**
 * FormX Automata Engine
 *
 * Standalone formal language and automata engine.
 * Future milestones will implement:
 * - Regular Expression Parsing and AST generation
 * - Thompson's Construction (Regex -> NFA with epsilon transitions)
 * - Epsilon-Closure computation
 * - Subset Construction (NFA -> DFA)
 * - DFA Simulation and String Validation
 *
 * NOTE: Standard JavaScript RegExp is NOT used for the custom regex validation engine.
 */

export function getEngineInfo() {
  return {
    name: 'FormX Automata Engine',
    version: '0.1.0',
    status: 'initialized',
    description: 'Standalone formal language and automata validation engine'
  };
}
