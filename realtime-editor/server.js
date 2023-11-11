const express = require('express');
const app = express();
const http = require('http');
const {Server} = require('socket.io');
const ACTIONS = require('./src/Actions');
const path = require('path');


const server = http.createServer(app);
const io = new Server(server);


// app.use(express.static('build'));
// app.use((req, res, next) => {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

const userSocketMap = {};
const tabsData = [];

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
                {roomId, tabID: '10', title: 'index', type: 'xml', value: `<h1 classname='welcome'>Hello<h1>`, createdByUser: socketId /* socketID */ },
                {roomId, tabID: '20', title: 'index', type: 'css', value: `.welcome{ color: red}`, createdByUser: socketId /* socketID */ },
                {roomId, tabID: '30', title: 'index', type: 'javascript', value: `document.getElementByClassname('welcome').style.color = 'green'`, createdByUser: socketId /* socketID */ },
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

    //GET TAB
    socket.on(ACTIONS.GET_TAB, ({roomId, tabId, socketId}) => {
        const tabs = getAllTabs(roomId);
        const tab = tabs.find(tab => (tab.tabID === tabId));
        io.to(socketId).emit(ACTIONS.GET_TAB, {tab});
    });

    //CODE CHANGE
    socket.on(ACTIONS.CODE_CHANGE, ({roomId, tabId, code}) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {tabId, code});
    });

    //SYNC CODE
    socket.on(ACTIONS.SYNC_CODE, ({roomId, saveTabId, tabId, code, socketId}) => {
        //SAVE CODE
        
        if(code !== null && code.length !== 0) {
            let tabs = getAllTabs(roomId);
            let tab = tabs.find(tab => (tab.tabID === saveTabId) && (tab.roomId === roomId));

            // IF TAB !== UNDEFINED
            if(tab !== undefined) {
                tab.value = code
            }
        }
        // SEND CODE
        let tab = getAllTabs(roomId).find(tab => (tab.tabID === tabId) && (tab.roomId === roomId));
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, {tabId, code: tab.value});
    });

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
        socket.leave();
    });
});

const PORT = process.env.REACT_APP_PORT || 5000;
server.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
});
