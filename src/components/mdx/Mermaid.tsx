'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidProps {
  chart: string;
}

// Helper to read CSS variable value
function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current) return;

      try {
        const mermaid = (await import('mermaid')).default;

        // Read Catppuccin Frappé colors from CSS variables
        const themeVariables = {
          primaryColor: getCSSVar('--mermaid-node-bg'),
          primaryTextColor: getCSSVar('--mermaid-primary-text'),
          primaryBorderColor: getCSSVar('--mermaid-node-border'),
          secondaryColor: getCSSVar('--mermaid-secondary'),
          secondaryTextColor: getCSSVar('--mermaid-secondary-text'),
          secondaryBorderColor: getCSSVar('--mermaid-node-border'),
          tertiaryColor: getCSSVar('--mermaid-tertiary'),
          tertiaryTextColor: getCSSVar('--mermaid-primary-text'),
          tertiaryBorderColor: getCSSVar('--mermaid-node-border'),
          lineColor: getCSSVar('--mermaid-line'),
          textColor: getCSSVar('--mermaid-primary-text'),
          mainBkg: getCSSVar('--mermaid-node-bg'),
          background: getCSSVar('--mermaid-bg'),
          nodeBorder: getCSSVar('--mermaid-node-border'),
          clusterBkg: getCSSVar('--mermaid-node-bg'),
          clusterBorder: getCSSVar('--mermaid-node-border'),
          titleColor: getCSSVar('--mermaid-primary-text'),
          edgeLabelBackground: getCSSVar('--mermaid-bg'),
          // Sequence diagram specific
          actorBkg: getCSSVar('--mermaid-actor-bg'),
          actorBorder: getCSSVar('--mermaid-actor-border'),
          actorTextColor: getCSSVar('--mermaid-primary-text'),
          actorLineColor: getCSSVar('--mermaid-line'),
          signalColor: getCSSVar('--mermaid-line'),
          signalTextColor: getCSSVar('--mermaid-primary-text'),
          labelBoxBkgColor: getCSSVar('--mermaid-node-bg'),
          labelBoxBorderColor: getCSSVar('--mermaid-node-border'),
          labelTextColor: getCSSVar('--mermaid-primary-text'),
          loopTextColor: getCSSVar('--mermaid-primary-text'),
          noteBkgColor: getCSSVar('--mermaid-note-bg'),
          noteBorderColor: getCSSVar('--mermaid-note-border'),
          noteTextColor: getCSSVar('--mermaid-primary-text'),
          activationBkgColor: getCSSVar('--mermaid-primary'),
          activationBorderColor: getCSSVar('--mermaid-node-border'),
          sequenceNumberColor: getCSSVar('--mermaid-bg'),
        };

        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables,
          securityLevel: 'loose',
          fontFamily: 'inherit',
        });

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Failed to render diagram');
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 my-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-diagram my-6 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
