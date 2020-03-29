class Player {
  constructor(name, id, room, score) {
    this.name = name;
    this.id = id;
    this.score = score;
  }
  constructor(name, id, room) {
    this.name = name;
    this.id = id;
    this.score = 0;
  }
  addPoints(amount) {
    this.score += amount;
  }
  deductPoints(amount) {
    this.score -= amount;
  }
  static stringify(playerList) {
    var names = [];
    for (var i = 0; i < playerList.length; i++) {
      names.push(playerList[i].name);
    }
    return names;
  }
  static getTotalScore(playerList) {
    var sum = 0;
    for (var i = 0; i < playerList.length; i++) {
      sum += playerList[i].score;
    }
    return sum;
  }
  static getHighestScore(playerList) {
    var highestInd = 0;
    for (var i = 1; i < playerList.length; i++) {
      if (playerList[i].score > playerList[highestInd].score) {
        highestInd = i;
      }
    }
    return {name: playerList[highestInd].name, score: playerList[highestInd].score};
  }
  static getLowestScore(playerList) {
    var lowestInd = 0;
    for (var i = 1; i < playerList.length; i++) {
      if (playerList[i].score < playerList[lowestInd].score) {
        lowestInd = i;
      }
    }
    return {name: playerList[lowestInd].name, score: playerList[lowestInd].score};
  }
}

Array.prototype.remove = function() {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

function getKeyByValue(object, value) {
  for (var prop in object) {
    if (object.hasOwnProperty(prop)) {
      if (object[prop] === value)
      return prop;
    }
  }
}

var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var gameID = process.env.PORT || 2000;
var players = [];

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
app.use(express.static(__dirname + '/client'));

io.on('connection', function(socket){
  /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<------>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
  /*<<<<<<<<<<<<<<<<<CONNECTIONS AND DISCONNECTIONS>>>>>>>>>>>>>>>>>>>*/
  /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<------>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

  var thisPlayer;

  console.log('a user connected');

  socket.on('createGame', function(data) {
    socket.join(data.room);
    socket.emit('newGame', data.room);

    //nameOfPlayer = data.name;
    io.emit('makeCookie', 'username=' + data.name + ';');
    console.log('playerName: ' + data.name);
    playerName = data.name;
    thisPlayer = new Player(data.name, socket.id, data.room);
    players.push(thisPlayer);
    io.emit('newPlayerList', Player.stringifyplayers(players));
  });

  socket.on('joinGame', function(data) {
    var room = io.nsps['/'].adapter.rooms[data.room];
    if(room) {
      socket.join(data.room);
      /*
      socket.broadcast.to(data.room).emit('player1', {});
      socket.emit('player2', {name: data.name, room: data.room })*/
      nameOfPlayer = data.name;
      io.emit('makeCookie', 'username=' + data.name + ';');
      console.log('playerName: ' + data.name);
      playerNames.push(data.name);
      io.emit('newPlayerList', playerNames);
    }
    else {
      socket.emit('error', 'room "' + data.room + '" does not exist');
    }
  });

  socket.on('print', function(toPrint) {
    console.log(toPrint);
  });

  socket.on('playerLeaving', function(){
    console.log('player left');
    players.remove(thisPlayer);
    io.emit('newPlayerList', Player.stringifyplayers(players));
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
    playerNames.remove(nameOfPlayer);
    io.emit('newPlayerList', playerNames);
  });

  /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<------>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
  /*<<<<<<<<<<<<<<<<<<<<<<<ACTUAL GAME SERVER>>>>>>>>>>>>>>>>>>>>>>>>>*/
  /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<------>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

  socket.on('redirect me to the game', function(){
    for (var i = 0; i < clientID.length; i++) {
      var destination = '/game.html';
      io.sockets.connected[clientID[i]].emit('redirect', destination);
    }
  });

  var randName;

  socket.on('randomize roles', function() {
    console.log('RANDOMIZING ROLES with ' + clientID.length.toString() + ' clients.');
    randName = Object.keys(nameToId)[Math.floor(Math.random() * Object.keys(nameToId).length)];
    console.log('randName = ' + randName.toString());
  });

  socket.on('sending identity', function(playername) {
    nameToId[playername] = socket.id;
  });

  socket.on('give me a role', function(){
    console.log('getting a role from id ' + socket.id.toString());
    var currName = getKeyByValue(nameToId, socket.id);
    if (randName === currName) {
      socket.emit('get role', "Try to blend in!!!");
    } else {
      socket.emit('get role', "raise your hand if you're low iq")
    }
  });
});

http.listen(gameID, function(){
  console.log('listening on port' + gameID.toString());
});
