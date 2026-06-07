type DisplayProps = {
  expression: string;
  result: string;
  preview: string;
  error: string;
};

export function Display({ expression, result, preview, error }: DisplayProps) {
  const hasResult = Boolean(result);
  const primaryText = error || (hasResult ? result : expression);
  const secondaryText = hasResult ? expression : preview ? `= ${preview}` : '\u00a0';
  const primaryFontSize = error ? '1.35rem' : getFittingFontSize(primaryText, 3.25, 0.72, 27);
  const secondaryFontSize = getFittingFontSize(secondaryText.trim(), 0.9, 0.66, 12);

  return (
    <section aria-label="Calculator display" className="calculator-display soft-inset">
      <div
        className="calculator-display-line min-h-6 font-semibold text-[#8a969d]"
        style={{ fontSize: secondaryFontSize }}
      >
        {secondaryText}
      </div>
      <div
        className={[
          'calculator-display-line font-semibold leading-none tracking-normal',
          error ? 'text-[#cf6b4c]' : 'text-[#3f474d]'
        ].join(' ')}
        style={{ fontSize: primaryFontSize }}
      >
        {primaryText}
      </div>
    </section>
  );
}

function getFittingFontSize(text: string, maxRem: number, minRem: number, scale: number) {
  const length = Math.max(text.length, 1);
  const size = Math.min(maxRem, Math.max(minRem, scale / length));
  return `${size.toFixed(2)}rem`;
}
