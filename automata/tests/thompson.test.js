import { describe, it, expect } from 'vitest';
import {
  thompson,
  createLiteralNFA,
  createCharClassNFA,
  concatenateNFAs,
  unionNFAs,
  kleeneStarNFA,
  CharacterClass,
  EPSILON,
  epsilonClosure,
} from '../src/index.js';

/**
 * Helper to simulate an ε-NFA on an input string to verify semantic correctness.
 */
function simulateNFA(nfa, inputString) {
  let currentStates = epsilonClosure(nfa.startState);

  for (const char of inputString) {
    const nextStates = new Set();
    for (const state of currentStates) {
      for (const transition of state.transitions) {
        if (transition.symbol === char) {
          nextStates.add(transition.toState);
        }
      }
    }
    currentStates = epsilonClosure(nextStates);
  }

  for (const state of currentStates) {
    if (nfa.acceptStates.has(state) || state.isAccept) {
      return true;
    }
  }
  return false;
}

describe("Thompson's Construction", () => {
  describe('Base Case: Literal Symbol', () => {
    it('creates an NFA fragment with 2 states and 1 character transition', () => {
      const frag = createLiteralNFA('a');

      expect(frag.states.size).toBe(2);
      expect(frag.startState).toBeDefined();
      expect(frag.acceptState).toBeDefined();
      expect(frag.acceptState.isAccept).toBe(true);
      expect(frag.startState.isAccept).toBe(false);

      expect(frag.startState.transitions).toHaveLength(1);
      const t = frag.startState.transitions[0];
      expect(t.symbol).toBe('a');
      expect(t.toState).toBe(frag.acceptState);
    });
  });

  describe('Base Case: Character Class', () => {
    it('creates transitions for each character in the class [abc]', () => {
      const cc = new CharacterClass(new Set(['a', 'b', 'c']), '[abc]');
      const frag = createCharClassNFA(cc);

      expect(frag.states.size).toBe(2);
      expect(frag.startState.transitions).toHaveLength(3);

      const symbols = frag.startState.transitions.map((t) => t.symbol).sort();
      expect(symbols).toEqual(['a', 'b', 'c']);
      frag.startState.transitions.forEach((t) => {
        expect(t.toState).toBe(frag.acceptState);
      });
    });

    it('creates transitions for range character class [a-z]', () => {
      const chars = new Set();
      for (let c = 97; c <= 122; c++) chars.add(String.fromCharCode(c));
      const cc = new CharacterClass(chars, '[a-z]');
      const frag = createCharClassNFA(cc);

      expect(frag.startState.transitions).toHaveLength(26);
    });
  });

  describe('Concatenation Construction (A · B)', () => {
    it('links accept of A to start of B via epsilon transition', () => {
      const fragA = createLiteralNFA('a');
      const fragB = createLiteralNFA('b');
      const concat = concatenateNFAs(fragA, fragB);

      expect(concat.startState).toBe(fragA.startState);
      expect(concat.acceptState).toBe(fragB.acceptState);

      // fragA's accept state now has an epsilon transition to fragB's start
      const epsTransition = fragA.acceptState.transitions.find((t) => t.symbol === EPSILON);
      expect(epsTransition).toBeDefined();
      expect(epsTransition.toState).toBe(fragB.startState);

      // fragA's accept is no longer accepting, fragB's accept is accepting
      expect(fragA.acceptState.isAccept).toBe(false);
      expect(fragB.acceptState.isAccept).toBe(true);
    });
  });

  describe('Union Construction (A | B)', () => {
    it('creates new start with 2 epsilon branches and new accept receiving 2 epsilons', () => {
      const fragA = createLiteralNFA('a');
      const fragB = createLiteralNFA('b');
      const union = unionNFAs(fragA, fragB);

      expect(union.states.size).toBe(6); // 2 + 2 + 2 = 6 states

      // Start state has epsilon transitions to fragA.start and fragB.start
      const startEpsilons = union.startState.getEpsilonTransitions();
      expect(startEpsilons).toHaveLength(2);
      const targets = startEpsilons.map((t) => t.toState);
      expect(targets).toContain(fragA.startState);
      expect(targets).toContain(fragB.startState);

      // Accept states of A and B both transition to new accept state
      const aEps = fragA.acceptState.getEpsilonTransitions();
      expect(aEps).toHaveLength(1);
      expect(aEps[0].toState).toBe(union.acceptState);

      const bEps = fragB.acceptState.getEpsilonTransitions();
      expect(bEps).toHaveLength(1);
      expect(bEps[0].toState).toBe(union.acceptState);

      expect(union.acceptState.isAccept).toBe(true);
      expect(fragA.acceptState.isAccept).toBe(false);
      expect(fragB.acceptState.isAccept).toBe(false);
    });
  });

  describe('Kleene Star Construction (A*)', () => {
    it('creates 4 epsilon transitions for loop, enter, bypass, and exit', () => {
      const fragA = createLiteralNFA('a');
      const star = kleeneStarNFA(fragA);

      expect(star.states.size).toBe(4); // 2 + 2 = 4 states

      // 1. Enter and 2. Bypass from new start
      const startEps = star.startState.getEpsilonTransitions();
      expect(startEps).toHaveLength(2);
      const startTargets = startEps.map((t) => t.toState);
      expect(startTargets).toContain(fragA.startState); // enter
      expect(startTargets).toContain(star.acceptState); // bypass

      // 3. Loop and 4. Exit from original accept
      const acceptEps = fragA.acceptState.getEpsilonTransitions();
      expect(acceptEps).toHaveLength(2);
      const acceptTargets = acceptEps.map((t) => t.toState);
      expect(acceptTargets).toContain(fragA.startState); // loop
      expect(acceptTargets).toContain(star.acceptState); // exit

      expect(star.acceptState.isAccept).toBe(true);
      expect(fragA.acceptState.isAccept).toBe(false);
    });
  });

  describe('Full Thompson Construction & Language Recognition', () => {
    it('recognizes single character language for "a"', () => {
      const nfa = thompson('a');
      expect(simulateNFA(nfa, 'a')).toBe(true);
      expect(simulateNFA(nfa, 'b')).toBe(false);
      expect(simulateNFA(nfa, '')).toBe(false);
      expect(simulateNFA(nfa, 'aa')).toBe(false);
    });

    it('recognizes concatenated string for "ab"', () => {
      const nfa = thompson('ab');
      expect(simulateNFA(nfa, 'ab')).toBe(true);
      expect(simulateNFA(nfa, 'a')).toBe(false);
      expect(simulateNFA(nfa, 'b')).toBe(false);
      expect(simulateNFA(nfa, 'aba')).toBe(false);
    });

    it('recognizes union for "a|b"', () => {
      const nfa = thompson('a|b');
      expect(simulateNFA(nfa, 'a')).toBe(true);
      expect(simulateNFA(nfa, 'b')).toBe(true);
      expect(simulateNFA(nfa, 'c')).toBe(false);
      expect(simulateNFA(nfa, 'ab')).toBe(false);
    });

    it('recognizes zero or more repetitions for "a*"', () => {
      const nfa = thompson('a*');
      expect(simulateNFA(nfa, '')).toBe(true);
      expect(simulateNFA(nfa, 'a')).toBe(true);
      expect(simulateNFA(nfa, 'aa')).toBe(true);
      expect(simulateNFA(nfa, 'aaaaa')).toBe(true);
      expect(simulateNFA(nfa, 'b')).toBe(false);
      expect(simulateNFA(nfa, 'ab')).toBe(false);
    });

    it('recognizes repetition of groups for "(ab)*"', () => {
      const nfa = thompson('(ab)*');
      expect(simulateNFA(nfa, '')).toBe(true);
      expect(simulateNFA(nfa, 'ab')).toBe(true);
      expect(simulateNFA(nfa, 'abab')).toBe(true);
      expect(simulateNFA(nfa, 'ababab')).toBe(true);
      expect(simulateNFA(nfa, 'a')).toBe(false);
      expect(simulateNFA(nfa, 'aba')).toBe(false);
    });

    it('recognizes character class ranges "[a-z]"', () => {
      const nfa = thompson('[a-z]');
      expect(simulateNFA(nfa, 'a')).toBe(true);
      expect(simulateNFA(nfa, 'm')).toBe(true);
      expect(simulateNFA(nfa, 'z')).toBe(true);
      expect(simulateNFA(nfa, 'A')).toBe(false);
      expect(simulateNFA(nfa, '0')).toBe(false);
    });

    it('recognizes complex combined expression: "[0-9]+ not used -> [0-9][0-9]*|[a-z]"', () => {
      // Simulating digits [0-9][0-9]* or single lowercase letter [a-z]
      const nfa = thompson('[0-9][0-9]*|[a-z]');
      expect(simulateNFA(nfa, '0')).toBe(true);
      expect(simulateNFA(nfa, '12345')).toBe(true);
      expect(simulateNFA(nfa, 'a')).toBe(true);
      expect(simulateNFA(nfa, 'z')).toBe(true);
      expect(simulateNFA(nfa, 'az')).toBe(false);
      expect(simulateNFA(nfa, '1a')).toBe(false);
    });

    it('recognizes escaped metacharacters as literals "\\*\\|\\("', () => {
      const nfa = thompson('\\*\\|\\(');
      expect(simulateNFA(nfa, '*|(')).toBe(true);
      expect(simulateNFA(nfa, '*')).toBe(false);
    });

    it('ensures each state in the resulting NFA has a unique ID', () => {
      const nfa = thompson('(a|b)*c');
      const idSet = new Set();
      for (const state of nfa.states) {
        expect(idSet.has(state.id)).toBe(false);
        idSet.add(state.id);
      }
      expect(idSet.size).toBe(nfa.states.size);
    });
  });
});
