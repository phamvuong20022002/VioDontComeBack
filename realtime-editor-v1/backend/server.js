const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const helmet = require("helmet");
const compression = require("compression");
const { Server } = require("socket.io");
require("dotenv").config();
const EditorOnlineService = require("./src/services/editorOnline.service");
const path = require("path");
const OpenAI = require("openai");
const { getStreamingCompletion } = require("./src/modules/openai/index.js");
const { error } = require("console");

// Middlewares
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

//create server
const server = http.createServer(app);
const io = new Server(server);
const openai = new OpenAI({
  //create OpenAI
  apiKey: process.env.OPENAI_API_KEY,
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
app.use(require("./src/routes/editorOnline.route"));
app.use(require("./src/routes/chatbot.route"));

//contingency API Chat bot (for testing purposes)
app.post("/aiCompletion", async (req, res) => {
  const { messages } = req.body;
  const stream = await getStreamingCompletion(messages);
  for await (const part of stream) {
    // here express will stream the response
    res.write(part.choices[0]?.delta.content || "");
    process.stdout.write(JSON.stringify(part.choices[0].delta) + "\n");
  }
  // here express sends the closing/done/end signal for the stream consumer
  res.end();
});

//Services
global._io.on("connection", EditorOnlineService.connection);
global._openai = openai;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
