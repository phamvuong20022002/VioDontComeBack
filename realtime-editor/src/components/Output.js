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

const initTabsTemplate = [
  {tabID: '10', title: 'index.html'},
  {tabID: '20', title: 'index.css'},
  {tabID: '30', title: 'index.js'},
]


const initTabIDsTemplate = ['10', '20', '30']

const Output = () => {
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");
  const [displaySelect, setDisplaySelect] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [selectedTabs, setSelectedTabs] = useState(initTabIDsTemplate);
  
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

    //add listening for Output button
    handleOutputBtn();
  }, [previewFrame]);


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

  function getCode(){
    console.log('getCode',selectedTabs);
  }

  useEffect(() => {
    getCode();
  }, [selectedTabs]);

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
