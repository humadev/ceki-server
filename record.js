var express = require('express');
var fs = require('fs');
// var db = require('../config/config.js').knex;
var routes = express.Router();

routes.route('/').post(record, error_handling);

function record(req, res, next) {
      const data = req.body;
      let room = fs.readFileSync('./rooms/' + data.roomID + '.json');
      room = JSON.parse(room);
      room.players[data.index].cards = data.card;
      room.players[data.index].trash = data.trash;
      room.players[data.index].turn = !data.turning;
      room.players[data.index].pick = data.pick;
      room.players[data.index].throw = data.throw;
      room.players[data.index].date = data.date;
      if (data.turning === true) {
            room.players[whosTurn(data.index, room.players.length)].turn = true;
            room.players[whosTurn(data.index, room.players.length)].pick = 1;
            room.players[whosTurn(data.index, room.players.length)].throw = 1;
      }
      room.dealers = data.dealers;
      fs.writeFileSync(
            './rooms/' + data.roomID + '.json',
            JSON.stringify(room)
      );
      res.status(200).json({
            success: true
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
