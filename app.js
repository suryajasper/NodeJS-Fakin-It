var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var gameID = process.env.PORT || 2000;

var playerNames = [];

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
app.use(express.static(__dirname + '/client'));

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('playerName', function(pname){
    console.log('playerName: ' + pname);
    playerNames.push(pname);
    io.emit('newPlayerList', playerNames);
  });
  socket.on('gameName', function(gname){
    console.log('gameName: ' + gname);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(gameID, function(){
  console.log('listening on port' + gameID.toString());
});
