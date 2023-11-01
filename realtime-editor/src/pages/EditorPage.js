import React, { useState, useEffect, useRef} from 'react'
import { useLocation, useNavigate, Navigate, useParams} from 'react-router-dom'
import Client from '../components/Client';
import Tab from '../components/Tab';
import Editor from '../components/Editor';
// import Editor_v2 from '../components/Editor_v2';
import {AiOutlinePlus } from "react-icons/ai";
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import toast from 'react-hot-toast';


const EditorPage = () => {
  
  const socketRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const {roomId} = useParams();

  const [show, setShow] = useState(false);

  const [clients, setClients] = useState([]);

  const [tabs, setTabs] = useState([
      {tabID:'10', title: 'Tab ABC', type:'xml', value: `<h1 classname='welcome'>Hello<h1>`,createdByUser: 1 /* socketID */},
      {tabID:'20', title: 'Tab B', type:'css', value: `.welcome{ color: red}` ,createdByUser: 1 /* socketID */},
      {tabID:'30', title: 'Tab C', type:'javascript', value: `document.getElementByClassname('welcome').style.color = 'green'` ,createdByUser: 1 /* socketID */},
    ]);

  const [oneTab, setOneTab] = useState(tabs[0]);

  useEffect(() => {
      /*****************************  INIT SOCKET CONNECTION*********************************** */
      /* Create socket connection */
    const init =  async () => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error',(err) => handleErrors(err));
      socketRef.current.on('connect_failed',(err) => handleErrors(err));

      function handleErrors(err){
        console.log('socket error: ',err);
        toast.error('Socket connection failed. Try again later,');
        reactNavigator('/');
      };

      /*Send JOIN sign*/
      socketRef.current.emit(ACTIONS.JOIN,{
        roomId,
        username: location.state?.username,
      });
      
      /*Listening for JOINED*/
      socketRef.current.on(ACTIONS.JOINED,({clients, username, socketId})=>{
        console.log(username, location.state.username);
        if(username !== location.state?.username){
          toast.success(`${username} joined room`);
          console.log(username,'Joined room');
        }
        setClients(clients);
      });

      return socketRef.current;
    };
      init();
      /***************************** #END INIT SOCKET CONNECTION******************************** */



      /*****************************  CONFIG FRONTEND ****************************************** */
      /*Show Editor function */
      function showEditor(tab){
        /* Show Editor */
        setShow(true);
        setOneTab(tab);
      }

      /*Hide Editor function */
      function hideEditor(tab){
        /* Show Editor */
        setShow(false);
        setOneTab(tab);
      }

      /* Active tab function */
      function activeTab(e) {
        const currentTab = e.target.closest('div');
        const currentTabClassname = currentTab.className;

        /* Don't add active style to actived tab */
        if(currentTabClassname.search("active") !== -1) {
            return;
        };

        /* Remove active style on tab*/
        let tabContainers = document.getElementsByClassName('tabContainer');
        Array.from(tabContainers).forEach(function (element) {
            let activeTab = element.querySelector('.active');
            if(activeTab) {
                activeTab.classList.remove('active');
                return;
            }
        });

        /* Add active style */
        if(currentTab.className === 'btn tabBtn'){
          currentTab.classList.add('active');
        }
      }

      /* Handle Click */
      function handleClick(e) {

        if(e.target.className === 'editorSidebar' || e.target.className === 'btn createTabBtn' 
          || e.target.tagName === 'svg' || e.target.tagName === 'path') {
          return;
        }
        else{
          /*add active */
          activeTab(e);

          /*find current tabID and tab data*/
          const tabID = e.target.closest('div').id;
          const tab = (tabs.find((tab) => tab.tabID === tabID));

          /*show Editor */
          showEditor(tab);
        }
      }
      document.getElementsByClassName('editorSidebar')[0].addEventListener('click', handleClick);

      /***************************** #END CONFIG FRONTEND ************************************** */

    }, []);

  if(!location.state){
    return <Navigate to="/"/>;
  }

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
                <Client key={client.socketID} username={client.username}/>
              ))
            }
          </div>
        </div>
        <button className="btn shareBtn">Share RoomID</button>
        <button className="btn leaveBtn">Leave</button>
      </div>

      <div className="editorWrap">
        <div className="editorSidebar">
          {
            tabs.map(tab => (
              <Tab key={tab.tabID} tab={tab}/>
            ))
          }
          <div className='tagCreate'>
            <button className="btn createTabBtn"><AiOutlinePlus/></button>
          </div>
        </div>
        <div className="editorSpace">
          {show ? <Editor key={oneTab.tabID} tab={oneTab}/> : null}
        </div>
      </div>
    </div>
    
  )
}

export default EditorPage