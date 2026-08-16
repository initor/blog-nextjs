interface FormulaProps {
  children: React.ReactNode;
}

interface FormulaLineProps {
  term: string;
  children: React.ReactNode;
}

export function FormulaLine({ term, children }: FormulaLineProps) {
  return (
    <div className="formula-row">
      <dt className="formula-term">{term}</dt>
      <dd className="formula-value">
        <span className="formula-eq" aria-hidden="true">
          =
        </span>
        <span>{children}</span>
      </dd>
    </div>
  );
}

export default function Formula({ children }: FormulaProps) {
  return (
    <div className="formula not-prose">
      <dl className="formula-grid">{children}</dl>
    </div>
  );
}
