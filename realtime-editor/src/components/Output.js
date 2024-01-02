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
import { initTabIDsTemplate, TIMEOUT } from "../assets/variables_template/index.js"
import _ from 'lodash';
import { getCodeWithSocket,  generateCode} from "../helpers/CodeSelectedTabs.js";
const initHTMLContent = "<html><head></head><body>Hello, iframe content!</body></html>";


const Output = ({socketRef, roomId}) => {
  const [displaySelect, setDisplaySelect] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [selectedTabs, setSelectedTabs] = useState(initTabIDsTemplate);
  const [previewFrame, setPreviewFrame] = useState(initHTMLContent);
  const [consoleValues, setConsoleValues] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const preSelectedTabs = useRef([]);

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
        setConsoleValues((prevLogs) => [...prevLogs, {type:'log', message:event.data.message, time:event.data.time}]);
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
  }, [consoleValues]);

  // Add listener for components
  useEffect(() => {
    //add listener for taskbars
    const rightIcon = document.getElementsByClassName('rightIcon');
    
    rightIcon[0].addEventListener('click', (e)=>{
      handleRightIcon(e);
    })
    
    //add listener for Output button (Run button)
    let btn = document.getElementById('outputBtn')
    btn.addEventListener('click', () => {
      addTabsToForm();
    })

    return () => {
      if(rightIcon && btn){
        rightIcon?.[0]?.removeEventListener('click', handleRightIcon);
        btn.removeEventListener('click', addTabsToForm);
      }
      
    };
  }, [selectedTabs]);

  useEffect(() => {
    //function get code have tabIds in selectedTabs array
    const getCodeFromSelectedTabs = async () =>{
      try {
        //get code form server
        const data = await getCodeWithSocket(socketRef.current, { roomId, data: selectedTabs, socketId: socketRef.current.id});
        //generate code for previewFrame 
        const htmlContent = generateCode(data);
        // rerender iframe
        setPreviewFrame(htmlContent);
      } catch (error) {
        console.error(error);
      }
    }

    //refresh code every 1 second
    setTimeout(() => {
      setRefresh(!refresh);
    }, TIMEOUT);
    //check length of selectedTabs
    if(selectedTabs.length === 0){
      setPreviewFrame(initHTMLContent);
    }else{
      if(socketRef.current !== null){
        // save selectedTabs to server
        socketRef.current.emit(ACTIONS.SAVE_SELECTEDTABS,{
          roomId,
          socketId: socketRef.current.id,
          data: selectedTabs
        })
      }
      // get code from selectedTabs
      getCodeFromSelectedTabs();
      //add scroll to end of console window
      scrollToBottom();
    }

  }, [refresh]);

  /*----FUNCTION AREA----*/
  // toggle select from check boxs
  const toggleSelect = () => {
    setDisplaySelect(!displaySelect);
  };
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

  //Style icon buttons
  function addStyleIcon(button){
    if(button.className.baseVal === 'outputIcon'){
      button.classList.add('inactiveicon');
    }
    else{
      button.classList.remove('inactiveicon');
    }
    // button.style.background = 'red';
  }
  //Scroll Console Monitor to bottom
  function scrollToBottom() {
    var consoleContainer = document.getElementById('consoleContainer');
    consoleContainer.scrollTop = consoleContainer.scrollHeight;
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
  // Add listeners for rightIcon class
  function handleRightIcon(e){
    if(e.target){
      if(e.target.id === null){
        return ;
      }
      //reload icon button
      if(e.target.id === 'reload-icon'){
        addStyleIcon(e.target);
        setTimeout(() => {
          setConsoleValues([]);
        }, 2000)
        addStyleIcon(e.target);
      }
      //responsive icon button
      else if(e.target.id === 'responsive-icon') {
        console.log('responsive icon::OKOK');
      }
      //new window icon button
      else if(e.target.id === 'newWindow-icon'){
        if(!_.isEqual(preSelectedTabs.current, selectedTabs)){
          const newWindow = window.open(`${getIframeSrc()}?id=${encodeURIComponent(socketRef.current.id)}`);
          if (newWindow) {
            newWindow.opener.socketInNewWindow = socketRef.current;
            console.log('SEND::', selectedTabs);
            newWindow.opener.socketNewWindowData = selectedTabs;
          }
          preSelectedTabs.current = selectedTabs;
        }
      }
    }
  }
  // Get iframe src
  function getIframeSrc() {
    var iframe = document.getElementById('monitor');
    if(iframe){
      return(iframe.src);
    }
    else{
      return null;
    }
  }

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
                <VscRefresh className="outputIcon" id="reload-icon"/>
                <VscVersions className="outputIcon" id="responsive-icon"/>
                <VscMultipleWindows className="outputIcon" id="newWindow-icon"/>
              </div>
            </div>

            <div className="outputMonitor" id="newIframe">
              <iframe
                  src={`/preview/${roomId}`}
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
                  <span className={"lineInfo " + value.type}>
                    {value.type !== 'error' && (
                      <>
                        {'time: '+ value.time}
                      </> 
                    )}
                    {value.type === 'error' && (
                      <>
                        {value.filename +' : ' + value.lineno}
                      </> 
                    )}
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
