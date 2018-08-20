var express = require('express');
var fs = require('fs');
var db = require('./database.js');
// var db = require('../config/config.js').knex;
var routes = express.Router();

routes.route('/').post(record, error_handling);
routes.route('/getRoom').get(getRoom, error_handling);

async function record(req, res, next) {
        const rooms = await db.connection('rooms').where('roomid', data.roomID);
      const data = req.body;
      var room = JSON.parse(rooms[0].state);
    //   let room = fs.readFileSync('./rooms/' + data.roomID + '.json');
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
            room.players[whosTurn(data.index, room.players.length)].turn = true;
            room.players[whosTurn(data.index, room.players.length)].pick = 1;
            room.players[whosTurn(data.index, room.players.length)].throw = 1;
      }
      room.dealers = data.dealers;
      const update = await db.connection('rooms').where('roomid', data.roomID).update({state: JSON.stringify(room)});
    //   fs.writeFileSync(
    //         './rooms/' + data.roomID + '.json',
    //         JSON.stringify(room)
    //   );
      res.status(200).json({
            success: true
      });
}

async function getRoom(req, res, next) {
    const rooms = await db.connection('rooms').where('status', 'init').orderBy('id_room', 'desc');
    res.status(200).json({
        success: true,
        room: rooms[0]
    });
}

function whosTurn(index, player) {
      let obsIndex = index + 1;
      if (obsIndex > player - 1) {
            obsIndex -= player;
      }
      return obsIndex;
}

function error_handling(err, req, res, next) {
      // console.log(err.stack);
      code = err.code ? err.code : 401;
      res.status(code).json({
            success: false,
            message: err.message,
            stack: err.stack
      });
}

module.exports = routes;
