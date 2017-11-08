var battle_buttons;
var button_height;
var battlemode = false;
var player_turn = true;
var txt_color = 0;
var button_pushed;

var player;

var SCENE_W = 1600;
var SCENE_H = 800;
var bg;

////////////////////////////////////////////////////////////////////////////////

function preload() {

  button_img = loadImage("./images/game_assets/button.png");

}

////////////////////////////////////////////////////////////////////////////////

function setup() {
  textAlign(CENTER);
  createCanvas(800, 600);

  bg = new Group();

  player = createSprite(400, 200, 50, 100);

  battle_buttons = new Group();
  battle_button_height = height - (height/8);
  battle_buttons.add(attack1_button = createSprite(width/5, height+this.height));
    attack1_button.name = "Attack 1";
  battle_buttons.add(attack2_button = createSprite(width/2, height+this.height));
    attack2_button.name = "Attack 2";
  battle_buttons.add(special_button = createSprite(width - (width/5), height+this.height));
    special_button.name = "Special";
  battle_buttons.add(items_button = createSprite(width - (width/5), height+this.height));
    items_button.name = "Items";
  battle_buttons.add(run_button = createSprite(width - (width/5), height+this.height));
    run_button.name = "Run!";

  //Set up buttons and their mouse events
  for(var i = 0; i<battle_buttons.length; i++) {
    battle_buttons[i].addAnimation("test", button_img);
    battle_buttons[i].onMouseOver = function() {
    }
    //Set button_pushed to this button's name and end turn when clicked
    battle_buttons[i].onMousePressed = function() {
      if (player_turn == true){
        print("Clicked button " + this.name);
        button_pushed = this.name;
        player_turn = false;
      }
    }
    battle_buttons[i].position.x = (((width + (battle_buttons[i].width)/2)/(battle_buttons.length + 1)) * (i+1)) - (battle_buttons[i].width)/4;
    battle_buttons[i].setCollider("rectangle", 0, 0, battle_buttons[i].width, battle_buttons[i].height);
  }

  //Set up some background stuff
  for(var i=0; i<20; i++){
    var thing = createSprite(random(0, SCENE_W), random(0, SCENE_H));
    bg.add(thing);
  }
}

////////////////////////////////////////////////////////////////////////////////

function draw() {

  background(255);
  playerMove();

  camera.on();

  if (battlemode == false){
    bg.draw();
    //Draw the borders
      fill(0,0);
      stroke(0);
      rect(0 - player.width/2, 0 - player.height/2, SCENE_W + player.width, SCENE_H + player.height);
  }

  drawSprite(player);

  camera.off();

  fill(0);
  textSize(12);
  text("WASD to move while outside of battle", 100, 60);
  text("Space to toggle battle mode, shift to toggle if it's your turn", 100, 80);

  //Mode switching
  if(battlemode == true){
    text("battlemode = true", 100, 100);
    battle_mode();
    player.velocity.x = 0;
    player.velocity.y = 0;

    } else {
      text("battlemode = false", 100, 100);
      for(var i = 0; i<battle_buttons.length; i++) {
        var scl_lerp = lerp(battle_buttons[i].position.y, height + battle_buttons[i].height, 0.1);
        battle_buttons[i].position.y = scl_lerp;
      }
      if (txt_color >= 10){
        txt_color = lerp(txt_color, 0, 0.05);
        fill(0, txt_color);
        textSize(64);
        text("Explore!", width/2 - 120, height/2);
      }
  }

  fill(0);
  textSize(12);
  if(player_turn == true){
    text("player_turn = true", 100, 120);
  } else {
    text("player_turn = false", 100, 120);
  }



  battle_buttons.draw();

}

////////////////////////////////////////////////////////////////////////////////

function battle_mode(){

  if (button_pushed != null){
    text("Current Action: " + button_pushed, 100, 140);
  }

  //Shows Battle! text
  if (txt_color >= 10){
    txt_color = lerp(txt_color, 0, 0.05);
    fill(0, txt_color);
    textSize(64);
    text("Battle!", width/2 - 100, height/2);
  }

  //Player's turn
  if(player_turn == true){
    //Show the battle buttons
    for(var i = 0; i<battle_buttons.length; i++) {
      var scl_lerp = lerp(battle_buttons[i].position.y, battle_button_height, 0.1);
      battle_buttons[i].position.y = scl_lerp;
    }

    //Make buttons react to hovering
    for(var i = 0; i<battle_buttons.length; i++) {
      if(battle_buttons[i].mouseIsOver){
          battle_buttons[i].scale = 1.2 * (3/battle_buttons.length);
          battle_buttons[i].rotation -= (Math.sin(millis()/100))/5;
        } else {
          var rot_lerp = lerp(battle_buttons[i].rotation, 0, 0.5);
          battle_buttons[i].rotation = rot_lerp;
          var scl_lerp = lerp(battle_buttons[i].scale, (3/battle_buttons.length), 0.1);
          battle_buttons[i].scale = scl_lerp;
        }
    }

  } else if(player_turn == false) /*Lower the battle buttons*/ {
    for(var i = 0; i<battle_buttons.length; i++) {
      var pos_lerp = lerp(battle_buttons[i].position.y, height /*+ battle_buttons[i].height*/, 0.1);
      battle_buttons[i].position.y = pos_lerp;
      var rot_lerp = lerp(battle_buttons[i].rotation, 0, 0.5);
      battle_buttons[i].rotation = rot_lerp;
      var scl_lerp = lerp(battle_buttons[i].scale, (3/battle_buttons.length), 0.1);
      battle_buttons[i].scale = scl_lerp;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

function playerMove(){

  if(keyDown("w")) {
    player.addSpeed(3, -90);
  }
  if (keyDown("s")) {
    player.addSpeed(3, 90);
  }
  if (keyDown("a")) {
    player.addSpeed(3, 180);
  }
  if (keyDown("d")) {
    player.addSpeed(3, 0);
  }

  player.limitSpeed(12);
  player.friction = 0.2;

  //set the camera position to the player position
  if (battlemode == false){
    var posx_lerp = lerp(camera.position.x, player.position.x, 0.3);
    camera.position.x = posx_lerp;
    var posy_lerp = lerp(camera.position.y, player.position.y, 0.3);
    camera.position.y = posy_lerp;

    var scl_lerp = lerp(camera.zoom, 1 / (player.velocity.mag()*0.01 + 1), 0.05);
    camera.zoom = scl_lerp;

  } else if (battlemode == true) {
    var posx_lerp = lerp(camera.position.x, player.position.x + width/4, 0.1);
    camera.position.x = posx_lerp;
    var posy_lerp = lerp(camera.position.y, player.position.y - 50, 0.1);
    camera.position.y = posy_lerp;

    var scl_lerp = lerp(camera.zoom, 1, 0.1);
    camera.zoom = scl_lerp;
  }

  //limit the player movements
  if(player.position.x < 0)
    player.position.x = 0;
  if(player.position.y < 0)
    player.position.y = 0;
  if(player.position.x > SCENE_W)
    player.position.x = SCENE_W;
  if(player.position.y > SCENE_H)
    player.position.y = SCENE_H;

}

////////////////////////////////////////////////////////////////////////////////

function keyPressed(){

  if (keyCode === 32){

    battlemode = !battlemode;
    if (battlemode == false){
      //player_turn = false;
      button_pushed = null;
    } else {
      //player_turn = true;
    }
    txt_color = 255;

  }

  if (keyCode === 16){

    player_turn = !player_turn;

  }

}
