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

const initTabsTemplate = [
  {tabID: '10', title: 'index.html'},
  {tabID: '20', title: 'index.css'},
  {tabID: '30', title: 'index.js'},
]
const initTabIDsTemplate = ['10', '20', '30']

const initHTMLContent = "<html><head></head><body>Hello, iframe content!</body></html>"

const Output = ({socketRef, roomId}) => {
  const [displaySelect, setDisplaySelect] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [selectedTabs, setSelectedTabs] = useState(initTabIDsTemplate);
  const [previewFrame, setPreviewFrame] = useState(initHTMLContent);

  useEffect(() => {
    //add listening for Output button
    handleOutputBtn();
    //generate code for previewFrame
    generateCode();
  }, [previewFrame, selectedTabs, socketRef]);


    // toggle select from check boxs
    const toggleSelect = () => {
      setDisplaySelect(!displaySelect);
    };
  
    // handle Click Output button 
    function handleOutputBtn(){
      let btn = document.getElementById('outputBtn')
      btn.addEventListener('click', () => {
        rotateIcon();
        addTabsToForm();
      })
    }
    // rotate 90 output Button
    function rotateIcon() {
      var outputBtn = document.getElementById('outputBtn');
      outputBtn.classList.toggle('rotate-90');
    }

  const handleTabChange = (tabID) => {
    // Add or remove the tab from the selectedTabs array
    if (selectedTabs.some((selected) => selected === tabID)) {
      setSelectedTabs(selectedTabs.filter((selected) => selected !== tabID));
    } else {
      setSelectedTabs([...selectedTabs, tabID]);
    }
  };

  // Pre-ActionsCode have 'REQUEST or RECIEVE' pass parameters with 'data' from an array obj [{},{}...]
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

  function getFileType(fileName) {
    // Split the file name by the dot (.)
    let splitFileName = fileName.split('.');
  
    // Get the last element from the split array (assuming it's the file extension)
    let fileType = splitFileName[splitFileName.length - 1];
  
    return fileType;
  }

  function generateCode(){
    if(selectedTabs.length === 0){
      return;
    }

    // response is data array obj [{},{}...]
    getCodeWithSocket().then((data) =>{
      let cssValue ='';
      let htmlValue ='';
      let jsValue ='';
      data.forEach((tab) =>{
          if(tab.type === 'css'){
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
      let htmlContent = `
            <html>
                <head>
                    ${cssValue}
                </head>
                <body>
                    ${htmlValue}
                </body>
                ${jsValue}
            </html>
          `;
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
    <div className="outputContainer">
      
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
        ></iframe>
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
