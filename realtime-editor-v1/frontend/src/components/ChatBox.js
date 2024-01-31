import React, { useState, useRef, useEffect } from "react";
import "../Chatbox.css";
import { TbNewSection, TbSettings } from "react-icons/tb";
import { FiSend } from "react-icons/fi";
import { FaUser, FaRegStopCircle } from "react-icons/fa";
import { LuPanelRightClose } from "react-icons/lu";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Message from "./Message";
import toast from 'react-hot-toast';

const examples = [
  "Create chatbox using jsx.",
  "How to add css using tailwind?",
  "How do you declare a function in JavaScript?",
  "Using JS to create a function for checking emails.",
];

const ChatBox = ({ isBoxOpen, setIsBoxOpen }) => {
  /* Max z-index of monaco editor is 11*/
  const zIndex = isBoxOpen ? 12 : 0;
  const [inputValue, setInputValue] = useState("");
  const [chats, setChats] = useState([]);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const [isFetching, setIsFetching] = useState(false);
 
  useEffect(() => {
    // Clear the previous timeout
    clearTimeout(timeoutRef.current);

    // Set a new timeout
    // Use Timeout to Box Chat slide more smoothly
    timeoutRef.current = setTimeout(() => {
      if (isBoxOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, 300);
  }, [isBoxOpen]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleClickAbort = () => {
    clearTimeout(timeoutRef.current);

    // No fetch request in progress, clear input and focus
    if(!isFetching){
      setInputValue("");
      inputRef.current.focus();
    }
  };


  const handleSendMessage = async () => {
    if (inputValue.trim() && !isFetching) {
      setIsFetching(true);
      // Handle sending the message
      // setChats([...chats, { role: "user", content: inputValue.trim() }]);
      setChats((prevChats) => [...prevChats, { role: "user", content: inputValue.trim() }]);
      // Reset the input value if needed
      setInputValue("");


      try {
        const response = await fetch(process.env.REACT_APP_API_CHATBOX_V1, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stream: true,
            messages: [...chats, { role: "user", content: inputValue }],
          }),
        });

        console.log('readData::', response.body ,'\n');
        if(response.body.locked === false){
          const data = await response.json();
          if(data.status === 'error'){
            toast.error(`Error ${data.metadata.code}: ${data.metadata.message}`);
          }
        }

        const readData = response.body
          .pipeThrough(new TextDecoderStream())
          .getReader();
        let aiRes = "";
        while (true) {
          const { done, value } = await readData.read();
          
          if (done) break;
          aiRes += value;
          setChats([
            ...chats,
            { role: "user", content: inputValue },
            { role: "assistant", content: aiRes },
          ]);
        }
      } catch (error) {
        // console.error("Error in fetch:", error);
        setChats([
          ...chats,
          { role: "user", content: inputValue },  // Include user message
          { role: "assistant", content: "Sorry! Have some problems with chat bot service. Please try again!" },
        ]);
      }finally {
        setIsFetching(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  useEffect(() => {
    //Add Scrollbar for answers box
    let container = document.getElementById("answers-box-chats");
    if (isBoxOpen && container) {
      container.scrollTop = container?.scrollHeight;
    }
  }, [chats, isBoxOpen]);

  return (
    <div className="chatbox-container" style={{ zIndex }}>
      <div className={`slide-box ${isBoxOpen ? "open" : ""}`}>
        {/* Taskbar */}
        <div className="chatbox-taskbar">
          <TbNewSection 
            className={`chatBox-icon ${isFetching ? 'disabled': ''} `}
            id="newChat-icon" 
            title="New chat"
            onClick={() => setChats([])}
          />
          <span className="chatBox-title">Chat GPT</span>

          <div className="rightIcon monitor">
            <TbSettings
              className={`chatBox-icon ${isFetching ? 'disabled': ''} `}
              id="setting-icon"
              title="Settings"
            />
            <LuPanelRightClose 
              className={`chatBox-icon ${isFetching ? 'disabled': ''} `}
              id="setting-icon"
              title="Settings"
              onClick={() => setIsBoxOpen(false)}
            />
          </div>
        </div>

        {/* Chatbox */}
        <div className="chatbox-bot">
          {/* Answer box */}
          {chats.length > 0 ? (
            <div className="answers-box-chats" id="answers-box-chats">
              {chats.map((item, index) => (
                <div key={index} className={`answer-wrap ${item.role}`}>
                  {item.role === "user" ? (
                    <span className="role">
                      <FaUser />
                    </span>
                  ) : (
                    <span className="role">
                      <img
                        width="32"
                        height="32"
                        src="/chatgpt-48-white.png"
                        alt="chatgpt--v1"
                      />
                    </span>
                  )}
                  <div className="answer">
                    <p>
                      <Message content={item.content} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="answers-box">
              {/* welcome */}
              <div className="welcome-wrap">
                <div className="welcome-img">
                  <img id="gpt-logo" src="/chatgpt-68.svg" alt="gpt-logo" />
                </div>
                <div className="welcome-text">How can I help you today?</div>
              </div>
              {/* examples */}
              <div className="example-wrap">
                {examples.map((example, index) => (
                  <div
                    key={index}
                    className="example"
                    onClick={() => setInputValue(example)}
                  >
                    {example}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question box */}
          <div className="questions-box">
            <div className="question-wrap">
              <div className="question">
                <input
                  type="text"
                  className="question-input"
                  placeholder="Type your message here..."
                  autoFocus={isBoxOpen}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  ref={inputRef}
                />
                <span className="question-icon">
                {isFetching ? (
                  <FaRegStopCircle className="chatBox-icon" id="stopChat-icon" title="Stop" onClick={handleClickAbort} />
                ) : (
                  <FiSend className="icon-send" onClick={handleSendMessage} />
                )}
                 
                </span>
              </div>
              <small> AI can generate incorrect information.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
