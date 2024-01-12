import React from 'react';
import { VscChromeClose } from "react-icons/vsc";


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

    return (
        <div className="tabContainer">
            <div className="btn tabBtn" id={tabContent.tab.tabID}>
                <img src={"/" + typeToTail(tabContent.tab.type).img} alt="tabLogo"></img>
                <span className="tabTitle">
                    {tabContent.tab.title + "." + typeToTail(tabContent.tab.type).tail}
                </span>
                <span className="closeTabBtn"><VscChromeClose id="closeTab-icon" /></span>
            </div>
        </div>
    );
};

export default Tab