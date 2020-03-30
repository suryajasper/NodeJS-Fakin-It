var socket = io();
var roleOut = document.querySelector('#prompt');

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

//console.log('cookie: ' + getCookie('username'));
//socket.emit('sending identity', {name: getCookie('username'), room: getCookie('room')});
var toParse = window.location.href.split('?')[1].split('&');
socket.emit('sending identity', {name: toParse[0], room: toParse[1]});
socket.emit('give me a role');
socket.on('get role', function(newRole){
  roleOut.innerHTML = newRole;
});
