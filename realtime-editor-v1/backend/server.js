const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
const compression = require('compression');
const {Server} = require('socket.io');
require('dotenv').config();
const EditorOnlineService = require('./src/services/editorOnline.service')
const path = require('path');
const OpenAI = require('openai');

// Middlewares
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: '*'
}));
app.use(express.json());

//create server
const server = http.createServer(app);
const io = new Server(server);
const openai = new OpenAI({ //create OpenAI 
    apiKey: process.env.OPENAI_API_KEY
});

//init data
global.__dirname = path.dirname(__dirname);

//global storage
global._io = io;
global._userSocketMap = {};
global._tabsData = [];
global._selectedTabs = [];
global._savedRooms = [];


//Route
app.use(require('./src/routes/editorOnline.route'));
app.use(require('./src/routes/chatbot.route'));

//Services
global._io.on('connection', EditorOnlineService.connection);
global._openai = openai;

const PORT = process.env.PORT || 5000;
server.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
});
