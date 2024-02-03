import ACTIONS from "../Actions";
import { CodeTypes } from "../assets/code_types/code.types";

import { scriptConsoleTemplate, scriptDisableConsoleTemplate } from "../assets/variables_template";
// Pre-ActionsCode have 'REQUEST or RECIEVE' pass parameters with 'data' from an array obj [{},{}...]
// Get code from server
export const getCodeWithSocket = (socket, dataEmit) => {
    return new Promise((resolve, reject) => {
        // Request code from server
        socket.emit(ACTIONS.REQUEST_CODE, dataEmit);
  
        // Listen for the code from the server
        socket.on(ACTIONS.RECEIVE_CODE, ({ data }) => {
            // Resolve the Promise with the received code
            resolve(data);
        });
    });
}

// Generate Code
export const generateCode = (data, disableConsole = true, addScriptConsole = true) =>{
    // response is data array obj [{},{}...]
    // 1.Get code from server using getCodeWithSocket function
    // 2.Merge them with code template
    let cssValue ='';
    let htmlValue ='';
    let jsValue ='';
    data.forEach((tab) =>{
        if(tab === null){
          return;
        }
        else if(tab.type === CodeTypes.CSS){
          let tabStyle = `<style>${tab.value}</style>`;
          cssValue += tabStyle;
        }
        else if(tab.type === CodeTypes.HTML){
          htmlValue += tab.value;
        }
        else{
          jsValue += `<script type="text/${tab.type}">${tab.value}</script>\n`;
        }
    })
    // Merge code with codeTemplate
    let htmlContent = `
          <html>
              <head>
                  ${cssValue}
              </head>
              <body>
                  ${disableConsole ? scriptDisableConsoleTemplate : ''}
                  ${addScriptConsole? scriptConsoleTemplate: ''}
                  ${htmlValue}
              </body>
              ${jsValue}
          </html>
        `;
    return htmlContent;
}