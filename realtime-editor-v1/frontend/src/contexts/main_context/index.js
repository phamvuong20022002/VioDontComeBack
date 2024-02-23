import { createContext, useRef, useState} from "react";

export const AppContext = createContext({});

export const AppProvider = ({ children }) => {

  const editorRef = useRef(null);
  const [refreshOutput, setRefreshOutput] = useState(false);

  return (
    <AppContext.Provider
      value={{
        editorRef,
        refreshOutput,
        setRefreshOutput
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
