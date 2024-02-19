import React, { useState, useContext, useRef, useEffect } from "react";
import { FaRegStopCircle } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { EditorPageContext } from "../contexts/editorpage_contexts";

const QuestionTextArea = ({ setChats, chats, setInputValue, inputValue }) => {
  const { isChatBoxOpen, setQuestion, question, isFetching, setIsFetching } =
    useContext(EditorPageContext);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

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
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  const handleClickAbort = () => {
    clearTimeout(timeoutRef.current);

    // No fetch request in progress, clear input and focus
    if (!isFetching) {
      setInputValue("");
      inputRef.current.focus();
    }
  };

  return (
    <div className="questions-box">
      <div className="question-wrap">
        <div className="question">
          <textarea
            rows="100"
            cols="100"
            style={{ resize: "none" }}
            className="question-input"
            placeholder="Type your message here..."
            onChange={handleInputChange}
            autoFocus={isChatBoxOpen}
            onKeyPress={handleKeyPress}
            value={inputValue}
            ref={inputRef}
          ></textarea>
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
  );
};

export default QuestionTextArea;
