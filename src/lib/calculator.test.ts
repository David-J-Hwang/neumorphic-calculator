import { CalculatorError, evaluateExpression, formatNumber } from './calculator';

describe('calculator engine', () => {
  it('evaluates arithmetic with operator precedence', () => {
    expect(evaluateExpression('2+3×4')).toBe(14);
  });

  it('evaluates parentheses before multiplication', () => {
    expect(evaluateExpression('(2+3)×4')).toBe(20);
  });

  it('handles decimal arithmetic with readable rounding', () => {
    expect(evaluateExpression('0.1+0.2')).toBe(0.3);
  });

  it('handles calculator-style percent after addition', () => {
    expect(evaluateExpression('50+10%')).toBe(55);
  });

  it('handles percent in multiplication as a fraction', () => {
    expect(evaluateExpression('200×10%')).toBe(20);
  });

  it('formats long result values', () => {
    expect(formatNumber(1234567.89123)).toBe('1,234,567.89123');
  });

  it('rejects division by zero', () => {
    expect(() => evaluateExpression('8÷0')).toThrow(CalculatorError);
  });
});
