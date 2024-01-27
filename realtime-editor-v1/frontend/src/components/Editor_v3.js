import React, { useEffect, useRef, memo } from 'react';
import * as monaco from 'monaco-editor';
import ACTIONS from '../Actions';

const MonacoEditor = ({ socketRef, roomId, tab, onCodeChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    async function init() {
      if (!editorRef.current) {
        editorRef.current = monaco.editor.create(
          document.getElementById(JSON.stringify(tab.tabID)),
          {
            width: 'auto',
            height: '100%',
            language:
              tab.type === 'javascript' || tab.type === 'babel'
                ? 'javascript'
                : tab.type,
            theme: 'vs-dark',
            value: tab.value,
            automaticLayout: true,
            minimap: {
              enabled: true,
            },
          }
        );

        editorRef.current.onDidChangeModelContent(() => {
          const code = editorRef.current.getValue();
          onCodeChange(tab.tabID + '|' + code);

          if (socketRef.current) {
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
              roomId,
              tabId: tab.tabID,
              code,
            });
          }
        });
      }
    }

    init();
  }, [editorRef, onCodeChange, roomId, socketRef, tab.tabID, tab.type, tab.value]);

  useEffect(() => {
    const handleCodeChange = ({ tabId, code }) => {
      if (code !== null && tab.tabID === tabId) {
        editorRef.current.setValue(code);
      }
    };

    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
      }
    };
  }, [socketRef.current, tab.tabID]);

  return (
    <div className={'Editor ' + JSON.stringify(tab.tabID)}>
      <div id={JSON.stringify(tab.tabID)}></div>
    </div>
  );
};

export default memo(MonacoEditor);
