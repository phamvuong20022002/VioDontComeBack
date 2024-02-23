import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Clipboard } from './Clipboard';

const processCode = (code = '') => {
  let skippedLeadingEmptyLines = false;
  let lastNonEmptyLineIndex = 0;
  let minRawStringIndentation = Number.MAX_SAFE_INTEGER;
  let numberOfRemovedLines = 0;

  const processNonEmptyLine = (line, index) => {
    lastNonEmptyLineIndex = index - numberOfRemovedLines;
    minRawStringIndentation = Math.min(minRawStringIndentation, Math.max(0, line.search(/\S/)));
    return [line.trimEnd()];
  };

  const codeLines = code.split('\n');

  const nonEmptyLinesAtStart = codeLines.flatMap((line, index) => {
    if (!skippedLeadingEmptyLines) {
      if (line.match(/^\s*$/)) {
        numberOfRemovedLines += 1;
        return [];
      }

      skippedLeadingEmptyLines = true;
      return processNonEmptyLine(line, index);
    }

    if (line.match(/^\s*$/)) return [''];

    return processNonEmptyLine(line, index);
  });

  const nonEmptyLinesStartAndEnd = nonEmptyLinesAtStart.slice(0, lastNonEmptyLineIndex + 1);

  if (nonEmptyLinesStartAndEnd.length === 0) return '';

  const nonRawStringIndentationLines =
    minRawStringIndentation !== 0
      ? nonEmptyLinesStartAndEnd.map((line) => line.substring(minRawStringIndentation))
      : nonEmptyLinesStartAndEnd;

  return nonRawStringIndentationLines.join('\n');
};

const CodeBlock = ({ code, language }) => {
  const [isReloaded, setIsReloaded] = useState(false);

  const processedCode = processCode(code);

  useEffect(() => {
    const timerId = setTimeout(() => setIsReloaded(true), 0);

    return () => clearTimeout(timerId);
  }, []);

  return isReloaded ? (
    <pre className="code-pre">
      <Clipboard language={language} text={processedCode} />
      <SyntaxHighlighter language={language} style={vscDarkPlus}>
        {processedCode}
      </SyntaxHighlighter>
    </pre>
  ) : null;
};

export default CodeBlock;
