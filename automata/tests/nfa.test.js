import { describe, it, expect } from 'vitest';
import { State, Transition, NFA, EPSILON, epsilonClosure } from '../src/index.js';

describe('NFA, State, and Transition Data Structures', () => {
  describe('EPSILON constant', () => {
    it('standardizes EPSILON as null', () => {
      expect(EPSILON).toBeNull();
    });
  });

  describe('Transition', () => {
    it('creates character transition', () => {
      const s0 = new State(0);
      const s1 = new State(1);
      const t = new Transition('a', s1);

      expect(t.symbol).toBe('a');
      expect(t.toState).toBe(s1);
      expect(t.to).toBe(s1);
      expect(t.target).toBe(s1);
      expect(t.isEpsilon()).toBe(false);
    });

    it('creates epsilon transition with EPSILON', () => {
      const s1 = new State(1);
      const t = new Transition(EPSILON, s1);

      expect(t.symbol).toBeNull();
      expect(t.toState).toBe(s1);
      expect(t.isEpsilon()).toBe(true);
    });
  });

  describe('State', () => {
    it('initializes with unique numeric or string ID and default properties', () => {
      const s0 = new State(0);
      expect(s0.id).toBe(0);
      expect(s0.name).toBe('q0');
      expect(s0.isAccept).toBe(false);
      expect(s0.transitions).toEqual([]);
      expect(s0.toString()).toBe('q0');

      const sq = new State('custom');
      expect(sq.id).toBe('custom');
      expect(sq.name).toBe('custom');
    });

    it('adds character transitions and filters by symbol', () => {
      const s0 = new State(0);
      const s1 = new State(1);
      const s2 = new State(2);

      s0.addTransition('a', s1);
      s0.addTransition('b', s2);
      s0.addEpsilonTransition(s2);

      expect(s0.transitions).toHaveLength(3);
      expect(s0.getTransitions('a')).toHaveLength(1);
      expect(s0.getTransitions('a')[0].toState).toBe(s1);
      expect(s0.getTransitions('b')).toHaveLength(1);
      expect(s0.getEpsilonTransitions()).toHaveLength(1);
      expect(s0.getEpsilonTransitions()[0].toState).toBe(s2);
    });

    it('computes epsilon closure via state method', () => {
      const s0 = new State(0);
      const s1 = new State(1);
      s0.addEpsilonTransition(s1);

      const closure = s0.epsilonClosure();
      expect(closure.has(s0)).toBe(true);
      expect(closure.has(s1)).toBe(true);
    });
  });

  describe('NFA', () => {
    it('initializes with start state and accept states', () => {
      const s0 = new State(0);
      const s1 = new State(1);
      s1.isAccept = true;

      const nfa = new NFA(s0, [s1]);
      expect(nfa.startState).toBe(s0);
      expect(nfa.acceptState).toBe(s1);
      expect(nfa.acceptStates.has(s1)).toBe(true);
      expect(nfa.states.has(s0)).toBe(true);
      expect(nfa.states.has(s1)).toBe(true);
    });

    it('collects all transitions and input alphabet across the automaton', () => {
      const s0 = new State(0);
      const s1 = new State(1);
      const s2 = new State(2);

      s0.addTransition('x', s1);
      s0.addEpsilonTransition(s1);
      s1.addTransition('y', s2);

      const nfa = new NFA(s0, [s2]);
      nfa.addState(s1);

      const allTransitions = nfa.getAllTransitions();
      expect(allTransitions).toHaveLength(3);

      const alphabet = nfa.getAlphabet();
      expect(alphabet.has('x')).toBe(true);
      expect(alphabet.has('y')).toBe(true);
      expect(alphabet.has(EPSILON)).toBe(false);
      expect(alphabet.size).toBe(2);
    });

    it('computes epsilon closure via nfa method', () => {
      const s0 = new State(0);
      const s1 = new State(1);
      s0.addEpsilonTransition(s1);

      const nfa = new NFA(s0, [s1]);
      const closure = nfa.epsilonClosure(s0);
      expect(closure.has(s0)).toBe(true);
      expect(closure.has(s1)).toBe(true);
    });
  });
});
