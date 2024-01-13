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
      reject(new Error('No file selected'));
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
  const mimeMapping = {
    'text/javascript': 'js',
    'application/javascript': 'js',
    'text/html': 'xml',
    'text/css': 'css',
    // Add more MIME types and their corresponding file types as needed
  };

  const lowerCaseMimeType = mimeType.toLowerCase();
  return mimeMapping[lowerCaseMimeType] || 'unknown'; // Default to 'unknown' if not found
};

export const getFileNameWithoutExtension = (fileName) => {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex !== -1) {
    return fileName.slice(0, lastDotIndex);
  }
  return fileName; // If no dot (.) is found, return the entire file name
};