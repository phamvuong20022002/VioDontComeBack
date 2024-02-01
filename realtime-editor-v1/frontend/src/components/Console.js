import React, { useEffect, useState, useRef, memo } from "react"; // Import scrollToTop function
import "../Console.css";

const Console = () => {
  const [consoleValues, setConsoleValues] = useState([]);

  useEffect(() => {
    const receiveLogs = (event) => {
      if (event.data.type === "reload") {
        setConsoleValues([]);
        return;
      }

      if (event.data && event.data.type === "error") {
        setConsoleValues((prevLogs) => [
          {
            type: "error",
            message: event.data.message,
            filename: event.data.filename,
            lineno: event.data.lineno,
          },
          ...prevLogs,
        ]);
      }

      if (event.data && event.data.type === "log") {
        setConsoleValues((prevLogs) => [
          { type: "log", message: event.data.message, time: event.data.time },
          ...prevLogs,
        ]);
      }

      if (event.data && event.data.type === "warn") {
        setConsoleValues((prevLogs) => [
          { type: "warn", message: event.data.message, time: event.data.time },
          ...prevLogs,
        ]);
      }
    };

    window.addEventListener("message", receiveLogs);

    return () => {
      window.removeEventListener("message", receiveLogs);
    };
  }, []);

  return (
    <div className="console-box" id="console-box">
      {consoleValues.map((value, index) => (
        <div key={index}>
          <div className="consoleLine">
            <code>
              <span className={value.type}>{value.message}</span>
            </code>
            <code>
              <span className={"lineInfo " + value.type}>
                {value.type !== "error" && <>{"time: " + value.time}</>}
                {value.type === "error" && (
                  <>{value.filename + " : " + value.lineno}</>
                )}
              </span>
            </code>
          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(Console);
