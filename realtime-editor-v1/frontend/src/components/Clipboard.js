import React, { useState, useEffect } from 'react';
import { BsClipboard2Fill, BsCheckCircleFill } from "react-icons/bs";
import classes from './Clipboard.module.css';

export const Clipboard = ({ language, text }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleClipboard = async (event) => {
    event.preventDefault();

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch (error) {
      console.error('Can not write to clipboard', error);
    }
  };

  useEffect(() => {
    if (!isCopied) return;
    const timerId = setTimeout(() => setIsCopied(false), 3000);

    return () => clearTimeout(timerId);
  }, [isCopied]);

  return (
    <div className={classes.clipboard}>
      <span className={classes.clipboard__language}>{language}</span>
      <button className={classes.clipboard__button} onClick={handleClipboard} aria-label="copy">
        <BsClipboard2Fill className={`${classes['svg-copy']} ${isCopied ? classes.hide : ''}`} />
        <BsCheckCircleFill className={`${classes['svg-checkmark']} ${isCopied ? classes.active : ''}`} />
      </button>
    </div>
  );
};
