// socket.ts
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://192.168.1.31:8080");

export default socket;
