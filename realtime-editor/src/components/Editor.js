import React, { useEffect, useRef, useState} from 'react';

import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/css/css';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/css-hint'
import 'codemirror/addon/hint/javascript-hint'
import 'codemirror/addon/hint/anyword-hint'
import ACTIONS from '../Actions';

const Editor = ({socketRef, roomId, tab, onCodeChange}) => {

    const editorRef = useRef(null);
    useEffect(() =>{
        function isCreated(){
            const containerCodeMirror = document.getElementsByClassName('Editor ' + JSON.stringify(tab.tabID))[0];
            const codemirror = containerCodeMirror.getElementsByClassName("CodeMirror").length;
            return Boolean(codemirror);
        };

        async function init(){
            if(!isCreated()){
                editorRef.current = Codemirror.fromTextArea(
                    document.getElementById(JSON.stringify(tab.tabID)),
                    {
                        mode: tab.type,
                        theme: 'dracula',
                        autoCloseTags: true,
                        autoCloseBrackets: true,
                        lineNumbers: true,
                        extraKeys:{'Tab':'autocomplete'},
                        goLineDownDown: true,
                        autocorrect: true,
                    }
                );
                
                editorRef.current.on('change', (instance, changes) => {
                    const {origin} = changes;
                    const code = instance.getValue();
                    onCodeChange(tab.tabID + '|' + code);
                    if(origin !== 'setValue'){
                        socketRef.current.emit(ACTIONS.CODE_CHANGE,{
                            roomId,
                            tabId: tab.tabID,
                            code,
                        })
                    }
                });

            }
            else{
                return;
            };
        };
        init();
    },[])

    useEffect(() => {
        if(socketRef.current){
            socketRef.current.on(ACTIONS.CODE_CHANGE,({tabId, code}) => {
                if(code !== null && tab.tabID === tabId){
                    editorRef.current.setValue(code);
                }
            })
        }

        return () =>{
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        }
    },[socketRef.current])

  return (
    <div className={'Editor ' + JSON.stringify(tab.tabID)}>
        <textarea id={JSON.stringify(tab.tabID)} ></textarea>
    </div>
  )
}

export default Editor