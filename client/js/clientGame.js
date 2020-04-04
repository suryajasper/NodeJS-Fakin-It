var roleDiv = document.querySelector('#role');

var roleOut = document.querySelector('#prompt');
var voting = document.querySelector('#voting');
var votingRow = document.querySelector('#voterow');
var readyButton = document.getElementById('ready');
var socket = io();

voting.style.display = "none";
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

function organizeNames(names) {
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
  roleOut.innerHTML = newRole;
});

readyButton.onclick = function() {
  console.log('clicked');
  $('#ready').attr('disabled','disabled');
  readyButton.style.backgroundColor = '#0d900b';
  readyButton.style.color = '#ffffff';
  readyButton.innerHTML = 'Ready';
  socket.emit('ready');
}

socket.on('voting time', function(names) {
  socket.emit('print', thisName + ' has just received the names and will vote soon');

  voting.style.display = "block";
  role.style.display = "none";

  organizeNames(names);
});
