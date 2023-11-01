const express = require('express');
const app = express();
const http = require('http');
const {Server} = require('socket.io');
const Actions = require('./src/Actions');
const ACTIONS = require('./src/Actions');


const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};

function getAllConnectedClients(roomId){
    console.log('abc', io.sockets.adapter.rooms.get(roomId))
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId)=>{
        return{
            socketId,
            username: userSocketMap[socketId],
        };
    });
};

io.on('connection',(socket)=>{
    // console.log('socket connected', socket.id);

    socket.on(Actions.JOIN, ({roomId, username})=>{
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
});

const PORT = process.env.REACT_APP_PORT || 5000;
server.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
});
