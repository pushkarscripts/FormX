/**
 * Custom error types for the FormX Automata engine.
 * Includes character position indicators for syntax errors.
 */

export class AutomataError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AutomataError';
  }
}

export class RegexSyntaxError extends AutomataError {
  /**
   * @param {string} message - Descriptive error message
   * @param {number} position - 0-based character index in the input string
   */
  constructor(message, position = -1) {
    const formattedMessage = position >= 0
      ? `${message} at position ${position}`
      : message;
    super(formattedMessage);
    this.name = 'RegexSyntaxError';
    this.position = position;
    this.rawMessage = message;
  }
}
