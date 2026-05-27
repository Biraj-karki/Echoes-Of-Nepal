// backend/socket.js
// Shared Socket.io instance - import this in controllers to emit events
let io = null;

export function setIO(ioInstance) {
    io = ioInstance;
}

export function getIO() {
    return io;
}
