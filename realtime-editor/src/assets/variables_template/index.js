export const scriptConsoleTemplate = `
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
      window.parent.postMessage({ type: 'error', message: errorMessage, filename, lineno, colno, error }, '*');
    });

    window.console = {
      log: function(message) {
        originalConsole.log(message); // Output logs to the browser console
        // Pass logs to the parent window
        window.parent.postMessage({ type: 'log', message }, '*');
      },
      warn: function(message) {
        // Output warnings to the browser console
        originalConsole.warn(message);

        // Pass warnings to the parent window
        window.parent.postMessage({ type: 'warn', message}, '*');
      },
      // You can add more methods like info, debug, etc., if needed
    };
  };

  // Call the function to start capturing console logs and errors
  passLogsAndErrorsToParent();
</script>`;



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

export const initTabIDsTemplate = ['10', '20', '30'];

export const initTabsTemplate = [
    {tabID: '10', title: 'index.html'},
    {tabID: '20', title: 'index.css'},
    {tabID: '30', title: 'index.js'},
  ];