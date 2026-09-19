import { describe, it, expect } from 'vitest';
import {
  thompson,
  subsetConstruction,
  simulateDFA,
  AutomataError,
  epsilonClosure,
} from '../src/index.js';

/**
 * Test-only NFA simulator to verify language equivalence between NFA and DFA.
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

describe('DFA Simulation', () => {
  describe('Single Literal: a', () => {
    const dfa = subsetConstruction('a');

    it('accepts matching single literal', () => {
      expect(simulateDFA(dfa, 'a')).toBe(true);
      expect(dfa.accepts('a')).toBe(true);
    });

    it('rejects empty input', () => {
      expect(simulateDFA(dfa, '')).toBe(false);
    });

    it('rejects wrong literal and unknown characters', () => {
      expect(simulateDFA(dfa, 'b')).toBe(false);
      expect(simulateDFA(dfa, 'x')).toBe(false);
    });

    it('rejects multiple characters where prefix matches', () => {
      expect(simulateDFA(dfa, 'aa')).toBe(false);
      expect(simulateDFA(dfa, 'ab')).toBe(false);
    });
  });

  describe('Concatenation: ab', () => {
    const dfa = subsetConstruction('ab');

    it('accepts exact concatenation sequence', () => {
      expect(simulateDFA(dfa, 'ab')).toBe(true);
    });

    it('rejects prefixes and partial sequences', () => {
      expect(simulateDFA(dfa, '')).toBe(false);
      expect(simulateDFA(dfa, 'a')).toBe(false);
      expect(simulateDFA(dfa, 'b')).toBe(false);
    });

    it('rejects superstrings and incorrect sequences', () => {
      expect(simulateDFA(dfa, 'aba')).toBe(false);
      expect(simulateDFA(dfa, 'ba')).toBe(false);
      expect(simulateDFA(dfa, 'abc')).toBe(false);
    });
  });

  describe('Union: a|b', () => {
    const dfa = subsetConstruction('a|b');

    it('accepts either branch', () => {
      expect(simulateDFA(dfa, 'a')).toBe(true);
      expect(simulateDFA(dfa, 'b')).toBe(true);
    });

    it('rejects empty input', () => {
      expect(simulateDFA(dfa, '')).toBe(false);
    });

    it('rejects combinations and unlisted symbols', () => {
      expect(simulateDFA(dfa, 'ab')).toBe(false);
      expect(simulateDFA(dfa, 'ba')).toBe(false);
      expect(simulateDFA(dfa, 'c')).toBe(false);
    });
  });

  describe('Kleene Star: a*', () => {
    const dfa = subsetConstruction('a*');

    it('accepts empty input (zero repetitions)', () => {
      expect(simulateDFA(dfa, '')).toBe(true);
    });

    it('accepts one or more repetitions of the symbol', () => {
      expect(simulateDFA(dfa, 'a')).toBe(true);
      expect(simulateDFA(dfa, 'aa')).toBe(true);
      expect(simulateDFA(dfa, 'aaa')).toBe(true);
      expect(simulateDFA(dfa, 'aaaaa')).toBe(true);
    });

    it('rejects any non-matching character', () => {
      expect(simulateDFA(dfa, 'b')).toBe(false);
      expect(simulateDFA(dfa, 'ab')).toBe(false);
      expect(simulateDFA(dfa, 'aab')).toBe(false);
    });
  });

  describe('Grouping and Repetition: (ab)*', () => {
    const dfa = subsetConstruction('(ab)*');

    it('accepts empty string and multiple full group iterations', () => {
      expect(simulateDFA(dfa, '')).toBe(true);
      expect(simulateDFA(dfa, 'ab')).toBe(true);
      expect(simulateDFA(dfa, 'abab')).toBe(true);
      expect(simulateDFA(dfa, 'ababab')).toBe(true);
    });

    it('rejects partial group iterations and mismatched characters', () => {
      expect(simulateDFA(dfa, 'a')).toBe(false);
      expect(simulateDFA(dfa, 'aba')).toBe(false);
      expect(simulateDFA(dfa, 'b')).toBe(false);
      expect(simulateDFA(dfa, 'ba')).toBe(false);
      expect(simulateDFA(dfa, 'ababa')).toBe(false);
    });
  });

  describe('Character Classes and Ranges: [a-c]', () => {
    const dfa = subsetConstruction('[a-c]');

    it('accepts any character within the specified range', () => {
      expect(simulateDFA(dfa, 'a')).toBe(true);
      expect(simulateDFA(dfa, 'b')).toBe(true);
      expect(simulateDFA(dfa, 'c')).toBe(true);
    });

    it('rejects characters outside the range and empty input', () => {
      expect(simulateDFA(dfa, '')).toBe(false);
      expect(simulateDFA(dfa, 'd')).toBe(false);
      expect(simulateDFA(dfa, 'z')).toBe(false);
      expect(simulateDFA(dfa, 'A')).toBe(false);
      expect(simulateDFA(dfa, '1')).toBe(false);
    });

    it('rejects multiple characters when only one is expected', () => {
      expect(simulateDFA(dfa, 'ab')).toBe(false);
      expect(simulateDFA(dfa, 'aa')).toBe(false);
    });
  });

  describe('Complex Expressions', () => {
    it('simulates combination: (a|b)*c', () => {
      const dfa = subsetConstruction('(a|b)*c');
      expect(dfa.accepts('c')).toBe(true);
      expect(dfa.accepts('ac')).toBe(true);
      expect(dfa.accepts('bc')).toBe(true);
      expect(dfa.accepts('ababc')).toBe(true);
      expect(dfa.accepts('bbaac')).toBe(true);

      expect(dfa.accepts('')).toBe(false);
      expect(dfa.accepts('a')).toBe(false);
      expect(dfa.accepts('b')).toBe(false);
      expect(dfa.accepts('ab')).toBe(false);
      expect(dfa.accepts('ca')).toBe(false);
    });

    it('simulates digit followed by letters: [0-9][a-z]*', () => {
      const dfa = subsetConstruction('[0-9][a-z]*');
      expect(dfa.accepts('0')).toBe(true);
      expect(dfa.accepts('7abc')).toBe(true);
      expect(dfa.accepts('9z')).toBe(true);

      expect(dfa.accepts('')).toBe(false);
      expect(dfa.accepts('abc')).toBe(false);
      expect(dfa.accepts('01')).toBe(false);
    });
  });

  describe('Equivalence with NFA Behavior', () => {
    const patterns = [
      'a',
      'ab',
      'a|b',
      'a*',
      '(ab)*',
      '(a|b)*c',
      '[a-c]',
      '[0-9][a-z]*',
    ];

    const testStrings = [
      '',
      'a',
      'b',
      'c',
      'd',
      '0',
      '7',
      'ab',
      'ba',
      'aa',
      'ac',
      'bc',
      'abab',
      'aba',
      'ababc',
      '7abc',
      '99',
      'xyz',
    ];

    for (const pattern of patterns) {
      it(`verifies DFA and NFA recognize the exact same language for "${pattern}"`, () => {
        const nfa = thompson(pattern);
        const dfa = subsetConstruction(nfa);

        for (const str of testStrings) {
          const nfaResult = simulateNFA(nfa, str);
          const dfaResult = simulateDFA(dfa, str);

          expect(dfaResult).toBe(
            nfaResult,
            `Discrepancy for pattern "${pattern}" on input "${str}": NFA=${nfaResult}, DFA=${dfaResult}`
          );
        }
      });
    }
  });

  describe('Error Handling', () => {
    it('throws AutomataError if input is not a string', () => {
      const dfa = subsetConstruction('a');
      expect(() => simulateDFA(dfa, null)).toThrow(AutomataError);
      expect(() => simulateDFA(dfa, 123)).toThrow(AutomataError);
      expect(() => simulateDFA(dfa, undefined)).toThrow(AutomataError);
    });

    it('throws AutomataError if DFA has no start state', () => {
      expect(() => simulateDFA(null, 'a')).toThrow(AutomataError);
      expect(() => simulateDFA({}, 'a')).toThrow(AutomataError);
    });
  });
});
