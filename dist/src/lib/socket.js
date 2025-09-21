"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        // Handle messages
        socket.on('message', (msg) => {
            // Echo: broadcast message only the client who send the message
            socket.emit('message', {
                text: `Echo: ${msg.text}`,
                senderId: 'system',
                timestamp: new Date().toISOString(),
            });
        });
        // Handle disconnect
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
        // Send welcome message
        socket.emit('message', {
            text: 'Welcome to WebSocket Echo Server!',
            senderId: 'system',
            timestamp: new Date().toISOString(),
        });
    });
};
exports.setupSocket = setupSocket;
