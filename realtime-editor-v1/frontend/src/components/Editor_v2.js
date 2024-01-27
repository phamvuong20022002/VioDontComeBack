import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import ACTIONS from "../Actions";

const MonacoEditor = ({ socketRef, roomId, tab, onCodeChange, themeData}) => {
  const editorRef = useRef(null);
  const localChangeRef = useRef(false);

  const handleEditorChange = (value, event) => {
    if (!localChangeRef.current) {
      onCodeChange(tab.tabID + "|" + value);
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        tabId: tab.tabID,
        code: value,
        origin: "local", // Add an origin property to the payload
      });
    }
  };

  const handleSocketCodeChange = ({ tabId, code, origin }) => {
    if (code && tab.tabID === tabId) {
      localChangeRef.current = true;
      editorRef.current?.setValue(code);
      localChangeRef.current = false;
    }
  };

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, handleSocketCodeChange);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.CODE_CHANGE, handleSocketCodeChange);
      }
    };
  });



  return (
    <Editor
      width="auto"
      height="100%"
      language={
        tab.type === "javascript" || tab.type === "babel"
          ? "javascript"
          : tab.type
      }
      // theme="vs-dark" // Change theme as needed
      theme={themeData}
      value={tab.value}
      options={{
        automaticLayout: true,
        minimap: {
          enabled: true,
        },
      }}
      onChange={handleEditorChange}
      onMount={(editor, monaco) => {
        // You can access the Monaco Editor instance here if needed
        editorRef.current = editor;
      }}
    />
  );
};

export default MonacoEditor;
