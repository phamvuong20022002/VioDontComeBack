const express = require('express');
const app = express();
const http = require('http');
const {Server} = require('socket.io');
const ACTIONS = require('./src/Actions');
const path = require('path');


const server = http.createServer(app);
const io = new Server(server);


app.use(express.static('build'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const userSocketMap = {};

// DB contains all tabs data
// Schema [{roomId, tabID, title, type, value, createdByUser}, {}.....]
const tabsData = [];

// DB contains selectedTabs of each clients
// Schema [{roomId, socketId, data}, {}.....]
const selectedTabs = [];

//DB contains saved rooms
// Schema [{roomId, savedDate, socketId}, {}.....]
const savedRooms = [];


function getAllConnectedClients(roomId){
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId)=>{
        return{
            socketId,
            username: userSocketMap[socketId],
        };
    });
};

function getAllTabs(roomId){
    return tabsData.filter(obj => {
        return obj.roomId === roomId;
    })
};

function removeArrayByRoomId(arr, roomId) {
    if(arr.length === 0) return;
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].roomId === roomId) {
            arr.splice(i, 1);
        }
    }
}


function getSelectedTabs(roomId, socketId){
    const userSelectedTabs = selectedTabs.filter(obj => {
        return (obj.roomId === roomId) && (obj.socketId === socketId);
    });
    if(userSelectedTabs.length > 1){
        throw new Error('Exists same items in selectedTabs!');
    }
    if(userSelectedTabs.length > 0){
        return userSelectedTabs[0];
    }else{
        return null;
    }
}

function addSelectedTabs(data) {
    let userSeletedTabs = getSelectedTabs(data.roomId, data.socketId)
    if(userSeletedTabs){  
        userSeletedTabs.data = data.data;
    }
    else{
        selectedTabs.push(data);
    }
}

function getSavedRoom(roomId){
    const savedRoom = savedRooms.filter(obj => {
        return (obj.roomId === roomId);
    });
    if(savedRoom.length > 1){
        throw new Error('Exists same items in SavedRooms!');
    }
    if(savedRoom.length > 0){
        return savedRoom[0];
    }else{
        return null;
    }
}

io.on('connection',(socket)=>{
    // console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({roomId, username})=>{
        userSocketMap[socket.id] = username;

        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({socketId}) => {
            io.to(socketId).emit(ACTIONS.JOINED,{
                clients,
                username,
                socketId: socket.id,
            })
        });
        console.log(clients);
    });

    //SYNC TAB
    socket.on(ACTIONS.SYNC_TABS, ({roomId, socketId}) => {
        if(getAllTabs(roomId).length === 0){
            tabsData.push
            (
                {roomId, tabID: '10', title: 'index', type: 'xml', value: `<h1 class="welcome">Hello World</h1>`, createdByUser: socketId /* socketID */ },
                {roomId, tabID: '20', title: 'index', type: 'css', value: `body{\n background: white; \n} \n.welcome{ color: red; text-align: center;}`, createdByUser: socketId /* socketID */ },
                {roomId, tabID: '30', title: 'index', type: 'javascript', value: `let welcomeClass = document.getElementsByClassName('welcome')[0];\nif(welcomeClass){\n    welcomeClass.style.color = 'green';\n}`, createdByUser: socketId /* socketID */ },
            )
        }
        let tabs = getAllTabs(roomId);
        io.to(socketId).emit(ACTIONS.GET_TABS, {tabs});
        // socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {tabId, code});
    });

    // ADD TAB
    socket.on(ACTIONS.ADD_TAB, ({roomId, tab}) => {
        if(io.sockets.adapter.rooms.has(roomId)) {
            tabsData.push(tab);
        }
        const tabs = getAllTabs(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({socketId}) => {
            io.to(socketId).emit(ACTIONS.GET_TABS, {tabs});
        });
    });

    //REMOVE TAB
    socket.on(ACTIONS.REMOVE_TAB, ({roomId, tabId}) => {
        if(io.sockets.adapter.rooms.has(roomId)) {
            for (let i = 0; i < tabsData.length; i++) {
                let el = tabsData[i];
                if(el.roomId === roomId && el.tabID === tabId){
                    tabsData.splice(i, 1);
                }
            }
        }
        const tabs = getAllTabs(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({socketId}) => {
            io.to(socketId).emit(ACTIONS.GET_TABS, {tabs});
        });
    });

    //RENAME TAB
    socket.on(ACTIONS.RENAME_TAB, ({roomId, tabId, newTabName}) => {
        if(io.sockets.adapter.rooms.has(roomId)) {
            for (let i = 0; i < tabsData.length; i++) {
                let el = tabsData[i];
                if(el.roomId === roomId && el.tabID === tabId){
                    el.title = newTabName;
                }
            }
        }
        const tabs = getAllTabs(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({socketId}) => {
            io.to(socketId).emit(ACTIONS.GET_TABS, {tabs});
        });
    })

    //GET TAB
    socket.on(ACTIONS.GET_TAB, ({roomId, tabId, socketId}) => {
        const tabs = getAllTabs(roomId);
        const tab = tabs.find(tab => (tab.tabID === tabId));
        io.to(socketId).emit(ACTIONS.GET_TAB, {tab});
    });

    //CODE CHANGE
    socket.on(ACTIONS.CODE_CHANGE, ({roomId, tabId, code}) => {
         //SAVE CODE
         if(code !== null && code.length !== 0) {
            let tabs = getAllTabs(roomId);
            let tab = tabs.find(tab => (tab.tabID === tabId) && (tab.roomId === roomId));

            // IF TAB !== UNDEFINED
            if(tab !== undefined) {
                tab.value = code
            }
        }
        //SEND CODE
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {tabId, code});
    });

    //SYNC CODE
    socket.on(ACTIONS.SYNC_CODE, ({roomId, tabId, socketId}) => {
       
        // SEND CODE
        let tab = getAllTabs(roomId).find(tab => (tab.tabID === tabId) && (tab.roomId === roomId));
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, {tabId, code: tab.value});
    });

    //REQUEST-RECEIVE CODE 
    socket.on(ACTIONS.REQUEST_CODE, ({roomId, data, socketId}) => {
        let dataResponse = [];
        const tabs = getAllTabs(roomId);
        
        data.forEach(tabId => {
            let tab = tabs.find(tab => (tab.tabID === tabId));
            dataResponse.push(tab);
        })
        //RESPONSE AN ARRAY
        if(dataResponse.length > 0){
            io.to(socketId).emit(ACTIONS.RECEIVE_CODE, { data: dataResponse});
        }
    });

    //SAVE SELECTED TABS
    socket.on(ACTIONS.SAVE_SELECTEDTABS, ({roomId, socketId, data}) => {
        // ADD SELECTED TABS
        if(roomId !== undefined && socketId !== undefined){
            addSelectedTabs({roomId, socketId, data});
        }
        // RESPONSE SELECTED TABS ARRAY
        const responseData = getSelectedTabs(roomId, socketId);
        if(responseData){
            io.to(socketId).emit(ACTIONS.GET_SELECTEDTABS, { data: responseData.data});
        }
    })

    //USER SAVE ROOM
    socket.on(ACTIONS.SAVE_ROOM, ({roomId, socketId, save}) => {
        if(save){
            if(io.sockets.adapter.rooms.has(roomId)){
                try {
                    //SAVE ROOM
                    const savedRoom = getSavedRoom(roomId);
                    if(savedRoom){
                        savedRoom.socketId = socketId;
                        savedRoom.savedDate = new Date();
                    }else{
                        savedRooms.push({roomId, savedDate: new Date() ,socketId});
                    }
                    //SAVE SUCCESSFULLY
                    io.to(socketId).emit(ACTIONS.SAVE_ROOM, {user: userSocketMap[socket.id], status: '201'});
                } catch (error) {
                    console.log(error);
                    io.to(socketId).emit(ACTIONS.SAVE_ROOM, {user: userSocketMap[socket.id], status:'error', message: 'Have some problem when saving!' });
                }
            }
            else{
                io.to(socketId).emit(ACTIONS.SAVE_ROOM, {user: userSocketMap[socket.id], status:'error', message: 'Your room is not found!' });
            }
        }
        else{
            //REMOVE ALL ITEMS OF THE ROOM
            removeArrayByRoomId(tabsData, roomId);
            removeArrayByRoomId(selectedTabs, roomId);
            removeArrayByRoomId(savedRooms, roomId);

            //SEND STATUS
            io.to(socketId).emit(ACTIONS.SAVE_ROOM, {user: userSocketMap[socket.id], status:'200', message: 'removed' });
        }
    })

    //USER LEAVE
    socket.on(ACTIONS.LEAVE, ({roomId}) => {
        const clients = getAllConnectedClients(roomId);
        let isLastClient = 0;
        if(clients.length < 2) {
            isLastClient = 1;
        }
        io.to(socket.id).emit(ACTIONS.LEAVE, {isLastClient});
    })

    //DISCONNECTING
    socket.on('disconnecting', () =>{
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED,{
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
    });
});

const PORT = process.env.REACT_APP_PORT || 5000;
server.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
});
