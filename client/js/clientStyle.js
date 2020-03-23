var maxChars = 12;

var nameText = document.getElementById('nameText');
var nameField = document.getElementById('playerName');

nameText.innerHTML = 'Enter your name (' + maxChars.toString() + ')'

nameField.oninput = () => {
  nameText.innerHTML = 'Enter your name (' + (maxChars - nameField.value.length).toString() + ')';
}
