var capture;
var last_frame = new Array();
var button;
var video_showing = false;
var stepSize = 12;

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();
  button = createButton('Show Video');
  pixel_button = createButton('Increase Resolution')
  button.position((windowWidth/2)-(button.width/2), windowHeight-100);
  button.mousePressed(toggle);
  pixel_button.position((windowWidth/2)-(pixel_button.width/2), windowHeight-80);
  pixel_button.mousePressed(toggle_pixels);
  rectMode(CENTER);
  noStroke();
  frameRate(12);
}

function draw() {
  noStroke();
  background(255);
  imageMode(CENTER);

  if (video_showing) {
    image(capture, windowWidth/2, windowHeight/2, 640, 480);
  }

  capture.loadPixels();

  for (var y=0; y<=capture.height; y+=stepSize) {
    for (var x=0; x<=capture.width; x+=stepSize) {
      var i = 4 * (y * capture.width + x);

      var red_changed = (capture.pixels[i] - last_frame[i]) /255;
      var grn_changed = (capture.pixels[(i+1)] - last_frame[(i+1)]) /255;
      var blu_changed = (capture.pixels[(i+2)] - last_frame[(i+2)]) /255;

      last_frame[i] = capture.pixels[i];
      last_frame[(i+1)] = capture.pixels[(i+1)];
      last_frame[(i+2)] = capture.pixels[(i+2)];

      var radius = stepSize * ((red_changed + grn_changed + blu_changed)/3);
      if (radius >= 1 || radius <= -1){
      fill(capture.pixels[i],capture.pixels[i+1], capture.pixels[i+2]);
      rect(x + ((windowWidth/2)-capture.width/2), y + ((windowHeight/2)-capture.height/2), radius * 2, radius * 2);
      }
    }
  }
}

function toggle() {
  video_showing = !video_showing;
  if (video_showing) {
    button.html('Hide Video');
  } else {
    button.html('Show Video');
  }
}

function toggle_pixels() {
  if (stepSize == 12) {
    stepSize = 8;
    pixel_button.html('Decrease Resolution');
  } else {
    stepSize = 12;
    pixel_button.html('Increase Resolution');
  }
}
