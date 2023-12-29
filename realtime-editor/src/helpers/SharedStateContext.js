// SharedStateContext.js
import React, { createContext, useContext, useState } from 'react';

const SharedStateContext = createContext();

export const SharedStateProvider = ({ children }) => {
  const [sharedData, setSharedData] = useState(null);

  const setSharedDataValue = (data) => {
    setSharedData(data);
  };

  return (
    <SharedStateContext.Provider value={{ sharedData, setSharedData: setSharedDataValue }}>
      {children}
    </SharedStateContext.Provider>
  );
};

export const useSharedState = () => {
  const context = useContext(SharedStateContext);
  if (!context) {
    throw new Error('useSharedState must be used within a SharedStateProvider');
  }
  return context;
};

