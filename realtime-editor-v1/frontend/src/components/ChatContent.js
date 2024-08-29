import React, { Fragment } from "react";

export const ChatContent = ({ text, children }) => {
  return (
    <div className="response__content-box">
      <pre className="response__text">
        {/* {text.map((content, index) => (
          <Fragment key={index}>{content}</Fragment>
        ))} */}
        {text}
      </pre>
      {children}
    </div>
  );
};
