
import React, {useState, useEffect} from 'react';
import "./style.css";; // Import your CSS file

const SelectInput = ({ tabs, selectedTabs, handleTabChange }) => {

  const handleCheckboxChange = (tabID) => {
    handleTabChange(tabID); // Call the handleTabChange function from ParentComponent
  };

  return (
    <div>
      <div className="container-select">
        <form className="form-select">
          {/* Display checkboxes for each tab */}
          {tabs.map((tab, index) => (
            <div className="form-group" key={index}>
              <input
                type="checkbox"
                id={`tab-${index}`}
                checked={selectedTabs.includes(tab.tabID)}
                onChange={() => handleCheckboxChange(tab.tabID)}
              />
              <label className="label-checkbox" htmlFor={`tab-${index}`}>
                <span className="checkbox">
                  <span className="check"></span>
                </span>
                {tab.title}
              </label>
            </div>
          ))}
        </form>
      </div>
    </div>
  );
};

export default SelectInput;




