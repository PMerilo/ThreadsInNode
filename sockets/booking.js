module.exports = (io, socket) => {
    const test = (payload) => {
        socket.to(payload.recipient).emit('notification', payload)
    }

    socket.on("default", test);
}