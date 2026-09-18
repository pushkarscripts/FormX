/**
 * FormX Automata Engine
 *
 * Standalone formal language and automata engine.
 * Tag 2:
 * - Regex Tokenizer with character classes and escape support
 * - Syntax Validator and Parser with implicit concatenation
 * - Infix to Postfix converter (Shunting-Yard)
 * - Thompson's Construction (Regex / Postfix -> ε-NFA)
 * - ε-Closure computation with cycle safety
 *
 * Standalone and independent of Express, React, MongoDB, or native RegExp.
 */

// Error types
export { AutomataError, RegexSyntaxError } from './errors.js';

// Tokenizer & Tokens
export {
  tokenize,
  TokenType,
  Token,
  CharacterClass,
} from './tokenizer.js';

// Parser & AST
export {
  parse,
  toPostfix,
  validateTokens,
  insertExplicitConcat,
  buildASTFromPostfix,
  ASTNode,
  LiteralNode,
  CharClassNode,
  ConcatNode,
  UnionNode,
  StarNode,
} from './parser.js';

// Automata Data Structures & Epsilon
export {
  State,
  Transition,
  NFA,
  EPSILON,
} from './nfa.js';

// Epsilon-Closure
export { epsilonClosure } from './epsilon-closure.js';

// Thompson's Construction
export {
  thompson,
  buildThompsonNFA,
  createLiteralNFA,
  createCharClassNFA,
  concatenateNFAs,
  unionNFAs,
  kleeneStarNFA,
  Fragment,
  StateIdGenerator,
} from './thompson.js';

/**
 * Returns package metadata for status and health verification.
 */
export function getEngineInfo() {
  return {
    name: 'FormX Automata Engine',
    version: '0.1.0',
    status: 'initialized',
    description: 'Standalone formal language and automata validation engine (Thompson ε-NFA)'
  };
}
