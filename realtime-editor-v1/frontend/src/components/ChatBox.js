import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  memo,
  useCallback,
} from "react";
import "../Chatbox.css";
import { TbNewSection, TbSettings, TbCloudUpload } from "react-icons/tb";
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
import QuestionTextArea from "./QuestionTextArea";
import { getFormattedText, parseImageAndText } from "../utils/utlis";
import { ChatContent } from "./ChatContent";
import { extractAIAnswerContent } from "../helpers/ReadFileContents";
import UploadImageCloudinary from "../helpers/UploadImage";
import { buildMessages } from "../utils/prompt";

const examples = [
  "Create chatbox using jsx.",
  "How to add css using tailwind?",
  "How do you declare a function in JavaScript?",
  "Using JS to create a function for checking emails.",
];

const ChatBox = () => {
  const {
    isChatBoxOpen,
    setIsChatBoxOpen,
    isFetching,
    setIsFetching,
    setQuestion,
    question,
  } = useContext(EditorPageContext);

  /* Max z-index of monaco editor is 11*/
  const zIndex = isChatBoxOpen ? 12 : 0;
  const [inputValue, setInputValue] = useState("");
  const [chats, setChats] = useState([]);
  // const inputRef = useRef(null);
  // const timeoutRef = useRef(null);
  // const [isFetching, setIsFetching] = useState(false);
  const [isDisplaySettings, setIsDisplaySettings] = useState(false);
  const [isDarkModeChatBox, setIsDarkModeChatBox] = useState(true);
  const [isEnterKey, setIsEnterKey] = useState(false);
  const [inputAPIValue, setInputAPIValue] = useState("");
  const [errorMessage, setErrorMessage] = useState({});
  const [validAPI, setValidAPI] = useState("");
  const [dataChats, setDataChats] = useState([]);
  const [heightAdder, setHeightAdder] = useState("auto");
  const [isUploadVisible, setIsUploadVisible] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [genImage2Code, setGenImage2Code] = useState(false);

  const processStreamData = async (reader, setChats, aiRes) => {
    let accumulatedResponse = aiRes || "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Tách dữ liệu thành từng dòng và lọc ra những dòng không rỗng
      const decodedLines = value
        .split("\n")
        .filter((line) => line.trim() !== "");

      for (const line of decodedLines) {
        if (line.startsWith("data:")) {
          const jsonStr = line.replace("data:", "").trim();
          if (jsonStr === "[DONE]") {
            break;
          }

          try {
            const json = JSON.parse(jsonStr);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              accumulatedResponse += content;

              // Cập nhật trạng thái với nội dung mới
              setChats([
                // ...chats,
                { role: "user", content: inputValue },
                { role: "assistant", content: accumulatedResponse },
              ]);
            }
          } catch (error) {
            console.error("Failed to parse JSON:", error);
          }
        }
      }
    }

    return accumulatedResponse;
  };

  const handleSendMessage = useCallback(async () => {
    if (inputValue.trim() && !isFetching) {
      setIsFetching(true);
      setChats((prevChats) => [
        // ...prevChats,
        { role: "user", content: inputValue.trim() },
      ]);
      setDataChats((prevChats) => [
        ...prevChats,
        { role: "user", content: inputValue.trim() },
      ]);
      // Reset the input value if needed
      setInputValue("");
      setQuestion("");

      // Handle sending the message
      try {
        const response = await fetch(
          validAPI
            ? "https://api.openai.com/v1/chat/completions"
            : process.env.REACT_APP_API_CHATBOX_V1,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${validAPI}`,
            },

            body: JSON.stringify({
              // model: "gpt-4o-mini",
              model: "gpt-3.5-turbo",

              stream: true,
              // messages: [...chats, { role: "user", content: inputValue }],
              messages: [...dataChats, { role: "user", content: inputValue }],
            }),
          }
        );

        const readData = response.body
          .pipeThrough(new TextDecoderStream())
          .getReader();

        let aiRes = "";
        let finalResponse = "";
        if (validAPI) {
          //fetch from openai server
          finalResponse = await processStreamData(readData, setChats, "");
        } else {
          // fetch from code2d server
          while (true) {
            const { done, value } = await readData.read();
            if (done) break;
            aiRes += value;

            //show streaming chats
            setChats([
              // ...chats,
              { role: "user", content: inputValue },
              { role: "assistant", content: aiRes },
            ]);
          }
        }

        //add height for asisstant
        addHeightForAnswerWrap();
        //Save chats
        setDataChats([
          ...dataChats,
          { role: "user", content: inputValue },
          { role: "assistant", content: validAPI ? finalResponse : aiRes },
        ]);
      } catch (error) {
        // console.error("Error in fetch:", error);
        setChats([
          // ...chats,
          { role: "user", content: inputValue }, // Include user message
          {
            role: "assistant",
            content:
              "Sorry! Have some problems with chat bot service. Please try again!",
          },
        ]);
        setDataChats([
          ...dataChats,
          { role: "user", content: inputValue },
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
  }, [inputValue, isFetching, chats, dataChats]);

  //Add heights for Assistant if answers lenght of user and assisstant not fix answers-box-chats (521px)
  const addHeightForAnswerWrap = () => {
    const answerWrap = Array.from(
      document.getElementsByClassName("answer-wrap")
    );
    if (!answerWrap.length) {
      return;
    }
    let answerWrapHeight = 0;
    let container = document.getElementById("answers-box-chats");
    console.log("container height::", container.clientHeight);
    answerWrap.forEach((element) => {
      // Perform actions on each element here
      answerWrapHeight += element.clientHeight;
    });

    if (answerWrapHeight < container.clientHeight) {
      const assistant = document.getElementsByClassName(
        "answer-wrap assistant"
      );
      const assistantHeight = assistant[assistant.length - 1].clientHeight;
      setHeightAdder(
        assistantHeight + (container.clientHeight - answerWrapHeight) + 10
      );
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

  //Add Scrollbar for answers box
  useEffect(() => {
    let container = document.getElementById("answers-box-chats");
    if (isChatBoxOpen && container) {
      container.scrollTop = container?.scrollHeight;
    }
  }, [chats, isChatBoxOpen]);

  //Show old chats when sroll to top
  useEffect(() => {
    let answersBox = document.getElementById("answers-box-chats");

    let i = 2;
    function handleScroll() {
      if (answersBox?.scrollTop === 0) {
        setHeightAdder("auto");
        if (dataChats.length % 2 === 1) {
          return;
        }
        // console.log("Bạn đã cuộn đến đỉnh của phần tử!");
        if (dataChats.length >= i + 2) {
          setChats([...dataChats.slice(-(i + 2))]);
          i += 2;
        }
      }
    }

    answersBox?.addEventListener("scroll", handleScroll);

    return () => {
      answersBox?.removeEventListener("scroll", handleScroll);
    };
  }, [dataChats, inputValue]);

  //setChat when input new question
  useEffect(() => {
    if (chats.length > 2 && dataChats.length > 2) {
      setChats([
        dataChats[dataChats.length - 1 - 1],
        dataChats[dataChats.length - 1 - 2],
      ]);
    }
  }, [inputValue, dataChats]);

  //handle mouse on
  const handleMouseEnter = () => {
    setIsUploadVisible(true);
  };

  const handleMouseLeave = () => {
    setIsUploadVisible(false);
  };

  //process uploaded image
  useEffect(() => {
    if (uploadedImageUrls.length > 0) {
      setChats((prevChats) => [
        // ...prevChats,
        {
          role: "user",
          content: `uploaded_image:${uploadedImageUrls[2]}-text:Generate HTML CSS JS from image`,
        },
      ]);
      setDataChats([
        // ...dataChats,
        {
          role: "user",
          content: `uploaded_image:${uploadedImageUrls[2]}-text:Generate HTML CSS JS from image`,
        },
      ]);
      setGenImage2Code(true);
      setUploadedImageUrls([]);
    }
  }, [uploadedImageUrls]);

  useEffect(() => {
    const genCodefromImage = async () => {
      setIsFetching(true);
      // console.log("dataChats::", dataChats?.[dataChats.length - 1]?.content);
      const content = dataChats[dataChats.length - 1]?.content;
      const dataImage = parseImageAndText(content);
      const messages = await buildMessages(dataImage.imageUrl);
      console.log("messages::", messages);
      try {
        const response = await fetch(
          validAPI
            ? "https://api.openai.com/v1/chat/completions"
            : process.env.REACT_APP_API_CHATBOX_V1,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${validAPI}`,
            },
            body: JSON.stringify({
              // model: "gpt-4o-mini",
              model: "gpt-3.5-turbo",
              stream: true,
              messages: messages,
            }),
          }
        );
        const readData = response.body
          .pipeThrough(new TextDecoderStream())
          .getReader();
        let aiRes = "";
        let finalResponse = "";
        if (validAPI) {
          //fetch from openai server
          finalResponse = await processStreamData(readData, setChats, "");
        } else {
          // fetch from code2d server
          while (true) {
            const { done, value } = await readData.read();
            if (done) break;
            aiRes += value;
            //show streaming chats
            setChats([
              // ...chats,
              { role: "user", content },
              { role: "assistant", content: aiRes },
            ]);
          }
        }
        //add height for asisstant
        addHeightForAnswerWrap();
        //Save chats
        setDataChats([
          ...dataChats,
          { role: "user", content },
          { role: "assistant", content: validAPI ? finalResponse : aiRes },
        ]);
      } catch (error) {
        console.error("Error in fetch:", error);
        setChats([
          // ...chats,
          { role: "user", content }, // Include user message
          {
            role: "assistant",
            content:
              "Sorry! Have some problems with chat bot service. Please try again!",
          },
        ]);
        setDataChats([
          ...dataChats,
          { role: "user", content },
          {
            role: "assistant",
            content:
              "Sorry! Have some problems with chat bot service. Please try again!",
          },
        ]);
      } finally {
        setIsFetching(false);
        setGenImage2Code(false);
      }
    };

    if (genImage2Code) {
      genCodefromImage();
    }
  }, [genImage2Code]);

  return (
    <div
      className="chatbox-container"
      style={{ zIndex }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`slide-box ${isChatBoxOpen ? "open" : ""}  ${
          isDarkModeChatBox ? "" : "light-mode"
        }`}
      >
        {/* Taskbar */}
        <div className="chatbox-taskbar">
          <div className="chatBox-rightIcon">
            <TbNewSection
              className={`chatBox-icon ${isFetching ? "disabled" : ""} `}
              id="newChat-icon"
              title="New chat"
              onClick={() => {
                setChats([]);
                setDataChats([]);
              }}
            />
            <div className="chatBox-icon">
              <UploadImageCloudinary
                setUploadedImageUrls={setUploadedImageUrls}
              />
              {/* <TbCloudUpload title="Upload image" /> */}
            </div>
          </div>
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
                    <pre className="api-key">{maskApiKey(validAPI)}</pre>
                    <MdOutlineChangeCircle
                      id="icon-change-api"
                      title="Change API"
                      onClick={() => setValidAPI("")}
                    />
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
          {dataChats.length > 0 ? (
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
                  <div
                    className="answer"
                    style={{
                      height: item.role === "user" ? "auto" : heightAdder,
                    }}
                  >
                    <ChatContent
                      text={getFormattedText(item.content)}
                    ></ChatContent>
                    {/* <Message content={item.content} /> */}
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
                    onClick={() => {
                      setInputValue(example);
                      document.getElementById("question-box-chats")?.focus();
                    }}
                  >
                    {example}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Input Questions */}
          <QuestionTextArea
            handleSendMessage={handleSendMessage}
            setInputValue={setInputValue}
            inputValue={inputValue}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(ChatBox);
