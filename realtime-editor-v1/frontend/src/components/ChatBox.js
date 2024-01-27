import React, { useState } from "react";
import "../Chatbox.css";
import { 
  TbNewSection,
  TbSettings 
} from "react-icons/tb";
const ChatBox = ({ isBoxOpen }) => {
  const zIndex = isBoxOpen ? 2 : 0;
  return (
    <div className="chatbox-container" style={{ zIndex }}>
      <div className={`slide-box ${isBoxOpen ? "open" : ""}`}>
        <div className="chatbox-taskbar">
          <TbNewSection
            className="chatBox-icon"
            id="newChat-icon"
            // onClick={toggleSelect}
            title="New chat"
          />
          
          <span className="chatBox-title">Chat GPT</span>

          <div className="rightIcon monitor">
            <TbSettings 
              className="chatBox-icon"
              id="setting-icon"
              title="Settings"
            />
          </div>
        </div>
        <div className="chatbox-bot"></div>
      </div>
    </div>
  );
};

export default ChatBox;
