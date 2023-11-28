//Wijmo


import { React, useEffect, useState, useRef } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import {
  VscVersions,
  VscMultipleWindows,
  VscRefresh,
  VscMove,
  VscDebugRerun ,
} from "react-icons/vsc";

const Output = () => {
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");

  const [previewFrame, setPreviewFrame] = useState("");

  const htmlCodeExample = `
        <h1 id="header"></h1>
        <button onclick="myfunc()"></button>
    `;

    const cssCodeExample = `
        body {
            background-color: white;
        }
    `;

  const jsCodeExample = `
        const message = 'Hello world' // Try edit me

        // Update header text
        document.querySelector('#header').innerHTML = message
        
        function myfunc(){
        console.log(message)
        }
    `;

  // Build the HTML content
  const htmlContent = `
        <html>
            <head>
                <style>${cssCode}</style>
            </head>
            <body>
                ${htmlCode}
                <script>${jsCode}</script>
            </body>
        </html>
    `;


  useEffect(() => {
    setHtmlCode(htmlCodeExample);
    setCssCode(cssCodeExample);
    setJsCode(jsCodeExample);
    setPreviewFrame(htmlContent);

    // const newIframe = document.createElement('iframe');
    // newIframe.src="http://localhost:3000";
    // newIframe.id="console";
    // newIframe.sandbox="allow-scripts";
    // newIframe.srcdoc= previewFrame;

    // document.getElementById('newIframe').appendChild(newIframe);


  }, [previewFrame]);


  return (
    <div className="outputContainer">

      <div className="outputTaskbar">
        <AiOutlineArrowRight className="outputIcon"/>
        
        <span className="outputTitle">Monitor</span>
        
        <div className="rightIcon">
          <VscRefresh className="outputIcon"/>
          <VscVersions className="outputIcon"/>
          <VscMultipleWindows className="outputIcon"/>
        </div>
      </div>

      <div className="outputMonitor" id="newIframe">
        <iframe
            // src="http://localhost:3000"
            allow-same-origin="true"
            id="monitor"
            srcDoc={previewFrame}
            title="output"
            sandbox="allow-scripts"
            width="100%"
            height="100%"
          />
      </div>

      <div className="consoleTaskbar">
        {/* <AiOutlineArrowRight className="outputIcon"/> */}
        
        <span className="consoleTitle">Console</span>
        
        <div className="rightIcon">
          <VscDebugRerun className="outputIcon"/>
        </div>
      </div>
      <div className="consoleContainer" id="consoleContainer">
        BAC
      </div>

    </div>
  );
};

export default Output;
