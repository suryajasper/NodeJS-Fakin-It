var maxChars = 20;

var nameText = document.getElementById('nameText');
var nameField = document.getElementById('playerName');

nameText.innerHTML = 'Enter your name (' + maxChars.toString() + ')'

nameField.oninput = () => {
  if (nameField.value.length > maxChars) {
    nameField.value = nameField.value.substring(0, maxChars);
  }
  nameText.innerHTML = 'Enter your name (' + (maxChars - nameField.value.length).toString() + ')';
}
