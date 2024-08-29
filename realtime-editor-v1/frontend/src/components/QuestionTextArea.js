import React, { useState, useContext, useRef, useEffect, memo } from "react";
import { FaRegStopCircle } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { EditorPageContext } from "../contexts/editorpage_contexts";

const QuestionTextArea = ({ handleSendMessage, setInputValue, inputValue }) => {
  const { isChatBoxOpen, question, isFetching } = useContext(EditorPageContext);
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
  const handleKeyPress = async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSendMessage();
    }
    return;
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
            id="question-box-chats"
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

export default memo(QuestionTextArea);
