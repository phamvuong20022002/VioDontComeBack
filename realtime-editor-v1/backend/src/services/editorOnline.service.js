const ACTIONS = require('../consts/Actions');
const {ROOMSTATUS, ROOMOPTIONS} = require('../consts/Status');
const {JAVASCRIPT_DATA_INIT,
    TABID_INIT,
    TYPE_INIT,
    TITLE_INIT,
    REACT_DATA_INIT} = require('../consts/InitData');

//DB
// const global._userSocketMap = {};

// DB contains all tabs data
// Schema [{roomId, tabID, title, type, value, createdByUser}, {}.....]
// const global._tabsData = [];

// DB contains global._selectedTabs of each clients
// Schema [{roomId, socketId, data}, {}.....]
// const global._selectedTabs = [];

//DB contains saved rooms
// Schema [{roomId, savedDate, socketId}, {}.....]
// const savedRooms = [];

function getAllConnectedClients(roomId){
    return Array.from(global._io.sockets.adapter.rooms.get(roomId) || []).map((socketId)=>{
        return{
            socketId,
            username: global._userSocketMap[socketId],
        };
    });
};

function getAllTabs(roomId){
    return global._tabsData.filter(obj => {
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
    const userSelectedTabs = global._selectedTabs.filter(obj => {
        return (obj.roomId === roomId) && (obj.socketId === socketId);
    });
    if(userSelectedTabs.length > 1){
        throw new Error('Exists same items in global._selectedTabs!');
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
        global._selectedTabs.push(data);
    }
}

function getSavedRoom(roomId){
    const savedRoom = global._savedRooms.filter(obj => {
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

class EditorOnlineService {

    //connection socket
    connection(socket) {
        //JOIN
        socket.on(ACTIONS.JOIN, ({roomId, username})=>{
            global._userSocketMap[socket.id] = username;

            socket.join(roomId);
            const clients = getAllConnectedClients(roomId);
            clients.forEach(({socketId}) => {
                global._io.to(socketId).emit(ACTIONS.JOINED,{
                    clients,
                    username,
                    socketId: socket.id,
                })
            });
            console.log(clients);
        });

        //SYNC TAB
        socket.on(ACTIONS.SYNC_TABS, async({roomId, socketId, option}) => {
            let roomStatus = ROOMSTATUS.EXISTING;          
            if(getAllTabs(roomId).length === 0) {
                if(option === ROOMOPTIONS.JAVASCRIPT){
                    global._tabsData.push
                    (
                        {roomId, tabID: TABID_INIT.HTML, title: TITLE_INIT.HTML, type: TYPE_INIT.HTML, value: JAVASCRIPT_DATA_INIT.HTML, createdByUser: socketId /* socketID */ },
                        {roomId, tabID: TABID_INIT.CSS, title: TITLE_INIT.CSS, type: TYPE_INIT.CSS, value: JAVASCRIPT_DATA_INIT.CSS, createdByUser: socketId /* socketID */ },
                        {roomId, tabID: TABID_INIT.JAVASCRIPT, title: TITLE_INIT.JAVASCRIPT, type: TYPE_INIT.JAVASCRIPT, value: JAVASCRIPT_DATA_INIT.JAVASCRIPT, createdByUser: socketId /* socketID */ },
                    )
                }
                else if (option === ROOMOPTIONS.REACT){
                    global._tabsData.push
                    (
                        {roomId, tabID: TABID_INIT.HTML, title: TITLE_INIT.HTML, type: TYPE_INIT.HTML, value: REACT_DATA_INIT.HTML, createdByUser: socketId /* socketID */ },
                        {roomId, tabID: TABID_INIT.CSS, title: TITLE_INIT.CSS, type: TYPE_INIT.CSS, value: REACT_DATA_INIT.CSS, createdByUser: socketId /* socketID */ },
                        {roomId, tabID: TABID_INIT.JAVASCRIPT, title: TITLE_INIT.JAVASCRIPT, type: TYPE_INIT.BABEL, value: REACT_DATA_INIT.JAVASCRIPT, createdByUser: socketId /* socketID */ },
                    )
                }
                
                roomStatus = ROOMSTATUS.NEW
            }
            let tabs = getAllTabs(roomId);
            global._io.to(socketId).emit(ACTIONS.GET_TABS, {tabs, roomStatus});
            // socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {tabId, code});
        });

        // ADD TAB
        socket.on(ACTIONS.ADD_TAB, ({roomId, tab}) => {
            if(global._io.sockets.adapter.rooms.has(roomId)) {
                global._tabsData.push(tab);
            }
            const tabs = getAllTabs(roomId);
            const clients = getAllConnectedClients(roomId);
            clients.forEach(({socketId}) => {
                global._io.to(socketId).emit(ACTIONS.GET_TABS, {tabs});
            });
        });

        //REMOVE TAB
        socket.on(ACTIONS.REMOVE_TAB, ({roomId, tabId}) => {
            if(global._io.sockets.adapter.rooms.has(roomId)) {
                for (let i = 0; i < global._tabsData.length; i++) {
                    let el = global._tabsData[i];
                    if(el.roomId === roomId && el.tabID === tabId){
                        global._tabsData.splice(i, 1);
                    }
                }
            }
            const tabs = getAllTabs(roomId);
            const clients = getAllConnectedClients(roomId);
            clients.forEach(({socketId}) => {
                global._io.to(socketId).emit(ACTIONS.GET_TABS, {tabs});
            });
        });

        //RENAME TAB
        socket.on(ACTIONS.EDIT_TAB, ({roomId, tabId, newTabName, newType}) => {
            if(global._io.sockets.adapter.rooms.has(roomId)) {
                for (let i = 0; i < global._tabsData.length; i++) {
                    let el = global._tabsData[i];
                    if(el.roomId === roomId && el.tabID === tabId){
                        el.title = newTabName;
                        el.type = newType;
                    }
                }
            }
            const tabs = getAllTabs(roomId);
            const clients = getAllConnectedClients(roomId);
            clients.forEach(({socketId}) => {
                global._io.to(socketId).emit(ACTIONS.GET_TABS, {tabs});
            });
        })

        //GET TAB
        socket.on(ACTIONS.GET_TAB, ({roomId, tabId, socketId}) => {
            const tabs = getAllTabs(roomId);
            const tab = tabs.find(tab => (tab.tabID === tabId));
            global._io.to(socketId).emit(ACTIONS.GET_TAB, {tab});
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
            // global._io.to(roomId).emit(ACTIONS.CODE_CHANGE, {tabId, code});
        });

        //SYNC CODE
        socket.on(ACTIONS.SYNC_CODE, ({roomId, tabId, socketId}) => {
        
            // SEND CODE
            let tab = getAllTabs(roomId).find(tab => (tab.tabID === tabId) && (tab.roomId === roomId));
            global._io.to(socketId).emit(ACTIONS.CODE_CHANGE, {tabId, code: tab.value});
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
                global._io.to(socketId).emit(ACTIONS.RECEIVE_CODE, { data: dataResponse});
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
                global._io.to(socketId).emit(ACTIONS.GET_SELECTEDTABS, { data: responseData.data});
            }
        })

        //USER SAVE ROOM
        socket.on(ACTIONS.SAVE_ROOM, ({roomId, socketId, save}) => {
            if(save){
                if(global._io.sockets.adapter.rooms.has(roomId)){
                    try {
                        //SAVE ROOM
                        const savedRoom = getSavedRoom(roomId);
                        if(savedRoom){
                            savedRoom.socketId = socketId;
                            savedRoom.savedDate = new Date();
                        }else{
                            global._savedRooms.push({roomId, savedDate: new Date() ,socketId});
                        }
                        //SAVE SUCCESSFULLY
                        global._io.to(socketId).emit(ACTIONS.SAVE_ROOM, {user: global._userSocketMap[socket.id], status: '201'});
                    } catch (error) {
                        console.log(error);
                        global._io.to(socketId).emit(ACTIONS.SAVE_ROOM, {user: global._userSocketMap[socket.id], status:'error', message: 'Have some problem when saving!' });
                    }
                }
                else{
                    global._io.to(socketId).emit(ACTIONS.SAVE_ROOM, {user: global._userSocketMap[socket.id], status:'error', message: 'Your room is not found!' });
                }
            }
            else{
                //REMOVE ALL ITEMS OF THE ROOM
                removeArrayByRoomId(global._tabsData, roomId);
                removeArrayByRoomId(global._selectedTabs, roomId);
                removeArrayByRoomId(global._savedRooms, roomId);

                //SEND STATUS
                global._io.to(socketId).emit(ACTIONS.SAVE_ROOM, {user: global._userSocketMap[socket.id], status:'200', message: 'removed' });
            }
        })

        //USER LEAVE
        socket.on(ACTIONS.LEAVE, ({roomId}) => {
            const clients = getAllConnectedClients(roomId);
            let isLastClient = 0;
            if(clients.length < 2) {
                isLastClient = 1;
            }
            global._io.to(socket.id).emit(ACTIONS.LEAVE, {isLastClient});
        })

        //DISCONNECTING
        socket.on('disconnecting', () =>{
            const rooms = [...socket.rooms];
            rooms.forEach((roomId) => {
                socket.in(roomId).emit(ACTIONS.DISCONNECTED,{
                    socketId: socket.id,
                    username: global._userSocketMap[socket.id],
                });
            });
            delete global._userSocketMap[socket.id];
        });
    }
}

module.exports = new EditorOnlineService();