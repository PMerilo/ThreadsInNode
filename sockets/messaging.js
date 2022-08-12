module.exports = (io, socket) => {
    const messageSent = ({msg}) => {
        console.log("msg sent.. sending to users in ", msg)
        io.in(`Chat ${msg.chatId}`).emit('message:receive', msg)
    }

    socket.on("message:sent", messageSent);
}