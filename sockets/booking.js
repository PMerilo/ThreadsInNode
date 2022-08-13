module.exports = (io, socket) => {
    const test = (payload) => {
        socket.to(`User ${payload.recipient}`).emit('notification', payload)
    }

    const requests = (payload) => {
        socket.to(`User ${payload.recipient}`).emit('request:notif', payload)
    }

    const admin = (payload) => {
        socket.to(`admins`).emit('notification', payload)
    }

    socket.on("default", test);
    socket.on("request:notif", requests);
    socket.on("livechat:request", admin);
}