function createInput(prompt) {
  var newListElement = document.createElement('li');
  var newInput = document.createElement('input');
  newInput.setAttribute('type', 'text');
  if (prompt != null) {
    newInput.value = prompt;
  }
  newListElement.appendChild(newInput);
  return newListElement;
}

function makeEverything(questions) {
  for (var i = 0; i < Object.keys(questions).length; i++) (function(i) {
    var category = Object.keys(questions)[i];
    console.log('cat ' + category);
    var divToAppendTo = document.getElementById(category);
    var h1 = document.getElementById('h1' + category);
    for (var j = 0; j < questions[category].length; j++) {
      divToAppendTo.appendChild(createInput(questions[category][j]));
    }
    document.getElementById('button' + category).onclick = function() {
      divToAppendTo.appendChild(createInput(null));
    }
  })(i);
}

function loadJSON(filename, callback) {
   var xobj = new XMLHttpRequest();
   xobj.overrideMimeType("application/json");
   xobj.open('GET', filename, true); // Replace 'my_data' with the path to your file
   xobj.onreadystatechange = function () {
     if (xobj.readyState == 4 && xobj.status == "200") {
       // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
       callback(xobj.responseText);
     }
   };
   xobj.send(null);
}

if (window.localStorage.getItem('questions') != null) {
  makeEverything(window.localStorage.getItem('questions'));
} else {
  loadJSON('questions.json', function(json) {
    console.log('we here');
    makeEverything(JSON.parse(json));
  });
}
