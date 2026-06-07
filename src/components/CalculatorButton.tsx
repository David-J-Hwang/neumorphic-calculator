import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonTone = 'number' | 'operator' | 'control' | 'equal';

type CalculatorButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: ButtonTone;
};

const toneClassNames: Record<ButtonTone, string> = {
  number: 'text-[#3f474d]',
  operator: 'text-[#476f73]',
  control: 'text-[#cf6b4c]',
  equal: 'calculator-button-equal'
};

export function CalculatorButton({
  children,
  tone = 'number',
  className = '',
  ...props
}: CalculatorButtonProps) {
  return (
    <button
      className={[
        'calculator-button',
        toneClassNames[tone],
        className
      ].join(' ')}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
