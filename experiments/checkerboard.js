var capture;
var stepSize = 16;

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();
  pixel_button = createButton('Increase Resolution')
  pixel_button.position((windowWidth/2)-(pixel_button.width/2), windowHeight-80);
  pixel_button.mousePressed(toggle_pixels);
  rectMode(CENTER);
  noStroke();
}

function draw() {
  background(0);
  capture.loadPixels();

  for (var y=0; y<=capture.height; y+=stepSize) {
    for (var x=0; x<=capture.width; x+=stepSize) {
      var i = 4 * (y * capture.width + x);

      if(y % (stepSize*2) == 0 && x % (stepSize*2) == 0){
        fill(capture.pixels[i],capture.pixels[i+1], capture.pixels[i+2]);
        rect(x + ((windowWidth/2)-capture.width/2), y + ((windowHeight/2)-capture.height/2), stepSize, stepSize);
      } else if (y % (stepSize*2) != 0 && x % (stepSize*2) != 0) {
        fill(capture.pixels[i],capture.pixels[i+1], capture.pixels[i+2]);
        rect(x + ((windowWidth/2)-capture.width/2), y + ((windowHeight/2)-capture.height/2), stepSize, stepSize);
      }
    }
  }
}

function toggle_pixels() {
  if (stepSize == 16) {
    stepSize = 12;
    pixel_button.html('Decrease Resolution');
  } else {
    stepSize = 16;
    pixel_button.html('Increase Resolution');
  }
}
