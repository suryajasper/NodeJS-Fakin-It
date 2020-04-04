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
async function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout*1000);
  });
}

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
app.use(express.static(__dirname + '/client'));
var gameID = process.env.PORT || 2000;

var players = {}; // a dictionary that stores a list of player objects (which stores their name and socket id) for each room
var playerVotes = {};
var playerSockets = {};
var playerVoteDecisions = {};
var randPlayers = {};
var readyTracker = 0;

var params = {
  secondsUntilVote: 7
}
/*
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});*/

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
    /*
    socket.emit('makeCookie', 'username=' + data.name + ';');
    socket.emit('makeCookie', 'room=' + data.room + ';');*/
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
      socket.emit('makeCookie', 'username=' + data.name + ';');
      socket.emit('makeCookie', 'room=' + data.room + ';');*/
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

  socket.on('randomize roles', function() {
    console.log('RANDOMIZING ROLES with ' + players[playerRoomName].length.toString() + ' clients.');
    randPlayers[playerRoomName] = Player.getRandomName(players[playerRoomName]);
    console.log('randName = ' + randPlayers[playerRoomName]);
  });

  socket.on('sending identity', function(data) {
    console.log('Room ' + data.room + ': received identity from ' + data.name);
    playerRoomName = data.room;
    var playerName = data.name;
    console.log(players[playerRoomName]);
    console.log(data);
    thisPlayer = new Player(playerName, socket.id, playerRoomName);
    players[playerRoomName].push(thisPlayer);
    if (!(playerRoomName in playerSockets)) {
      playerSockets[playerRoomName] = [];
    }
    playerSockets[playerRoomName].push(socket);
  });

  socket.on('give me a role', function(){
    console.log('getting a role for ' + thisPlayer.name + ' and the randname is ' + randPlayers[playerRoomName]);
    var currName = thisPlayer.name;
    if (randPlayers[playerRoomName] === currName) {
      console.log(currName + ' is the spy');
      socket.emit('get role', "Try to blend in!!!");
    } else {
      console.log(currName + ' is normal');
      socket.emit('get role', "raise your hand if you're low iq")
    }
  });

  var sendToAll = (room, header, data) => {
    for (var i = 0; i < playerSockets[room].length; i++) {
      if (data == null) {
        playerSockets[room][i].emit(header);
      } else {
        playerSockets[room][i].emit(header, data);
      }
    }
  }

  socket.on('ready', function() {
    readyTracker++;
    if (readyTracker === players[playerRoomName].length) {
      console.log('we bout to start waitin');
      sendToAll(playerRoomName, 'decision time');
      wait(params.secondsUntilVote);
      playerVotes[playerRoomName] = {};
      playerVoteDecisions[playerRoomName] = {};
      for (var i = 0; i < players[playerRoomName].length; i++) {
        playerVotes[playerRoomName][players[playerRoomName][i].name] = 0;
        playerVoteDecisions[playerRoomName][players[playerRoomName][i].name] = null;
      }
      console.log(io.in(playerRoomName));
      var listOfPlayerNames = [];
      for (var i = 0; i < players[playerRoomName].length; i++) {
        listOfPlayerNames.push(players[playerRoomName][i].name);
      }
      sendToAll(playerRoomName, 'voting time', listOfPlayerNames);
      console.log('we be done waitin');
    }
  });

  socket.on('voting for', function(toVote) {
    if (playerVoteDecisions[playerRoomName][thisPlayer.name] == null) {
      playerVoteDecisions[playerRoomName][thisPlayer.name] = toVote;
      playerVotes[playerRoomName][toVote]++;
    } else if (playerVoteDecisions[playerRoomName][thisPlayer.name] == toVote) {
      playerVoteDecisions[playerRoomName][thisPlayer.name] = null;
      playerVotes[playerRoomName][toVote]--;
    } else {
      playerVotes[playerRoomName][toVote]++;
      playerVotes[playerRoomName][playerVoteDecisions[playerRoomName][thisPlayer.name]]--;
      playerVoteDecisions[playerRoomName][thisPlayer.name] = toVote;
    }
    sendToAll(playerRoomName, 'refresh votes', playerVotes[playerRoomName]);
  });
});

http.listen(gameID, function(){
  console.log('listening on port' + gameID.toString());
});
