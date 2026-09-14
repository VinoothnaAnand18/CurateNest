import React from 'react';

const inline = (text) => {
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="rounded bg-slate-950/15 px-1.5 py-0.5 font-mono text-[0.9em]">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

// A deliberately small, safe Markdown renderer for model output. React escapes
// all text nodes, while this preserves the headings, lists and emphasis users need.
const MarkdownContent = ({ content, className = '' }) => {
  const lines = String(content || '').replace(/\r/g, '').split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) code.push(lines[index++]);
      if (index < lines.length) index += 1;
      blocks.push(<pre key={blocks.length} className="overflow-x-auto rounded-lg bg-slate-950/20 p-3 text-xs"><code>{code.join('\n')}</code></pre>);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Tag = `h${heading[1].length}`;
      const sizes = ['text-base', 'text-sm', 'text-sm'];
      blocks.push(<Tag key={blocks.length} className={`${sizes[heading[1].length - 1]} font-bold leading-snug`}>{inline(heading[2])}</Tag>);
      index += 1;
      continue;
    }

    const listMatch = line.match(/^[-*+]\s+(.+)$/);
    const orderedMatch = line.match(/^\d+[.)]\s+(.+)$/);
    if (listMatch || orderedMatch) {
      const ordered = Boolean(orderedMatch);
      const items = [];
      while (index < lines.length) {
        const match = ordered ? lines[index].match(/^\d+[.)]\s+(.+)$/) : lines[index].match(/^[-*+]\s+(.+)$/);
        if (!match) break;
        items.push(<li key={items.length}>{inline(match[1])}</li>);
        index += 1;
      }
      const List = ordered ? 'ol' : 'ul';
      blocks.push(<List key={blocks.length} className={`${ordered ? 'list-decimal' : 'list-disc'} space-y-1 pl-5`}>{items}</List>);
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(#{1,3}\s+|[-*+]\s+|\d+[.)]\s+|```)/.test(lines[index])) {
      paragraph.push(lines[index++]);
    }
    blocks.push(<p key={blocks.length}>{inline(paragraph.join(' '))}</p>);
  }

  return <div className={`space-y-3 ${className}`}>{blocks}</div>;
};

export default MarkdownContent;
