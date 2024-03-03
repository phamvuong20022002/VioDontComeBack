import React, { memo, useEffect, useState } from 'react';
import {v4 as uuidV4} from 'uuid';
import toast from 'react-hot-toast';
import {useNavigate, useLocation} from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [roomID, setRoomID] = useState(location.state?.roomId || '');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);

    // Create a new ROOM
    const createNewRoom = (e) =>{
        e.preventDefault();
        const id = uuidV4().toString();
        setRoomID(id);
        //focus username input
        document.getElementById('inputUsername')?.focus();
        toast.success('Room created');
    }

    // Join a ROOM and Redirect to EditorPage (joinRoom Button)
    const joinRoom = () =>{
        if(!username) {
            toast.error('Please enter Username!');
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
            if(!roomID ){
                document.getElementById('inputRoomID')?.focus();
                // RoomID or Username is required
                toast.error('Please enter Room ID!');
                return;
            }
            else{
                if(!username){
                    document.getElementById('inputUsername')?.focus();
                    return;
                }
            }
            joinRoom();
        }
    }

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 50);
    })

    useEffect(() => {
        if(location.state?.roomId) {
            document.getElementById('inputUsername')?.focus();
        }
    })

  return (
    <div>
        { loading ? (<LoadingSpinner />):
            (<div className="homePageWrapper">
                <div className="formWrapper">
                    <img src="/logoRE.png" alt="infinity-logo"/>
                    <h4 className="PasteIDRoomLabel"> Paste invitation or new a ROOM ID </h4>
                    <div className="inputGroup">
                        <input 
                            id="inputRoomID"
                            type="text" 
                            className="inputBox" 
                            placeholder="ROOMID" 
                            onChange={(e)=>{setRoomID(e.target.value)}}
                            value={roomID}
                            onKeyUp={handleInputEnter}
                            autoFocus={true}
                        />

                        <input 
                            id="inputUsername"
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
            </div>)
        }
    </div>
  )
}

export default memo(Home)