import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import { VscChromeClose } from "react-icons/vsc";
import Editor from './Editor';

const Tab = (tabContent) => {

    const typeToTail = (type) =>{
        if(type === 'xml'){
            return {tail: 'html',img: 'HtmlIcon.png'};
        }
        else if(type === 'javascript'){
            return {tail: 'js',img: 'JsIcon.png'};
        }
        else {
            return {tail: 'css',img: 'CssIcon.png'};
        }
    }
    
    function unhideEditor(e) {
        // Remove active styles
        let tabContainers = document.getElementsByClassName('tabContainer');

        Array.from(tabContainers).forEach(function (element) {
            let activeTab = element.querySelector('.active');
            if(activeTab) {
                activeTab.classList.remove('active');
                return;
            }
        });

        // Add active styles
        const currentTab = e.target.closest('div');
        currentTab.classList.add('active');
        
        //Unhide Editor
        // classname/id = <Editor &quot;10&quot;> => 'Editor' + '&quot;' + tadID + '&quot;'
        const tabID = 'Editor "' + currentTab.getAttribute('id') + '"';
        // document.getElementsByClassName(tabID)[0].hidden = false;
    }
    return (
        <div className="tabContainer">
            <div className="btn tabBtn" id={tabContent.tab.tabID} onClick={unhideEditor}>
                <img src={"/" + typeToTail(tabContent.tab.type).img} alt="tabLogo"></img>
                <span className="tabTitle">
                    {tabContent.tab.title + "." + typeToTail(tabContent.tab.type).tail}
                </span>
                <span className="closeTabBtn"><VscChromeClose /></span>
            </div>

            <Editor key={tabContent.tab.tabID} tab={tabContent.tab}/>
        </div>
    );
};

export default Tab