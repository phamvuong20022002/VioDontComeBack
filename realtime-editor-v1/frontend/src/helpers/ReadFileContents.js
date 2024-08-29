import { mimeMapping } from "../assets/code_types/code.types";

export const handleFileChange = (e) => {
  return new Promise(async (resolve, reject) => {
    const file = e.target.files[0];

    if (file) {
      try {
        const fileContents = await readFileContents(file);
        resolve(fileContents);
      } catch (error) {
        reject(error);
      }
    } else {
      reject(new Error("No file selected"));
    }
  });
};

export const readFileContents = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const contents = event.target.result;
      resolve(contents);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
};

export const getFileTypeFromMimeType = (mimeType) => {
  const lowerCaseMimeType = mimeType.toLowerCase();
  return mimeMapping[lowerCaseMimeType] || "unknown"; // Default to 'unknown' if not found
};

export const getFileNameWithoutExtension = (fileName) => {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex !== -1) {
    return fileName.slice(0, lastDotIndex);
  }
  return fileName; // If no dot (.) is found, return the entire file name
};

export const extractAIAnswerContent = (line) => {
  console.log("abcabc::::", line, "\n\n 123");
  if (line.startsWith("data:")) {
    const jsonStr = line.replace("data:", "").trim();
    try {
      const json = JSON.parse(jsonStr);
      return json.choices?.[0]?.delta?.content || null;
    } catch (error) {
      console.error("Failed to parse JSON:", error);
      return null;
    }
  }
  return null;
};
