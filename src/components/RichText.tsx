import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface RichTextProps {
  text?: string;
  className?: string;
}

const renderMath = (source: string, displayMode: boolean) => {
  try {
    return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(source, { displayMode, throwOnError: false }) }} />;
  } catch {
    return <span>{source}</span>;
  }
};

const renderInline = (text: string): React.ReactNode[] => {
  const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|\^\^[^^]+\^\^|\^\^[^^]+\^\^)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith('$$') && part.endsWith('$$')) return <React.Fragment key={index}>{renderMath(part.slice(2, -2), true)}</React.Fragment>;
    if (part.startsWith('$') && part.endsWith('$')) return <React.Fragment key={index}>{renderMath(part.slice(1, -1), false)}</React.Fragment>;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith('__') && part.endsWith('__')) return <u key={index}>{part.slice(2, -2)}</u>;
    if (part.startsWith('^^') && part.endsWith('^^')) return <sup key={index}>{part.slice(2, -2)}</sup>;
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

export const RichText: React.FC<RichTextProps> = ({ text = '', className = '' }) => (
  <span className={className}>
    {text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {index > 0 && <br />}
        {renderInline(line)}
      </React.Fragment>
    ))}
  </span>
);
