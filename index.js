const express = require('express');
const port = process.env.PORT || 3000
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
var peerExpress = require('peer').ExpressPeerServer;
const options = {
    debug: true
}
app.set('view engine', 'ejs')
app.use(express.static('public'));

app.use('/peerjs', peerExpress(server, options))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(port, () => {
    console.log("server running on port " + port);
})