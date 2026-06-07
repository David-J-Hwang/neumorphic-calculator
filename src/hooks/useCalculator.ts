import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  clearCurrentEntry,
  countOpenParentheses,
  evaluateExpression,
  formatExpression,
  formatNumber,
  hasDecimalInCurrentNumber,
  isOperator,
  toggleLastNumberSign,
  trimTrailingDecimal
} from '../lib/calculator';

export type HistoryItem = {
  id: string;
  expression: string;
  result: string;
  createdAt: string;
};

const HISTORY_STORAGE_KEY = 'neumorphic-calculator-history';
const MAX_HISTORY_ITEMS = 20;

export function useCalculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as HistoryItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const preview = useMemo(() => {
    if (!expression || error || justEvaluated) {
      return '';
    }

    try {
      return formatNumber(evaluateExpression(expression));
    } catch {
      return '';
    }
  }, [error, expression, justEvaluated]);

  const resetTransientState = useCallback(() => {
    setError('');
    setResult('');
  }, []);

  const setNewExpression = useCallback(
    (next: string) => {
      resetTransientState();
      setJustEvaluated(false);
      setExpression(next);
    },
    [resetTransientState]
  );

  const inputDigit = useCallback(
    (digit: string) => {
      if (justEvaluated || error) {
        setNewExpression(digit);
        return;
      }

      setExpression((current) => {
        const last = current.at(-1);

        if (last === ')') {
          return `${current}×${digit}`;
        }

        if (last === '%' || last === ')') {
          return `${current}×${digit}`;
        }

        const segment = current.match(/(?:^|[+\-×÷(])(-?\d+\.?\d*)$/)?.[1];

        if (segment === '0' && digit !== '0') {
          return `${current.slice(0, -1)}${digit}`;
        }

        if (segment === '0' && digit === '0') {
          return current;
        }

        return `${current}${digit}`;
      });
    },
    [error, justEvaluated, setNewExpression]
  );

  const inputDoubleZero = useCallback(() => {
    if (justEvaluated || error) {
      setNewExpression('0');
      return;
    }

    setExpression((current) => {
      const last = current.at(-1);

      if (!last || isOperator(last) || last === '(') {
        return `${current}0`;
      }

      if (last === ')' || last === '%') {
        return `${current}×0`;
      }

      const segment = current.match(/(?:^|[+\-×÷(])(-?\d+\.?\d*)$/)?.[1];

      if (segment === '0' || segment === '-0') {
        return current;
      }

      return `${current}00`;
    });
  }, [error, justEvaluated, setNewExpression]);

  const inputDecimal = useCallback(() => {
    if (justEvaluated || error) {
      setNewExpression('0.');
      return;
    }

    setExpression((current) => {
      if (hasDecimalInCurrentNumber(current)) {
        return current;
      }

      const last = current.at(-1);

      if (!last || isOperator(last) || last === '(') {
        return `${current}0.`;
      }

      if (last === ')' || last === '%') {
        return `${current}×0.`;
      }

      return `${current}.`;
    });
  }, [error, justEvaluated, setNewExpression]);

  const inputOperator = useCallback(
    (operator: string) => {
      setError('');

      if (justEvaluated && result) {
        setExpression(`${result}${operator}`);
        setResult('');
        setJustEvaluated(false);
        return;
      }

      setExpression((current) => {
        if (!current) {
          return operator === '-' ? '-' : current;
        }

        const trimmed = trimTrailingDecimal(current);
        const last = trimmed.at(-1);

        if (!last) {
          return operator === '-' ? '-' : '';
        }

        if (last === '(') {
          return operator === '-' ? `${trimmed}-` : trimmed;
        }

        if (isOperator(last)) {
          return `${trimmed.slice(0, -1)}${operator}`;
        }

        return `${trimmed}${operator}`;
      });
    },
    [justEvaluated, result]
  );

  const inputPercent = useCallback(() => {
    if (error || justEvaluated) {
      return;
    }

    setExpression((current) => {
      const last = current.at(-1);
      return last && (/[\d)]/.test(last) || last === '%') && last !== '%' ? `${current}%` : current;
    });
  }, [error, justEvaluated]);

  const inputParenthesis = useCallback(
    (value: '(' | ')') => {
      if (value === '(') {
        if (justEvaluated || error) {
          setNewExpression('(');
          return;
        }

        setExpression((current) => {
          const last = current.at(-1);

          if (!last || isOperator(last) || last === '(') {
            return `${current}(`;
          }

          return `${current}×(`;
        });
        return;
      }

      if (error || justEvaluated) {
        return;
      }

      setExpression((current) => {
        const last = current.at(-1);
        const canClose = countOpenParentheses(current) > 0 && last && (/[\d%)]/.test(last));
        return canClose ? `${current})` : current;
      });
    },
    [error, justEvaluated, setNewExpression]
  );

  const toggleSign = useCallback(() => {
    if (justEvaluated && result) {
      setExpression(toggleLastNumberSign(result));
      setResult('');
      setJustEvaluated(false);
      setError('');
      return;
    }

    setNewExpression(toggleLastNumberSign(expression));
  }, [expression, justEvaluated, result, setNewExpression]);

  const clearAll = useCallback(() => {
    setExpression('');
    setResult('');
    setError('');
    setJustEvaluated(false);
  }, []);

  const clearEntry = useCallback(() => {
    if (error || justEvaluated) {
      clearAll();
      return;
    }

    setNewExpression(clearCurrentEntry(expression));
  }, [clearAll, error, expression, justEvaluated, setNewExpression]);

  const backspace = useCallback(() => {
    if (error || justEvaluated) {
      clearAll();
      return;
    }

    setNewExpression(expression.slice(0, -1));
  }, [clearAll, error, expression, justEvaluated, setNewExpression]);

  const calculate = useCallback(() => {
    if (!expression) {
      return;
    }

    try {
      const calculated = evaluateExpression(trimTrailingDecimal(expression));
      const formatted = formatNumber(calculated);
      const savedExpression = formatExpression(trimTrailingDecimal(expression));

      setResult(formatted);
      setError('');
      setJustEvaluated(true);
      setHistory((items) => [
        {
          id: `${Date.now()}-${savedExpression}`,
          expression: savedExpression,
          result: formatted,
          createdAt: new Date().toISOString()
        },
        ...items
      ].slice(0, MAX_HISTORY_ITEMS));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '잘못된 수식입니다.');
      setResult('');
      setJustEvaluated(false);
    }
  }, [expression]);

  const useHistoryItem = useCallback((item: HistoryItem) => {
    setExpression(item.result.replaceAll(',', ''));
    setResult('');
    setError('');
    setJustEvaluated(false);
    setIsHistoryOpen(false);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    expression,
    displayExpression: formatExpression(expression),
    result,
    preview,
    error,
    history,
    isHistoryOpen,
    setIsHistoryOpen,
    inputDigit,
    inputDoubleZero,
    inputDecimal,
    inputOperator,
    inputPercent,
    inputParenthesis,
    toggleSign,
    clearAll,
    clearEntry,
    backspace,
    calculate,
    useHistoryItem,
    clearHistory
  };
}
