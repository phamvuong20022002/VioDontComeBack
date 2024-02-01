import { createContext,useState } from "react";

export const EditorPageContext = createContext({})

export const EditorPageProvider = ({children}) => {

    const [question, setQuestion] = useState('');
    const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);

    return <EditorPageContext.Provider value={{question, setQuestion, isChatBoxOpen, setIsChatBoxOpen}}>
        {children}
    </EditorPageContext.Provider>
}