import { describe, it, expect } from 'vitest';
import { tokenize, TokenType, RegexSyntaxError } from '../src/index.js';

describe('Tokenizer', () => {
  describe('Literal Characters', () => {
    it('tokenizes single alphanumeric literals', () => {
      const tokens = tokenize('a');
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe(TokenType.LITERAL);
      expect(tokens[0].value).toBe('a');
      expect(tokens[0].position).toBe(0);
    });

    it('tokenizes multiple sequential literals', () => {
      const tokens = tokenize('abc123');
      expect(tokens).toHaveLength(6);
      expect(tokens.map((t) => t.value)).toEqual(['a', 'b', 'c', '1', '2', '3']);
    });

    it('tokenizes space and permitted punctuation as literals', () => {
      const tokens = tokenize('a b_c-d');
      expect(tokens.map((t) => t.value)).toEqual(['a', ' ', 'b', '_', 'c', '-', 'd']);
    });
  });

  describe('Operators and Grouping', () => {
    it('tokenizes union operator |', () => {
      const tokens = tokenize('a|b');
      expect(tokens).toHaveLength(3);
      expect(tokens[1].type).toBe(TokenType.UNION);
      expect(tokens[1].value).toBe('|');
      expect(tokens[1].position).toBe(1);
    });

    it('tokenizes Kleene star *', () => {
      const tokens = tokenize('a*');
      expect(tokens).toHaveLength(2);
      expect(tokens[1].type).toBe(TokenType.STAR);
      expect(tokens[1].value).toBe('*');
      expect(tokens[1].position).toBe(1);
    });

    it('tokenizes parentheses ()', () => {
      const tokens = tokenize('(ab)');
      expect(tokens).toHaveLength(4);
      expect(tokens[0].type).toBe(TokenType.LPAREN);
      expect(tokens[3].type).toBe(TokenType.RPAREN);
    });

    it('tokenizes nested parentheses ((a))', () => {
      const tokens = tokenize('((a))');
      expect(tokens).toHaveLength(5);
      expect(tokens[0].type).toBe(TokenType.LPAREN);
      expect(tokens[1].type).toBe(TokenType.LPAREN);
      expect(tokens[2].type).toBe(TokenType.LITERAL);
      expect(tokens[3].type).toBe(TokenType.RPAREN);
      expect(tokens[4].type).toBe(TokenType.RPAREN);
    });
  });

  describe('Character Classes and Ranges', () => {
    it('tokenizes individual characters in character class [abc]', () => {
      const tokens = tokenize('[abc]');
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe(TokenType.CHAR_CLASS);
      expect(tokens[0].value.has('a')).toBe(true);
      expect(tokens[0].value.has('b')).toBe(true);
      expect(tokens[0].value.has('c')).toBe(true);
      expect(tokens[0].value.has('d')).toBe(false);
    });

    it('tokenizes character class range [a-z]', () => {
      const tokens = tokenize('[a-z]');
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe(TokenType.CHAR_CLASS);
      expect(tokens[0].value.has('a')).toBe(true);
      expect(tokens[0].value.has('m')).toBe(true);
      expect(tokens[0].value.has('z')).toBe(true);
      expect(tokens[0].value.has('A')).toBe(false);
      expect(tokens[0].value.characters.size).toBe(26);
    });

    it('tokenizes digit range [0-9]', () => {
      const tokens = tokenize('[0-9]');
      expect(tokens[0].value.has('0')).toBe(true);
      expect(tokens[0].value.has('5')).toBe(true);
      expect(tokens[0].value.has('9')).toBe(true);
      expect(tokens[0].value.has('a')).toBe(false);
      expect(tokens[0].value.characters.size).toBe(10);
    });

    it('tokenizes multiple ranges and individual characters [a-cA-C0-1_]', () => {
      const tokens = tokenize('[a-cA-C0-1_]');
      const cc = tokens[0].value;
      expect(cc.has('a')).toBe(true);
      expect(cc.has('b')).toBe(true);
      expect(cc.has('c')).toBe(true);
      expect(cc.has('A')).toBe(true);
      expect(cc.has('B')).toBe(true);
      expect(cc.has('C')).toBe(true);
      expect(cc.has('0')).toBe(true);
      expect(cc.has('1')).toBe(true);
      expect(cc.has('_')).toBe(true);
      expect(cc.has('d')).toBe(false);
      expect(cc.has('2')).toBe(false);
    });

    it('treats leading and trailing dashes as literal characters in character classes', () => {
      const leadingDash = tokenize('[-ab]')[0].value;
      expect(leadingDash.has('-')).toBe(true);
      expect(leadingDash.has('a')).toBe(true);
      expect(leadingDash.has('b')).toBe(true);

      const trailingDash = tokenize('[ab-]')[0].value;
      expect(trailingDash.has('-')).toBe(true);
      expect(trailingDash.has('a')).toBe(true);
      expect(trailingDash.has('b')).toBe(true);
    });

    it('supports escaped characters inside character classes', () => {
      const tokens = tokenize('[\\]\\-\\\\]');
      const cc = tokens[0].value;
      expect(cc.has(']')).toBe(true);
      expect(cc.has('-')).toBe(true);
      expect(cc.has('\\')).toBe(true);
    });
  });

  describe('Escaped Metacharacters', () => {
    it('escapes metacharacters as literals: \\*, \\|, \\(, \\)', () => {
      const tokens = tokenize('\\*\\|\\(\\)');
      expect(tokens).toHaveLength(4);
      tokens.forEach((t) => expect(t.type).toBe(TokenType.LITERAL));
      expect(tokens.map((t) => t.value)).toEqual(['*', '|', '(', ')']);
    });

    it('escapes brackets and backslash: \\[, \\], \\\\', () => {
      const tokens = tokenize('\\[\\]\\\\');
      expect(tokens).toHaveLength(3);
      tokens.forEach((t) => expect(t.type).toBe(TokenType.LITERAL));
      expect(tokens.map((t) => t.value)).toEqual(['[', ']', '\\']);
    });

    it('escapes unsupported operators so they are treated as valid literals: \\+, \\?', () => {
      const tokens = tokenize('\\+\\?');
      expect(tokens).toHaveLength(2);
      expect(tokens[0].value).toBe('+');
      expect(tokens[1].value).toBe('?');
    });
  });

  describe('Syntax Errors and Unsupported Features', () => {
    it('throws RegexSyntaxError on empty string', () => {
      expect(() => tokenize('')).toThrow(RegexSyntaxError);
      expect(() => tokenize('')).toThrow(/Empty regular expression/);
    });

    it('throws RegexSyntaxError on non-string input', () => {
      expect(() => tokenize(123)).toThrow(RegexSyntaxError);
    });

    it('throws RegexSyntaxError on dangling backslash', () => {
      expect(() => tokenize('abc\\')).toThrow(RegexSyntaxError);
      expect(() => tokenize('abc\\')).toThrow(/Dangling backslash/);
    });

    it('throws RegexSyntaxError on unclosed character class', () => {
      expect(() => tokenize('[abc')).toThrow(RegexSyntaxError);
      expect(() => tokenize('[abc')).toThrow(/Unclosed character class/);
    });

    it('throws RegexSyntaxError on empty character class', () => {
      expect(() => tokenize('[]')).toThrow(RegexSyntaxError);
      expect(() => tokenize('[]')).toThrow(/Empty character class/);
    });

    it('throws RegexSyntaxError on invalid character range [z-a]', () => {
      expect(() => tokenize('[z-a]')).toThrow(RegexSyntaxError);
      expect(() => tokenize('[z-a]')).toThrow(/Invalid character range/);
    });

    it('rejects negated character classes [^...]', () => {
      expect(() => tokenize('[^abc]')).toThrow(RegexSyntaxError);
      expect(() => tokenize('[^abc]')).toThrow(/Negated character classes/);
    });

    it('rejects unexpected closing bracket outside class', () => {
      expect(() => tokenize('abc]')).toThrow(RegexSyntaxError);
      expect(() => tokenize('abc]')).toThrow(/Unexpected closing bracket/);
    });

    it('rejects unsupported operators: +, ?, {n}, ^, $, .', () => {
      expect(() => tokenize('a+')).toThrow(/Unsupported quantifier '\+'/);
      expect(() => tokenize('a?')).toThrow(/Unsupported quantifier '\?'/);
      expect(() => tokenize('a{2}')).toThrow(/Unsupported repetition quantifier '\{'/);
      expect(() => tokenize('^a')).toThrow(/Unsupported anchor '\^'/);
      expect(() => tokenize('a$')).toThrow(/Unsupported anchor '\$'/);
      expect(() => tokenize('a.b')).toThrow(/Unsupported wildcard '\.'/);
    });
  });
});
