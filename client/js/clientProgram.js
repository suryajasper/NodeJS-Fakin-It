var socket = io();

var createButton = document.getElementById('createButton');
var joinButton = document.getElementById('joinButton');

var playerName = document.getElementById('playerName');
var gameName = document.getElementById('gameName');

var form = document.getElementById('form');
var optionsMenu = document.getElementById('options');
var optionsSliders = document.getElementById('optionsSliders');
var optionsSubmit = document.getElementById('finishedOptions');
var lobby = document.getElementById('lobby');

form.style.display = "block";
lobby.style.display = "none";

var gameButtons = document.querySelector('#gamebuttons');
var footertext = document.querySelector('#disclaimer');

var startButton = document.querySelector('#start');
var leaveButton = document.querySelector('#leave');

var plist = document.getElementById('playerlist');

function formatOptions() {
  var sliderChildren = optionsSliders.children;
  var optionsToReturn = {};
  for (var i = 0; i < sliderChildren.length; i++) {
    socket.emit('print', i.toString() + ': ' + sliderChildren[i].tagName);
    socket.emit('print', i.toString() + ': ' + sliderChildren[i].getAttribute('type'));
    if (sliderChildren[i].tagName === 'INPUT' && sliderChildren[i].getAttribute('type') === 'range') {
      socket.emit('print', 'we got an input');
      optionsToReturn[sliderChildren[i].id] = parseInt(sliderChildren[i].value);
    }
  }
  socket.emit('print', optionsToReturn);
  return optionsToReturn;
}

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

function changeVal(el) {
  var currText = document.getElementById('p' + el.id).innerHTML;
  currText = currText.substring(0, currText.indexOf('[') + 1) + el.value.toString() + ']';
  document.getElementById('p' + el.id).innerHTML = currText;
}

function setCookie(cookieText, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cookieText + expires + ";path=/";
}

createButton.onclick = function(e) {
  e.preventDefault();
  form.style.display = "none";
  optionsMenu.style.display = "block";

  finishedOptions.onclick = function(e2) {
    e2.preventDefault();
    socket.emit('createGame', {name: playerName.value, room: gameName.value, options: formatOptions()});
    optionsMenu.style.display = "none";
    lobby.style.display = "block";
    gameButtons.style.display = 'block';
    footertext.style.display = 'none';
  }
}
joinButton.onclick = function(e) {
  e.preventDefault();
  socket.emit('joinGame', {name: playerName.value, room: gameName.value});

  form.style.display = "none";
  lobby.style.display = "block";
  gameButtons.style.display = 'block';
  footertext.style.display = 'none';
}

socket.on('makeCookie', function(cookieText) {
  setCookie(cookieText, 365);
});

socket.on('error', function(errorMsg) {
  window.alert(errorMsg);
});

socket.on('redirect', function(destination) {
  socket.emit('print', 'user is being redirected and his name is ' + playerName.value + ' room: ' + gameName.value);
  window.location.href = destination + '?' + playerName.value + "&" + gameName.value;
});

leaveButton.onclick = function() {
  form.style.display = "block";
  lobby.style.display = "none";
  gameButtons.style.display = 'none';
  footertext.style.display = 'block';
  socket.emit('playerLeaving', playerName.value);
}
startButton.onclick = function() {
  socket.emit('randomize roles');
  socket.emit('print', 'asking server to redirect');
  socket.emit('redirect me to the game');
}

socket.on('newPlayerList', function(newPlayerList){
  refreshList(newPlayerList);
  socket.emit('print', 'received a list');
  socket.emit('print', newPlayerList);
});

var ranges = document.getElementsByTagName('input');
console.log(ranges);
for (var i = 0; i < ranges.length; i++)(function(i) {
  var typeOfRange = ranges[i].getAttribute('type');
  if (typeOfRange === 'range') {
    changeVal(ranges[i]);
    ranges[i].oninput = function() {
      changeVal(this);
    };
  }
})(i);
