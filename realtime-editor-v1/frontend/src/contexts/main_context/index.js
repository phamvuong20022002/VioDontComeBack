import { createContext, useRef, useState} from "react";

export const AppContext = createContext({});

export const AppProvider = ({ children }) => {

  const editorRef = useRef(null);
  const [refreshOutput, setRefreshOutput] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem('U_id') || null);
  const [userName, setUserName] = useState(localStorage.getItem('U_name') || '');


  return (
    <AppContext.Provider
      value={{
        editorRef,
        refreshOutput,
        setRefreshOutput,
        userId,
        setUserId,
        userName,
        setUserName
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
