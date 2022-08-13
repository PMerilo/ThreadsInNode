module.exports = (io, socket) => {
    const test = (payload) => {
        socket.to(`User ${payload.recipient}`).emit('notification', payload)
    }

    const requests = (payload) => {
        console.log("requ")
        socket.to(`User ${payload.recipient}`).emit('request:notif', payload)
    }

    socket.on("default", test);
    socket.on("request:notif", requests);
}