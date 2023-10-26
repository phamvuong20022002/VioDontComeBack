import React, { useState } from 'react';
import {v4 as uuidV4} from 'uuid';

const Home = () => {

    const [roomID, setRoomID] = useState('');
    const [Username, setUsername] = useState('');

    const createNewRoom = (e) =>{
        e.preventDefault();
        const id = uuidV4().toString();
        setRoomID(id);
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
                />

                <input 
                    type="text" 
                    className="inputBox" 
                    placeholder="USERNAME"
                    onChange={(e)=>{setUsername(e.target.value)}}
                    value={Username}
                />

                <button className="btn joinBtn"> Join </button>
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
        </footer>
    </div>
    
  )
}

export default Home