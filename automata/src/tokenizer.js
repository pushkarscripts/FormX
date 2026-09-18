import { RegexSyntaxError } from './errors.js';

export const TokenType = {
  LITERAL: 'LITERAL',
  CHAR_CLASS: 'CHAR_CLASS',
  CONCAT: 'CONCAT',
  UNION: 'UNION',
  STAR: 'STAR',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
};

/**
 * Represents a parsed character class, such as [a-z] or [abc].
 */
export class CharacterClass {
  constructor(characters = new Set(), raw = '') {
    this.characters = characters instanceof Set ? characters : new Set(characters);
    this.raw = raw;
  }

  has(char) {
    return this.characters.has(char);
  }

  matches(char) {
    return this.characters.has(char);
  }

  toString() {
    return this.raw || `[${Array.from(this.characters).join('')}]`;
  }
}

/**
 * Token structure returned by the tokenizer.
 */
export class Token {
  constructor(type, value, position) {
    this.type = type;
    this.value = value;
    this.position = position;
  }

  toString() {
    return `Token(${this.type}, ${JSON.stringify(this.value)}, pos=${this.position})`;
  }
}

/**
 * Parses a character class [...] starting at index startPos in the pattern.
 * Supports individual characters, ranges (e.g. a-z), and escaped characters (e.g. \], \-, \\).
 *
 * @param {string} pattern
 * @param {number} startPos
 * @returns {{ token: Token, nextIndex: number }}
 */
function parseCharacterClass(pattern, startPos) {
  let i = startPos + 1; // Skip '['

  if (i >= pattern.length) {
    throw new RegexSyntaxError("Unclosed character class '['", startPos);
  }

  if (pattern[i] === ']') {
    throw new RegexSyntaxError("Empty character class '[]'", startPos);
  }

  if (pattern[i] === '^') {
    throw new RegexSyntaxError("Negated character classes '[^...]' are not supported", startPos);
  }

  const characters = new Set();
  let prevChar = null;

  while (i < pattern.length && pattern[i] !== ']') {
    let currentChar = null;

    let isEscaped = false;
    if (pattern[i] === '\\') {
      // Escaped character inside character class
      if (i + 1 >= pattern.length) {
        throw new RegexSyntaxError('Dangling backslash inside character class', i);
      }
      currentChar = pattern[i + 1];
      isEscaped = true;
      i += 2;
    } else {
      currentChar = pattern[i];
      isEscaped = false;
      i++;
    }

    if (!isEscaped && currentChar === '-') {
      // Range check: does unescaped '-' act as a range delimiter?
      // It's a range if there was a preceding character and it's not the end of the class.
      if (prevChar !== null && i < pattern.length && pattern[i] !== ']') {
        let endChar = null;
        const rangeStartPos = i - 1;

        if (pattern[i] === '\\') {
          if (i + 1 >= pattern.length) {
            throw new RegexSyntaxError('Dangling backslash inside character class range', i);
          }
          endChar = pattern[i + 1];
          i += 2;
        } else {
          endChar = pattern[i];
          i++;
        }

        const startCode = prevChar.charCodeAt(0);
        const endCode = endChar.charCodeAt(0);

        if (startCode > endCode) {
          throw new RegexSyntaxError(
            `Invalid character range '[${prevChar}-${endChar}]': start character '${prevChar}' is greater than end character '${endChar}'`,
            rangeStartPos
          );
        }

        for (let code = startCode; code <= endCode; code++) {
          characters.add(String.fromCharCode(code));
        }

        prevChar = null; // Range completed
        continue;
      } else {
        // Leading or trailing '-' inside class, treated as literal '-'
        if (prevChar !== null) {
          characters.add(prevChar);
        }
        prevChar = '-';
        continue;
      }
    }

    // Normal character encountered
    if (prevChar !== null) {
      characters.add(prevChar);
    }
    prevChar = currentChar;
  }

  if (i >= pattern.length) {
    throw new RegexSyntaxError("Unclosed character class '['", startPos);
  }

  // Add any dangling previous character
  if (prevChar !== null) {
    characters.add(prevChar);
  }

  const raw = pattern.slice(startPos, i + 1);
  return {
    token: new Token(TokenType.CHAR_CLASS, new CharacterClass(characters, raw), startPos),
    nextIndex: i + 1, // Advance past ']'
  };
}

/**
 * Tokenizes a supported regular expression into a stream of tokens.
 *
 * @param {string} pattern
 * @returns {Token[]}
 */
export function tokenize(pattern) {
  if (typeof pattern !== 'string') {
    throw new RegexSyntaxError('Regular expression pattern must be a string', 0);
  }

  if (pattern.length === 0) {
    throw new RegexSyntaxError('Empty regular expression', 0);
  }

  const tokens = [];
  let i = 0;

  while (i < pattern.length) {
    const char = pattern[i];

    if (char === '\\') {
      if (i + 1 >= pattern.length) {
        throw new RegexSyntaxError('Dangling backslash at end of expression', i);
      }
      // Escaped character: treat the next character as a literal symbol
      tokens.push(new Token(TokenType.LITERAL, pattern[i + 1], i));
      i += 2;
    } else if (char === '(') {
      tokens.push(new Token(TokenType.LPAREN, '(', i));
      i++;
    } else if (char === ')') {
      tokens.push(new Token(TokenType.RPAREN, ')', i));
      i++;
    } else if (char === '*') {
      tokens.push(new Token(TokenType.STAR, '*', i));
      i++;
    } else if (char === '|') {
      tokens.push(new Token(TokenType.UNION, '|', i));
      i++;
    } else if (char === '[') {
      const { token, nextIndex } = parseCharacterClass(pattern, i);
      tokens.push(token);
      i = nextIndex;
    } else if (char === ']') {
      throw new RegexSyntaxError("Unexpected closing bracket ']'", i);
    } else if (char === '+' || char === '?' || char === '{' || char === '}' || char === '^' || char === '$' || char === '.') {
      let desc = `Unsupported operator '${char}'`;
      if (char === '+' || char === '?') {
        desc = `Unsupported quantifier '${char}'`;
      } else if (char === '{' || char === '}') {
        desc = `Unsupported repetition quantifier '${char}'`;
      } else if (char === '^' || char === '$') {
        desc = `Unsupported anchor '${char}'`;
      } else if (char === '.') {
        desc = `Unsupported wildcard '.'`;
      }
      throw new RegexSyntaxError(
        `${desc}. Supported syntax: literals, concatenation, union '|', Kleene star '*', grouping '()', and character classes '[]'.`,
        i
      );
    } else {
      // Regular literal character
      tokens.push(new Token(TokenType.LITERAL, char, i));
      i++;
    }
  }

  return tokens;
}
