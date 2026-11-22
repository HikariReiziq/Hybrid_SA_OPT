import katex from 'katex';
import { useMemo } from 'react';

interface TexProps {
  math: string;
  block?: boolean;
  className?: string;
}

export function Tex({ math, block = false, className = '' }: TexProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        strict: 'ignore',
      });
    } catch {
      return null;
    }
  }, [math, block]);

  if (!html) {
    return <code className={`font-mono-tabular ${className}`}>{math}</code>;
  }

  return block ? (
    <div
      className={`overflow-x-auto py-1 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
