import { TokenType, Token, tokenize } from './tokenizer.js';
import { RegexSyntaxError } from './errors.js';

// Precedence levels for Shunting-Yard algorithm
const PRECEDENCE = {
  [TokenType.LPAREN]: 0,
  [TokenType.UNION]: 1,
  [TokenType.CONCAT]: 2,
  [TokenType.STAR]: 3,
};

/**
 * Base AST Node class
 */
export class ASTNode {
  constructor(type) {
    this.type = type;
  }
}

export class LiteralNode extends ASTNode {
  constructor(value) {
    super('Literal');
    this.value = value;
  }
}

export class CharClassNode extends ASTNode {
  constructor(charClass) {
    super('CharacterClass');
    this.charClass = charClass;
  }
}

export class ConcatNode extends ASTNode {
  constructor(left, right) {
    super('Concat');
    this.left = left;
    this.right = right;
  }
}

export class UnionNode extends ASTNode {
  constructor(left, right) {
    super('Union');
    this.left = left;
    this.right = right;
  }
}

export class StarNode extends ASTNode {
  constructor(child) {
    super('Star');
    this.child = child;
  }
}

/**
 * Determines whether a token can end an atomic regex operand.
 */
function canEndAtom(token) {
  return (
    token.type === TokenType.LITERAL ||
    token.type === TokenType.CHAR_CLASS ||
    token.type === TokenType.STAR ||
    token.type === TokenType.RPAREN
  );
}

/**
 * Determines whether a token can start an atomic regex operand.
 */
function canStartAtom(token) {
  return (
    token.type === TokenType.LITERAL ||
    token.type === TokenType.CHAR_CLASS ||
    token.type === TokenType.LPAREN
  );
}

/**
 * Validates syntax, parenthesis balancing, and operator placements in token stream.
 *
 * @param {Token[]} tokens
 */
export function validateTokens(tokens) {
  if (!tokens || tokens.length === 0) {
    throw new RegexSyntaxError('Empty regular expression', 0);
  }

  // Check first token
  if (tokens[0].type === TokenType.STAR) {
    throw new RegexSyntaxError("Unexpected quantifier '*' with no preceding expression", tokens[0].position);
  }
  if (tokens[0].type === TokenType.UNION) {
    throw new RegexSyntaxError("Unexpected union '|' with no preceding expression", tokens[0].position);
  }

  // Check last token
  const lastToken = tokens[tokens.length - 1];
  if (lastToken.type === TokenType.UNION) {
    throw new RegexSyntaxError("Trailing union '|' with no following expression", lastToken.position);
  }

  const parenStack = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const nextToken = i + 1 < tokens.length ? tokens[i + 1] : null;

    if (token.type === TokenType.LPAREN) {
      parenStack.push(token);

      if (nextToken) {
        if (nextToken.type === TokenType.RPAREN) {
          throw new RegexSyntaxError("Empty parentheses '()' are not allowed", token.position);
        }
        if (nextToken.type === TokenType.UNION) {
          throw new RegexSyntaxError("Unexpected union '|' after opening parenthesis", nextToken.position);
        }
        if (nextToken.type === TokenType.STAR) {
          throw new RegexSyntaxError("Unexpected quantifier '*' after opening parenthesis", nextToken.position);
        }
      }
    } else if (token.type === TokenType.RPAREN) {
      if (parenStack.length === 0) {
        throw new RegexSyntaxError("Unmatched closing parenthesis ')'", token.position);
      }
      parenStack.pop();
    } else if (token.type === TokenType.UNION) {
      if (nextToken) {
        if (nextToken.type === TokenType.UNION) {
          throw new RegexSyntaxError("Unexpected union '|': empty alternative branch", nextToken.position);
        }
        if (nextToken.type === TokenType.STAR) {
          throw new RegexSyntaxError("Unexpected quantifier '*' immediately after union '|'", nextToken.position);
        }
        if (nextToken.type === TokenType.RPAREN) {
          throw new RegexSyntaxError("Unexpected closing parenthesis ')' after union '|'", nextToken.position);
        }
      }
    } else if (token.type === TokenType.STAR) {
      if (nextToken && nextToken.type === TokenType.STAR) {
        throw new RegexSyntaxError("Multiple consecutive '*' quantifiers are not allowed", nextToken.position);
      }
    }
  }

  if (parenStack.length > 0) {
    const unclosed = parenStack.pop();
    throw new RegexSyntaxError("Unmatched opening parenthesis '('", unclosed.position);
  }
}

/**
 * Inserts explicit concatenation tokens into a valid token stream.
 *
 * @param {Token[]} tokens
 * @returns {Token[]}
 */
export function insertExplicitConcat(tokens) {
  const result = [];

  for (let i = 0; i < tokens.length; i++) {
    result.push(tokens[i]);

    if (i + 1 < tokens.length) {
      const current = tokens[i];
      const next = tokens[i + 1];

      if (canEndAtom(current) && canStartAtom(next)) {
        result.push(new Token(TokenType.CONCAT, '·', next.position));
      }
    }
  }

  return result;
}

/**
 * Converts an infix regular expression or token list to postfix (Reverse Polish) notation
 * using the Shunting-Yard algorithm.
 *
 * Precedence: Parentheses (highest) > Kleene Star > Concatenation > Union (lowest)
 *
 * @param {string|Token[]} input
 * @returns {Token[]}
 */
export function toPostfix(input) {
  const rawTokens = typeof input === 'string' ? tokenize(input) : input;
  validateTokens(rawTokens);

  const tokens = insertExplicitConcat(rawTokens);
  const outputQueue = [];
  const operatorStack = [];

  for (const token of tokens) {
    switch (token.type) {
      case TokenType.LITERAL:
      case TokenType.CHAR_CLASS:
        outputQueue.push(token);
        break;

      case TokenType.STAR:
        // Unary postfix operator: operates immediately on top operand
        outputQueue.push(token);
        break;

      case TokenType.LPAREN:
        operatorStack.push(token);
        break;

      case TokenType.RPAREN: {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== TokenType.LPAREN) {
          outputQueue.push(operatorStack.pop());
        }
        if (operatorStack.length === 0) {
          throw new RegexSyntaxError("Unmatched closing parenthesis ')'", token.position);
        }
        operatorStack.pop(); // Discard LPAREN
        break;
      }

      case TokenType.CONCAT:
      case TokenType.UNION: {
        const currPrec = PRECEDENCE[token.type];
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type === TokenType.LPAREN) {
            break;
          }
          const topPrec = PRECEDENCE[top.type];
          if (topPrec >= currPrec) {
            outputQueue.push(operatorStack.pop());
          } else {
            break;
          }
        }
        operatorStack.push(token);
        break;
      }

      default:
        throw new RegexSyntaxError(`Unknown token type: ${token.type}`, token.position);
    }
  }

  while (operatorStack.length > 0) {
    const op = operatorStack.pop();
    if (op.type === TokenType.LPAREN) {
      throw new RegexSyntaxError("Unmatched opening parenthesis '('", op.position);
    }
    outputQueue.push(op);
  }

  return outputQueue;
}

/**
 * Builds an AST from a postfix token list.
 *
 * @param {Token[]} postfixTokens
 * @returns {ASTNode}
 */
export function buildASTFromPostfix(postfixTokens) {
  const stack = [];

  for (const token of postfixTokens) {
    switch (token.type) {
      case TokenType.LITERAL:
        stack.push(new LiteralNode(token.value));
        break;

      case TokenType.CHAR_CLASS:
        stack.push(new CharClassNode(token.value));
        break;

      case TokenType.STAR: {
        if (stack.length < 1) {
          throw new RegexSyntaxError("Quantifier '*' missing operand", token.position);
        }
        const child = stack.pop();
        stack.push(new StarNode(child));
        break;
      }

      case TokenType.CONCAT: {
        if (stack.length < 2) {
          throw new RegexSyntaxError("Concatenation missing operand", token.position);
        }
        const right = stack.pop();
        const left = stack.pop();
        stack.push(new ConcatNode(left, right));
        break;
      }

      case TokenType.UNION: {
        if (stack.length < 2) {
          throw new RegexSyntaxError("Union '|' missing operand", token.position);
        }
        const right = stack.pop();
        const left = stack.pop();
        stack.push(new UnionNode(left, right));
        break;
      }

      default:
        throw new RegexSyntaxError(`Unexpected token in postfix AST construction: ${token.type}`, token.position);
    }
  }

  if (stack.length !== 1) {
    throw new RegexSyntaxError(`Failed to construct valid AST, remaining stack items: ${stack.length}`);
  }

  return stack[0];
}

/**
 * Parses a regular expression string into an AST with attached postfix tokens.
 *
 * @param {string} pattern
 * @returns {ASTNode}
 */
export function parse(pattern) {
  const postfix = toPostfix(pattern);
  const ast = buildASTFromPostfix(postfix);
  ast.postfix = postfix;
  return ast;
}
