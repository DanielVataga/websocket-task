"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const port = 8080;
const wss = new ws_1.WebSocketServer({ port });
wss.on("connection", (ws) => {
    console.log("Client connected");
    ws.on("message", (message) => {
        console.log(`Received: ${message}`);
        ws.send(`Echo: ${message}`);
    });
    ws.on("close", () => {
        console.log("Client disconnected");
    });
});
console.log("WebSocket server is running on ws://localhost:8080");
