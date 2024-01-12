const express = require('express');
const app = express();
const http = require('http');
const {Server} = require('socket.io');
require('dotenv').config();
const EditorOnlineService = require('./src/services/editorOnline.service')


const server = http.createServer(app);
const io = new Server(server);

//global storage
global._io = io;
global._userSocketMap = {};
global._tabsData = [];
global._selectedTabs = [];
global._savedRooms = [];


//Route
app.use(require('./src/routes/editorOnline.route'));

//Services
global._io.on('connection', EditorOnlineService.connection);

const PORT = process.env.PORT || 5000;
server.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
});
