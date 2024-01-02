//refce 
import '../PreviewPage.css'
import React, { useEffect, useState } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { previewHtmlTemplate } from '../assets/variables_template';
import ACTIONS from '../Actions';
import { getCodeWithSocket, generateCode} from '../helpers/CodeSelectedTabs';
import toast from 'react-hot-toast';

const PreviewPage = () => {
    const { roomId } = useParams();
    const [Code, setCode] = useState(previewHtmlTemplate);
    const location = useLocation();
    const [listen, setListen] = useState(true);
    const reactNavigator = useNavigate();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const socketId = decodeURIComponent(searchParams.get('id'));
        const socket = window.opener?.socketInNewWindow || null;

        // function get code have tabIds in selectedTabs array
        const getCodeFromSelectedTabs = async (selectedTabs) =>{
            try {
                //get code form server
                const data = await getCodeWithSocket(socket, { roomId, data: selectedTabs, socketId: socketId});
                //generate code for previewFrame 
                const htmlContent = generateCode(data, false, false);
                // rerender code
                setCode(htmlContent);
            } catch (error) {
                console.error(error);
            }
        }

        if(socket === null){
            toast.error(`Connection to server is not established with this socket id`);
            // Redirect to HomePage
            reactNavigator('/', {
                state: {
                roomId,
                },
            })
            return; 
        }
        // Listen for the connection open event
        socket.addEventListener(ACTIONS.GET_SELECTEDTABS, (event) => {
            getCodeFromSelectedTabs(event.data);
        });

    }, []);

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