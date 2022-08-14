module.exports = (io, socket) => {
    const test = (payload) => {
        socket.to(`User ${payload.recipient}`).emit('notification', payload)
    }

    const requests = (payload) => {
        socket.to(`User ${payload.recipient}`).emit('request:notif', payload)
    }

    
    const removeLivechat = (payload) => {
        socket.to(`admins`).emit('livechat:remove', payload)
    }

    const sendLivechat = (payload) => {
        socket.to(payload.recipient ? payload.recipient : `admins`).emit('livechat:request', payload)
    }

    const getLivechat = (payload) => {
        socket.to(`livechat`).emit('livechat:get', payload.adminId)
    }

    socket.on("default", test);
    socket.on("request:notif", requests);
    socket.on("livechat:request", sendLivechat);
    socket.on("livechat:get", getLivechat);
    socket.on("livechat:remove", removeLivechat);
}