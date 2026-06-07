import { useEffect } from 'react';

import { CalculatorButton } from './components/CalculatorButton';
import { Display } from './components/Display';
import { HistoryPanel } from './components/HistoryPanel';
import { useCalculator } from './hooks/useCalculator';

function App() {
  const calculator = useCalculator();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;

      if (/^\d$/.test(key)) {
        calculator.inputDigit(key);
        return;
      }

      if (key === '.') {
        calculator.inputDecimal();
        return;
      }

      if (key === '+' || key === '-') {
        calculator.inputOperator(key);
        return;
      }

      if (key === '*' || key.toLowerCase() === 'x') {
        calculator.inputOperator('×');
        return;
      }

      if (key === '/') {
        event.preventDefault();
        calculator.inputOperator('÷');
        return;
      }

      if (key === '%') {
        calculator.inputPercent();
        return;
      }

      if (key === '(' || key === ')') {
        calculator.inputParenthesis(key);
        return;
      }

      if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculator.calculate();
        return;
      }

      if (key === 'Backspace') {
        calculator.backspace();
        return;
      }

      if (key === 'Escape') {
        calculator.clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [calculator]);

  return (
    <main className="app-page text-[#3f474d]">
      <div className="app-frame mx-auto">
        <div className="app-grid">
          <section className="calculator-card soft-panel">
            <header className="calculator-header">
              <div className="min-w-0">
                <h1 className="calculator-title">Neumorphic Calculator</h1>
                <p className="calculator-subtitle">Basic mode</p>
              </div>
              <button
                className="soft-small-button px-4 text-sm font-bold text-[#476f73] lg:hidden"
                onClick={() => calculator.setIsHistoryOpen(true)}
                type="button"
              >
                History
              </button>
            </header>

            <Display
              error={calculator.error}
              expression={calculator.displayExpression}
              preview={calculator.preview}
              result={calculator.result}
            />

            <div className="calculator-keypad">
              <CalculatorButton onClick={calculator.clearAll} tone="control">
                AC
              </CalculatorButton>
              <CalculatorButton onClick={calculator.clearEntry} tone="control">
                C
              </CalculatorButton>
              <CalculatorButton aria-label="Backspace" onClick={calculator.backspace} tone="control">
                ⌫
              </CalculatorButton>
              <CalculatorButton onClick={calculator.toggleSign} tone="operator">
                +/-
              </CalculatorButton>

              <CalculatorButton onClick={() => calculator.inputParenthesis('(')} tone="operator">
                (
              </CalculatorButton>
              <CalculatorButton onClick={() => calculator.inputParenthesis(')')} tone="operator">
                )
              </CalculatorButton>
              <CalculatorButton onClick={calculator.inputPercent} tone="operator">
                %
              </CalculatorButton>
              <CalculatorButton onClick={() => calculator.inputOperator('÷')} tone="operator">
                ÷
              </CalculatorButton>

              {['7', '8', '9'].map((digit) => (
                <CalculatorButton key={digit} onClick={() => calculator.inputDigit(digit)}>
                  {digit}
                </CalculatorButton>
              ))}
              <CalculatorButton onClick={() => calculator.inputOperator('×')} tone="operator">
                ×
              </CalculatorButton>

              {['4', '5', '6'].map((digit) => (
                <CalculatorButton key={digit} onClick={() => calculator.inputDigit(digit)}>
                  {digit}
                </CalculatorButton>
              ))}
              <CalculatorButton onClick={() => calculator.inputOperator('-')} tone="operator">
                -
              </CalculatorButton>

              {['1', '2', '3'].map((digit) => (
                <CalculatorButton key={digit} onClick={() => calculator.inputDigit(digit)}>
                  {digit}
                </CalculatorButton>
              ))}
              <CalculatorButton onClick={() => calculator.inputOperator('+')} tone="operator">
                +
              </CalculatorButton>

              <CalculatorButton onClick={() => calculator.inputDigit('0')}>
                0
              </CalculatorButton>
              <CalculatorButton onClick={calculator.inputDoubleZero}>00</CalculatorButton>
              <CalculatorButton onClick={calculator.inputDecimal}>.</CalculatorButton>
              <CalculatorButton onClick={calculator.calculate} tone="equal">
                =
              </CalculatorButton>
            </div>
          </section>

          <div className="history-column hidden lg:block">
            <HistoryPanel
              history={calculator.history}
              onClearHistory={calculator.clearHistory}
              onUseHistoryItem={calculator.useHistoryItem}
            />
          </div>
        </div>
      </div>

      {calculator.isHistoryOpen ? (
        <div className="fixed inset-0 z-20 bg-[#3f474d]/25 p-4 backdrop-blur-sm lg:hidden">
          <div className="ml-auto flex h-full max-w-sm flex-col gap-3">
            <button
              className="soft-small-button ml-auto px-4 text-sm font-bold text-[#476f73]"
              onClick={() => calculator.setIsHistoryOpen(false)}
              type="button"
            >
              Close
            </button>
            <HistoryPanel
              history={calculator.history}
              onClearHistory={calculator.clearHistory}
              onUseHistoryItem={calculator.useHistoryItem}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default App;
