//Wijmo


import { React, useEffect, useState, useRef } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import {
  VscVersions,
  VscMultipleWindows,
  VscRefresh,
  VscMove,
  VscDebugRerun ,
  VscVmRunning,
  VscDebugStart 
} from "react-icons/vsc";
import { TfiReload } from "react-icons/tfi";
import SelectInput from "../assets/select_input/SelectInput";
import ACTIONS from "../Actions";
import Split from 'react-split'
import {
  scriptConsoleTemplate,
  scriptDisableConsoleTemplate,
  initTabIDsTemplate,
} from "../assets/variables_template/index.js"

const initHTMLContent = "<html><head></head><body>Hello, iframe content!</body></html>";


const Output = ({socketRef, roomId}) => {
  const [displaySelect, setDisplaySelect] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [selectedTabs, setSelectedTabs] = useState(initTabIDsTemplate);
  const [previewFrame, setPreviewFrame] = useState(initHTMLContent);
  const [consoleValues, setConsoleValues] = useState([]);

  // Redefine console for showing in console window
  useEffect(() => {
    // Event listener to receive console logs from the iframe
    const receiveLogs = (event) => {

      if (event.data && event.data.type === 'error') {
        // Handle or log the SyntaxError as needed
        setConsoleValues((prevLogs) => [...prevLogs, {type:'error', message:event.data.message, filename: event.data.filename, lineno: event.data.lineno}]);
      }

      if (event.data && event.data.type === 'log') {
        // Do whatever you want with the logs received from the iframe
        setConsoleValues((prevLogs) => [...prevLogs, {type:'log', message:event.data.message, filename: event.data.filename, lineno: event.data.lineno}]);
      }

      if (event.data && event.data.type === 'warn') {
        // Do whatever you want with the logs received from the iframe
        setConsoleValues((prevLogs) => [...prevLogs, {type:'warn', message:event.data.message, filename: event.data.filename, lineno: event.data.lineno}]);
      }
    };

    window.addEventListener('message', receiveLogs);

    return () => {
      window.removeEventListener('message', receiveLogs);
    };
  }, []);
  // Rerender when selectedTabs array change
  useEffect(() => {
    //add listening for Output button
    handleOutputBtn();
    //generate code for previewFrame
    generateCode();
  }, [selectedTabs, socketRef]);

  /*----FUNCTION AREA----*/
  // toggle select from check boxs
  const toggleSelect = () => {
    setDisplaySelect(!displaySelect);
  };
  // handle Click Output button 
  function handleOutputBtn(){
      let btn = document.getElementById('outputBtn')
      btn.addEventListener('click', () => {
        // rotateIcon(btn);
        addTabsToForm();
      })
  }
  // rotate 90 output Button
  function rotateIcon(btn) {
    btn.classList.toggle('rotate-90');
  }
  //Get all chosen tabs
  const handleTabChange = (tabID) => {
    // Add or remove the tab from the selectedTabs array
    if (selectedTabs.some((selected) => selected === tabID)) {
      setSelectedTabs(selectedTabs.filter((selected) => selected !== tabID));
    } else {
      setSelectedTabs([...selectedTabs, tabID]);
    }
  };
  // Pre-ActionsCode have 'REQUEST or RECIEVE' pass parameters with 'data' from an array obj [{},{}...]
  // Get code from server
  function getCodeWithSocket() {
    return new Promise((resolve, reject) => {
      // Request code from server
      socketRef.current.emit(ACTIONS.REQUEST_CODE, {
        roomId,
        data: selectedTabs,
        socketId: socketRef.current.id,
      });
  
      // Listen for the code from the server
      socketRef.current.on(ACTIONS.RECEIVE_CODE, ({ data }) => {
        // Resolve the Promise with the received code
        resolve(data);
      });
    });
  }
  // Generate Code
  function generateCode(){
    if(selectedTabs.length === 0){
      return;
    }

    // response is data array obj [{},{}...]
    // 1.Get code from server using getCodeWithSocket function
    // 2.Merge them with code template
    getCodeWithSocket().then((data) =>{
      let cssValue ='';
      let htmlValue ='';
      let jsValue ='';
      data.forEach((tab) =>{
          if(tab === null){
            return;
          }
          else if(tab.type === 'css'){
            let tabStyle = `<style>${tab.value}</style>`;
            cssValue += tabStyle;
          }
          else if(tab.type === 'xml'){
            htmlValue += tab.value;
          }
          else{
            let tabScript = `<script>${tab.value}</script>`;
            jsValue += tabScript;
          }
      })
      // Merge code with codeTemplate
      let htmlContent = `
            <html>
                <head>
                    ${cssValue}
                </head>
                <body>
                    ${scriptDisableConsoleTemplate}
                    ${scriptConsoleTemplate}
                    ${htmlValue}
                </body>
                ${jsValue}
            </html>
          `;
      // rerender iframe
      setPreviewFrame(htmlContent);
    });
  }
  // Add tabs to select input form
  const addTabsToForm = () => {
    // Add the new tab to the tabs array
    let tabsArray = [];
    let tabsContainer = Array.from(document.getElementsByClassName('tabContainer'));
    tabsContainer.forEach((tab) =>{
      let tabTitle = tab.getElementsByClassName('tabTitle')[0].innerHTML;
      let tabID = tab.getElementsByClassName('btn tabBtn')[0].id;
      
      tabsArray.push({tabID: tabID, title: tabTitle});
    })
    if(tabsArray.length > 0) {
      setTabs(tabsArray);
    }
  };

  return (
      <Split
          className="outputContainer"
          direction="vertical"
          sizes={[85, 15]}
          minSize={200}
          gutterSize={10}
          cursor="row-resize"
      >
          <div className="container__top" >
            {displaySelect &&( 
            <div>
              <SelectInput
                tabs={tabs}
                selectedTabs={selectedTabs}
                handleTabChange={handleTabChange}
              />
            </div>
            )}

            <div className="outputTaskbar">
              <VscDebugStart className="outputIcon" id="outputBtn" onClick={toggleSelect}/>
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
                  id="monitor"
                  srcDoc={previewFrame}
                  title="output"
                  sandbox="allow-same-origin allow-scripts"
                  width="100%"
                  height="100%"
                  frameBorder="0"
              ></iframe>
            </div>
          </div>
          {/* Separator */}
          <div className="container__bottom">

            <div className="consoleTaskbar">
              <span className="consoleTitle">Console</span>
              <div className="rightIcon">
                <VscDebugRerun className="outputIcon"/>
              </div>
            </div>

            <div className="consoleContainer" id="consoleContainer">
            {consoleValues.map((value, index) => (
              <div key={index}>
                <div className="consoleLine">
                  <span className={value.type}>
                    {value.message}
                  </span>
                  <span className="lineInfo">
                    {value.filename}
                    {value.lineno}
                  </span>
                </div>
              </div>
            ))}
            </div>
          </div>

      </Split>
  );
};

export default Output;
