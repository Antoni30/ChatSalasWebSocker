import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { crearSala } from "./handlers/crearSala.js";
import { unirSala } from "./handlers/unirSala.js";
import { mensaje } from "./handlers/mesaje.js";
import { listarSalas } from "./handlers/listarSalas.js";
import { manejoSalidaUsuario } from './handlers/manejoSalida.js';
import { emitirEstadoSala } from "./handlers/emitirEstadoSala.js";


dotenv.config();
const PORT = process.env.PORT || 8080;

const appExpress = express();
appExpress.use(cors({ origin: "*" }));

const server = http.createServer(appExpress);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const salas = {};
const ipsConectadas = new Map();

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);
  const emitirSalasActualizadas = () => {
    io.emit("salasDisponibles", Object.keys(salas));
  };
  listarSalas(socket, salas);
  crearSala(socket, salas, io, emitirSalasActualizadas,ipsConectadas);
  unirSala(socket, salas, io, emitirSalasActualizadas,ipsConectadas);
  mensaje(socket, io);
  manejoSalidaUsuario(socket, salas, io, emitirSalasActualizadas,ipsConectadas);

  socket.on("pedirEstadoSala", (nombreSala) => {
    emitirEstadoSala(nombreSala, io, salas);
  });

  socket.on("error", (error) => {
    console.error("Error del socket:", error);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
