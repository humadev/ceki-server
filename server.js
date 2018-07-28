var app = require('express')();
var fs = require('fs');
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

var cards = [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30
];

var fullCards = [...cards, ...cards, ...cards, ...cards];

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

function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
}

app.get('/', function(req, res) {
      res.sendfile(__dirname + '/index.html');
});

io.on('connection', socket => {
      socket.on('create room', data => {
            roomID = createRoom();
            socket.join(roomID);
            io.in(roomID).emit('create room', { roomID: roomID });
            fs.writeFileSync(
                  './rooms/' + roomID + '.json',
                  JSON.stringify({
                        players: [
                              {
                                    name: data.name,
                                    email: data.email,
                                    cards: [],
                                    trash: [],
                                    turn: true,
                                    pick: 1,
                                    throw: 1,
                                    date: data.date
                              }
                        ],
                        dealers: [],
                        playersNumber: 1
                  })
            );
      });

      socket.on('join room', data => {
            socket.join(data.roomID);
            let room = fs.readFileSync('./rooms/' + data.roomID + '.json');
            room = JSON.parse(room);
            room.players.push({
                  name: data.name,
                  email: data.email,
                  cards: [],
                  trash: [],
                  turn: false,
                  pick: 0,
                  throw: 0,
                  date: data.date
            });
            room.playersNumber++;
            fs.writeFileSync(
                  './rooms/' + data.roomID + '.json',
                  JSON.stringify(room)
            );
            socket.emit('join room', { index: room.playersNumber - 1 });
            io.in(data.roomID).emit('room', room.players);
      });

      socket.on('rejoin room', data => {
            socket.join(data.roomID);
            let room = fs.readFileSync('./rooms/' + data.roomID + '.json');
            socket.emit('rejoin room', { gameState: JSON.parse(room) });
      });

      socket.on('init play', data => {
            let room = fs.readFileSync('./rooms/' + data.roomID + '.json');
            room = JSON.parse(room);
            const shuffleCards = shuffle(fullCards);
            let player = 0;
            for (const cards of shuffleCards) {
                  if (player < room.players.length) {
                        if (room.players[player].cards.length < 11) {
                              room.players[player].cards.push(cards);
                        } else {
                              player++;
                              if (room.players.length !== player) {
                                    room.players[player].cards.push(cards);
                              } else {
                                    room.dealers.push(cards);
                              }
                        }
                  } else {
                        room.dealers.push(cards);
                  }
            }
            fs.writeFileSync(
                  './rooms/' + data.roomID + '.json',
                  JSON.stringify(room)
            );
            io.in(data.roomID).emit('play', room);
      });

      socket.on('move', data => {
            let room = fs.readFileSync('./rooms/' + data.roomID + '.json');
            io.to(data.roomID).emit('move', data);
            room = JSON.parse(room);
            room.players[data.index].cards = data.card;
            room.players[data.index].trash = data.trash;
            room.players[data.index].turn = !data.turning;
            room.players[data.index].pick = data.pick;
            room.players[data.index].throw = data.throw;
            room.players[data.index].date = data.date;
            if (data.turning === false) {
                  room.players[whosTurn(data.index)].turn = true;
                  room.players[whosTurn(data.index)].pick = 1;
                  room.players[whosTurn(data.index)].throw = 1;
            }
            room.dealers = data.dealers;
            fs.writeFileSync(
                  './rooms/' + data.roomID + '.json',
                  JSON.stringify(room)
            );
      });
});

function whosTurn(index) {
      let obsIndex = index + 1;
      if (obsIndex > 4) {
            obsIndex -= 5;
      }
      return obsIndex;
}
