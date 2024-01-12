import React from 'react';
import '../LoadingSpinner.css'; // Import your CSS file


const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      {/* Replace 'your-logo.png' with the path to your logo */}
      <img src="/loadingRe_512_2.gif" alt="Logo" className="logo-loading"/>
      {/* <div className="spinner"></div> */}
    </div>
  );
};

export default LoadingSpinner;
