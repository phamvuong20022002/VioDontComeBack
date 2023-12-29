//refce 
import '../PreviewPage.css'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
// import { useSharedState } from '../helpers/SharedStateContext';
const html = 
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
const PreviewPage = () => {
    const { roomId } = useParams();
    const [Code, setCode] = useState(html);

    // const { sharedData } = useSharedState();
    

    return (
        <div>
            <iframe
            id="prevew-page"
            srcDoc={Code}
            title="output"
            sandbox="allow-same-origin allow-scripts"
            width="100%"
            height="100%"
            frameBorder="0"
            ></iframe>
        </div>
    );
}

export default PreviewPage