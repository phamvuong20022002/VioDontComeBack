import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom'
import Client from '../components/Client';
import Tab from '../components/Tab';
import Editor from '../components/Editor';
// import Editor_v2 from '../components/Editor_v2';
import { AiOutlinePlus } from "react-icons/ai";
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import toast from 'react-hot-toast';


const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  const [show, setShow] = useState(true);
  const [clients, setClients] = useState([]);

  const [tabs, setTabs] = useState([
    { tabID: '10', title: 'Tab ABC', type: 'xml', value: `<h1 classname='welcome'>Hello<h1>`, createdByUser: 1 /* socketID */ },
    { tabID: '20', title: 'Tab B', type: 'css', value: `.welcome{ color: red}`, createdByUser: 1 /* socketID */ },
    { tabID: '30', title: 'Tab C', type: 'javascript', value: `document.getElementByClassname('welcome').style.color = 'green'`, createdByUser: 1 /* socketID */ },
  ]);

  const [oneTab, setOneTab] = useState(tabs[0]);

  /*Create Socket for Sending and Listening Actions */
  useEffect(() => {
    /* Create socket connection */
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(err) {
        console.log('socket error: ', err);
        toast.error('Socket connection failed. Try again later,');
        reactNavigator('/');
      };

      /*Send JOIN sign*/
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username || 'anonymous',
      });

      /*Listening for JOINED*/
      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined room`);
          console.log(username, 'Joined room');
        }
        setClients(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId,
          tabId: oneTab.tabID,
        });
      });

      /*Listening for DISCONNECTED */
      socketRef.current.on(ACTIONS.DISCONNECTED, ({socketId, username}) => {
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

    /* Fix miss username when join room by a link*/
    if (!location.state) {
      toast.error("Please enter an USERNAME and try to join again!");
      // Redirect to HomePage
      reactNavigator('/',{
          state: {
              roomId,
          },
      })
      return;
    }
    else{
      init();
    }
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOIN);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    }
  }, []);

  /*****************************  CONFIG FRONTEND ****************************************** */
  /*Show Editor function */
  function showEditor(tab) {
    /* Show Editor */
    setShow(true);
    setOneTab(tab);
  }

  /*Hide Editor function */
  function hideEditor(tab) {
    /* Show Editor */
    setShow(false);
    setOneTab(tab);
  }

  /* Active tab function */
  function activeTab(e) {
    const currentTab = e.target.closest('div');
    const currentTabClassname = currentTab.className;

    /* Don't add active style for actived tab */
    if (currentTabClassname.search("active") !== -1) {
      return;
    };

    /* Remove active style on tab*/
    let tabContainers = document.getElementsByClassName('tabContainer');
    Array.from(tabContainers).forEach(function (element) {
      let activeTab = element.querySelector('.active');
      if (activeTab) {
        activeTab.classList.remove('active');
        return;
      }
    });

    /* Add active style */
    if (currentTab.className === 'btn tabBtn') {
      currentTab.classList.add('active');
    }
  }

  /* Handle Click */
  function handleClick(e) {
    if (e.target.className === 'editorSidebar' || e.target.className === 'btn createTabBtn'
      || e.target.tagName === 'svg' || e.target.tagName === 'path') {
      return;
    }
    else {
      activeTab(e);

      /*find current tabID and tab data*/
      const tabID = e.target.closest('div').id;
      const tab = (tabs.find((tab) => tab.tabID === tabID));

      showEditor(tab);
    }
  }

  /*Add Event Listener for editor side bar  */
  useEffect(() => {
    const sidebarElement = document.getElementsByClassName('editorSidebar')[0];

    if (sidebarElement) {
      sidebarElement.addEventListener('click', handleClick);
    }

    return () => {
      if (sidebarElement) {
        sidebarElement.removeEventListener('click', handleClick);
      }
    };
  }, []);
  /***************************** #END CONFIG FRONTEND ************************************** */

  async function coppyRoomId(){
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID has been coppied to your clipboard');
    } catch (error) {
      toast.error('Couldn not copy the Room ID');
    };
  };

  function leaveRoom(){
    reactNavigator('/');
  };

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
              clients.map(client => (
                <Client key={client.socketID} username={client.username} />
              ))
            }
          </div>
        </div>
        <button className="btn shareBtn" onClick={coppyRoomId}>Share RoomID</button>
        <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
      </div>

      <div className="editorWrap">
        <div className="editorSidebar">
          {
            tabs.map(tab => (
              <Tab key={tab.tabID} tab={tab} />
            ))
          }
          <div className='tagCreate'>
            <button className="btn createTabBtn"><AiOutlinePlus /></button>
          </div>
        </div>
        <div className="editorSpace">
          {show ? <Editor 
                    socketRef={socketRef} 
                    roomId={roomId} 
                    tab={oneTab} 
                    onCodeChange={(code) =>{
                      codeRef.current = code;
                    }
          }/> : null}
        </div>
      </div>
    </div>

  )
}

export default EditorPage