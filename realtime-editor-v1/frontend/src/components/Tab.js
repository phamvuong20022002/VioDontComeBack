import React, {memo} from 'react';
import { VscChromeClose } from "react-icons/vsc";


const Tab = (tabContent) => {

    const typeToTail = (type) =>{
        if(type === 'xml'){
            return {tail: 'html',img: 'HtmlIcon.png'};
        }
        else if(type === 'javascript' || type === 'babel'){
            return {tail: 'js',img: 'JsIcon.png'};
        }
        else {
            return {tail: 'css',img: 'CssIcon.png'};
        }
    }

    return (
        <div className="tabContainer">
            <div className="btn tabBtn" id={tabContent.tab.tabID} title={tabContent.tab.title + '/' + tabContent.tab.type} datatype={tabContent.tab.type}>
                <img src={"/" + typeToTail(tabContent.tab.type).img} alt="tabLogo"></img>
                <span className="tabTitle">
                    {tabContent.tab.title + "." + typeToTail(tabContent.tab.type).tail}
                </span>
                <span className="closeTabBtn"><VscChromeClose id="closeTab-icon" title="Close tab" /></span>
            </div>
        </div>
    );
};

export default memo(Tab);