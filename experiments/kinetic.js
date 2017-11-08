var station_start_time;
var station_time;
var station_current_time;
var stations = [];
var fake_stations = [];
var rail_lines = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  stations.push(new Station(windowWidth/2, windowHeight/2));
  station_start_time = millis();
  station_time = random(3, 5);
}

function draw() {

  for (var i = 0; i < rail_lines.length; i++) {
    rail_lines[i].display();
  }
  for (var i = 0; i < stations.length; i++) {
    stations[i].display();
  }

  for (var i = 0; i < fake_stations.length; i++) {
    fake_stations[i].display();
  }

  station_current_time = station_time - (millis()-station_start_time)/1000;
  if (station_current_time <= 0){
    station_start_time = millis();
    station_time = random(1, 3);
    var line_number = floor(random(0, rail_lines.length));
    if (rail_lines[line_number].current_position_x() < windowWidth && rail_lines[line_number].current_position_x() > 0 && (rail_lines[line_number].current_position_y() < windowHeight && rail_lines[line_number].current_position_y() > 0)) {
        stations.push(new Station(rail_lines[line_number].current_position_x(), rail_lines[line_number].current_position_y()));
    }

  }

}

//function mouseClicked() {

  //stations.push(new Station(mouseX, mouseY));

//}

function touchStarted() {

  stations.push(new Station(mouseX, mouseY));

}

function keyPressed(){

  if (keyCode === 32){

    print("TEST");
    fake_stations.push(new fake_station(mouseX, mouseY));

  }

}


class Station{

  constructor(x, y){
    this.xpos = x;
    this.ypos = y;
    this.rx = random(-1, 1);
    this.ry = random(-1, 1);
    this.rc = color (random(0,255), random(0,255), random(0,255));
    this.diameter = 20;

    rail_lines.push(new rail_line(this.xpos, this.ypos, this.rx, this.ry, this.rc));
    rail_lines.push(new rail_line(this.xpos, this.ypos, -this.rx, -this.ry, this.rc));

  }

  display(){
    fill(255);
    stroke(0);
    strokeWeight(3);
    ellipse(this.xpos, this.ypos, this.diameter, this.diameter);
  }

}

class rail_line {

  constructor(x, y, xs, ys, c) {
    this.xpos = x;
    this.ypos = y;
    this.hue = c;

    this.start_time = millis();
    this.turn_time = random(2, 6);
    this.direction = new p5.Vector(xs, ys);
    this.current_time = this.turn_time - (millis()-this.start_time)/1000;
    this.direction.normalize();
  }

  current_position_x() {
    return this.xpos;
  }

  current_position_y() {
    return this.ypos;
  }

  display() {
    noFill();
    stroke(this.hue);
    strokeWeight(7);
    if ((this.xpos < windowWidth && this.xpos > 0) && (this.ypos < windowHeight && this.ypos > 0)) {
      this.current_time = this.turn_time - (millis()-this.start_time)/1000;
      ellipse(this.xpos, this.ypos, 2, 2);
      this.xpos += this.direction.x;
      this.ypos += this.direction.y;
      if (this.current_time <= 0) {
        this.start_time = millis();
        if (round(random(0, 1)) < 1) {
          this.direction.rotate(random(0, QUARTER_PI));
        } else {
          this.direction.rotate(random(-QUARTER_PI, 0));
        }
      }
    }
  }
}

class fake_station{

  constructor(x, y){

    this.xpos = x;
    this.ypos = y;
    this.diameter = 20;

  }

  display(){
    fill(255);
    stroke(0);
    strokeWeight(3);
    ellipse(this.xpos, this.ypos, this.diameter, this.diameter);
  }

}
