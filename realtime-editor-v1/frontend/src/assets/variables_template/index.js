export const scriptConsoleTemplate = 
`
<script>
// Function to pass console logs and errors to the parent window
const passLogsAndErrorsToParent = () => {
  const originalConsole = window.console;

  window.addEventListener('error', (event) => {
    const { message, filename, lineno, colno, error } = event;
    const errorMessage = error ? error.message : message;

    // Output errors to the browser console
    originalConsole.error(errorMessage, { filename, lineno, colno, error });

    // Pass errors to the parent window
    window.parent.postMessage({
      type: 'error',
      message: errorMessage,
      filename,
      lineno,
      colno,
      error: serializeError(error), // Serialize the error object
    }, '*');
  });

  window.console = {
    log: function (...args) {
      originalConsole.log(...args); // Output logs to the browser console
      
      // Pass logs to the parent window
      window.parent.postMessage({ 
        type: 'log', 
        message: serializeArgs(args),
        time: formatDate(new Date())
      }, '*');
    },
    warn: function (...args) {
      // Output warnings to the browser console
      originalConsole.warn(...args);

      // Pass warnings to the parent window
      window.parent.postMessage({ type: 'warn', message: serializeArgs(args) }, '*');
    },
    // You can add more methods like info, debug, etc., if needed
  };
};

// Helper function to convert date to "hh:mm:ss - dd/mm/yy"
function formatDate(date) {
  // Extract components
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var day = date.getDate();
  var month = date.getMonth() + 1; // Month is zero-based, so add 1
  var year = date.getFullYear() % 100; // Get last two digits of the year

  // Pad single-digit numbers with leading zeros
  var formattedTime = padZero(hours) + ':' + padZero(minutes) + ':' + padZero(seconds);
  var formattedDate = padZero(day) + '/' + padZero(month) + '/' + padZero(year);

  return formattedTime + ' - ' + formattedDate;
}

// Helper function to pad single-digit numbers with leading zero
function padZero(num) {
  return num < 10 ? '0' + num : num;
}

// Helper function to serialize error objects
const serializeError = (error) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return null;
};

// Helper function to serialize various argument types
const serializeArgs = (args) => {
  return args.map(arg => {
    if (typeof arg === 'object') {
      return serializeObject(arg); // Serialize objects
    } 
    else {
      return arg; // Pass other types as-is
    }
  });
};

// Helper function to serialize objects, including special handling for HTMLCollection
const serializeObject = (obj) => {
  if (obj instanceof HTMLCollection) {
    return Array.from(obj).map(serializeObject); // Serialize HTMLCollection as an array of serialized elements
  } 
  else if (obj instanceof HTMLElement) {
    return obj.outerHTML; // Serialize HTMLElement to outerHTML
  } 
  else {
    return JSON.stringify(obj); // Serialize other objects to JSON
  }
};

// Call the function to start capturing console logs and errors
passLogsAndErrorsToParent();
</script>
`


export const scriptDisableConsoleTemplate = `
<script>
  // Override console methods to prevent logging
  const disableConsole = () => {
    const disableLog = () => {}; // Empty function to replace console methods
    console.log = disableLog;
    console.error = disableLog;
    console.warn = disableLog;
    console.info = disableLog;
    console.debug = disableLog;
    console.trace = disableLog;
  };

  // Call the function to disable console logging
  disableConsole();
</script>
`

export const previewHtmlTemplate = 
    `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
    body {background-color: powderblue;}
    h1   {color: blue;}
    p    {color: red;}
    </style>
    </head>
    <body>

    <h1>This is a heading</h1>
    <p>This is a paragraph.</p>

    </body>
    </html>
    `

export const initTabIDsTemplate = ['10', '20', '30'];

export const initTabsTemplate = [
    {tabID: '10', title: 'index.html'},
    {tabID: '20', title: 'index.css'},
    {tabID: '30', title: 'index.js'},
  ];

export const TIMEOUT = 1000