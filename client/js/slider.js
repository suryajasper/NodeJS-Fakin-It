
var slider = document.getElementById('slider');
var start = 0;

async function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout*1000);
  });
}

function setToPercent(percent) {
  var ctx = slider.getContext("2d");
  console.log('setting to ' + percent);
  ctx.clearRect(0, 0, slider.width, slider.height);
  ctx.rect(0, 20, slider.width * (percent/100), slider.height);
  ctx.fillStyle = "rgb(187, 12, 180)";
  ctx.fill();
}

setToPercent(start);

async function timer(seconds) {
  for (var i = 0; i < seconds * 12; i++) {
    start+= 1;
    setToPercent(start);
    await wait(seconds / 12);
  }
}
timer(5);
