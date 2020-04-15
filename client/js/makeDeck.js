var categories = [];
var JSONobj = null;

function downloadObjectAsJson(exportObj, exportName){
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

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

function convertElementsToJSON() {
  for (var i = 0; i < categories.length; i++) {
    var childnodes = document.getElementById(categories[i]).children;
    JSONobj[categories[i]] = [];
    for (var j = 0; j < childnodes.length; j++) {
      var inputField = childnodes[j].children[0];
      JSONobj[categories[i]].push(inputField.value);
    }
  }
  console.log(JSONobj);
}

function makeEverything(questions) {
  JSONobj = questions;
  categories = Object.keys(questions);
  for (var i = 0; i < Object.keys(questions).length; i++) (function(i) {
    var category = Object.keys(questions)[i];
    console.log('cat ' + category);
    var divToAppendTo = document.getElementById(category);
    var h1 = document.getElementById('h1' + category);
    for (var j = 0; j < questions[category].length; j++) {
      divToAppendTo.appendChild(createInput(questions[category][j]));
    }
    document.getElementById('button' + category).onclick = function() {
      convertElementsToJSON();
      window.localStorage.setItem('questions', JSON.stringify(JSONobj));
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
  makeEverything(JSON.parse(window.localStorage.getItem('questions')));
  document.getElementById('download').onclick = function() {
    downloadObjectAsJson(JSON.parse(window.localStorage.getItem('questions')), 'genprompts');
  }
} else {
  loadJSON('questions.json', function(json) {
    makeEverything(JSON.parse(json));
  });
  document.getElementById('download').onclick = function() {
    convertElementsToJSON();
    downloadObjectAsJson(JSONobj, 'genprompts');
  }
}
document.getElementById('save').onclick = function() {
  convertElementsToJSON();
  window.localStorage.setItem('questions', JSON.stringify(JSONobj));
}
