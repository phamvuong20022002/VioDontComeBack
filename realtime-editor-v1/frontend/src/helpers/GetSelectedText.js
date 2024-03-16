// Function to get the selected text
export const getSelectedText = (editorRef) => {
  var selectedText = "";
  if (editorRef?.current) {
    const selection = editorRef?.current.getSelection();
    selectedText = editorRef?.current.getModel().getValueInRange(selection);
  }
  else {
    selectedText = window.getSelection()?.toString();
  }
  return selectedText.trim();
};
