import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import Client from '../components/Client';
import Tab from '../components/Tab';
import Editor from '../components/Editor';
import Output from '../components/Output';
// import Editor_v2 from '../components/Editor_v2';
import { AiOutlinePlus } from "react-icons/ai";
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import toast from 'react-hot-toast';
import { v4 as uuidV4 } from 'uuid';
import { 
  templateSaveCode, 
  templateCloseTab,
  templateSaveRoomError, 
  templateSaveRoomSuccess
} from '../assets/alerts/index.js';
import { setupPanel } from '../assets/panel_gutter/setupPanel.js';
import Split from 'react-split';
import VanillaContextMenu from 'vanilla-context-menu';
import { getStatusSaveRoom } from '../helpers/GetStatusSaveRoom';
import { isLastClient } from '../helpers/GetLastClient.js';


const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef('');
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  const [clients, setClients] = useState([]);
  const [tabs, setTabs] = useState([]);
  var editorSpace = null;


  /*Create Socket for Sending and Listening Actions */
  useEffect(() => {
    // Create socket connection
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(err) {
        console.log('socket error: ', err);
        toast.error('Socket connection failed. Try again later,');
        reactNavigator('/');
      };

      // Send JOIN sign
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username || 'anonymous',
      });

      // Listening for JOINED
      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined room`);
        }
        setClients(clients);

        //SYNC TABS
        socketRef.current.emit(ACTIONS.SYNC_TABS, {
          socketId,
          roomId,
          tab: null,
        });
      });

      // Listening for GETTING TABS
      socketRef.current.on(ACTIONS.GET_TABS, ({ tabs }) => {
        setTabs(tabs);
      });

      // Listening for DISCONNECTED 
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast(`${username} left the room.`, {
          icon: '🏃‍♂️',
        });
        setClients((prev) => {
          return prev.filter(
            (client) => client.socketId !== socketId
          )
        });
      });

      return socketRef.current;
    };

    // Fix miss username when join room by a link
    if (!location.state) {
      toast.error("Please enter an USERNAME and try to join again!");
      // Redirect to HomePage
      reactNavigator('/', {
        state: {
          roomId,
        },
      })
      return;
    }
    else {
      init();
    }
    return async () => {
      await socketRef.current.disconnect();
      await socketRef.current.off(ACTIONS.JOIN);
      await socketRef.current.off(ACTIONS.DISCONNECTED);
    }
  }, [socketRef]);

  /*----FUNCTION AREA----*/
  /*Get TabID and Code from CodeRef */
  function getTabIDAndCode(data) {
    let tabId = data.substring(0, data.indexOf('|'));
    let code = data.substring(data.indexOf('|') + 1);
    return { tabId, code }
  }
  /*Render Editor function */
  function renderEditor(tab) {
    if (editorSpace !== null) {
      editorSpace.unmount();
    }
    editorSpace = ReactDOM.createRoot(
      document.getElementsByClassName("editorSpace")[0]
    );
    let data = getTabIDAndCode(codeRef.current);
    //SYNC CODE
    socketRef.current.emit(ACTIONS.SYNC_CODE, {
      roomId,
      saveTabId: data.tabId,
      code: data.code,
      socketId: socketRef.current.id,
      tabId: tab.tabID,
    });

    editorSpace.render(
      <Editor
        socketRef={socketRef}
        roomId={roomId}
        tab={tab}
        onCodeChange={(code) => {
          codeRef.current = code;
        }}
      />
    );

  }
  /*Require Tad Data for Rendering Editor */
  async function showEditor(socketRef, tabId) {
    /* Show Editor */

    await socketRef.current.emit(ACTIONS.GET_TAB, {
      roomId,
      tabId,
      socketId: socketRef.current.id,
    });

    await socketRef.current.on(ACTIONS.GET_TAB, ({ tab }) => {
      renderEditor(tab);
    });


  }
  /* Active tab function */
  function activeTab(e) {
    const currentTab = e.target.closest('div');
    const currentTabClassname = currentTab.className;
    // Don't add active style for actived tab
    if (currentTabClassname.search("active") !== -1) {
      return;
    };

    // Remove active style on tab
    let tabContainers = document.getElementsByClassName('tabContainer');
    Array.from(tabContainers).forEach(function (element) {
      let activeTab = element.querySelector('.active');
      if (activeTab) {
        activeTab.classList.remove('active');
        return;
      }
    });
    
    // Add active style 
    if (currentTab.className === 'btn tabBtn') {
      currentTab.classList.add('active');
    }
  }
  /* Add Handle Click On `editorSidebar` class*/
  function handleClick(e) {
    //click  another element on editorSidebar
    if (e.target.className === 'editorSidebar' || e.target.tagName === 'path'|| e.target.className === 'tabContainer') {
      return;
    }
    // click create button
    else if (e.target.className === 'btn createTabBtn' || e.target.id === 'createTab-icon') {
      // create a new tab
      createNewTab();
    }
    //  click close button
    else if (e.target.id === 'closeTab-icon' || e.target.className === 'closeTabBtn'){
      //close the tab
      closeTab(e);
    }
    else {
      //add active on tab
      activeTab(e);

      /*find current tabID and tab data*/
      const tabID = e.target.closest('div').id;
      showEditor(socketRef, tabID);
    }
  }
  /*Create New Tab */
  async function createNewTab() {
    //Create new tab
    const result = await toast((t) => (
      <div>
        <input id="tabName" type="text" placeholder="Enter Tag Name" />
        
        <select name="Type:" id="chooseType">
          <option value="xml">HTML</option>
          <option value="javascript">JS</option>
          <option value="css">CSS</option>
        </select>

        <button onClick={() => {
            let tabName = document.getElementById('tabName').value;
            if (tabName.length !== 0) {
              let type = document.getElementById('chooseType').value;
              let tab = {
                roomId, tabID: uuidV4().toString(), title: tabName, type, value: `new tab`, createdByUser: socketRef.current.id /* socketID */
              }

              /*Send ADD_TAB*/
              socketRef.current.emit(ACTIONS.ADD_TAB, {
              roomId,
              tab,
              });

              toast.dismiss(t.id);
            }
            else {
              document.getElementById('tabName').placeholder = "Please enter a tab name!";
              document.getElementById('tabName').style = 'border: 2px solid red;';
            }
            }
          }>
          New
        </button>
      </div>
    ));
    return result;
  }
  /*Close and Remove tab data on server */
  async function closeTab(e=null, tabID=null) {
    // alert are you sure
    const result = await templateCloseTab();
    if (!result.isConfirmed) {
      // User clicked "Cancel"
      return;
    }

    // Close tab in event
    if(e){
      if (e.target.id === 'closeTab-icon' || e.target.className === 'closeTabBtn') {
        // remove tab on server backend
        const closeTabId = e.target.closest('div').id;
        /*Send REMOVE_TAB*/
        socketRef.current.emit(ACTIONS.REMOVE_TAB, {
          roomId,
          tabId: closeTabId,
        });
      }
    }

    // Close tab with tabID
    if(tabID){
      /*Send REMOVE_TAB*/
      socketRef.current.emit(ACTIONS.REMOVE_TAB, {
        roomId,
        tabId: tabID,
      });
    }
    
  }
  /*Coppy ID room button */
  async function coppyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID has been coppied to your clipboard');
    } catch (error) {
      toast.error('Couldn not copy the Room ID');
    };
  };
  /* Leave room button */
  async function leaveRoom() {
    //check is last client?
    const isLastClient_ = await isLastClient(socketRef.current, roomId);
    if(!isLastClient_) {
      //return Home page
      reactNavigator('/');
      return;
    }
    // popup save code for last client
    const result = await templateSaveCode();
    if(result.isDismissed){
      return;
    }
    //Save code
    else if(result.isConfirmed){
      const data = await getStatusSaveRoom(socketRef.current, roomId, true);
      if(data.status === '201'){
        await templateSaveRoomSuccess(reactNavigator, roomId)
      }
      else if(data.status === 'error') {
        await templateSaveRoomError(data.message)
      }
      return;
    }
    //Don't Save code
    else {
      const data = await getStatusSaveRoom(socketRef.current, roomId, false);
      if(data.status === '200') {
        reactNavigator('/');
        return;
      }
      else{
        await templateSaveRoomError('Have some problems during clean code, Please try again!')
      }
    }
  };

  /*----USEEFFECT AREA----*/
  /*Add Event Listener for editor side bar  */
  useEffect(() => {
    const sidebarElement = document.getElementsByClassName('editorSidebar')[0];

    if (sidebarElement) {
      // create Editor Component when click on tab
      sidebarElement.addEventListener('click', handleClick);
    }

    return () => {
      if (sidebarElement) {
        sidebarElement.removeEventListener('click', handleClick);
      }
    };
  }, []);
  /*Add right click menu on tab */
  useEffect(()=> {
    const myMenu = [
      {
        label: 'Rename',
        callback: async(e) => {
          // Get TabID
          let tabID = null;
          if(e.target.id){
            tabID = e.target.id
          }
          else {
            tabID = e.target.closest('.tabBtn').id;
          }

          // Create toast for input new tab name
          toast((t) => (
            <div>
              <input id="newTabName" type="text" placeholder="Enter Tag Name" />
              <button onClick={
                () => {
                  let newTabName = document.getElementById('newTabName').value;
                  if ((newTabName.length !== 0) && tabID) {
                    /*Send RENAME_TAB*/
                    socketRef.current.emit(ACTIONS.RENAME_TAB, {
                      roomId,
                      tabId: tabID,
                      newTabName
                    });
    
                    toast.dismiss(t.id);
                  }
                  else {
                    document.getElementById('newTabName').placeholder = "Please enter a tab name!";
                    document.getElementById('newTabName').style = 'border: 2px solid red;';
                  }
                }
              }>Rename</button>
            </div>
          ));
        },
      },
      'hr', // separator
      {
        label: 'Close',
        callback: async(e) => {
          // Get TabID
          let tabID = null;
          if(e.target.id && e.target.id !== 'closeTab-icon'){
            tabID = e.target.id
          }
          else {
            tabID = e.target.closest('.tabBtn').id;
          }

          // Send remove tab info
          if(tabID){
            await closeTab(null, tabID);
          }else{
            await closeTab(e, null);
          }
        },
      },
    ]

    let myTabs = document.getElementsByClassName('btn tabBtn');
    for (let i = 0; i< myTabs.length; i++) {
      new VanillaContextMenu({
        scope: myTabs[i],
        menuItems: myMenu,
        customClass: 'tabMenu',
      });
    }
    
  })
  


  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoEditor" src="/logoRe.png" alt="logo"></img>
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {
              clients.map((client, index) => (
                <Client key={index} username={client.username} clientID={client.socketID}/>
              ))
            }
          </div>
        </div>
        <button className="btn shareBtn" onClick={coppyRoomId}>Share RoomID</button>
        <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
      </div>

      <div className="editorWrap">
        {/* Side Bar */}
        <div className="editorSidebar">
          {
            tabs.map(tab => (
              <Tab key={tab.tabID} tab={tab} />
            ))
          }
          <div className='tagCreate'>
            <button className="btn createTabBtn"><AiOutlinePlus id="createTab-icon" /></button>
          </div>
        </div>

        {/* Content */}
        <Split 
          className="editorContent"
          sizes={[60, 40]}
          minSize={250}
          gutterSize={5}
        >
          {/* Space */}
          <div className="editorSpace" id="left-panel"></div>
          {/* Output */}
          <div className="outputSpace" id="right-panel">
            {socketRef.current !== null && <Output socketRef={socketRef} roomId={roomId}/>}
          </div>
        </Split>

      </div>
    </div>

  )
}

export default EditorPage
