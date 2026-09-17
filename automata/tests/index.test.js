import { describe, it, expect } from 'vitest';
import { getEngineInfo } from '../src/index.js';

describe('FormX Automata Engine', () => {
  it('should initialize successfully and return engine metadata', () => {
    const info = getEngineInfo();

    expect(info).toBeDefined();
    expect(info.name).toBe('FormX Automata Engine');
    expect(info.version).toBe('0.1.0');
    expect(info.status).toBe('initialized');
  });
});
