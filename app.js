class Player {
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
  static getRandomID(playerList) {
    var randInd = Math.floor(Math.random() * playerList.length);
    return playerList[randInd].id;
  }
  static getRandomName(playerList) {
    var randInd = Math.floor(Math.random() * playerList.length);
    return playerList[randInd].name;
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
var players = {};

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
app.use(express.static(__dirname + '/client'));

io.on('connection', function(socket){
  /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<------>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
  /*<<<<<<<<<<<<<<<<<CONNECTIONS AND DISCONNECTIONS>>>>>>>>>>>>>>>>>>>*/
  /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<------>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

  var thisPlayer;
  var playerRoomName;

  var disconnectFunc = function() {
    try {
      players[playerRoomName].remove(thisPlayer);
      io.in(playerRoomName).emit('newPlayerList', Player.stringify(players[playerRoomName]));
      console.log('logged in user disconnected successfully');
    } catch (TypeError) {
      console.log('anonymous user disconnected successfully');
    }
  }

  console.log('a user connected');

  socket.on('createGame', function(data) {
    socket.join(data.room);
    playerRoomName = data.room;
    socket.emit('newGame', data.room);

    socket.emit('makeCookie', 'username=' + data.name + ';');
    socket.emit('makeCookie', 'room=' + data.room + ';');
    console.log('playerName: ' + data.name + ' created room ' + playerRoomName);
    playerName = data.name;
    thisPlayer = new Player(data.name, socket.id, data.room);
    players[playerRoomName] = [];
    players[playerRoomName].push(thisPlayer);
    io.in(playerRoomName).emit('newPlayerList', Player.stringify(players[playerRoomName]));
  });

  socket.on('joinGame', function(data) {
    var room = io.nsps['/'].adapter.rooms[data.room];
    if(room) {
      playerRoomName = data.room;
      socket.join(data.room);
      /*
      socket.broadcast.to(data.room).emit('player1', {});
      socket.emit('player2', {name: data.name, room: data.room })*/
      socket.emit('makeCookie', 'username=' + data.name + ';');
      socket.emit('makeCookie', 'room=' + data.room + ';');
      console.log('playerName: ' + data.name + ' joined room ' + playerRoomName);
      playerName = data.name;
      thisPlayer = new Player(data.name, socket.id, data.room);
      players[playerRoomName].push(thisPlayer);
      io.in(playerRoomName).emit('newPlayerList', Player.stringify(players[playerRoomName]));
    }
    else {
      socket.emit('error', 'room "' + data.room + '" does not exist');
    }
  });

  socket.on('print', function(toPrint) {
    console.log(toPrint);
  });

  socket.on('playerLeaving', disconnectFunc);
  socket.on('disconnect', disconnectFunc);
  
  /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<------>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
  /*<<<<<<<<<<<<<<<<<<<<<<<ACTUAL GAME SERVER>>>>>>>>>>>>>>>>>>>>>>>>>*/
  /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<------>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

  socket.on('redirect me to the game', function(){
    var destination = '/game.html';
    io.in(playerRoomName).emit('redirect', destination);
  });

  var randName;

  socket.on('randomize roles', function() {
    console.log('RANDOMIZING ROLES with ' + players[playerRoomName].length.toString() + ' clients.');
    randName = Player.getRandomName(players[playerRoomName]);
    console.log('randName = ' + randName.toString());
  });

  socket.on('sending identity', function(data) {
    console.log('Room ' + data.room + ': received identity from ' + data.name);
    var playerName = data.name;
    playerRoomName = data.room;
    for (var i = 0; i < players[playerRoomName].length; i++) {
      if (players[playerRoomName][i].name === playerName) {
        players[playerRoomName][i].id = socket.id;
        thisPlayer = new Player(players[playerRoomName][i].name, socket.id, playerRoomName);
        break;
      }
    }
  });

  socket.on('give me a role', function(){
    console.log('getting a role from id ' + socket.id.toString());
    var currName = thisPlayer.name;
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
