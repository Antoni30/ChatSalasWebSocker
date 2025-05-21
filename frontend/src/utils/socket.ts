// socket.ts
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://10.40.14.75:8080");

export default socket;
