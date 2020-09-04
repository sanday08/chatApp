const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const app = express();
const path = require("path");
const formatMessage = require("./utils/messages");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require("./utils/users");
const server = http.createServer(app);
const io = socketio(server);

//set static folde
app.use(express.static(path.join(__dirname, "public")));
const botName = "ChatCord Bot";
//Run when Client Connected
io.on("connection", (socket) => {
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        //Wellcome current user(Only display current user)
        socket.emit("message", formatMessage(botName, "Welcome to ChatBoard"));
        //Broadcast when a user Connect (It's display all other user except current clint)
        socket.broadcast
            .to(user.room)
            .emit(
                "message",
                formatMessage(botName, `${user.username} has joined the chat`)
            );

        //Send user and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });
    //Listen for chatMessage
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg));
    });

    //Runs when client disconnect (It's display all of the users')
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        io.to(user.room).emit(
            "message",
            formatMessage(botName, `${user.username} has left the chat`)
        );
        //Send user and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log("Server started on port " + PORT);
});
