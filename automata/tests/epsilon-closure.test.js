import { describe, it, expect } from 'vitest';
import { State, EPSILON, epsilonClosure } from '../src/index.js';

describe('Epsilon Closure', () => {
  it('includes the starting state when there are no outgoing transitions', () => {
    const s0 = new State(0);
    const closure = epsilonClosure(s0);

    expect(closure.size).toBe(1);
    expect(closure.has(s0)).toBe(true);
  });

  it('includes the starting state and single epsilon transition target', () => {
    const s0 = new State(0);
    const s1 = new State(1);
    s0.addEpsilonTransition(s1);

    const closure = epsilonClosure(s0);
    expect(closure.size).toBe(2);
    expect(closure.has(s0)).toBe(true);
    expect(closure.has(s1)).toBe(true);
  });

  it('follows transitive chains of multiple epsilon transitions (s0 -> s1 -> s2 -> s3)', () => {
    const s0 = new State(0);
    const s1 = new State(1);
    const s2 = new State(2);
    const s3 = new State(3);

    s0.addEpsilonTransition(s1);
    s1.addEpsilonTransition(s2);
    s2.addEpsilonTransition(s3);

    const closure = epsilonClosure(s0);
    expect(closure.size).toBe(4);
    expect(closure.has(s0)).toBe(true);
    expect(closure.has(s1)).toBe(true);
    expect(closure.has(s2)).toBe(true);
    expect(closure.has(s3)).toBe(true);
  });

  it('follows branching (tree/DAG) epsilon transitions', () => {
    const s0 = new State(0);
    const s1 = new State(1);
    const s2 = new State(2);
    const s3 = new State(3);

    s0.addEpsilonTransition(s1);
    s0.addEpsilonTransition(s2);
    s1.addEpsilonTransition(s3);

    const closure = epsilonClosure(s0);
    expect(closure.size).toBe(4);
    expect(closure.has(s0)).toBe(true);
    expect(closure.has(s1)).toBe(true);
    expect(closure.has(s2)).toBe(true);
    expect(closure.has(s3)).toBe(true);
  });

  it('does NOT follow non-epsilon character transitions', () => {
    const s0 = new State(0);
    const s1 = new State(1);
    const s2 = new State(2);

    s0.addTransition('a', s1);
    s0.addEpsilonTransition(s2);

    const closure = epsilonClosure(s0);
    expect(closure.size).toBe(2);
    expect(closure.has(s0)).toBe(true);
    expect(closure.has(s2)).toBe(true);
    expect(closure.has(s1)).toBe(false);
  });

  it('safely handles direct cycles without entering an infinite loop (s0 <-> s1)', () => {
    const s0 = new State(0);
    const s1 = new State(1);

    s0.addEpsilonTransition(s1);
    s1.addEpsilonTransition(s0);

    const closure = epsilonClosure(s0);
    expect(closure.size).toBe(2);
    expect(closure.has(s0)).toBe(true);
    expect(closure.has(s1)).toBe(true);
  });

  it('safely handles multi-state cycles and self-loops', () => {
    const s0 = new State(0);
    const s1 = new State(1);
    const s2 = new State(2);

    s0.addEpsilonTransition(s0); // Self loop
    s0.addEpsilonTransition(s1);
    s1.addEpsilonTransition(s2);
    s2.addEpsilonTransition(s0); // Cycle back to s0

    const closure = epsilonClosure(s0);
    expect(closure.size).toBe(3);
    expect(closure.has(s0)).toBe(true);
    expect(closure.has(s1)).toBe(true);
    expect(closure.has(s2)).toBe(true);
  });

  it('computes epsilon closure for a collection of states (Array or Set)', () => {
    const s0 = new State(0);
    const s1 = new State(1);
    const s2 = new State(2);
    const s3 = new State(3);

    s0.addEpsilonTransition(s1);
    s2.addEpsilonTransition(s3);

    // Passed as Array
    const closureArray = epsilonClosure([s0, s2]);
    expect(closureArray.size).toBe(4);
    expect(closureArray.has(s0)).toBe(true);
    expect(closureArray.has(s1)).toBe(true);
    expect(closureArray.has(s2)).toBe(true);
    expect(closureArray.has(s3)).toBe(true);

    // Passed as Set
    const closureSet = epsilonClosure(new Set([s0, s2]));
    expect(closureSet.size).toBe(4);
  });

  it('handles empty input gracefully', () => {
    expect(epsilonClosure(null).size).toBe(0);
    expect(epsilonClosure([]).size).toBe(0);
    expect(epsilonClosure(new Set()).size).toBe(0);
  });
});
