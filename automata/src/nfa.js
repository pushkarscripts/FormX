import { epsilonClosure } from './epsilon-closure.js';

/**
 * Representation of an epsilon (empty string) transition.
 * Standardized across the entire engine as `null`.
 */
export const EPSILON = null;

/**
 * Represents a directed transition from one state to another on a symbol or EPSILON.
 */
export class Transition {
  /**
   * @param {string|null} symbol - Character symbol or null for EPSILON
   * @param {State} toState - Destination state
   */
  constructor(symbol, toState) {
    this.symbol = symbol;
    this.toState = toState;
  }

  get to() {
    return this.toState;
  }

  get target() {
    return this.toState;
  }

  isEpsilon() {
    return this.symbol === EPSILON;
  }
}

/**
 * Represents an individual automaton state.
 */
export class State {
  /**
   * @param {number|string} id - Unique identifier for the state
   */
  constructor(id) {
    this.id = id;
    this.name = typeof id === 'number' ? `q${id}` : String(id);
    this.transitions = [];
    this.isAccept = false;
  }

  /**
   * Adds a transition to another state.
   * If only one argument is provided, it is treated as an EPSILON transition.
   *
   * @param {string|null|State} symbolOrToState
   * @param {State} [maybeToState]
   * @returns {Transition}
   */
  addTransition(symbolOrToState, maybeToState) {
    let symbol = symbolOrToState;
    let toState = maybeToState;

    if (arguments.length === 1 && symbolOrToState instanceof State) {
      symbol = EPSILON;
      toState = symbolOrToState;
    }

    const transition = new Transition(symbol, toState);
    this.transitions.push(transition);
    return transition;
  }

  /**
   * Adds an epsilon transition to the destination state.
   *
   * @param {State} toState
   * @returns {Transition}
   */
  addEpsilonTransition(toState) {
    return this.addTransition(EPSILON, toState);
  }

  /**
   * Gets transitions matching an optional symbol. If omitted, returns all transitions.
   *
   * @param {string|null} [symbol]
   * @returns {Transition[]}
   */
  getTransitions(symbol = undefined) {
    if (symbol === undefined) {
      return this.transitions;
    }
    return this.transitions.filter((t) => t.symbol === symbol);
  }

  /**
   * Returns all outgoing epsilon transitions.
   *
   * @returns {Transition[]}
   */
  getEpsilonTransitions() {
    return this.transitions.filter((t) => t.symbol === EPSILON);
  }

  /**
   * Computes the epsilon closure starting from this state.
   *
   * @returns {Set<State>}
   */
  epsilonClosure() {
    return epsilonClosure(this);
  }

  toString() {
    return this.name;
  }
}

/**
 * Represents a Non-deterministic Finite Automaton with epsilon transitions (ε-NFA).
 */
export class NFA {
  /**
   * @param {State|null} startState
   * @param {Set<State>|State[]} [acceptStates]
   */
  constructor(startState = null, acceptStates = new Set()) {
    this.startState = startState;
    this.acceptStates = acceptStates instanceof Set ? acceptStates : new Set(acceptStates ? [acceptStates].flat() : []);
    this.states = new Set();

    if (startState) {
      this.states.add(startState);
    }
    for (const accept of this.acceptStates) {
      this.states.add(accept);
    }
  }

  /**
   * Convenience getter for NFAs that have a single primary accept state (like Thompson NFAs).
   *
   * @returns {State|null}
   */
  get acceptState() {
    return this.acceptStates.values().next().value || null;
  }

  /**
   * Adds a state to the NFA's state set.
   *
   * @param {State} state
   */
  addState(state) {
    this.states.add(state);
  }

  /**
   * Designates a state as an accepting state.
   *
   * @param {State} state
   */
  addAcceptState(state) {
    state.isAccept = true;
    this.states.add(state);
    this.acceptStates.add(state);
  }

  /**
   * Collects all transitions in the entire automaton.
   *
   * @returns {Array<{ from: State, symbol: string|null, to: State }>}
   */
  getAllTransitions() {
    const result = [];
    for (const state of this.states) {
      for (const transition of state.transitions) {
        result.push({
          from: state,
          symbol: transition.symbol,
          to: transition.toState,
        });
      }
    }
    return result;
  }

  /**
   * Returns the set of all non-epsilon symbols used in the automaton (the input alphabet Σ).
   *
   * @returns {Set<string>}
   */
  getAlphabet() {
    const alphabet = new Set();
    for (const state of this.states) {
      for (const transition of state.transitions) {
        if (transition.symbol !== EPSILON && typeof transition.symbol === 'string') {
          alphabet.add(transition.symbol);
        }
      }
    }
    return alphabet;
  }

  /**
   * Computes the epsilon-closure of a given state or set of states within this NFA.
   *
   * @param {State|Iterable<State>} stateOrStates
   * @returns {Set<State>}
   */
  epsilonClosure(stateOrStates) {
    return epsilonClosure(stateOrStates);
  }
}
