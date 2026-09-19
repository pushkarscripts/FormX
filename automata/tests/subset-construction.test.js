import { describe, it, expect } from 'vitest';
import {
  thompson,
  subsetConstruction,
  getStateSetKey,
  DFA,
  DFAState,
  State,
  NFA,
} from '../src/index.js';

describe('Subset Construction (NFA to DFA)', () => {
  describe('getStateSetKey', () => {
    it('produces identical keys regardless of Set iteration order or insertion order', () => {
      const s0 = new State(0);
      const s1 = new State(1);
      const s2 = new State(2);

      const set1 = new Set([s2, s0, s1]);
      const set2 = new Set([s0, s1, s2]);
      const set3 = new Set([s1, s2, s0]);

      const key1 = getStateSetKey(set1);
      const key2 = getStateSetKey(set2);
      const key3 = getStateSetKey(set3);

      expect(key1).toBe('0,1,2');
      expect(key1).toBe(key2);
      expect(key2).toBe(key3);
    });

    it('handles numeric sorting correctly without string collision (e.g. 2 vs 10)', () => {
      const s1 = new State(1);
      const s2 = new State(2);
      const s10 = new State(10);

      const key = getStateSetKey([s10, s2, s1]);
      expect(key).toBe('1,2,10');
    });

    it('returns empty string for empty state set', () => {
      expect(getStateSetKey(new Set())).toBe('');
      expect(getStateSetKey([])).toBe('');
      expect(getStateSetKey(null)).toBe('');
    });
  });

  describe('DFA Construction Structural Properties', () => {
    it('computes DFA start state from epsilon-closure of NFA start state', () => {
      // For 'a*', NFA start state has epsilon transitions to fragment start and accept
      const nfa = thompson('a*');
      const dfa = subsetConstruction(nfa);

      expect(dfa.startState).toBeDefined();
      expect(dfa.startState.nfaStates.size).toBeGreaterThan(1);
      // NFA start state must be present in the DFA start state's subset
      expect(dfa.startState.nfaStates.has(nfa.startState)).toBe(true);
    });

    it('derives the input alphabet from non-epsilon transitions', () => {
      const nfa = thompson('a|b|c');
      const dfa = subsetConstruction(nfa);

      expect(dfa.alphabet.has('a')).toBe(true);
      expect(dfa.alphabet.has('b')).toBe(true);
      expect(dfa.alphabet.has('c')).toBe(true);
      expect(dfa.alphabet.has(null)).toBe(false);
      expect(dfa.alphabet.size).toBe(3);
    });

    it('contains multiple NFA states in the same DFA state subset', () => {
      // In 'a*', the start DFA state contains the enter, bypass, and accept states
      const nfa = thompson('a*');
      const dfa = subsetConstruction(nfa);

      expect(dfa.startState.nfaStates.size).toBe(3);
      // Because one of those NFA states is accepting, start DFA state is accepting
      expect(dfa.startState.isAccept).toBe(true);
    });

    it('correctly marks DFA states as accepting if at least one NFA state is accepting', () => {
      const nfa = thompson('a|b');
      const dfa = subsetConstruction(nfa);

      // Start state is NOT accepting
      expect(dfa.startState.isAccept).toBe(false);

      // Transition on 'a' leads to an accepting state
      const nextA = dfa.startState.getTransition('a');
      expect(nextA).toBeDefined();
      expect(nextA.isAccept).toBe(true);

      // Transition on 'b' leads to an accepting state
      const nextB = dfa.startState.getTransition('b');
      expect(nextB).toBeDefined();
      expect(nextB.isAccept).toBe(true);
    });

    it('avoids generating unreachable DFA states', () => {
      const nfa = thompson('ab');
      const dfa = subsetConstruction(nfa);

      // Reachable states in 'ab': start (D0), after 'a' (D1), after 'b' (D2)
      expect(dfa.states.size).toBe(3);

      // Verify all states in dfa.states are reachable from startState
      const reachable = new Set();
      const queue = [dfa.startState];
      reachable.add(dfa.startState);

      while (queue.length > 0) {
        const curr = queue.shift();
        for (const { toState } of curr.getAllTransitions()) {
          if (!reachable.has(toState)) {
            reachable.add(toState);
            queue.push(toState);
          }
        }
      }

      expect(reachable.size).toBe(dfa.states.size);
    });

    it('omits transitions for empty moves instead of generating unreachable sink states', () => {
      const nfa = thompson('a');
      const dfa = subsetConstruction(nfa);

      // Start state only has transition on 'a'
      expect(dfa.startState.getTransition('a')).toBeDefined();
      expect(dfa.startState.getTransition('b')).toBeNull();

      // Accepting state has no outgoing transitions
      const acceptState = dfa.startState.getTransition('a');
      expect(acceptState.getAllTransitions()).toHaveLength(0);
    });

    it('supports character classes and ranges (e.g. [a-c])', () => {
      const nfa = thompson('[a-c]');
      const dfa = subsetConstruction(nfa);

      expect(dfa.alphabet.size).toBe(3);
      expect(dfa.alphabet.has('a')).toBe(true);
      expect(dfa.alphabet.has('b')).toBe(true);
      expect(dfa.alphabet.has('c')).toBe(true);

      const targetA = dfa.startState.getTransition('a');
      const targetB = dfa.startState.getTransition('b');
      const targetC = dfa.startState.getTransition('c');

      expect(targetA).toBeDefined();
      expect(targetA.isAccept).toBe(true);
      // All three symbols lead to the same DFA state
      expect(targetA).toBe(targetB);
      expect(targetB).toBe(targetC);
    });

    it('ensures each state has at most one transition per symbol (determinism)', () => {
      const nfa = thompson('(a|b)*a(a|b)');
      const dfa = subsetConstruction(nfa);

      for (const state of dfa.states) {
        for (const symbol of dfa.alphabet) {
          const transitions = state.getAllTransitions().filter((t) => t.symbol === symbol);
          expect(transitions.length).toBeLessThanOrEqual(1);
        }
      }
    });
  });
});
