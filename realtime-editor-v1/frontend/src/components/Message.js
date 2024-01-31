import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import { prism as style } from "react-syntax-highlighter/dist/esm/styles/prism";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import React, { useEffect, useState } from "react";
import { BsClipboard2Fill, BsCheckCircleFill } from "react-icons/bs";
import "../Message.css";

export default function Message({ content }) {
  const [isCopy, setIsCopy] = useState(false);

  const handleCopyButtonClick = (code) => {
    navigator.clipboard.writeText(code);
    setIsCopy(true);
    setTimeout(() => {
      setIsCopy(false);
    }, 3000);
  };

  return (
    <div>
      <ReactMarkdown
        components={{
          code: ({ inline, children, language }) => {
            language = "javascript";
            const code = String(children);
            return inline ? (
              <pre style={{ display: "inline" }}>{code}</pre>
            ) : (
              <div>
                <div className="blockCode-taskbar">
                  <p>Example Code</p>
                  <div className="copy-button">
                    {isCopy ? (
                      <button>
                        <BsCheckCircleFill />
                        Copied!
                      </button>
                    ) : (
                      <button
                        title="Copy code to clipboard!"
                        onClick={() => handleCopyButtonClick(code)}
                      >
                        <BsClipboard2Fill id="clipboard-icon" />
                        Copy Code
                      </button>
                    )}
                  </div>
                </div>
   
                <SyntaxHighlighter
                  showLineNumbers={true}
                  style={atomOneDark}
                  // customStyle={{
                      //   borderRadius: "5px",
                      //   border: "1px solid lightgray",
                      //   backgroundColor: "#f4f7f6",
                      // }}
                      useInlineStyles={true}
                      language={language}
                >
                  {code.replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
