import { createContext, useState, useRef } from "react";

export const EditorPageContext = createContext({});

export const EditorPageProvider = ({ children }) => {
  const [question, setQuestion] = useState("");
  const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const editorRef = useRef(null);

  return (
    <EditorPageContext.Provider
      value={{
        question,
        setQuestion,
        isChatBoxOpen,
        setIsChatBoxOpen,
        editorRef,
        isFetching,
        setIsFetching
      }}
    >
      {children}
    </EditorPageContext.Provider>
  );
};
