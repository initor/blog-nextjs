interface CalloutProps {
  children: React.ReactNode;
}

export default function Callout({ children }: CalloutProps) {
  return (
    <aside className="callout not-prose">
      <div className="callout-pipe" />
      <p className="callout-text">{children}</p>
    </aside>
  );
}
