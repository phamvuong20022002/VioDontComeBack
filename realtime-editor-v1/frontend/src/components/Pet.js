import React, { useEffect, useState, useContext } from "react";
import "../Pet.css";
import ChatBox from "./ChatBox";
import { detectKeyCombination } from "../helpers/DetectKeyDown";
import { FUCTION_KEYS } from "../assets/variables_template";
import { EditorPageContext } from "../contexts/editorpage_contexts";
import { getSelectedText } from "../helpers/GetSelectedText";

const Pet = () => {

  const {isChatBoxOpen, setIsChatBoxOpen, setQuestion} = useContext(EditorPageContext);

  const toggleSlideBox = () => {
    setIsChatBoxOpen(!isChatBoxOpen);
  };


  useEffect(() => {
    //Drag Pet
    const draggableCircle = document.getElementById("draggable-circle");

    //Set up draggable for pet
    let isDragging = false;
    let offsetX, offsetY;

    const handleMouseDown = (e) => {
      isDragging = true;
      offsetX = e.clientX - draggableCircle.getBoundingClientRect().left;
      offsetY = e.clientY - draggableCircle.getBoundingClientRect().top;
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        const maxX = window.innerWidth - draggableCircle.offsetWidth;
        const maxY = window.innerHeight - draggableCircle.offsetHeight;

        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        // Ensure the circle stays within the screen boundaries
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));

        draggableCircle.style.left = `${x}px`;
        draggableCircle.style.top = `${y}px`;
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    draggableCircle.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    //Handle Click Pet Buttons
    const handleButtonClick = (e) => {
      e.preventDefault();
      if (e.target.closest("button").id === "chatbox") {
        toggleSlideBox();
      }
      if (e.target.closest("button").id === "templates") {
        console.log("templates");
      }
    };

    const buttons = document.querySelectorAll("#draggable-circle button");
    buttons.forEach((button) => {
      button.addEventListener("click", handleButtonClick);
    });

    //Hover on Pet
    let mouseEnterTimeout;
    const menuToggle = document.getElementById("menuToggle");
    const handleMouseEnter = () => {
      clearTimeout(mouseEnterTimeout);
      menuToggle.checked = true;
    };
    const handleMouseLeave = () => {
      mouseEnterTimeout = setTimeout(() => {
        menuToggle.checked = false;
      }, 3000);
    };

    draggableCircle.addEventListener("mouseenter", handleMouseEnter);
    draggableCircle.addEventListener("mouseleave", handleMouseLeave);

    // Cleanup the event listeners when the component unmounts
    return () => {
      draggableCircle.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      buttons.forEach((button) => {
        button.removeEventListener("click", handleButtonClick);
      });

      draggableCircle.removeEventListener("mouseenter", handleMouseEnter);
      draggableCircle.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isChatBoxOpen]);

  useEffect(() => {
    const callChatBot = () => {
      const question = getSelectedText();
      if(!question) { 
        setIsChatBoxOpen(false);
      }
      else {
        setIsChatBoxOpen(true);
      }
      setQuestion(question);
    }

    const HandleKeyDown = (event) =>{
      if (detectKeyCombination(event, [FUCTION_KEYS.CONTROL, FUCTION_KEYS.SHIFT, 'Q'])) {
        toggleSlideBox();
      }
      else if (detectKeyCombination(event, [FUCTION_KEYS.CONTROL, 'Q'])){
        callChatBot();
      }
    }
    document.addEventListener("keydown", HandleKeyDown);

    return () => {
      document.removeEventListener("keydown", HandleKeyDown);
    }
  }, [isChatBoxOpen]);

  return (
    <div>
      <ChatBox/>
      <div id="draggable-circle">
        <input className="menu-toggler" type="checkbox" id="menuToggle" />
        <div className="pet-container">
          <img
            className="icon rotate-infinite"
            src="/logoRe192.png"
            alt="Pet"
          ></img>
        </div>
        <ul>
          <li className="menu-item">
            <button id="templates">
              <img
                src="https://img.icons8.com/nolan/64/template.png"
                alt="templates"
              />
            </button>
          </li>
          <li className="menu-item">
            <button id="chatbox">
              <img
                src="https://img.icons8.com/nolan/64/chatgpt.png"
                alt="chatgpt"
              />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Pet;
