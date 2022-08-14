module.exports = (io, socket) => {
    const ping = (callback) => {
        console.log("Client has pinged server")
        callback({
            status: "ok"
        })
    }

    const rooms = (data) => {
        data.forEach(room => {
            socket.join(room)
        });
        console.log(`User ${socket.userid} has joined the rooms [${data.join(', ')}]`)
    }


    socket.on("server:ping", ping);
    socket.on("rooms", rooms)
}