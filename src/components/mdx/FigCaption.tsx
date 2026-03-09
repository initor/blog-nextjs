interface FigCaptionProps {
  children: React.ReactNode;
}

export default function FigCaption({ children }: FigCaptionProps) {
  return (
    <figcaption className="fig-caption">
      {children}
    </figcaption>
  );
}
