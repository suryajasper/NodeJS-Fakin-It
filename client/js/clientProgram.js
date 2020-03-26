var socket = io();

var submitButton = document.getElementById('submitButton');
var playerName = document.getElementById('playerName');
var gameName = document.getElementById('gameName');

var form = document.getElementById('form');
var lobby = document.getElementById('lobby');
form.style.display = "block";
lobby.style.display = "none";

var gameButtons = document.querySelector('#gamebuttons');
var footertext = document.querySelector('#disclaimer');

var startButton = document.querySelector('#start');
var leaveButton = document.querySelector('#leave');

var plist = document.getElementById('playerlist');

function refreshList(names) {
  $("#playerlist").empty();
  for (var i = 0; i < names.length; i++) {
    var li = document.createElement('li');
    var h3 = document.createElement('h3');
    h3.innerHTML = names[i];
    li.appendChild(h3);
    plist.appendChild(li);
  }
}

submitButton.onclick = function(e) {
  e.preventDefault();
  socket.emit('playerName', playerName.value);
  socket.emit('gameName', gameName.value);
  form.style.display = "none";
  lobby.style.display = "block";
  gameButtons.style.display = 'block';
  footertext.style.display = 'none';

  leaveButton.onclick = function() {
    form.style.display = "block";
    lobby.style.display = "none";
    gameButtons.style.display = 'none';
    footertext.style.display = 'block';
    socket.emit('playerLeaving', playerName.value);
  }
}

socket.on('newPlayerList', function(newPlayerList){
  refreshList(newPlayerList);
});
