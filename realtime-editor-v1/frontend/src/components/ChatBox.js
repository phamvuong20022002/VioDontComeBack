import React, { useState, useRef, useEffect, useContext } from "react";
import "../Chatbox.css";
import { TbNewSection, TbSettings } from "react-icons/tb";
import { FiSend } from "react-icons/fi";
import { FaUser, FaRegStopCircle, FaKey } from "react-icons/fa";
import { PiWarningCircle } from "react-icons/pi";
import { CiSaveUp2 } from "react-icons/ci";
import { LuPanelRightClose } from "react-icons/lu";
import { MdOutlineChangeCircle } from "react-icons/md";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Message from "./Message";
import toast from "react-hot-toast";
import { EditorPageContext } from "../contexts/editorpage_contexts";
import "../dark_light_button.css";
import { LINKS } from "../assets/links/index";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { checkOpenAPIKey } from "../helpers/CheckAPIKey";
import { maskApiKey } from "../helpers/MaskAPIKey";


const examples = [
  "Create chatbox using jsx.",
  "How to add css using tailwind?",
  "How do you declare a function in JavaScript?",
  "Using JS to create a function for checking emails.",
];

const ChatBox = () => {
  const { isChatBoxOpen, setIsChatBoxOpen, question, setQuestion} = useContext(EditorPageContext);

  /* Max z-index of monaco editor is 11*/
  const zIndex = isChatBoxOpen ? 12 : 0;
  const [inputValue, setInputValue] = useState("");
  const [chats, setChats] = useState([]);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isDisplaySettings, setIsDisplaySettings] = useState(false);
  const [isDarkModeChatBox, setIsDarkModeChatBox] = useState(true);
  const [isEnterKey, setIsEnterKey] = useState(false);
  const [inputAPIValue, setInputAPIValue] = useState("");
  const [errorMessage, setErrorMessage] = useState({});
  const [validAPI, setValidAPI] = useState("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");

  useEffect(() => {
    // Clear the previous timeout
    clearTimeout(timeoutRef.current);

    // Set a new timeout
    // Use Timeout to Box Chat slide more smoothly
    timeoutRef.current = setTimeout(() => {
      if (isChatBoxOpen && inputRef.current) {
        inputRef.current.focus();
        // Set value(question) for input
        if (question) {
          setInputValue(question);
          inputRef.current.focus();
        }
      }
    }, 300);
  }, [isChatBoxOpen, question]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleClickAbort = () => {
    clearTimeout(timeoutRef.current);

    // No fetch request in progress, clear input and focus
    if (!isFetching) {
      setInputValue("");
      inputRef.current.focus();
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isFetching) {
      setIsFetching(true);
      // Handle sending the message
      // setChats([...chats, { role: "user", content: inputValue.trim() }]);
      setChats((prevChats) => [
        ...prevChats,
        { role: "user", content: inputValue.trim() },
      ]);
      // Reset the input value if needed
      setInputValue("");
      setQuestion("");

      try {
        const response = await fetch(process.env.REACT_APP_API_CHATBOX_V1, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stream: true,
            messages: [...chats, { role: "user", content: inputValue }],
          }),
        });

        console.log("readData::", response.body, "\n");
        if (response.body.locked === false) {
          const data = await response.json();
          if (data.status === "error") {
            toast.error(
              `Error ${data.metadata.code}: ${data.metadata.message}`
            );
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
          { role: "user", content: inputValue }, // Include user message
          {
            role: "assistant",
            content:
              "Sorry! Have some problems with chat bot service. Please try again!",
          },
        ]);
      } finally {
        setIsFetching(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleKeyAPIPress = (e) => {
    if (e.key === "Enter") {
      handleSendAPI();
    }
  };

  const handleApiChange = (e) => {
    setIsEnterKey(!!e.target.value);
    setInputAPIValue(e.target.value);
    setErrorMessage({});
  };

  const submitOpenaiApi = () => {
    handleSendAPI();
  };

  const handleSendAPI = async () => {
    //API Processing
    //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
    let apiKey = inputAPIValue.trim();
    const response = await checkOpenAPIKey(apiKey);
    if (response.status) {
      setValidAPI(inputAPIValue.trim());
      console.log("OpenAI API key is valid!");
    } else {
      setErrorMessage({
        message: response.message,
        details: response.errors_details,
      });
    }
    setInputAPIValue("");
  };

  useEffect(() => {
    //Add Scrollbar for answers box
    let container = document.getElementById("answers-box-chats");
    if (isChatBoxOpen && container) {
      container.scrollTop = container?.scrollHeight;
    }
  }, [chats, isChatBoxOpen, inputValue]);

  return (
    <div className="chatbox-container" style={{ zIndex }}>
      <div
        className={`slide-box ${isChatBoxOpen ? "open" : ""}  ${
          isDarkModeChatBox ? "" : "light-mode"
        }`}
      >
        {/* Taskbar */}
        <div className="chatbox-taskbar">
          <TbNewSection
            className={`chatBox-icon ${isFetching ? "disabled" : ""} `}
            id="newChat-icon"
            title="New chat"
            onClick={() => setChats([])}
          />
          <span className="chatBox-title">Chat GPT</span>

          <div className="rightIcon chat-box">
            <TbSettings
              className={`chatBox-icon ${isFetching ? "disabled" : ""} ${
                isDisplaySettings ? "rotate-90" : ""
              }`}
              id="settings-icon"
              title="Ctrl + Shift + S"
              onClick={() => setIsDisplaySettings(!isDisplaySettings)}
            />
            <LuPanelRightClose
              className={`chatBox-icon ${isFetching ? "disabled" : ""} `}
              id="close-icon"
              title="Ctrl + Shift + Q"
              onClick={() => setIsChatBoxOpen(false)}
            />
          </div>
        </div>

        {/* Settings box */}
        <div className={`setting-box ${isDisplaySettings ? "show" : "hide"}`}>
          <div className="setting-title">
            <span>Chat Box Settings</span>
          </div>
          <div className="setting-options-container">
            <div className="setting-option-custom">
              <div className="custom-top">
                <div className="top-title">
                  <span>Use Your OpenAI API</span>
                  <PiWarningCircle
                    className="title-icon"
                    title="What will we do with your API?"
                  />
                </div>
              </div>
              <div className="custom-bottom">
                {validAPI ? (
                  <div className="api-box">
                    <div className="api-title">Available API</div>
                    <pre className="api-key">
                      {maskApiKey(validAPI)}
                    </pre>
                    <MdOutlineChangeCircle id="icon-change-api" title="Change API" onClick={()=>setValidAPI("")}/>
                  </div>
                ) : (
                  <div className="input-box">
                    <div className="input-wrap">
                      <input
                        name="api_key"
                        value={inputAPIValue}
                        className="input-api"
                        placeholder="Enter your API key..."
                        onChange={handleApiChange}
                        onKeyPress={handleKeyAPIPress}
                      />
                      {isEnterKey ? (
                        <CiSaveUp2
                          className="api-icon"
                          id="submit-api-icon"
                          onClick={submitOpenaiApi}
                        />
                      ) : (
                        <FaKey className="api-icon" id="icon-key" />
                      )}
                      <small className="error-input">
                        {errorMessage.message}{" "}
                        <a href={errorMessage.details} target="_blank">
                          {errorMessage.details ? "More Info!" : ""}
                        </a>
                      </small>
                    </div>
                    <small className="link-api">
                      How to get an OpenAI API Key.{" "}
                      <a href={LINKS.HOW_TO_GET_OPENAI_API_KEY} target="_blank">
                        Click here!
                      </a>
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="setting-options-container">
            <div className="setting-option">
              <label>Chat Box Themes</label>
              <div className="switch">
                <input
                  id="switch"
                  className="switch__input"
                  name="switch"
                  type="checkbox"
                  checked={isDarkModeChatBox} //default true
                  onChange={() => {
                    setIsDarkModeChatBox(!isDarkModeChatBox);
                  }}
                />
                <label className="switch__label"></label>
              </div>
            </div>
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
                    <Message content={item.content} />
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
                {/* <input
                  type="text"
                  className="question-input"
                  placeholder="Type your message here..."
                  autoFocus={isChatBoxOpen}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  ref={inputRef}
                /> */}
                <textarea
                  rows="100"
                  cols="100"
                  style={{ resize: 'none' }}
                  className="question-input"
                  placeholder="Type your message here..."
                  onChange={handleInputChange}
                  autoFocus={isChatBoxOpen}
                  onKeyPress={handleKeyPress}
                  value={inputValue}
                  ref={inputRef}
                  >
                </textarea>
                <span className="question-icon">
                  {isFetching ? (
                    <FaRegStopCircle
                      className="chatBox-icon"
                      id="stopChat-icon"
                      title="Stop"
                      onClick={handleClickAbort}
                    />
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
