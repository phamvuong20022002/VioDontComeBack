import React, { useEffect } from 'react';
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
import 'codemirror/addon/hint/html-hint'

const Editor = ({tab}) => {
    useEffect(() =>{
        function isCreated(){
            const containerCodeMiror = document.getElementsByClassName('Editor ' + JSON.stringify(tab.tabID))[0];
            const codemirror = containerCodeMiror.getElementsByClassName("CodeMirror").length;
            return Boolean(codemirror);
        };

        async function init(){
            if(!isCreated()){
                console.log(tab.value);
                Codemirror.fromTextArea(document.getElementById(JSON.stringify(tab.tabID)),{
                    mode: tab.type,
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                    extraKeys:{'Tab':'autocomplete'}
                }).setValue(tab.value);
            }
            else{
                return;
            };
        };
        init();
    },[])
  return (
    // classname/id = <Editor &quot;10&quot;> => 'Editor' + '&quot;' + tadID + '&quot;'
    <div className={'Editor ' + JSON.stringify(tab.tabID)}>
        <textarea id={JSON.stringify(tab.tabID)} ></textarea>
    </div>
  )
}

export default Editor