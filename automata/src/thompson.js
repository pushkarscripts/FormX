import { State, Transition, NFA, EPSILON } from './nfa.js';
import { TokenType, CharacterClass } from './tokenizer.js';
import { toPostfix } from './parser.js';
import { AutomataError } from './errors.js';

/**
 * Sequential state ID generator.
 */
export class StateIdGenerator {
  constructor(initial = 0) {
    this.current = initial;
  }

  next() {
    return this.current++;
  }

  reset(val = 0) {
    this.current = val;
  }
}

/**
 * An NFA fragment produced during Thompson's construction.
 * In classic Thompson's construction, each fragment has exactly one start state
 * and one accept state.
 */
export class Fragment {
  constructor(startState, acceptState, states = new Set()) {
    this.startState = startState;
    this.acceptState = acceptState;
    this.states = states;
  }
}

/**
 * Creates an NFA fragment for a single literal symbol.
 * Base case 1 of Thompson's construction:
 * s0 --(symbol)--> s1 (accept)
 *
 * @param {string} symbol
 * @param {StateIdGenerator} [idGen]
 * @returns {Fragment}
 */
export function createLiteralNFA(symbol, idGen = new StateIdGenerator()) {
  const start = new State(idGen.next());
  const accept = new State(idGen.next());
  accept.isAccept = true;

  start.addTransition(symbol, accept);

  return new Fragment(start, accept, new Set([start, accept]));
}

/**
 * Creates an NFA fragment for a character class (e.g. [a-z], [abc]).
 * Generates transitions from start state to accept state for every character in the class.
 *
 * @param {CharacterClass|Set<string>|string[]} charClass
 * @param {StateIdGenerator} [idGen]
 * @returns {Fragment}
 */
export function createCharClassNFA(charClass, idGen = new StateIdGenerator()) {
  const start = new State(idGen.next());
  const accept = new State(idGen.next());
  accept.isAccept = true;

  const characters = charClass instanceof CharacterClass
    ? charClass.characters
    : (charClass instanceof Set ? charClass : new Set(charClass));

  for (const char of characters) {
    const transition = start.addTransition(char, accept);
    if (charClass instanceof CharacterClass) {
      transition.charClass = charClass;
    }
  }

  return new Fragment(start, accept, new Set([start, accept]));
}

/**
 * Concatenates two NFA fragments (A · B).
 * Thompson's concatenation construction:
 * Connects A's accept state to B's start state via an ε-transition.
 * A's accept state is no longer accepting; B's accept state becomes the new accept state.
 *
 * @param {Fragment} fragA
 * @param {Fragment} fragB
 * @returns {Fragment}
 */
export function concatenateNFAs(fragA, fragB) {
  // Connect accept of A to start of B with epsilon
  fragA.acceptState.addEpsilonTransition(fragB.startState);
  fragA.acceptState.isAccept = false;
  fragB.acceptState.isAccept = true;

  const states = new Set([...fragA.states, ...fragB.states]);
  return new Fragment(fragA.startState, fragB.acceptState, states);
}

/**
 * Creates a union of two NFA fragments (A | B).
 * Thompson's union construction:
 * Introduces a new start state that branches via ε-transitions to A's start and B's start.
 * Both A's accept and B's accept branch via ε-transitions to a new accept state.
 *
 * @param {Fragment} fragA
 * @param {Fragment} fragB
 * @param {StateIdGenerator} [idGen]
 * @returns {Fragment}
 */
export function unionNFAs(fragA, fragB, idGen) {
  if (!idGen) {
    let maxId = -1;
    for (const s of [...fragA.states, ...fragB.states]) {
      if (typeof s.id === 'number' && s.id > maxId) {
        maxId = s.id;
      }
    }
    idGen = new StateIdGenerator(maxId + 1);
  }

  const newStart = new State(idGen.next());
  const newAccept = new State(idGen.next());
  newAccept.isAccept = true;

  // New start branches to both sub-automata starts
  newStart.addEpsilonTransition(fragA.startState);
  newStart.addEpsilonTransition(fragB.startState);

  // Both sub-automata accepts branch to new accept
  fragA.acceptState.addEpsilonTransition(newAccept);
  fragB.acceptState.addEpsilonTransition(newAccept);

  fragA.acceptState.isAccept = false;
  fragB.acceptState.isAccept = false;

  const states = new Set([
    newStart,
    ...fragA.states,
    ...fragB.states,
    newAccept,
  ]);

  return new Fragment(newStart, newAccept, states);
}

/**
 * Applies the Kleene star operator to an NFA fragment (A*).
 * Thompson's star construction:
 * Introduces a new start state and new accept state.
 * Adds 4 ε-transitions:
 * 1. newStart -> frag.start (enter fragment)
 * 2. newStart -> newAccept (bypass fragment for zero repetitions)
 * 3. frag.accept -> frag.start (loop back for repeated matches)
 * 4. frag.accept -> newAccept (exit fragment to new accept state)
 *
 * @param {Fragment} frag
 * @param {StateIdGenerator} [idGen]
 * @returns {Fragment}
 */
export function kleeneStarNFA(frag, idGen) {
  if (!idGen) {
    let maxId = -1;
    for (const s of frag.states) {
      if (typeof s.id === 'number' && s.id > maxId) {
        maxId = s.id;
      }
    }
    idGen = new StateIdGenerator(maxId + 1);
  }

  const newStart = new State(idGen.next());
  const newAccept = new State(idGen.next());
  newAccept.isAccept = true;

  // 1. Enter fragment
  newStart.addEpsilonTransition(frag.startState);
  // 2. Bypass fragment (0 occurrences)
  newStart.addEpsilonTransition(newAccept);
  // 3. Loop back for repetitions
  frag.acceptState.addEpsilonTransition(frag.startState);
  // 4. Exit fragment
  frag.acceptState.addEpsilonTransition(newAccept);

  frag.acceptState.isAccept = false;

  const states = new Set([
    newStart,
    ...frag.states,
    newAccept,
  ]);

  return new Fragment(newStart, newAccept, states);
}

/**
 * Builds an ε-NFA from a regular expression pattern or postfix token stream
 * using Thompson's construction.
 *
 * @param {string|Token[]} input
 * @returns {NFA}
 */
export function buildThompsonNFA(input) {
  const postfix = typeof input === 'string' ? toPostfix(input) : input;
  if (!Array.isArray(postfix) || postfix.length === 0) {
    throw new AutomataError('Cannot build Thompson NFA from empty or invalid postfix stream');
  }

  const idGen = new StateIdGenerator(0);
  const stack = [];

  for (const token of postfix) {
    switch (token.type) {
      case TokenType.LITERAL: {
        stack.push(createLiteralNFA(token.value, idGen));
        break;
      }

      case TokenType.CHAR_CLASS: {
        stack.push(createCharClassNFA(token.value, idGen));
        break;
      }

      case TokenType.STAR: {
        if (stack.length < 1) {
          throw new AutomataError("Thompson construction error: missing operand for '*'");
        }
        const frag = stack.pop();
        stack.push(kleeneStarNFA(frag, idGen));
        break;
      }

      case TokenType.CONCAT: {
        if (stack.length < 2) {
          throw new AutomataError('Thompson construction error: missing operands for concatenation');
        }
        const fragB = stack.pop();
        const fragA = stack.pop();
        stack.push(concatenateNFAs(fragA, fragB));
        break;
      }

      case TokenType.UNION: {
        if (stack.length < 2) {
          throw new AutomataError("Thompson construction error: missing operands for union '|'");
        }
        const fragB = stack.pop();
        const fragA = stack.pop();
        stack.push(unionNFAs(fragA, fragB, idGen));
        break;
      }

      default:
        throw new AutomataError(`Thompson construction error: unrecognized token type '${token.type}'`);
    }
  }

  if (stack.length !== 1) {
    throw new AutomataError(`Thompson construction failed: expected 1 final fragment on stack, found ${stack.length}`);
  }

  const finalFrag = stack[0];
  const nfa = new NFA(finalFrag.startState, new Set([finalFrag.acceptState]));

  for (const state of finalFrag.states) {
    nfa.addState(state);
  }

  return nfa;
}

/**
 * Primary public alias for buildThompsonNFA.
 */
export const thompson = buildThompsonNFA;
