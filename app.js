var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var gameID = process.env.PORT || 2000;

var playerNames = [];

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
  console.log('a user connected');
  var nameOfPlayer;

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
});

http.listen(gameID, function(){
  console.log('listening on port' + gameID.toString());
});
