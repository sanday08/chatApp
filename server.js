const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const app = express();
const path = require("path");
const formatMessage = require("./utils/messages");
const server = http.createServer(app);
const io = socketio(server);

//set static folde
app.use(express.static(path.join(__dirname, "public")));
const botName = "ChatCord Bot";
//Run when Client Connected
io.on("connection", (socket) => {
    //Wellcome current user(Only display current user)
    socket.emit("message", formatMessage(botName, "Welcome to ChatBoard"));
    //Broadcast when a user Connect (It's display all other user except current clint)
    socket.broadcast.emit(
        "message",
        formatMessage(botName, "A user has joined the chat")
    );
    //Runs when client disconnect (It's display all of the users')
    socket.on("disconnect", () => {
        io.emit("message", formatMessage(botName, "A user has left the chat"));
    });

    //Listen for chatMessage
    socket.on("chatMessage", (msg) => {
        io.emit("message", formatMessage("User", msg));
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log("Server started on port " + PORT);
});
