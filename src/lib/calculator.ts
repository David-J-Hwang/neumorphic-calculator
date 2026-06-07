export class CalculatorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CalculatorError';
  }
}

const operatorSymbols = new Set(['+', '-', '×', '÷', '*', '/']);

export function isOperator(value: string) {
  return operatorSymbols.has(value);
}

export function countOpenParentheses(expression: string) {
  let open = 0;

  for (const char of expression) {
    if (char === '(') {
      open += 1;
    }

    if (char === ')') {
      open = Math.max(0, open - 1);
    }
  }

  return open;
}

export function hasDecimalInCurrentNumber(expression: string) {
  const segment = getCurrentNumberSegment(expression);
  return segment.includes('.');
}

export function getCurrentNumberSegment(expression: string) {
  let index = expression.length - 1;

  if (expression[index] === '%') {
    index -= 1;
  }

  let segment = '';

  while (index >= 0 && /[\d.]/.test(expression[index])) {
    segment = expression[index] + segment;
    index -= 1;
  }

  return segment;
}

export function trimTrailingDecimal(expression: string) {
  return expression.endsWith('.') ? expression.slice(0, -1) : expression;
}

export function toggleLastNumberSign(expression: string) {
  if (!expression) {
    return '-';
  }

  if (expression.endsWith(')')) {
    return expression.startsWith('-(') ? expression.slice(2, -1) : `-(${expression})`;
  }

  let end = expression.length;

  if (expression[end - 1] === '%') {
    end -= 1;
  }

  let start = end;

  while (start > 0 && /[\d.]/.test(expression[start - 1])) {
    start -= 1;
  }

  if (start === end) {
    const last = expression.at(-1);
    return !last || isOperator(last) || last === '(' ? `${expression}-` : expression;
  }

  const signIndex = start - 1;
  const hasUnaryMinus =
    expression[signIndex] === '-' &&
    (signIndex === 0 || isOperator(expression[signIndex - 1]) || expression[signIndex - 1] === '(');

  if (hasUnaryMinus) {
    return `${expression.slice(0, signIndex)}${expression.slice(start)}`;
  }

  return `${expression.slice(0, start)}-${expression.slice(start)}`;
}

export function clearCurrentEntry(expression: string) {
  if (!expression) {
    return '';
  }

  let end = expression.length;

  if (expression[end - 1] === '%') {
    end -= 1;
  }

  let start = end;

  while (start > 0 && /[\d.]/.test(expression[start - 1])) {
    start -= 1;
  }

  if (start !== end) {
    const signIndex = start - 1;
    const hasUnaryMinus =
      expression[signIndex] === '-' &&
      (signIndex === 0 || isOperator(expression[signIndex - 1]) || expression[signIndex - 1] === '(');
    return expression.slice(0, hasUnaryMinus ? signIndex : start);
  }

  return expression.slice(0, -1);
}

export function evaluateExpression(expression: string) {
  const parser = new Parser(expression);
  const value = parser.parse();

  if (!Number.isFinite(value)) {
    throw new CalculatorError('계산할 수 없는 결과입니다.');
  }

  return normalizeResult(value);
}

export function formatNumber(value: number) {
  if (!Number.isFinite(value)) {
    return 'Error';
  }

  const normalized = normalizeResult(value);
  const rounded = Number(normalized.toPrecision(12));

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 10
  }).format(Object.is(rounded, -0) ? 0 : rounded);
}

export function formatExpression(expression: string) {
  return expression || '0';
}

function normalizeResult(value: number) {
  const rounded = Number(value.toPrecision(12));
  return Object.is(rounded, -0) ? 0 : rounded;
}

class Parser {
  private readonly source: string;
  private index = 0;

  constructor(expression: string) {
    this.source = expression.replaceAll('×', '*').replaceAll('÷', '/').replaceAll(',', '').replaceAll(' ', '');
  }

  parse(): number {
    if (!this.source) {
      throw new CalculatorError('수식을 입력해주세요.');
    }

    const value = this.parseExpression();
    this.skipSpaces();

    if (!this.isAtEnd()) {
      throw new CalculatorError('잘못된 수식입니다.');
    }

    return value;
  }

  private parseExpression(): number {
    let left: number = this.parseTerm();

    while (this.match('+') || this.match('-')) {
      const operator = this.previous();
      const right = this.parseTerm(left);
      left = operator === '+' ? left + right : left - right;
    }

    return left;
  }

  private parseTerm(additivePercentBase?: number): number {
    let left: number = this.parseFactor(additivePercentBase);

    while (this.match('*') || this.match('/')) {
      const operator = this.previous();
      const right = this.parseFactor();

      if (operator === '/' && Math.abs(right) < Number.EPSILON) {
        throw new CalculatorError('0으로 나눌 수 없습니다.');
      }

      left = operator === '*' ? left * right : left / right;
    }

    return left;
  }

  private parseFactor(percentBase?: number): number {
    let sign = 1;

    while (this.match('+') || this.match('-')) {
      sign *= this.previous() === '-' ? -1 : 1;
    }

    let value: number = sign * this.parsePrimary();

    while (this.match('%')) {
      value = percentBase === undefined ? value / 100 : (percentBase * value) / 100;
      percentBase = undefined;
    }

    return value;
  }

  private parsePrimary(): number {
    this.skipSpaces();

    if (this.match('(')) {
      const value: number = this.parseExpression();

      if (!this.match(')')) {
        throw new CalculatorError('괄호가 닫히지 않았습니다.');
      }

      return value;
    }

    return this.parseNumber();
  }

  private parseNumber(): number {
    const start = this.index;
    let hasDigit = false;
    let hasDecimal = false;

    while (!this.isAtEnd()) {
      const char = this.peek();

      if (/\d/.test(char)) {
        hasDigit = true;
        this.index += 1;
        continue;
      }

      if (char === '.') {
        if (hasDecimal) {
          throw new CalculatorError('소수점이 중복되었습니다.');
        }

        hasDecimal = true;
        this.index += 1;
        continue;
      }

      break;
    }

    if (!hasDigit) {
      throw new CalculatorError('숫자를 확인해주세요.');
    }

    return Number(this.source.slice(start, this.index));
  }

  private match(char: string): boolean {
    this.skipSpaces();

    if (this.peek() !== char) {
      return false;
    }

    this.index += 1;
    return true;
  }

  private previous(): string {
    return this.source[this.index - 1];
  }

  private peek(): string {
    return this.source[this.index] ?? '';
  }

  private skipSpaces(): void {
    while (this.source[this.index] === ' ') {
      this.index += 1;
    }
  }

  private isAtEnd(): boolean {
    return this.index >= this.source.length;
  }
}
