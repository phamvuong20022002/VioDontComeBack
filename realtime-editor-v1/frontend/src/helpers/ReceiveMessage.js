export const setupConsoleListener = (setConsoleValues) => {
    const receiveLogs = (event) => {

      if(event.data.type === 'reload') {
        setConsoleValues([]);
        return;
      }

      if (event.data && event.data.type === 'error') {
        setConsoleValues((prevLogs) => [
          ...prevLogs,
          { type: 'error', message: event.data.message, filename: event.data.filename, lineno: event.data.lineno },
        ]);
      }
  
      if (event.data && event.data.type === 'log') {
        setConsoleValues((prevLogs) => [...prevLogs, { type: 'log', message: event.data.message, time: event.data.time }]);
      }
  
      if (event.data && event.data.type === 'warn') {
        setConsoleValues((prevLogs) => [...prevLogs, { type: 'warn', message: event.data.message, time: event.data.time }]);
      }
    };
  
    window.addEventListener('message', receiveLogs);
  
    return () => {
      window.removeEventListener('message', receiveLogs);
    };
  };