import { createContext, useRef } from "react";

export const EditorPageContext = createContext({});

export const EditorPageProvider = ({ children }) => {

  const editorRef = useRef(null);

  return (
    <EditorPageContext.Provider
      value={{
        editorRef,
      }}
    >
      {children}
    </EditorPageContext.Provider>
  );
};
