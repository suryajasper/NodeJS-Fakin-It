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
  socket.on('give me a role', function(){
    var randInd = Math.floor(Math.random() * clientID.length);
    //console.log(io.sockets.connected[clientID[randInd]]);
    for (var i = 0; i < clientID.length; i++) {
      if (randInd == i) {
        io.sockets.connected[clientID[i]].emit('get role', "Try to blend in!!!");
      } else {
        io.sockets.connected[clientID[i]].emit('get role', "raise your hand if you're low iq")
      }
    }
  });

});

http.listen(gameID, function(){
  console.log('listening on port' + gameID.toString());
});
