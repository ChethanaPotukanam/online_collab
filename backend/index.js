import express from "express";
import http from "http";
import { Server } from "socket.io";
const app = express();
import path from "path";
import axios from "axios";
const server = http.createServer(app);

const url = "https://online-colab.onrender.com";
const interval = 30000;

function reloadWebsite(){
    axios.get(url)
    .then((response)=>{
        console.log("Website reloaded");
    })
    .catch((error)=>{
        console.error(`Error : ${error.message}`);
    })
}

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});


const rooms = new Map();

io.on("connection", (socket) => {
    console.log("a user connected" , socket.id);

    let currentRoom = null;
    let currentUser = null;

    socket.on("join",({roomId , userName})=>{
        if(currentRoom){
            socket.leave(currentRoom);
            rooms.get(currentRoom).delete(currentUser);
            io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
        }
        currentRoom = roomId;
        currentUser = userName;

        socket.join(roomId);

        if(!rooms.has(roomId)){
            rooms.set(roomId , new Set());
        }

        rooms.get(roomId).add(userName);

        io.to(roomId).emit("userJoined", Array.from(rooms.get(roomId)));
    })
    socket.on("codeChange",({roomId , code})=>{
        socket.to(roomId).emit("codeUpdate" , code);
    })

    socket.on("leaveRoom",()=>{
        if(currentRoom && currentUser){
            rooms.get(currentRoom).delete(currentUser);
            io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
            socket.leave(currentRoom);
            currentRoom = null;
            currentUser = null;
        }
    })
    socket.on("typing",({roomId,userName})=>{
        socket.to(roomId).emit("userTyping",userName);
    })

    socket.on("languageChange",({roomId,language})=>{
        io.to(roomId).emit("languageUpdate",language);
    })

    socket.on("compileCode",async({code , roomId , language , version})=>{
        if(rooms.has(roomId)){
            const room = rooms.get(roomId);
            const response = await axios.post("https://emkc.org/api/v2/piston/execute",{
                language,
                version,
                files:[
                    {
                        content : code
                    }
                ]
            })
            room.output = response.data.run.output;
            io.to(roomId).emit("codeResponse",response.data);
        }
    })

    socket.on("disconnect",()=>{
        if(currentRoom && currentUser){
            rooms.get(currentRoom).delete(currentUser);
            io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
        }
    })

})

const PORT = process.env.PORT || 3002;

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend" , "dist" , "index.html"));
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})