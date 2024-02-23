import CodeBlock from '../components/CodeBlock';
import {Highlight} from '../components/HightLight';

const BACKTICKS_REGEX = /`{3}/;
const SINGLE_BACKTICKS_REGEX = /`(?!`+)/;
const LANGUAGE_IN_CODE_BLOCK_REGEX = /^\w+(?=\n)/;

const createCodeBlock = (block, language = '') => <CodeBlock code={block} language={language} />;
const createHighlightBlock = (text) => <Highlight>{text}</Highlight>;

const addHighlighting = (textBlocks) => {
  return textBlocks.flatMap((part) => {
    if (typeof part !== 'string') return part;

    const formattedParts = part.split(SINGLE_BACKTICKS_REGEX).map((subPart, index) => {
      return index % 2 === 0 ? subPart : createHighlightBlock(subPart);
    });

    return formattedParts;
  });
};

const addCodeBlocks = (text) => {
  const blocks = text.split(BACKTICKS_REGEX);

  return blocks.map((part, index) => {
    if (index % 2 === 1) {
      const language = part.match(LANGUAGE_IN_CODE_BLOCK_REGEX)?.[0];
      if (language) {
        const partWithoutLanguage = part.replace(language, '');
        return createCodeBlock(partWithoutLanguage, language);
      }
    }

    return part;
  });
};

export const getFormattedText = (text) => {
  let formattedText = addCodeBlocks(text);

  if (SINGLE_BACKTICKS_REGEX.test(text)) {
    formattedText = addHighlighting(formattedText);
  }

  return formattedText;
};
