// socket.ts
import { io, Socket } from "socket.io-client";

const socket: Socket = io("back-chat-production-ea5d.up.railway.app");

export default socket;
