
export const detectKeyCombination = (event, keys) => {
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
