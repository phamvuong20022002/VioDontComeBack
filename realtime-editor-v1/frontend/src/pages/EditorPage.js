import React, { useState, useEffect, useRef, useContext, memo } from "react";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import ReactDOM from "react-dom/client";
import Client from "../components/Client";
import Tab from "../components/Tab";
// import Editor from "../components/Editor";
import MonacoEditor from "../components/Editor_v2.js";
import Output from "../components/Output";
import { AiOutlinePlus } from "react-icons/ai";
import { initSocket } from "../socket";
import ACTIONS from "../Actions";
import toast from "react-hot-toast";
import { v4 as uuidV4 } from "uuid";
import {
  templateSaveCode,
  templateCloseTab,
  templateSaveRoomError,
  templateSaveRoomSuccess,
} from "../assets/alerts/index.js";
import { CodeTypes } from "../assets/code_types/code.types.js";
import Split from "react-split";
import VanillaContextMenu from "vanilla-context-menu";
import { getStatusSaveRoom } from "../helpers/GetStatusSaveRoom";
import { isLastClient } from "../helpers/GetLastClient.js";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  readFileContents,
  getFileTypeFromMimeType,
  getFileNameWithoutExtension,
} from "../helpers/ReadFileContents.js";
import { MAX_FILE_SIZE_MB } from "../assets/variables_template/index.js";
// import Modal from '../assets/modal/Language.modal.js';
import Modal from "../assets/modal/Language.modal.2.js";
import { ROOMSTATUS, ROOMOPTIONS } from "../Status.js";
import { toastNewTab } from "../assets/toasts/create_new_tab.toast.js";
import Console from "../components/Console.js";
import { PiBroomFill } from "react-icons/pi";
import { LuPanelBottomClose } from "react-icons/lu";
import Pet from "../components/Pet.js";
import { useMonaco } from "@monaco-editor/react";
import { EditorPageProvider, EditorPageContext } from "../contexts/editorpage_contexts/index.js";
import { AppContext } from "../contexts/main_context/index.js";

const EditorPage = () => {
  const {refreshOutput, setRefreshOutput, userId, userName} = useContext(AppContext)
  const socketRef = useRef(null);
  const codeRef = useRef("");
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  const [clients, setClients] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [tab, setTab] = useState("");
  const [loading, setLoading] = useState(true);
  const [fileContents, setFileContents] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [newlyChangedTab, setNewlyChangedTab] = useState(null);
  const consoleContainerRef = useRef(null);
  const [themeData, setThemeData] = useState("vs-dark");
  const monaco = useMonaco();
  const editorRef = useRef(null);

  // var editorSpace = null;
  const editorSpace = useRef(null);

  useEffect(()=>{
    console.log("State userId::", userId);
    console.log("State userName::", userName);


    if(!userId || !userName){
      reactNavigator("/");
      return;
    }
  }, [userId, userName, socketRef?.current]);

  /*Create Socket for Sending and Listening Actions */
  useEffect(() => {
    // Create socket connection
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(err) {
        console.log("socket error: ", err);
        toast.error("Socket connection failed. Try again later 😥");
        reactNavigator("/");
      }

      // Send JOIN sign
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: userName || "anonymous",//location.state?.username || "anonymous",
      });

      // Listening for JOINED
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== userName) {
            toast.success(`${username} joined room`);
          }
          setClients(clients);

          //SYNC TABS
          socketRef.current.emit(ACTIONS.SYNC_TABS, {
            socketId,
            roomId,
            option: selectedOption,
          });
        }
      );

      // Listening for GETTING TABS
      socketRef.current.on(ACTIONS.GET_TABS, ({ tabs, roomStatus }) => {
        // Wait for load tabs and roomStatus;
        setTimeout(() => {
          if (roomStatus === ROOMSTATUS.NEW) {
            setShowModal(true);
          } else {
            setShowModal(false);
            setTabs(tabs);
          }

          //turn off loading
          setLoading(false);
        }, 200);
      });

      // Listening for DISCONNECTED
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast(`${username} left the room.`, {
          icon: "🏃‍♂️",
        });
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });

      return socketRef.current;
    };

    // Fix miss username when join room by a link
    if (!userName) {
      toast.error("Please enter an USERNAME and try to join again!");
      // Redirect to HomePage
      reactNavigator("/", {
        state: {
          roomId,
        },
      });
      return;
    } else {
      // Init Editor Page
      init();
    }
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOIN);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, [loading]);

  /*----FUNCTION AREA----*/
  /*Get TabID and Code from CodeRef */
  function getTabIDAndCode(data) {
    let tabId = data.substring(0, data.indexOf("|"));
    let code = data.substring(data.indexOf("|") + 1);
    return { tabId, code };
  }
  /*Render Editor function */
  function renderEditor(tab) {
    if (editorSpace.current !== null) {
      editorSpace.current.unmount();
    }
    editorSpace.current = ReactDOM.createRoot(
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

    editorSpace.current.render(
      // <div className="monaco-editor"></div>

      <MonacoEditor
        socketRef={socketRef}
        roomId={roomId}
        tab={tab}
        onCodeChange={(code) => {
          setRefreshOutput(true);
          codeRef.current = code;
        }}
        themeData={themeData}
        editorRef={editorRef}
      />
    );

    setRefreshOutput(true);
  }
  /*Request Tad Data for Rendering Editor */
  async function showEditor(socketRef, tabId) {
    /* Show Editor */
    await socketRef.current.emit(ACTIONS.GET_TAB, {
      roomId,
      tabId,
      socketId: socketRef.current.id,
    });

    await socketRef.current.on(ACTIONS.GET_TAB, ({ tab }) => {
      renderEditor(tab);
      // setTab(tab);
    });
  }
  /* Active tab function */
  function activeTab(e = null, tab = null) {
    let currentTab = null;
    if (tab) {
      currentTab = tab;
    } else if (e) {
      currentTab = e.target.closest("div");
    } else {
      return;
    }

    if (currentTab) {
      const currentTabClassname = currentTab.className;
      // Don't add active style for actived tab
      if (currentTabClassname.search("active") !== -1) {
        return;
      }
    } else {
      return;
    }

    // Remove active style on tab
    let tabContainers = document.getElementsByClassName("tabContainer");
    Array.from(tabContainers).forEach(function (element) {
      let activedTab = element.querySelector(".active");
      if (activedTab) {
        activedTab.classList.remove("active");
        return;
      }
    });

    // Add active style
    if (currentTab.className === "btn tabBtn") {
      currentTab.classList.add("active");
    }
  }
  /* Add Handle Click On `editorSidebar` class*/
  function handleClick(e) {
    if (e?.target?.id === "fileInput") {
      return;
    }
    //click  another element on editorSidebar
    if (
      e.target.className === "editorSidebar" ||
      e.target.tagName === "path" ||
      e.target.className === "tabContainer"
    ) {
      return;
    }
    // click create button
    else if (
      e.target.className === "btn createTabBtn" ||
      e.target.id === "createTab-icon"
    ) {
      // create a new tab
      createNewTab();
    }
    //  click close button
    else if (
      e.target.id === "closeTab-icon" ||
      e.target.className === "closeTabBtn"
    ) {
      //close the tab
      closeTab(e);
    } else {
      //add active on tab
      activeTab(e);

      /*find current tabID and tab data*/
      const tabID = e.target.closest("div").id;
      showEditor(socketRef, tabID);
    }
  }
  /*Create New Tab */
  async function createNewTab() {
    //Create new tab
    let tab = {
      roomId,
      tabID: uuidV4().toString(),
      value: `new tab`,
      createdByUser: socketRef.current.id /* socketID */,
    };
    const result = await toastNewTab(tab);
    setNewlyChangedTab(tab.tabID);

    //Send new tab to server
    if (result) {
      /*Send ADD_TAB*/
      socketRef.current.emit(ACTIONS.ADD_TAB, {
        roomId,
        tab,
      });
    }
  }
  /*Close and Remove tab data on server */
  async function closeTab(e = null, tabID = null) {
    // alert are you sure
    const result = await templateCloseTab();
    if (!result.isConfirmed) {
      // User clicked "Cancel"
      return;
    }

    // Close tab in event
    if (e) {
      if (
        e.target.id === "closeTab-icon" ||
        e.target.className === "closeTabBtn"
      ) {
        // remove tab on server backend
        const closeTabId = e.target.closest("div").id;
        /*Send REMOVE_TAB*/
        socketRef.current.emit(ACTIONS.REMOVE_TAB, {
          roomId,
          tabId: closeTabId,
        });
      }
    }

    // Close tab with tabID
    if (tabID) {
      /*Send REMOVE_TAB*/
      socketRef.current.emit(ACTIONS.REMOVE_TAB, {
        roomId,
        tabId: tabID,
      });
    }

    //Rerender Editor
    setNewlyChangedTab(null);
  }
  /*Coppy ID room button */
  async function coppyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID has been coppied to your clipboard");
    } catch (error) {
      toast.error("Couldn not copy the Room ID");
    }
  }
  /* Leave room button */
  async function leaveRoom() {
    //check is last client?
    const isLastClient_ = await isLastClient(socketRef.current, roomId);
    if (!isLastClient_) {
      //return Home page
      reactNavigator("/");
      return;
    }
    // popup save code for last client
    const result = await templateSaveCode();
    if (result.isDismissed) {
      return;
    }
    //Save code
    else if (result.isConfirmed) {
      const data = await getStatusSaveRoom(socketRef.current, roomId, true);
      if (data.status === "201") {
        await templateSaveRoomSuccess(reactNavigator, roomId);
      } else if (data.status === "error") {
        await templateSaveRoomError(data.message);
      }
      return;
    }
    //Don't Save code
    else {
      const data = await getStatusSaveRoom(socketRef.current, roomId, false);
      if (data.status === "200") {
        reactNavigator("/");
      } else {
        await templateSaveRoomError(
          "Have some problems during clean code, Please try again!"
        );
        reactNavigator("/");
      }
      return;
    }
  }
  /* Handle File Changed */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      // Check if the file size is within the acceptable range
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`File size exceeds the limit of ${MAX_FILE_SIZE_MB} MB`);
        return;
      }
      //chek if type of file is not html, css or javascript
      if (getFileTypeFromMimeType(file.type) === "unknown") {
        toast.error(`Unknown file type ${file.type}`);
        return;
      }
      try {
        // Read file contents
        const fileContents = await readFileContents(file);
        const fileDetails = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          contents: fileContents,
        };

        //Create New tab
        let tab = {
          roomId,
          tabID: uuidV4().toString(),
          title: getFileNameWithoutExtension(fileDetails.name),
          type: getFileTypeFromMimeType(fileDetails.type),
          value: fileDetails.contents,
          createdByUser: socketRef.current.id /* socketID */,
        };

        console.log("uploading file::", tab);

        /*Send ADD_TAB*/
        await socketRef.current.emit(ACTIONS.ADD_TAB, {
          roomId,
          tab,
        });
      } catch (error) {
        toast.error(`Error reading file!`);
        return;
      }
    }
  };
  /* Handle Clieck Option from popup */
  const handleOptionClick = (option) => {
    // Handle the option click
    setSelectedOption(option);
    setShowModal(false); // Close the modal
    setLoading(true); // For demonstration purposes, setting loading to true after selecting an option
  };
  /*Show Editor for first tab and created tab */
  function showEditorFirstTab(socketRef, tabID = null) {
    let tab = null;
    if (tabID) {
      //get class of the newly created tab
      tab = document.getElementById(tabID);
    } else {
      //get first tab
      tab = document.getElementsByClassName("tabBtn")?.[0];
    }
    //active and show
    if (tab) {
      activeTab(null, tab);
      showEditor(socketRef, tab.id);
    }
  }
  /*Post message 'clean' to terminal*/
  const handleRightIcon = (e) => {
    const idBtn = e.target?.closest('.outputIcon').id;
    if(idBtn === 'clean-teminal'){
      window.parent.postMessage(
        {
          type: "reload",
        },
        "*"
      );
    }
    else if (idBtn === 'close-teminal'){
      const consoleContainer = document.getElementById('console-container');
      const leftPanel = document.getElementById('editor-space');
      leftPanel.style.height = 'calc(90% - 1.5px)';
      consoleContainer.style.height = 'calc(10% - 1.5px)';
    }
  };

  /*----USEEFFECT AREA----*/
  /*Add Event Listener for editor side bar  */
  useEffect(() => {
    const sidebarElement = document.getElementsByClassName("editorSidebar")[0];

    if (sidebarElement) {
      // create Editor Component when click on tab
      sidebarElement.addEventListener("click", handleClick);
    }

    return () => {
      if (sidebarElement) {
        sidebarElement.removeEventListener("click", handleClick);
      }
    };
  }, [loading]);
  /*Add right click menu for tab */
  useEffect(() => {
    const myMenu = [
      {
        label: "Edit",
        callback: async (e) => {
          // Get TabID
          let tabID = null;
          if (e.target.id) {
            tabID = e.target.id;
          } else {
            tabID = e.target.closest(".tabBtn").id;
          }
          //get current tab data
          let curentTabName = getFileNameWithoutExtension(
            e.target.closest(".tabBtn").querySelector(".tabTitle").innerText
          );
          let currentTabType = e.target
            .closest(".tabBtn")
            .getAttribute("datatype");
          // Create toast for input new tab name
          toast((t) => (
            <div>
              <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                Edit your tab
              </span>
              <br />
              <input
                id="newTabName"
                type="text"
                placeholder={curentTabName || "Enter new tab name"}
              />

              <select name="Type:" id="chooseType">
                <option value={null} title={currentTabType}>
                  Current Type
                </option>
                <option value="xml" title="xml">
                  HTML
                </option>
                <option value="javascript" title="javascript">
                  JS
                </option>
                <option value="babel" title="babel">
                  JS for React
                </option>
                <option value="css" title="css">
                  CSS
                </option>
              </select>

              <button
                onClick={() => {
                  let newTabName =
                    document.getElementById("newTabName").value ||
                    curentTabName;
                  let newType =
                    document.getElementById("chooseType").value ===
                    "Current Type"
                      ? currentTabType
                      : document.getElementById("chooseType").value;
                  if (tabID) {
                    let editData = {
                      roomId,
                      tabId: tabID,
                      newTabName,
                      newType,
                    };
                    /*Send RENAME_TAB*/
                    socketRef.current.emit(ACTIONS.EDIT_TAB, editData);
                    //close toast
                    toast.dismiss(t.id);
                    //set show Editor
                    setNewlyChangedTab(tabID);
                  } else {
                    document.getElementById("newTabName").placeholder =
                      "Please enter a tab name!";
                    document.getElementById("newTabName").style =
                      "border: 2px solid red;";
                  }
                }}
              >
                Submit
              </button>
            </div>
          ));
        },
      },
      "hr", // separator
      {
        label: "Close",
        callback: async (e) => {
          // Get TabID
          let tabID = null;
          if (e.target.id && e.target.id !== "closeTab-icon") {
            tabID = e.target.id;
          } else {
            tabID = e.target.closest(".tabBtn").id;
          }

          // Send remove tab info
          if (tabID) {
            await closeTab(null, tabID);
          } else {
            await closeTab(e, null);
          }
        },
      },
    ];

    let myTabs = document.getElementsByClassName("btn tabBtn");
    for (let i = 0; i < myTabs.length; i++) {
      new VanillaContextMenu({
        scope: myTabs[i],
        menuItems: myMenu,
        customClass: "tabMenu",
      });
    }
  }, [loading, tabs]);
  /*Add right click menu for create tab button and editor sidebar */
  useEffect(() => {
    const myMenu = [
      {
        label: "Create new tab",
        callback: async (e) => {
          createNewTab();
        },
      },
      "hr",
      {
        label: "Upload from device",
        callback: async (e) => {
          // Trigger click on hidden file input
          const fileInput = document.getElementById("fileInput");
          if (fileInput) {
            fileInput.click();
          }
        },
      },
    ];

    let createbtn = document.getElementsByClassName("btn createTabBtn");
    let editorSidebar = document.getElementsByClassName("editorSidebar");

    if (createbtn.length && editorSidebar.length) {
      //create right click menu for createTabBtn
      new VanillaContextMenu({
        scope: createbtn[0],
        menuItems: myMenu,
        customClass: "tabMenu",
      });
      //create right click menu for editorSidebar
      new VanillaContextMenu({
        scope: editorSidebar[0],
        menuItems: myMenu,
        customClass: "tabMenu",
      });
    }
  }, [loading, tabs]);

  /*Show Edit for first loading*/
  useEffect(() => {
    if (newlyChangedTab) {
      showEditorFirstTab(socketRef, newlyChangedTab);
    } else {
      showEditorFirstTab(socketRef);
    }
  }, [tabs]);
  /*Load Monaco Editor themes */
  useEffect(() => {
    const fetchTheme = async () => {
      const response = await fetch("/themes/Cobalt2.json"); // Update the path accordingly
      const data = await response.json();
      if (data) {
        monaco?.editor.defineTheme("customTheme", data);
        setThemeData("customTheme");
      }
    };
    fetchTheme();
  }, [monaco]);
  /*Refresh Ouput */
  useEffect(()=>{
    if(refreshOutput){
      setRefreshOutput(false);
    }
  },[refreshOutput === true])
  
  return (
    <EditorPageProvider>
    <div>
      {/* Modal for choosing code template */}
      {showModal && (
        <Modal
          onOptionClick={handleOptionClick}
          onClose={() => {
            //return home page if close button is clicked
            reactNavigator("/");
          }}
        />
      )}

      {!showModal && loading ? (
        //wait for data loading to complete
        <LoadingSpinner />
      ) : (
        <div>
          {/* call my pet */}
          <Pet editorRef={editorRef}/>
          {/* Editor Page Main  */}
          <div className="mainWrap">
            {/* Conected Users */}
            <div className="aside">
              <div className="asideInner">
                <div className="logo">
                  <img
                    className="logoEditor"
                    src="/logoRe.png"
                    alt="logo"
                  ></img>
                </div>
                <h3>Connected</h3>
                <div className="clientsList">
                  {clients.map((client, index) => (
                    <Client
                    key={index}
                    username={client.username}
                    clientID={client.socketID}
                    />
                    ))}
                </div>
              </div>
              <button className="btn shareBtn" onClick={coppyRoomId}>
                Share RoomID
              </button>
              <button className="btn leaveBtn" onClick={leaveRoom}>
                Leave
              </button>
            </div>

            {/* WorkSpace include: Tab, Editor, Console, Ouput Component*/}
            <div className="editorWrap">
              {/* Side Bar - Tab Component */}
              <div className="editorSidebar">
                {tabs.map((tab) => (
                  <Tab key={tab.tabID} tab={tab} />
                  ))}
                <div className="tagCreate">
                  <button className="btn createTabBtn">
                    <AiOutlinePlus id="createTab-icon" title="Create new tab" />
                  </button>
                </div>
                <input
                  id="fileInput"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  />
              </div>

              {/* Content -  Split-horizontal(Split-vertical(Editor, Console), Ouput)*/}
              <Split
                className="editorContent"
                sizes={[60, 40]}
                // minSize={250}
                gutterSize={3}
                >
                <Split
                  direction="vertical"
                  sizes={[100, 0]}
                  // minSize={10}
                  // maxSize={500}
                  gutterSize={3}
                  cursor="row-resize"
                  id="left-panel"
                  >
                  {/* Editor */}
                  <div className="editorSpace" id="editor-space">
                  </div>
                  
                  {/* Console */}
                  <div
                    className="console-container"
                    id="console-container"
                    ref={consoleContainerRef}
                    >
                    <div className="consoleTaskbar">
                      <span className="consoleTitle">Console</span>
                      <div className="rightIcon" onClick={handleRightIcon}>
                        <PiBroomFill
                          className="outputIcon"
                          title="Clean terminal"
                          id="clean-teminal"
                          />
                        <LuPanelBottomClose
                          className="outputIcon"
                          title="Clean terminal"
                          id="close-teminal"
                          />
                      </div>
                    </div>
                    <Console />
                  </div>
                </Split>

                {/* Output */}
                <div className="outputSpace" id="right-panel">
                  {socketRef.current !== null && (
                    <Output socketRef={socketRef} roomId={roomId}/>
                    )}
                </div>
              </Split>
            </div>

          </div>
        </div>
      )}
    </div>
  </EditorPageProvider>
  );
};

export default memo(EditorPage);
