var roleDiv = document.querySelector('#role');

var roleOut = document.querySelector('#prompt');
var voting = document.querySelector('#voting');
var votingRow = document.querySelector('#voterow');
var readyButton = document.getElementById('ready');
var socket = io();

var votingResults = document.querySelector('#votingResults');
var votedName = document.querySelector('#votedName');
var votedNameResult = document.querySelector('#votedNameResult');

var playerScores = document.querySelector('#playerScores');
var playerScoresTbody = document.querySelector('#playerScoreBody');

playerScores.style.display = 'none';
voting.style.display = "none";
votingResults.style.display = 'none';
role.style.display = "block";

var toParse = window.location.href.split('?')[1].split('&');
var thisName = toParse[0];

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

function createScoreElement(name, score) {
  var tr = document.createElement('tr');

  var nameTD = document.createElement('td');
  var nameTDh3 = document.createElement('h3');
  nameTDh3.innerHTML = name;
  nameTD.appendChild(nameTDh3);
  nameTD.setAttribute('align', 'left');

  var scoreTD = document.createElement('td');
  var scoreTDh3 = document.createElement('h3');
  scoreTDh3.innerHTML = score;
  scoreTD.appendChild(scoreTDh3);
  scoreTD.setAttribute('align', 'right');

  tr.appendChild(nameTD);
  tr.appendChild(scoreTD);

  return tr;
}

function displayScores(scoreDict) {
  playerScores.style.display = 'block';
  voting.style.display = "none";
  votingResults.style.display = 'none';
  role.style.display = "none";
  $('#playerScoreBody').empty();
  for (var i = 0; i < Object.keys(scoreDict).length; i++) {
    playerScoresTbody.appendChild(createScoreElement(Object.keys(scoreDict)[i], scoreDict[Object.keys(scoreDict)[i]]));
  }
}

function organizeNames(names) {
  $('#voterow').empty();
  var voteDict = {};
  for (var i = 0; i < names.length; i++) (function(i) {
    var toVote = names[i];
    var votecard = document.createElement('div');
    votecard.classList.add("votecard");
    votecard.innerHTML = "<p>" + names[i] + "</p>";
    var votecardsuper = document.createElement('div');
    votecardsuper.classList.add("votecardsuper");
    votecardsuper.innerHTML = 0;
    voteDict[toVote] = votecardsuper;
    votecard.onclick = function() {
      console.log('registering onclick with iteration ' + i.toString());
      socket.emit('voting for', toVote);
    }
    votecard.appendChild(votecardsuper);
    votingRow.appendChild(votecard);
  })(i);
  socket.on('refresh votes', function(servdict) {
    for (var i = 0; i < Object.keys(servdict).length; i++) (function(i) {
      var currServName = Object.keys(servdict)[i];
      console.log(currServName);
      console.log(voteDict);
      if (currServName in voteDict) {
        voteDict[currServName].innerHTML = servdict[currServName].toString();
      }
    })(i)
  });
  votingRow.appendChild(document.createElement('br'));
}

//console.log('cookie: ' + getCookie('username'));
//socket.emit('sending identity', {name: getCookie('username'), room: getCookie('room')});
socket.emit('sending identity', {name: toParse[0], room: toParse[1]});
socket.emit('give me a role');
socket.on('get role', function(newRole){
  playerScores.style.display = 'none';
  voting.style.display = "none";
  votingResults.style.display = 'none';
  role.style.display = "block";
  roleOut.innerHTML = newRole;
});

function clickReady(bool) {
  if (bool) {
    $('#ready').attr('disabled', true);
    readyButton.style.backgroundColor = '#0d900b';
    readyButton.style.color = '#ffffff';
    readyButton.innerHTML = 'Ready';
  }
  else {
    $('#ready').attr('disabled', false);
    readyButton.style.backgroundColor = '#e3e5e8';
    readyButton.style.color = '#000000';
    readyButton.innerHTML = 'Click when ready';
  }
}

readyButton.onclick = function() {
  console.log('clicked');
  clickReady(true);
  socket.emit('ready');
}

socket.on('update round info', function(roundData) {
  document.querySelector('#roundInfo').innerHTML = 'Trial ' + roundData.currTrial.toString() + '/' + roundData.totalTrials.toString() + ' & Round ' + roundData.currRound.toString() + '/' + roundData.totalRounds.toString();
  clickReady(false);
});

socket.on('voting time', function(names) {
  socket.emit('print', thisName + ' has just received the names and will vote soon');

  playerScores.style.display = 'none';
  voting.style.display = "block";
  votingResults.style.display = 'none';
  role.style.display = "none";

  organizeNames(names);
});

socket.on('vote result', function(data) {
  voting.style.display = "none";
  role.style.display = "none";
  playerScores.style.display = 'none';
  votingResults.style.display = 'block';

  votedName.innerHTML = data.pick;
  votedNameResult.innerHTML = data.result;
});

socket.on('display scores', displayScores);
