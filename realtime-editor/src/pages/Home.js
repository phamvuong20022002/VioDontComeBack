import React, { useState } from 'react';
import {v4 as uuidV4} from 'uuid';
import toast from 'react-hot-toast';
import {useNavigate, useLocation} from 'react-router-dom'

const Home = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [roomID, setRoomID] = useState(location.state?.roomId || '');
    const [username, setUsername] = useState('');

    // Create a new ROOM
    const createNewRoom = (e) =>{
        e.preventDefault();
        const id = uuidV4().toString();
        setRoomID(id);
        toast.success('Room created');
    }

    // Join a ROOM and Redirect to EditorPage (joinRoom Button)
    const joinRoom = () =>{
        // RoomID or Username is required
        if(!roomID || !username){
            toast.error('Please enter Room ID and Username');
            return;
        }

        // Redirect to EditorPage
        navigate(`/editor/${roomID}`,{
            state: {
                username,
            },
        })
    }

    // Handle Enter Keyboard events
    const handleInputEnter = (e) => {
        if(e.code === 'Enter') {
            joinRoom();
        }
    }

  return (
    <div className="homePageWrapper">
        <div className="formWrapper">
            <img src="/logoRE.png" alt="infinity-logo"/>
            <h4 className="PasteIDRoomLabel"> Paste invitation ROOM ID </h4>
            <div className="inputGroup">
                <input 
                    type="text" 
                    className="inputBox" 
                    placeholder="ROOMID" 
                    onChange={(e)=>{setRoomID(e.target.value)}}
                    value={roomID}
                    onKeyUp={handleInputEnter}
                />

                <input 
                    type="text" 
                    className="inputBox" 
                    placeholder="USERNAME"
                    onChange={(e)=>{setUsername(e.target.value)}}
                    value={username}
                    onKeyUp={handleInputEnter}
                />

                <button className="btn joinBtn" onClick={joinRoom}> Join </button>
                <span className="createInfo">
                        Do you want to create a new trunk? &nbsp;
                        <a onClick={createNewRoom} href="" className="NewRoom">New Room</a>
                </span>
            </div>
        </div>
        <footer>
            <h4>
                Chicken coder {' '}
                <a href="https://facebook.com/phamhihihi">Vuong Pham</a>
            </h4>
            <h5>
                Beta 1.1.0 on DEV
                released version date: 11/01/2024
            </h5>
        </footer>
    </div>
    
  )
}

export default Home