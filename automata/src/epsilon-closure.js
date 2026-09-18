/**
 * Computes the ε-closure of a state or a collection of states.
 *
 * The ε-closure of a state set T is the set of all NFA states reachable from
 * any state in T by following zero or more ε-transitions (where symbol is null/EPSILON).
 *
 * Cycles in ε-transitions are safely handled through a visited set to prevent infinite loops.
 *
 * @param {State|Iterable<State>} states - Single State or collection of States
 * @returns {Set<State>} All states reachable via zero or more epsilon transitions
 */
export function epsilonClosure(states) {
  const closure = new Set();
  if (!states) {
    return closure;
  }

  const stack = [];

  // Determine if single state or collection
  if (typeof states.transitions !== 'undefined' || typeof states.id !== 'undefined') {
    // Single State instance
    closure.add(states);
    stack.push(states);
  } else if (typeof states[Symbol.iterator] === 'function') {
    // Array, Set, or any Iterable of states
    for (const state of states) {
      if (state && !closure.has(state)) {
        closure.add(state);
        stack.push(state);
      }
    }
  }

  // Traverse all reachable states along epsilon transitions
  while (stack.length > 0) {
    const currentState = stack.pop();

    if (!currentState.transitions) {
      continue;
    }

    for (const transition of currentState.transitions) {
      // Transition symbol is null for EPSILON
      if (transition.symbol === null) {
        const nextState = transition.toState || transition.to;
        if (nextState && !closure.has(nextState)) {
          closure.add(nextState);
          stack.push(nextState);
        }
      }
    }
  }

  return closure;
}
