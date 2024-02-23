//Wijmo


import { React, useEffect, useState, useRef, memo, useContext, useTransition } from "react";
import {
  VscMultipleWindows,
  VscRefresh,
  VscCloudDownload,
  VscDebugStart ,
  VscTerminal 
} from "react-icons/vsc";
import SelectInput from "../assets/select_input/SelectInput";
import ACTIONS from "../Actions";
import { initTabIDsTemplate, TIMEOUT_REFRESH_MONITOR } from "../assets/variables_template/index.js"
import _ from 'lodash';
import { getCodeWithSocket,  generateCode} from "../helpers/CodeSelectedTabs.js";
import LoadingSpinner from "./LoadingSpinner.js";
import { AppContext } from "../contexts/main_context/index.js";



const initHTMLContent = "<html><head></head><body>Hello, iframe content!</body></html>";
const Output = ({socketRef, roomId}) => {
  const {refreshOutput, setRefreshOutput} = useContext(AppContext); 
  const [displaySelect, setDisplaySelect] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [selectedTabs, setSelectedTabs] = useState(initTabIDsTemplate);
  const [previewFrame, setPreviewFrame] = useState(initHTMLContent);
  // const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Add listener for components
  useEffect(() => {
    if(loading) return;
    //add listener for Output button (Run button)
    let btn = document.getElementById('outputBtn')
    btn.addEventListener('click', () => {
      addTabsToForm();
    })

    return () => {
      btn.removeEventListener('click', addTabsToForm);
    };
  }, [loading]);

  //function get code have tabIds in selectedTabs array
  const getCodeFromSelectedTabs = async () =>{
    try {
      //get code form server
      const data = await getCodeWithSocket(socketRef.current, { roomId, data: selectedTabs, socketId: socketRef.current.id});
      //generate code for previewFrame 
      const htmlContent = generateCode(data);
      // rerender iframe
      setPreviewFrame(htmlContent);
      // Turn off loading
      setLoading(false);
    } catch (error) {
      console.error(error);
      // Turn off loading
      setLoading(false);
    }
  }
  //Main function
  useEffect(() => {
    startTransition(()=>{
      //check length of selectedTabs
      if(selectedTabs.length === 0){
        setPreviewFrame(initHTMLContent);
      }else{
        //save selected tabs to server
        if(socketRef.current !== null){
          // save selectedTabs to server
          socketRef.current.emit(ACTIONS.SAVE_SELECTEDTABS,{
            roomId,
            socketId: socketRef.current.id,
            data: selectedTabs
          })
        }
        // get code from selectedTabs in server
        getCodeFromSelectedTabs();
      }
    })

    //refresh code every 1 second
    // setTimeout(() => {
    //   setRefresh(!refresh);
    // }, TIMEOUT_REFRESH_MONITOR);

  }, [refreshOutput, loading, selectedTabs]);

  /*----FUNCTION AREA----*/
  // toggle select from check boxs
  const toggleSelect = (e) => {
    setDisplaySelect(!displaySelect);
    rotateIcon(e.target?.closest('#outputBtn'));

  };
  // rotate 90 output Button
  function rotateIcon(btn) {
    btn?.classList.toggle('rotate-90');
  }
  //Get all chosen tabs
  const handleTabChange = (tabID) => {
    startTransition(() => {
      // Add or remove the tab from the selectedTabs array
      if (selectedTabs.some((selected) => selected === tabID)) {
        setSelectedTabs(selectedTabs.filter((selected) => selected !== tabID));
      } else {
        setSelectedTabs([...selectedTabs, tabID]);
      }
    })
  };

  //Style icon buttons
  function addStyleIcon(button){
    if(button.className.baseVal === 'outputIcon'){
      button.classList.add('inactiveicon');
    }
    else{
      button.classList.remove('inactiveicon');
    }
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
        setLoading(true);
        addStyleIcon(e.target);
      }
      //export icon button
      else if(e.target.id === 'export-icon') {
        console.log('export icon::OKOK');
        console.log('code export::', previewFrame);
      }
      //new window icon button
      else if(e.target.id === 'newWindow-icon'){
        const newWindow = window.open(`${getIframeSrc()}?id=${encodeURIComponent(socketRef.current.id)}`);
          if (newWindow) {
            newWindow.opener.socketInNewWindow = socketRef.current;
            newWindow.opener.socketNewWindowData = selectedTabs;
          }
      }
      else if(e.target.id === 'terminal-icon'){
        const consoleContainer = document.getElementById('console-container');
        const leftPanel = document.getElementById('editor-space');
        leftPanel.style.height = 'calc(50% - 1.5px)';
        consoleContainer.style.height = 'calc(50% - 1.5px)';
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
    <div>
      { loading ? (<LoadingSpinner />):
      (<div
          className="outputContainer"
      >
          {/* Monitor Output */}
          <div className="container-monitor">
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
              <VscDebugStart className="outputIcon" id="outputBtn" onClick={toggleSelect} title="Debug Start With..."/>
              <span className="outputTitle">Monitor</span>
              
              <div className="rightIcon monitor" onClick={handleRightIcon}> 
                <VscTerminal className="outputIcon" id="terminal-icon" title="Display console monitor"/>
                <VscRefresh className="outputIcon" id="reload-icon" title="Reload monitor"/>
                <VscCloudDownload  className="outputIcon" id="export-icon" title="Export current code"/>
                <VscMultipleWindows className="outputIcon" id="newWindow-icon" title="Open preview in a new window"/>
              </div>
            </div>

            <div className="outputMonitor" id="newIframe">
              <iframe
                  src={`/preview/${roomId}`}
                  id="monitor"
                  srcDoc={previewFrame}
                  title="output"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation"
                  width="100%"
                  height="100%"
                  frameBorder="0"
              ></iframe>
            </div>
          </div>
      </div>)}
    </div>
  );
};

export default memo(Output);
