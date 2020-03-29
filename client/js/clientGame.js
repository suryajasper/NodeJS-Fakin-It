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

console.log('cookie: ' + getCookie('username'));

socket.emit('sending identity', getCookie('username'));
socket.emit('give me a role');
socket.on('get role', function(newRole){
  roleOut.innerHTML = newRole;
});