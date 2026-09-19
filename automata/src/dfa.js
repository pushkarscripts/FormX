import { AutomataError } from './errors.js';
import { epsilonClosure } from './epsilon-closure.js';
import { NFA } from './nfa.js';
import { thompson } from './thompson.js';

/**
 * Computes a stable, collision-safe string key for a subset of NFA states.
 * Sorts state IDs canonically (numerically when numbers, lexicographically otherwise)
 * to ensure that JavaScript Set iteration order does not affect state identity.
 *
 * @param {Iterable<State>} nfaStates - Collection of NFA State instances
 * @returns {string} Comma-separated sorted state IDs
 */
export function getStateSetKey(nfaStates) {
  if (!nfaStates) {
    return '';
  }

  const ids = [];
  for (const s of nfaStates) {
    if (s && s.id !== undefined) {
      ids.push(s.id);
    }
  }

  ids.sort((a, b) => {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    return String(a).localeCompare(String(b));
  });

  return ids.join(',');
}

/**
 * Represents a state in a Deterministic Finite Automaton (DFA).
 * Each DFA state corresponds to a subset of NFA states.
 */
export class DFAState {
  /**
   * @param {number|string} id - Unique identifier for the DFA state
   * @param {Set<State>|State[]} [nfaStates] - The subset of NFA states represented
   */
  constructor(id, nfaStates = new Set()) {
    this.id = id;
    this.name = typeof id === 'number' ? `D${id}` : String(id);
    this.nfaStates = nfaStates instanceof Set ? nfaStates : new Set(nfaStates);
    this.transitions = new Map(); // Map<string, DFAState>
    this.isAccept = false;
  }

  /**
   * Adds a deterministic transition from this state to target state on a symbol.
   *
   * @param {string} symbol
   * @param {DFAState} toState
   * @returns {DFAState}
   */
  addTransition(symbol, toState) {
    this.transitions.set(symbol, toState);
    return toState;
  }

  /**
   * Retrieves the destination DFA state for the given input symbol.
   * Returns null if no transition exists.
   *
   * @param {string} symbol
   * @returns {DFAState|null}
   */
  getTransition(symbol) {
    return this.transitions.get(symbol) || null;
  }

  /**
   * Returns all outgoing transitions as an array of { symbol, toState }.
   *
   * @returns {Array<{ symbol: string, toState: DFAState }>}
   */
  getAllTransitions() {
    const list = [];
    for (const [symbol, toState] of this.transitions.entries()) {
      list.push({ symbol, toState });
    }
    return list;
  }

  toString() {
    const nfaIds = getStateSetKey(this.nfaStates);
    return `${this.name}{${nfaIds}}${this.isAccept ? '*' : ''}`;
  }
}

/**
 * Represents a Deterministic Finite Automaton (DFA).
 */
export class DFA {
  /**
   * @param {DFAState|null} startState
   * @param {Set<string>|string[]} [alphabet]
   */
  constructor(startState = null, alphabet = new Set()) {
    this.startState = startState;
    this.alphabet = alphabet instanceof Set ? alphabet : new Set(alphabet);
    this.states = new Set();
    this.acceptStates = new Set();

    if (startState) {
      this.addState(startState);
    }
  }

  /**
   * Adds a DFA state to the automaton and tracks accepting states.
   *
   * @param {DFAState} state
   */
  addState(state) {
    this.states.add(state);
    if (state.isAccept) {
      this.acceptStates.add(state);
    }
  }

  /**
   * Simulates this DFA against an input string.
   *
   * @param {string} inputString
   * @returns {boolean} True if accepted, false otherwise
   */
  simulate(inputString) {
    return simulateDFA(this, inputString);
  }

  /**
   * Alias for simulate(inputString).
   *
   * @param {string} inputString
   * @returns {boolean}
   */
  accepts(inputString) {
    return simulateDFA(this, inputString);
  }
}

/**
 * Converts an ε-NFA into an equivalent DFA using the textbook Subset Construction algorithm.
 *
 * Algorithm:
 * 1. Compute start subset: ε-closure(NFA.startState).
 * 2. Derive alphabet Σ from NFA's non-epsilon transitions.
 * 3. Use a worklist to explore reachable DFA states:
 *    For each discovered subset T and each symbol 'a' in Σ:
 *      U = ε-closure(move(T, 'a'))
 *      If U is non-empty:
 *        Add transition T --('a')--> U
 * 4. Mark a DFA state as accepting if its NFA subset contains at least one NFA accept state.
 *
 * Policy on missing transitions:
 * When move(T, 'a') is empty, no transition is created (partial transition function).
 * During simulation, encountering a missing transition or unknown symbol immediately rejects.
 *
 * @param {NFA|string} nfaOrRegex - An NFA instance or a regular expression string
 * @returns {DFA} Equivalent deterministic finite automaton
 */
export function subsetConstruction(nfaOrRegex) {
  let nfa;
  if (typeof nfaOrRegex === 'string') {
    nfa = thompson(nfaOrRegex);
  } else if (nfaOrRegex instanceof NFA || (nfaOrRegex && nfaOrRegex.startState)) {
    nfa = nfaOrRegex;
  } else {
    throw new AutomataError('subsetConstruction requires an NFA instance or a regex string');
  }

  if (!nfa.startState) {
    throw new AutomataError('Cannot construct DFA from an NFA without a start state');
  }

  // Derive input alphabet Σ (non-epsilon symbols) sorted for determinism
  const rawAlphabet = typeof nfa.getAlphabet === 'function' ? nfa.getAlphabet() : new Set();
  const sortedAlphabet = Array.from(rawAlphabet).sort();

  // Compute DFA start state: ε-closure(NFA.startState)
  const startSubset = epsilonClosure(nfa.startState);
  const startKey = getStateSetKey(startSubset);

  let stateIdCounter = 0;
  const dfaStatesByKey = new Map(); // key -> DFAState
  const worklist = []; // DFAState[]

  function createDFAState(subset) {
    const id = stateIdCounter++;
    const state = new DFAState(id, subset);

    // Mark as accepting if subset contains at least one NFA accepting state
    for (const s of subset) {
      if (s.isAccept || (nfa.acceptStates && nfa.acceptStates.has(s))) {
        state.isAccept = true;
        break;
      }
    }
    return state;
  }

  const startDFAState = createDFAState(startSubset);
  dfaStatesByKey.set(startKey, startDFAState);
  worklist.push(startDFAState);

  while (worklist.length > 0) {
    const currentDFAState = worklist.shift();

    for (const symbol of sortedAlphabet) {
      // 1. move(currentDFAState.nfaStates, symbol)
      const moveTargetNFAStates = new Set();
      for (const nfaState of currentDFAState.nfaStates) {
        if (!nfaState.transitions) continue;
        for (const t of nfaState.transitions) {
          if (t.symbol === symbol) {
            const dest = t.toState || t.to || t.target;
            if (dest) {
              moveTargetNFAStates.add(dest);
            }
          }
        }
      }

      // If no states are reached on this symbol, omit transition (partial transition table)
      if (moveTargetNFAStates.size === 0) {
        continue;
      }

      // 2. ε-closure of the move targets
      const targetSubset = epsilonClosure(moveTargetNFAStates);
      if (targetSubset.size === 0) {
        continue;
      }

      const targetKey = getStateSetKey(targetSubset);
      let targetDFAState = dfaStatesByKey.get(targetKey);

      if (!targetDFAState) {
        targetDFAState = createDFAState(targetSubset);
        dfaStatesByKey.set(targetKey, targetDFAState);
        worklist.push(targetDFAState);
      }

      // Add deterministic transition
      currentDFAState.addTransition(symbol, targetDFAState);
    }
  }

  // Construct and populate the DFA object
  const dfa = new DFA(startDFAState, new Set(sortedAlphabet));
  for (const state of dfaStatesByKey.values()) {
    dfa.addState(state);
  }

  return dfa;
}

/**
 * Simulates a DFA on a given input string.
 *
 * Starts at the DFA's start state, follows deterministic transitions for each symbol.
 * Rejects immediately if a transition is missing or the symbol is outside the DFA alphabet.
 * Accepts if and only if the final state reached after consuming the input is accepting.
 *
 * @param {DFA} dfa
 * @param {string} inputString
 * @returns {boolean} True if the string is accepted by the DFA, false otherwise
 */
export function simulateDFA(dfa, inputString) {
  if (!dfa || !dfa.startState) {
    throw new AutomataError('Cannot simulate DFA: start state is missing');
  }

  if (typeof inputString !== 'string') {
    throw new AutomataError(`DFA simulation input must be a string, received ${typeof inputString}`);
  }

  let currentState = dfa.startState;

  for (let i = 0; i < inputString.length; i++) {
    const symbol = inputString[i];
    const nextState = currentState.getTransition(symbol);

    if (!nextState) {
      // Transition is missing or symbol is outside alphabet -> reject
      return false;
    }

    currentState = nextState;
  }

  return currentState.isAccept;
}
