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
var readyTracker = {};
var roundInfo = {};

var params = {
  numRounds: 5,
  numRoundsInRound: 3,
  secondsUntilVote: 7,
  secondsToVote: 20
}
/*
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});*/

function resetVarsForRound(room) {
  readyTracker[room] = 0;
  randPlayers[room] = undefined;
  playerVoteDecisions[room] = {};
  playerVotes[room] = {};
}

function getScoreDict(room) {
  var dictToReturn = {};
  for (var player of players[room]) {
    for (var i = 0; i < players[room].length; i++) {
      if (players[room][i].name === player.name) {
        dictToReturn[player.name] = players[room][i].score;
      }
    }
  }
  return dictToReturn;
}

function randomizeRoles(room) {
  console.log('RANDOMIZING ROLES with ' + players[room].length.toString() + ' clients.');
  randPlayers[room] = Player.getRandomName(players[room]);
  readyTracker[room] = 0;
  console.log('randName = ' + randPlayers[room]);
}

function printScores(roomName) {
  for (var i = 0; i < players[roomName].length; i++) {
    console.log(players[roomName][i].name + ": " + players[roomName][i].score.toString() + ' points');
  }
}

function sendToAll(room, header, data) {
  for (var i = 0; i < playerSockets[room].length; i++) {
    if (data == null) {
      playerSockets[room][i].emit(header);
    } else {
      playerSockets[room][i].emit(header, data);
    }
  }
}

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
    roundInfo[playerRoomName] = {currRound: 1, totalRounds: params.numRounds, currTrial: 1, totalTrials: 3};
    io.in(playerRoomName).emit('redirect', destination);
  });

  socket.on('randomize roles', function() {
    randomizeRoles(playerRoomName);
  });

  socket.on('sending identity', function(data) {
    console.log('Room ' + data.room + ': received identity from ' + data.name);
    playerRoomName = data.room;
    var playerName = data.name;
    thisPlayer = new Player(playerName, socket.id, playerRoomName);
    players[playerRoomName].push(thisPlayer);
    if (!(playerRoomName in playerSockets)) {
      playerSockets[playerRoomName] = [];
    }
    playerSockets[playerRoomName].push(socket);
    socket.emit('update round info', roundInfo[playerRoomName]);
  });

  socket.on('give me a role', function(){
    console.log('getting a role for ' + thisPlayer.name + ' and the randname is ' + randPlayers[playerRoomName]);
    var currName = thisPlayer.name;
    if (randPlayers[playerRoomName] === currName) {
      console.log(currName + ' is the spy');
      socket.emit('get role', "Try to blend in!!!");
    } else {
      socket.emit('get role', "raise your hand if you're low iq")
    }
  });

  socket.on('ready', function() {
    readyTracker[playerRoomName]++;
    console.log('(' + playerRoomName + ') ' + readyTracker[playerRoomName].toString() + '/' + players[playerRoomName].length.toString() + ' are ready');
    if (readyTracker[playerRoomName] === players[playerRoomName].length) {
      console.log('we bout to start waitin');
      sendToAll(playerRoomName, 'decision time', null);
      var promise = wait(params.secondsUntilVote);
      promise.then(function() {
        playerVotes[playerRoomName] = {};
        playerVoteDecisions[playerRoomName] = {};
        for (var i = 0; i < players[playerRoomName].length; i++) {
          playerVotes[playerRoomName][players[playerRoomName][i].name] = 0;
          playerVoteDecisions[playerRoomName][players[playerRoomName][i].name] = null;
        }
        var listOfPlayerNames = [];
        for (var i = 0; i < players[playerRoomName].length; i++) {
          listOfPlayerNames.push(players[playerRoomName][i].name);
        }
        sendToAll(playerRoomName, 'voting time', listOfPlayerNames);
        console.log('we be done waitin');

        var toVotePromise = wait(params.secondsToVote);
        toVotePromise.then(function() {
          var foundFaker = false;
          var foundLargest = false;
          /* Give points to whoever guessed correctly */
          for (var i = 0; i < Object.keys(playerVoteDecisions[playerRoomName]).length; i++) {
            var playerWhoDecided = Object.keys(playerVoteDecisions[playerRoomName])[i];
            var tempDecision = playerVoteDecisions[playerRoomName][playerWhoDecided];
            if (tempDecision === randPlayers[playerRoomName]) {
              for (var j = 0; j < players[playerRoomName].length; j++) {
                if (players[playerRoomName][j].name === playerWhoDecided) {
                  players[playerRoomName][j].addPoints(100);
                }
              }
            }
          }
          Object.keys(playerVotes[playerRoomName]).forEach(function(voteName) {
            var voteTally = playerVotes[playerRoomName][voteName];
            console.log(voteName, voteTally);
            if (voteTally >= players[playerRoomName].length-1) {
              if (voteName === randPlayers[playerRoomName]) {
                sendToAll(playerRoomName, 'vote result', {pick: voteName, result: 'IS the faker'});
                foundFaker = true;
              } else {
                for (var pInd = 0; pInd < players[playerRoomName].length; pInd++) {
                  if (players[playerRoomName][pInd].name === randPlayers[playerRoomName]) {
                    players[playerRoomName][pInd].addPoints(150);
                    break;
                  }
                }
                sendToAll(playerRoomName, 'vote result', {pick: voteName, result: 'is NOT the faker'});
              }
              foundLargest = true;
            }
          });
          if (!foundLargest) {
            for (var pInd = 0; pInd < players[playerRoomName].length; pInd++) {
              if (players[playerRoomName][pInd].name === randPlayers[playerRoomName]) {
                players[playerRoomName][pInd].addPoints(75);
                break;
              }
            }
            if (roundInfo[playerRoomName].currTrial === roundInfo[playerRoomName].totalTrials) {
              sendToAll(playerRoomName, 'vote result', {pick: randPlayers[playerRoomName], result: 'evaded capture'});
            } else {
              sendToAll(playerRoomName, 'vote result', {pick: 'The faker', result: 'is still at large'});
            }
          }
          roundInfo[playerRoomName].currTrial++;
          printScores(playerRoomName);
          var sendEveryoneTheirRoles = function() {
            for (var i = 0; i < players[playerRoomName].length; i++) {
              if (players[playerRoomName][i].name === randPlayers[playerRoomName]) {
                for (var j = 0; j < playerSockets[playerRoomName].length; j++) {
                  if (playerSockets[playerRoomName][j].id === players[playerRoomName][i].id) {
                    playerSockets[playerRoomName][j].emit('get role', "Try to blend in!!!");
                  }
                  else {
                    playerSockets[playerRoomName][j].emit('get role', "raise your hand if you're low iq");
                  }
                }
                break;
              }
            }
          }
          readyTracker[playerRoomName] = 0;
          if (foundFaker || (roundInfo[playerRoomName].currTrial > roundInfo[playerRoomName].totalTrials)) {
            var toScoreView = wait(7);
            toScoreView.then(function() {
              var playerScoreDict = getScoreDict(playerRoomName);
              sendToAll(playerRoomName, 'display scores', playerScoreDict);
              if (roundInfo[playerRoomName].currRound === roundInfo[playerRoomName].totalRounds) {

              }
              roundInfo[playerRoomName].currRound++;
              roundInfo[playerRoomName].currTrial = 1;
              randomizeRoles(playerRoomName);
              var toNextRoundPromise = wait(7);
              toNextRoundPromise.then(function() {
                sendToAll(playerRoomName, 'update round info', roundInfo[playerRoomName]);
                console.log('getting roles for everyone');
                sendEveryoneTheirRoles();
              })
            })
          } else {
            var toNextRoundPromise = wait(7);
            toNextRoundPromise.then(function() {
              sendToAll(playerRoomName, 'update round info', roundInfo[playerRoomName]);
              sendEveryoneTheirRoles();
            })
          }
        })
      })
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
