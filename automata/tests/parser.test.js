import { describe, it, expect } from 'vitest';
import {
  toPostfix,
  parse,
  TokenType,
  RegexSyntaxError,
  insertExplicitConcat,
  tokenize,
} from '../src/index.js';

describe('Parser and Postfix Conversion', () => {
  describe('Implicit Concatenation Insertion', () => {
    it('inserts concat between adjacent literals (ab -> a · b)', () => {
      const tokens = insertExplicitConcat(tokenize('ab'));
      expect(tokens.map((t) => t.type)).toEqual([
        TokenType.LITERAL,
        TokenType.CONCAT,
        TokenType.LITERAL,
      ]);
    });

    it('inserts concat after star (a*b -> a* · b)', () => {
      const tokens = insertExplicitConcat(tokenize('a*b'));
      expect(tokens.map((t) => t.type)).toEqual([
        TokenType.LITERAL,
        TokenType.STAR,
        TokenType.CONCAT,
        TokenType.LITERAL,
      ]);
    });

    it('inserts concat between parenthesis and literal ((ab)c -> (a · b) · c)', () => {
      const tokens = insertExplicitConcat(tokenize('(ab)c'));
      expect(tokens.map((t) => t.type)).toEqual([
        TokenType.LPAREN,
        TokenType.LITERAL,
        TokenType.CONCAT,
        TokenType.LITERAL,
        TokenType.RPAREN,
        TokenType.CONCAT,
        TokenType.LITERAL,
      ]);
    });

    it('inserts concat around character classes ([a-z][0-9] -> [a-z] · [0-9])', () => {
      const tokens = insertExplicitConcat(tokenize('[a-z][0-9]'));
      expect(tokens.map((t) => t.type)).toEqual([
        TokenType.CHAR_CLASS,
        TokenType.CONCAT,
        TokenType.CHAR_CLASS,
      ]);
    });
  });

  describe('Postfix Conversion (Shunting-Yard)', () => {
    it('converts single literal to postfix', () => {
      const postfix = toPostfix('a');
      expect(postfix).toHaveLength(1);
      expect(postfix[0].type).toBe(TokenType.LITERAL);
      expect(postfix[0].value).toBe('a');
    });

    it('converts concatenation: ab -> a b ·', () => {
      const postfix = toPostfix('ab');
      expect(postfix.map((t) => t.type)).toEqual([
        TokenType.LITERAL,
        TokenType.LITERAL,
        TokenType.CONCAT,
      ]);
    });

    it('converts union: a|b -> a b |', () => {
      const postfix = toPostfix('a|b');
      expect(postfix.map((t) => t.type)).toEqual([
        TokenType.LITERAL,
        TokenType.LITERAL,
        TokenType.UNION,
      ]);
    });

    it('converts Kleene star: a* -> a *', () => {
      const postfix = toPostfix('a*');
      expect(postfix.map((t) => t.type)).toEqual([
        TokenType.LITERAL,
        TokenType.STAR,
      ]);
    });

    it('respects precedence: star over concat (ab* -> a b * ·)', () => {
      const postfix = toPostfix('ab*');
      expect(postfix.map((t) => t.type)).toEqual([
        TokenType.LITERAL,
        TokenType.LITERAL,
        TokenType.STAR,
        TokenType.CONCAT,
      ]);
    });

    it('respects precedence: concat over union (ab|cd -> a b · c d · |)', () => {
      const postfix = toPostfix('ab|cd');
      expect(postfix.map((t) => t.type)).toEqual([
        TokenType.LITERAL,
        TokenType.LITERAL,
        TokenType.CONCAT,
        TokenType.LITERAL,
        TokenType.LITERAL,
        TokenType.CONCAT,
        TokenType.UNION,
      ]);
    });

    it('respects parentheses override: (a|b)*c -> a b | * c ·', () => {
      const postfix = toPostfix('(a|b)*c');
      expect(postfix.map((t) => t.type)).toEqual([
        TokenType.LITERAL,
        TokenType.LITERAL,
        TokenType.UNION,
        TokenType.STAR,
        TokenType.LITERAL,
        TokenType.CONCAT,
      ]);
    });

    it('handles nested parentheses: ((a|b)c)*', () => {
      const postfix = toPostfix('((a|b)c)*');
      expect(postfix.map((t) => t.type)).toEqual([
        TokenType.LITERAL,
        TokenType.LITERAL,
        TokenType.UNION,
        TokenType.LITERAL,
        TokenType.CONCAT,
        TokenType.STAR,
      ]);
    });

    it('handles character classes in postfix: [a-z]*|0 -> [a-z] * 0 |', () => {
      const postfix = toPostfix('[a-z]*|0');
      expect(postfix.map((t) => t.type)).toEqual([
        TokenType.CHAR_CLASS,
        TokenType.STAR,
        TokenType.LITERAL,
        TokenType.UNION,
      ]);
    });
  });

  describe('AST Construction', () => {
    it('builds AST for concatenation and star (ab)*', () => {
      const ast = parse('(ab)*');
      expect(ast.type).toBe('Star');
      expect(ast.child.type).toBe('Concat');
      expect(ast.child.left.value).toBe('a');
      expect(ast.child.right.value).toBe('b');
    });

    it('builds AST for union a|b', () => {
      const ast = parse('a|b');
      expect(ast.type).toBe('Union');
      expect(ast.left.value).toBe('a');
      expect(ast.right.value).toBe('b');
    });

    it('builds AST for character class [0-9]', () => {
      const ast = parse('[0-9]');
      expect(ast.type).toBe('CharacterClass');
      expect(ast.charClass.has('5')).toBe(true);
    });
  });

  describe('Validation and Syntax Errors', () => {
    it('rejects unmatched opening parenthesis: (ab', () => {
      expect(() => toPostfix('(ab')).toThrow(RegexSyntaxError);
      expect(() => toPostfix('(ab')).toThrow(/Unmatched opening parenthesis/);
    });

    it('rejects unmatched closing parenthesis: ab)', () => {
      expect(() => toPostfix('ab)')).toThrow(RegexSyntaxError);
      expect(() => toPostfix('ab)')).toThrow(/Unmatched closing parenthesis/);
    });

    it('rejects empty parentheses ()', () => {
      expect(() => toPostfix('()')).toThrow(RegexSyntaxError);
      expect(() => toPostfix('()')).toThrow(/Empty parentheses/);
    });

    it('rejects empty parentheses in sub-expression: a()b', () => {
      expect(() => toPostfix('a()b')).toThrow(/Empty parentheses/);
    });

    it('rejects leading Kleene star: *a', () => {
      expect(() => toPostfix('*a')).toThrow(/Unexpected quantifier '\*'/);
    });

    it('rejects Kleene star immediately after opening parenthesis: (*)', () => {
      expect(() => toPostfix('(*)')).toThrow(RegexSyntaxError);
    });

    it('rejects multiple consecutive stars: a**', () => {
      expect(() => toPostfix('a**')).toThrow(/Multiple consecutive '\*' quantifiers/);
    });

    it('rejects leading union: |a', () => {
      expect(() => toPostfix('|a')).toThrow(/Unexpected union '\|'/);
    });

    it('rejects trailing union: a|', () => {
      expect(() => toPostfix('a|')).toThrow(/Trailing union '\|'/);
    });

    it('rejects consecutive unions: a||b', () => {
      expect(() => toPostfix('a||b')).toThrow(/Unexpected union '\|'/);
    });

    it('rejects union followed by star: a|*b', () => {
      expect(() => toPostfix('a|*b')).toThrow(/Unexpected quantifier '\*' immediately after union '\|'/);
    });

    it('rejects union followed by closing parenthesis: (a|)', () => {
      expect(() => toPostfix('(a|)')).toThrow(/Unexpected closing parenthesis '\)' after union '\|'/);
    });

    it('rejects union immediately after opening parenthesis: (|a)', () => {
      expect(() => toPostfix('(|a)')).toThrow(/Unexpected union '\|' after opening parenthesis/);
    });
  });
});
