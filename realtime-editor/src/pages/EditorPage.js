import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Client from '../components/Client';
import Tab from '../components/Tab';
import Editor from '../components/Editor';


const EditorPage = () => {
  
  const navigate = useNavigate();
  const [clients, setClients] = useState(
    [
      {socketID:1, username: 'Pham Quoc Vuong'},
      {socketID:2, username: 'Le Vio'},
      {socketID:3, username: 'Pham Vuong'},
      {socketID:4, username: 'Le Vi'},
    ]);

    const [tabs, setTabs] = useState([
      {tabID:'10', title: 'Tab ABC', type:'xml', value: `<h1 classname='welcome'>Hello<h1>`,createdByUser: 1 /* socketID */},
      {tabID:'20', title: 'Tab B', type:'css', value: `.welcome{ color: red}` ,createdByUser: 1 /* socketID */},
      {tabID:'30', title: 'Tab C', type:'javascript', value: `document.getElementByClassname('welcome').style.color = 'green'` ,createdByUser: 1 /* socketID */},
    ]);

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
        </div>
        {/* <div className="editorSpace">
          {
            tabs.map(tab => (
              <Editor key={tab.tabID} tab={tab}/>
            ))
          }
        </div> */}
      </div>
      
    </div>
    
  )
}

export default EditorPage