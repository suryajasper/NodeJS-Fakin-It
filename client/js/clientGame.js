var roleOut = document.querySelector('#prompt');
var voting = document.querySelector('#voting');
var readyButton = document.getElementById('ready');

var socket = io();

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

function makeName(name) {
  var h3 = document.createElement('h3');
  h3.innerHTML = name;
  return h3;
}
function organizeNames(names) {
  var tr = document.createElement('tr');
  for (var i = 0; i < names.length; i++) {
    var newName = makeName(names[i]);
    tr.appendChild(newName);
  }
  voting.appendChild(tr);
  voting.appendChild(document.createElement('br'));
}

//console.log('cookie: ' + getCookie('username'));
//socket.emit('sending identity', {name: getCookie('username'), room: getCookie('room')});
var toParse = window.location.href.split('?')[1].split('&');
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

socket.on('decision time') {
  
}
