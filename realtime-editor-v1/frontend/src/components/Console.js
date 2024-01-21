import React, { useEffect, useState, useRef, memo } from "react";
import { setupConsoleListener } from "../helpers/ReceiveMessage";
import { scrollToBottom } from "../helpers/Scroll";
import "../Console.css";

const scrollId = "console-box";

const Console = () => {
  const [consoleValues, setConsoleValues] = useState([]);
  // Redefine console for showing in console window
  useEffect(() => {

    // Event listener to receive console logs from the iframe
    setupConsoleListener(setConsoleValues);
  },[]);
  useEffect(() => {
    //Add Scrollbar for Console window
    scrollToBottom(scrollId);
  });
  return (
    <div className="console-box" id="console-box">
      {consoleValues.map((value, index) => (
        <div key={index}>
          <div className="consoleLine">
            <span className={value.type}>{value.message}</span>
            <span className={"lineInfo " + value.type}>
              {value.type !== "error" && <>{"time: " + value.time}</>}
              {value.type === "error" && (
                <>{value.filename + " : " + value.lineno}</>
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(Console);
