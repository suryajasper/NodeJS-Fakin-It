var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var gameID = process.env.PORT || 2000;

var playerNames = [];
var clientID = [];
/*
var randomized = false;
var randomInd = 0;
var roundNum = 1;*/

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

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
app.use(express.static(__dirname + '/client'));

io.on('connection', function(socket){
  /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<------>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
  /*<<<<<<<<<<<<<<<<<CONNECTIONS AND DISCONNECTIONS>>>>>>>>>>>>>>>>>>>*/
  /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<------>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

  console.log('a user connected');
  var nameOfPlayer;
  clientID.push(socket.id);

  socket.on('print', function(toPrint) {
    console.log(toPrint);
  });

  socket.on('playerName', function(pname){
    nameOfPlayer = pname;
    console.log('playerName: ' + pname);
    playerNames.push(pname);
    io.emit('newPlayerList', playerNames);
  });
  socket.on('gameName', function(gname){
    console.log('gameName: ' + gname);
  });

  // playerLeaving
  socket.on('playerLeaving', function(){
    console.log('player left');
    playerNames.remove(nameOfPlayer);
    io.emit('newPlayerList', playerNames);
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

  var randID;

  socket.on('randomize roles', function() {
    console.log('RANDOMIZING ROLES with ' + clientID.length.toString() + ' clients.');
    randID = clientID[Math.floor(Math.random() * clientID.length)];
    console.log('randID = ' + randID.toString());
  });

  socket.on('give me a role', function(){
    console.log('getting a role from id ' + socket.id.toString());
    if (randID === socket.id) {
      socket.emit('get role', "Try to blend in!!!");
    } else {
      socket.emit('get role', "raise your hand if you're low iq")
    }
  });
});

http.listen(gameID, function(){
  console.log('listening on port' + gameID.toString());
});
