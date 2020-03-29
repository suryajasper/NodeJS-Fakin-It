var createButton = document.getElementById('createButton');
var joinButton = document.getElementById('joinButton');

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
  socket.emit('print', 'refreshing list');
  $("#playerlist").empty();
  for (var i = 0; i < names.length; i++) {
    var li = document.createElement('li');
    var h3 = document.createElement('h3');
    h3.innerHTML = names[i];
    li.appendChild(h3);
    plist.appendChild(li);
  }
}

function setCookie(cookieText, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cookieText + expires + ";path=/";
}

createButton.onclick = function(e) {
  e.preventDefault();
  socket.emit('createGame', {name: playerName.value, room: gameName.value});

  form.style.display = "none";
  lobby.style.display = "block";
  gameButtons.style.display = 'block';
  footertext.style.display = 'none';
}
joinButton.onclick = function(e) {
  e.preventDefault();
  socket.emit('createGame', {name: playerName.value, room: gameName.value});

  form.style.display = "none";
  lobby.style.display = "block";
  gameButtons.style.display = 'block';
  footertext.style.display = 'none';
}
socket.on('makeCookie', function(cookieText) {
  setCookie(cookieText, 365);
});

socket.on('redirect', function(destination) {
  socket.emit('print', 'user is being redirected');
  window.location.href = destination;
});

leaveButton.onclick = function() {
  form.style.display = "block";
  lobby.style.display = "none";
  gameButtons.style.display = 'none';
  footertext.style.display = 'block';
  socket.emit('playerLeaving', playerName.value);
}
startButton.onclick = function() {
  console.log('clicked');
  socket.emit('randomize roles');
  socket.emit('print', 'asking server to redirect');
  socket.emit('redirect me to the game');
}

socket.on('newPlayerList', function(newPlayerList){
  refreshList(newPlayerList);
});
