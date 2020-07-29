const express = require('express');
const port = process.env.PORT || 3000
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
var Turn = require('node-turn');
const { ExpressPeerServer } = require('peer');
const options = {
    debug: 3,
}
app.set('view engine', 'ejs')
app.use(express.static('public'));
var turnServer = new Turn({
    // set options
    authMech: 'long-term',
    credentials: {
      username: "devry-server"
    }
  });
  turnServer.start();

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

const peerServer = ExpressPeerServer(server, {
    path: '/myapp'
  });

  peerServer.on('connection', (client) => { console.log(client.setSocket);});
  
  app.use('/peerjs', peerServer);

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

const con = server.listen(port, () => {
    console.log("server running on port " + port);
})

