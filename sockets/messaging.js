module.exports = (io, socket) => {
    const messageSent = ({ msg }) => {
        console.log("msg sent.. sending to users in ", msg)
        io.in(`Chat ${msg.chatId}`).emit('message:receive', msg)
    }

    const livechat = ({ msg, id, owner }) => {
        console.log("msg sent.. sending to users in ", id)
        io.in(`User ${id}`).emit('livechat:receive', { msg, id, owner })
    }

    const enterChat = ({target, name, id}) => {
        console.log(name)
        io.in(`User ${target}`).emit('livechat:inside', {name, id});
    };
    
    const acknowledgement = ({id, x, username}) => {
        console.log(username)
        io.in(`User ${id}`).emit('livechat:acknowledgement', {x, username});
    };

    socket.on("message:sent", messageSent);
    socket.on("livechat:sent", livechat);
    socket.on("livechat:enter", enterChat);
    socket.on("livechat:acknowledgement", acknowledgement);
}