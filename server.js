var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

function createRoom() {
    const id =
        Math.random()
            .toString(36)
            .substring(2, 15) +
        Math.random()
            .toString(36)
            .substring(2, 15);
    return id;
}

app.get('/', function(req, res) {
      res.sendfile(__dirname + '/index.html');
});

io.on('connection', socket => {
      socket.on('send room', data => {
            io.emit('move', data);
      });
      socket.on('create room', data => {
            console.log('room created', data);
            roomID = createRoom();
            io.emit('create room', {roomID: roomID});
      });

      socket.on('join room', data => {
            io.emit(data.roomID, {type: 'join', data: {name: data.name}});
      });

    socket.on('update room', data => {
        io.emit(data.roomID, { type: 'players', data: data.data });
    });
});
