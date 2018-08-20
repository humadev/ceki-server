var express = require('express');
var app = express();
var fs = require('fs');
var record = require('./record');

var server = require('http').Server(app);
var ExpressPeerServer = require('peer').ExpressPeerServer;
var io = require('socket.io')(server);
var db = require('./database.js');

server.listen(3000);

var options = {
      debug: true
};

var peerserver = ExpressPeerServer(server, options);

app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Credentials', true);
      res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
      );
      next();
});

app.use(express.urlencoded({ extended: false })); // merubah bentuk request body menjadi urlencoded yang dipahami server jika berupa application/urlencoded
app.use(express.json({ limit: '1000mb' })); // merubah bentuk request body menjadi json yang dipahami server jika berupa application/json

app.use('/webrtc', peerserver);
app.use('/record', record);

peerserver.on('connection', id => {
      console.log('connection', id);
});

peerserver.on('disconnect', id => {
      console.log('disconnect', id);
});

var cards = [
      {
            no: 1,
            soroh: 'a',
            namaSoroh: 'raja'
      },
      {
            no: 2,
            soroh: 'f',
            namaSoroh: ''
      },
      {
            no: 3,
            soroh: 'b',
            namaSoroh: 'katik 1'
      },
      {
            no: 4,
            soroh: 'b',
            namaSoroh: 'katik 1'
      },
      {
            no: 5,
            soroh: 'b',
            namaSoroh: 'katik 1'
      },
      {
            no: 6,
            soroh: 'c',
            namaSoroh: ''
      },
      {
            no: 7,
            soroh: 'c',
            namaSoroh: ''
      },
      {
            no: 8,
            soroh: 'c',
            namaSoroh: ''
      },
      {
            no: 9,
            soroh: 'd',
            namaSoroh: 'ringgit'
      },
      {
            no: 10,
            soroh: 'd',
            namaSoroh: 'ringgit'
      },
      {
            no: 11,
            soroh: 'd',
            namaSoroh: 'ringgit'
      },
      {
            no: 12,
            soroh: 'e',
            namaSoroh: 'katik 2'
      },
      {
            no: 13,
            soroh: 'e',
            namaSoroh: 'katik 2'
      },
      {
            no: 14,
            soroh: 'e',
            namaSoroh: 'katik 2'
      },
      {
            no: 15,
            soroh: 'f',
            namaSoroh: ''
      },
      {
            no: 16,
            soroh: 'f',
            namaSoroh: ''
      },
      {
            no: 17,
            soroh: 'g',
            namaSoroh: ''
      },
      {
            no: 18,
            soroh: 'g',
            namaSoroh: ''
      },
      {
            no: 19,
            soroh: 'g',
            namaSoroh: ''
      },
      {
            no: 20,
            soroh: 'h',
            namaSoroh: 'caling'
      },
      {
            no: 21,
            soroh: 'h',
            namaSoroh: 'caling'
      },
      {
            no: 22,
            soroh: 'a',
            namaSoroh: ''
      },
      {
            no: 23,
            soroh: 'a',
            namaSoroh: ''
      },
      {
            no: 24,
            soroh: 'i',
            namaSoroh: ''
      },
      {
            no: 25,
            soroh: 'i',
            namaSoroh: ''
      },
      {
            no: 26,
            soroh: 'i',
            namaSoroh: ''
      },
      {
            no: 27,
            soroh: 'j',
            namaSoroh: ''
      },
      {
            no: 28,
            soroh: 'j',
            namaSoroh: ''
      },
      {
            no: 29,
            soroh: 'j',
            namaSoroh: ''
      },
      {
            no: 30,
            soroh: 'h',
            namaSoroh: 'caling'
      }
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
      res.json({
            status: true
      });
});

io.on('connection', socket => {
      socket.on('create room', async data => {
            roomID = createRoom();
            socket.join(roomID);
            io.in(roomID).emit('create room', { roomID: roomID });
            const insert = await db.connection('rooms').insert({
                roomid: roomID,
                players: 1,
                status: 'init',
                state: JSON.stringify({
                    players: [{
                        uid: data.uid,
                        name: data.name,
                        email: data.email,
                        photo: data.photo,
                        cards: [],
                        trash: [],
                        turn: true,
                        pick: 1,
                        throw: 1,
                        date: data.date
                    }],
                    dealers: [],
                    playersNumber: 1
                })
            });
            // fs.writeFileSync(
            //       './rooms/' + roomID + '.json',
            //       JSON.stringify({
            //             players: [
            //                   {
            //                         uid: data.uid,
            //                         name: data.name,
            //                         email: data.email,
            //                         photo: data.photo,
            //                         cards: [],
            //                         trash: [],
            //                         turn: true,
            //                         pick: 1,
            //                         throw: 1,
            //                         date: data.date
            //                   }
            //             ],
            //             dealers: [],
            //             playersNumber: 1
            //       })
            // );
      });

      socket.on('auto join room', async data => {
          const rooms = await db.connection('rooms').where('status', 'init').orderBy('id_room', 'desc');
            console.log(rooms[0]);
          var thisRoom = rooms[0];
          socket.join(thisRoom.roomid);
        //   let room = fs.readFileSync('./rooms/' + data.roomID + '.json');
          state = JSON.parse(thisRoom.state);
          state.players.push({
              uid: data.uid,
              name: data.name,
              email: data.email,
              photo: data.photo,
              cards: [],
              trash: [],
              turn: false,
              pick: 0,
              throw: 0,
              date: data.date,
              soca: [],
              serigat: [],
              lawang: [],
              status: ''
          });
          state.playersNumber++;
          const update = await db.connection('rooms').where('roomid', thisRoom.roomid).update({
              state: JSON.stringify(state),
              players: state.playersNumber
          });
          // fs.writeFileSync(
          //       './rooms/' + data.roomID + '.json',
          //       JSON.stringify(room)
          // );
          socket.emit('auto join room', {
              index: state.playersNumber - 1,
              roomID: thisRoom.roomid
          });
          io.in(data.roomID).emit('room', state.players);
      });

      socket.on('join room', async data => {
            socket.join(data.roomID);
            const rooms = await db.connection('rooms').select().where('roomid', data.roomID);
            // let room = fs.readFileSync('./rooms/' + data.roomID + '.json');
            state = JSON.parse(rooms[0].state);
            state.players.push({
                  uid: data.uid,
                  name: data.name,
                  email: data.email,
                  photo: data.photo,
                  cards: [],
                  trash: [],
                  turn: false,
                  pick: 0,
                  throw: 0,
                  date: data.date,
                  soca: [],
                  serigat: [],
                  lawang: [],
                  status: ''
            });
            var players = rooms[0].players++;
            state.playersNumber = players;
            const update = await db.connection('rooms').where('roomid', data.roomID).update({
                state: JSON.stringify(state),
                players: players
            });
            // fs.writeFileSync(
            //       './rooms/' + data.roomID + '.json',
            //       JSON.stringify(room)
            // );
            socket.emit('join room', { index: players - 1 });
            io.in(data.roomID).emit('room', state.players);
      });

      socket.on('rejoin room', async data => {
            socket.join(data.roomID);
            const rooms = await db.connection('rooms').select().where('roomid', data.roomID);
            let room = rooms[0];
            let state = JSON.parse(room.state)
            io.in(data.roomID).emit('rejoin room', {
                  gameState: state,
                  peer: data.peer
            });
      });

      socket.on('init play', async data => {
            const rooms = await db.connection('rooms').select().where('roomid', data.roomID);
            let room = rooms[0];
            let state = JSON.parse(room.state);
            const shuffleCards = shuffle(fullCards);
            let player = 0;
            for (const cards of shuffleCards) {
                  if (player < state.players.length) {
                        if (state.players[player].cards.length < 11) {
                              state.players[player].cards.push(cards);
                        } else {
                              player++;
                              if (state.players.length !== player) {
                                    state.players[player].cards.push(cards);
                              } else {
                                    state.dealers.push(cards);
                              }
                        }
                  } else {
                        state.dealers.push(cards);
                  }
            }
            const update = await db.connection('rooms').where('roomid', data.roomID).update({
                state: JSON.stringify(state)
            });
            io.in(data.roomID).emit('play', state);
      });

      socket.on('move', data => {
            let room = fs.readFileSync('./rooms/' + data.roomID + '.json');
            room = JSON.parse(room);
            room.players[data.index].cards = data.card;
            room.players[data.index].trash = data.trash;
            room.players[data.index].turn = !data.turning;
            room.players[data.index].pick = data.pick;
            room.players[data.index].throw = data.throw;
            room.players[data.index].date = data.date;
            room.players[data.index].soca = data.soca;
            room.players[data.index].serigat = data.serigat;
            room.players[data.index].lawang = data.lawang;
            room.players[data.index].status = data.status;

            if (data.turning === true) {
                  room.players[
                        whosTurn(data.index, room.players.length)
                  ].turn = true;
                  room.players[
                        whosTurn(data.index, room.players.length)
                  ].pick = 1;
                  room.players[
                        whosTurn(data.index, room.players.length)
                  ].throw = 1;
            }
            io.to(data.roomID).emit('move', data);
            room.dealers = data.dealers;
            fs.writeFileSync(
                  './rooms/' + data.roomID + '.json',
                  JSON.stringify(room)
            );
      });
});

function whosTurn(index, players) {
      let obsIndex = index + 1;
      if (obsIndex > players - 1) {
            obsIndex -= players;
      }
      return obsIndex;
}
