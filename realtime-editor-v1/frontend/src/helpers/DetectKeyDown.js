
const FUCTION_KEYS = {
  Control: "ctrlKey",
  Shift: "shiftKey",
  Alt: "altKey",
};

function detectKeyCombination(event, keys) {
  // Check if all specified keys are pressed
  const keysPressed = keys.every((key) => {
    if (key.toLowerCase() === "ctrl") {
      return event.ctrlKey;
    } else if (key.toLowerCase() === "shift") {
      return event.shiftKey;
    } else {
      return event.key.toUpperCase() === key.toUpperCase();
    }
  });

  return keysPressed;
}

export const detectKeyboard = (combineKeys, callbackFunction) => {
  function detectKeyCombination(event, keys) {
    // Check if all specified keys are pressed
    const keysPressed = keys.every((key) => {
      if (key.toLowerCase() === "ctrl") {
        return event.ctrlKey;
      } else if (key.toLowerCase() === "shift") {
        return event.shiftKey;
      } else {
        return event.key.toUpperCase() === key.toUpperCase();
      }
    });

    return keysPressed;
  }

  document.addEventListener("keydown", function (event) {
    if (detectKeyCombination(event, combineKeys)) {
      callbackFunction();
      // You can add your own code or function here
    }
  });
};
