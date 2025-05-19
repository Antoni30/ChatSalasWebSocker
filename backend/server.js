import express from "express";
import { Server } from "socket.io";
import cors from "cors" 
import http from "http";
import dotenv from "dotenv"
import { crearSala } from "./handlers/crearSala.js";
import { unirSala } from "./handlers/unirSala.js";
import { mensaje } from "./handlers/mesaje.js";
import { desconectar } from "./handlers/desconectar.js";
import { listarSalas } from "./handlers/listarSalas.js";

dotenv.config()
const PORT = process.env.PORT || 8080;


const appExpress = express();
appExpress.use(cors({origin:'*'}));

const server = http.createServer(appExpress);

const io = new Server(server,{
    cors:{
        origin:'*'
    }
})

const salas = {};

io.on('connection',(socket)=>{
    console.log('Cliente conectado:', socket.id);
    const emitirSalasActualizadas = () => {
    io.emit("salasDisponibles", Object.keys(salas));
  };
    listarSalas(socket,salas);
    crearSala(socket,salas,io,emitirSalasActualizadas);
    unirSala(socket,salas,io,emitirSalasActualizadas);
    mensaje(socket,io);
    desconectar(socket,salas,io,emitirSalasActualizadas);
    
  socket.on('error', (error) => {
    console.error('Error del socket:', error);
  });

})

server.listen(PORT,()=>{
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
})



