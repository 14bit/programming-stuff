

//Algorithm for randomly selecting weighted entries in a list adapted from:
//https://softwareengineering.stackexchange.com/questions/150616/return-random-list-item-by-its-weight

var button_height;
var battle_mode = false;
var player_turn = true;
var txt_color = 0;
var wandering = false;
var battle_start = false;
var battle_setup = false;
var battle_end = false;
var world_paused = false;
var current_encounter;
var attacking_enemy;

var SCENE_W = 2000;
var SCENE_H = 800;

////////////////////////////////////////////////////////////////////////////////

//Get assets
function preload() {

  button_img = loadImage("./game_assets/button.png");
  arrow_img = loadImage("./game_assets/arrow.png");
  data = loadJSON("enemies.json");
  player_idle = loadAnimation("./game_assets/knight_idle_1.png", "./game_assets/knight_idle_6.png");
  player_idle_flipped = loadAnimation("./game_assets/knight_idle_flipped_0.png", "./game_assets/knight_idle_flipped_5.png");
  player_idle.frameDelay = 12;
  player_idle_flipped.frameDelay = 12;

  player_run = loadAnimation("./game_assets/knight_run_0.png", "./game_assets/knight_run_9.png");
  player_run.frameDelay = 6;

  battle_top = loadImage("./game_assets/battle_top.png");
  battle_bottom = loadImage("./game_assets/battle_bottom.png");

  player_run_flipped = loadAnimation("./game_assets/knight_run_flipped_0.png", "./game_assets/knight_run_flipped_9.png");
  player_run_flipped.frameDelay = 6;


}

////////////////////////////////////////////////////////////////////////////////

function setup() {
  textAlign(CENTER);
  createCanvas(800, 600);

  enemies = data.enemies;
  encounters = data.encounters;

  //Create background group
  bg = new Group();

  //Encounter group for collisions
  encount_spr = new Group();

  //Create player
  player = new Player(SCENE_W/2, SCENE_H/2);

  //Set up the damage indicators
  indicators = new Array();

  //Used for targeting in battle and stuff
  enemy_array = new Array();

  //Used to queue up player moves
  player_moves = new Array();
  player_moves_readable = new Array();

  selector = createSprite((SCENE_W/2), (SCENE_H/2));
  selector.scale = 0.25;
  selector.addImage(arrow_img);

  //Set up the battle background
  back_top = createSprite((SCENE_W/2) + 190, - height);
  back_top.addImage(battle_top);
  back_top.scale = 0.55;
  back_bottom = createSprite((SCENE_W/2) + 190, SCENE_H + height);
  back_bottom.addImage(battle_bottom);
  back_bottom.scale = 0.55;

  //Set up battle buttons
  battle_buttons = new Array();
  battle_button_height = height - (height/8);

  battle_buttons.push(new battle_button(0, height+this.height, "Sword"));
  battle_buttons.push(new battle_button(0, height+this.height, "Bow"));
  //battle_buttons.push(new battle_button(0, height+this.height, "Special"));
  battle_buttons.push(new battle_button(0, height+this.height, "Recover"));
  battle_buttons.push(new battle_button(0, height+this.height, "Run!"));

  //Set up encounters
  // TODO: This is debug code, make this happen dynamically when loading rooms, instead of in setup
  enemy_encounters = new Array();
  enemy_encounters.push(new Encounter(1, SCENE_W/2 + 600, SCENE_H/2 + 200));
  enemy_encounters.push(new Encounter(0, SCENE_W/2 - 200, SCENE_H/2 - 400));
  enemy_encounters.push(new Encounter(2, SCENE_W/2 - 600, SCENE_H/2 + 400));

  //Resize/position buttons based on the number that exist
  for(var i = 0; i<battle_buttons.length; i++) {

    battle_buttons[i].spr.position.x = (((width + (battle_buttons[i].spr.width)/2)/(battle_buttons.length + 1)) * (i+1)) - (battle_buttons[i].spr.width)/4;
    battle_buttons[i].spr.setCollider("rectangle", 0, 0, battle_buttons[i].spr.width, battle_buttons[i].spr.height);
  }

  //Debug code for collidable objects, reuse this with invisible
  //objects to match background later
  coll = new Group();
  coll.add(block = createSprite(350, 400, 200, 200));
  coll.add(block2 = createSprite(500, 500, 200, 200));
  coll.add(block2 = createSprite(1200, 200, 400, 200));
  coll.add(block2 = createSprite(1200, 700, 400, 200));

  block.shapeColor = 0;
  block2.shapeColor = 0;

  for(var i = 0; i<coll.length; i++) {
    coll[i].shapeColor = 0;
    //coll[i].debug = true;
  }

}

////////////////////////////////////////////////////////////////////////////////

function draw() {

  background(255);

  //Enable the camera to draw everything other than the HUD
  camera.on();

  //Draw and turn on collisions for everything outside of battle
  if (world_paused == false){
    player.move();
    player.spr.collide(coll);
    for (var i = 0; i < enemy_encounters.length; i++) {
      enemy_encounters[i].spr.collide(coll);
      enemy_encounters[i].spr.collide(encount_spr);
    }

    //Draw the borders, this is temporary until art and collisions are done
    fill(0,0);
    stroke(0);
    rect(0 - player.spr.width/2, 0 - player.spr.height/2, SCENE_W + player.spr.width, SCENE_H + player.spr.height);
  }

  //Draw the background and collidable objects until the battle background is in place
  if(battle_mode == false){

    bg.draw();
    coll.draw();

  }

  //Draw encounters
  for (var i = 0; i < enemy_encounters.length; i++) {
    enemy_encounters[i].display();
    enemy_encounters[i].move();
  }

  //Draw battle backgrounds
  drawSprite(back_bottom);
  drawSprite(back_top);

  //Draw enemies in battle
  for (var i = 0; i < enemy_array.length; i++) {
    enemy_array[i].display();
  }

  //Draw player
  player.display();

  //Draw damage counters
  for (var i = 0; i < indicators.length; i++) {
    indicators[i].display();
  }

  //Run the battle loop
  if(world_paused == true) {
   player.battle_active();
 }

  //Disable camera to draw the HUD
  camera.off();

  //Switching to battle
  if(world_paused == true && battle_setup == true){
    player.battle_prep();

    //Shows Battle! text
    if (txt_color >= 10){
      txt_color = lerp(txt_color, 0, 0.05);
      fill(0, txt_color);
      textSize(64);
      text("Battle!", width/2 - 100, height/2);
    }
  }

  //Exit battle
  if(world_paused == true && battle_end == true){
    player.battle_exit();

    //Show "Explore!" text when switching modes
    if (txt_color >= 10){
      txt_color = lerp(txt_color, 0, 0.05);
      fill(0, txt_color);
      textSize(64);
      text("Explore!", width/2 - 120, height/2);
    }
  }

  //Draw the battle buttons
  for(var i = 0; i<battle_buttons.length; i++) {
    battle_buttons[i].display();
  }

  //Debug text/instructions
  fill(0);
  textSize(12);
  textAlign(LEFT);
  text("WASD to move while outside of battle", 20, 60);
  text("Press q to remove moves from the queue, and e to perform queued up moves when the queue is full", 20, 80);

  text("Moves queue:", 20, 100);
  if (player_moves_readable[0] != null){
    text(player_moves_readable[0], 20, 120);
  }
  if (player_moves_readable[1] != null){
    text(player_moves_readable[1], 20, 140);
  }

  //Health bar
  playerHealth();

}

////////////////////////////////////////////////////////////////////////////////

class Player{

  //Set up the player
  constructor(x,y){

    //Create sprite and collisions
    this.spr = createSprite(x, y, 50, 100);
    this.spr.addAnimation("idle", player_idle);
    this.spr.addAnimation("idle_flipped", player_idle_flipped);
    this.spr.addAnimation("run", player_run);
    this.spr.addAnimation("run_flipped", player_run_flipped);


    this.spr.scale = 0.3;

    this.flipped = false;

    this.spr.setCollider("rectangle", 0, 25, 200, 200);
    //this.spr.debug = true;

    this.max_health = 10;
    this.current_health = 10;

    this.can_be_attacked = true;

    //This determines if the player can add moves to the queue
    this.can_attack = true;
    this.in_progress = false;

    this.spr.world_position = createVector(this.spr.position.x, this.spr.position.y);

  }

  //Draw the player
  display(){

    fill(0,50);
    noStroke();
    ellipse(this.spr.position.x, this.spr.position.y + 45, 70, 20);

    drawSprite(this.spr);

  }

  //Let the player move around, have the camera follow them
  //Only to be called outside of battle!
  move(){

    if(keyDown("w")) {
      this.spr.addSpeed(3, -90);
    }
    if (keyDown("s")) {
      this.spr.addSpeed(3, 90);
    }
    if (keyDown("a")) {
      this.spr.addSpeed(3, 180);
      if(this.flipped == false){
        this.flipped = true;
      }
    }
    if (keyDown("d")) {
      this.spr.addSpeed(3, 0);
      if(this.flipped == true){
        this.flipped = false;
      }
    }

    if(this.spr.velocity.mag() > 0){

      if(this.flipped == false){
        this.spr.changeAnimation("run");
      } else {
        this.spr.changeAnimation("run_flipped");

      }

    }

    if(keyDown("w") != true && keyDown("s") != true && keyDown("a") != true && keyDown("d") != true){

      if(this.flipped == false){
        this.spr.changeAnimation("idle");
      } else {
        this.spr.changeAnimation("idle_flipped");
      }

    }

    this.spr.limitSpeed(12);
    this.spr.friction = 0.2;

    //set the camera position to the player position
    camera.position.lerp(this.spr.position, 0.3);

    //Zoom the camera based on velocity
    var scl_lerp = lerp(camera.zoom, 1 / (this.spr.velocity.mag()*0.03 + 1), 0.05);
    camera.zoom = scl_lerp;

    //limit the player movements
    if(this.spr.position.x < -60)
      this.spr.position.x = -60;
    if(this.spr.position.y < -85)
      this.spr.position.y = -85;
    if(this.spr.position.x > SCENE_W + 60)
      this.spr.position.x = SCENE_W + 60;
    if(this.spr.position.y > SCENE_H + 35)
      this.spr.position.y = SCENE_H + 35;

  }

  //Moves player to center and sets up battle
  battle_prep(){

    if(battle_start == true){
      this.spr.changeAnimation("idle");
      this.flipped = false;
      this.spr.world_position.set(this.spr.position.x, this.spr.position.y);
      this.can_be_attacked = false;
      battle_start = false;
    }

    //text("Battle Prep!", 100, 140);

    if((this.spr.position.y - (SCENE_H/2)) <= 0.15 && (this.spr.position.y - (SCENE_H/2)) >= -0.15){

      back_top.position.y = (SCENE_H/2) - 75;
      back_bottom.position.y = (SCENE_H/2) - 75;

      //Snap camera to correct position if it's not there yet
      camera.position.home = createVector(player.spr.position.x + width/4, player.spr.position.y - 50);
      camera.battle_zoom = 1;
      camera.battle_position = camera.position.home;

      camera.position.set(camera.position.home);

      //Snap enemies to battle positions if they haven't reached it yet
      for (var i = 0; i < enemy_array.length; i++) {
        enemy_array[i].spr.position.set(enemy_array[i].spr.home_position);
      }

      //Start the battle once setup is done!
      battle_setup = false;
      battle_mode = true;

    } else {

      var backy_lerp = lerp(back_top.position.y, (SCENE_H/2) - 75, 0.1);
      back_top.position.y = backy_lerp;
      var bottomy_lerp = lerp(back_bottom.position.y, (SCENE_H/2) - 75, 0.1);
      back_bottom.position.y = bottomy_lerp;

      //Move player to the center of the scene for battle
      var posx_lerp = lerp(this.spr.position.x, (SCENE_W/2), 0.1);
      this.spr.position.x = posx_lerp;
      var posy_lerp = lerp(this.spr.position.y, (SCENE_H/2), 0.1);
      this.spr.position.y = posy_lerp;

      //camera during battle setup
      var camx_lerp = lerp(camera.position.x, player.spr.position.x + width/4, 0.1);
      camera.position.x = camx_lerp;
      var camy_lerp = lerp(camera.position.y, player.spr.position.y - 50, 0.1);
      camera.position.y = camy_lerp;

      //Zoom the camera in for battle mode
      var scl_lerp = lerp(camera.zoom, 1, 0.1);
      camera.zoom = scl_lerp;

      //Move enemies to battle positions
      for (var i = 0; i < enemy_array.length; i++) {
        enemy_array[i].slideIn();
      }

    }

  }

  //Moves player back to position and ends battle
  battle_exit(){

    //text("Battle Exit!", 100, 140);

    if((this.spr.position.y - this.spr.world_position.y) <= 0.2 && (this.spr.position.y - this.spr.world_position.y) >= -0.2){

      //Remove any enemies you ran from
      for (var i = 0; i < enemy_array.length; i++) {
        enemy_array[i].spr.remove();
      }


      //Clear all battle arrays so they don't overfill in the next fight
      enemy_array = [];
      player_moves = [];
      player_moves_readable = [];

      //Set the player back to their default battle state
      player.can_attack = true;
      player.in_progress = false;

      //Hide battle background
      back_top.position.y = -back_top.height;
      back_bottom.position.y = SCENE_H + back_top.height;

      //Exit battle
      battle_end = false;
      world_paused = false;

      //Pause before enemies can attack again
      setTimeout("player.can_be_attacked = true;", 1500);

    } else {

      //Move background out
      var backy_lerp = lerp(back_top.position.y, -back_top.height, 0.03);
      back_top.position.y = backy_lerp;
      var bottomy_lerp = lerp(back_bottom.position.y, SCENE_H + back_bottom.height, 0.03);
      back_bottom.position.y = bottomy_lerp;

      //Move to position to exit battle
      this.spr.position.lerp(this.spr.world_position, 0.1);

      //set the camera position to the player position
      camera.position.lerp(this.spr.position, 0.3);

      //Zoom the camera based on velocity
      var scl_lerp = lerp(camera.zoom, 1 / (this.spr.velocity.mag()*0.01 + 1), 0.05);
      camera.zoom = scl_lerp;

      //Move living enemies out
      for (var i = 0; i < enemy_array.length; i++) {
        enemy_array[i].slideOut();
      }

    }

  }

  battle_active(){

    if(battle_mode == true){

      //Lerp to desired zoom at all times for fancy cinematics
      var scl_lerp = lerp(camera.zoom, camera.battle_zoom, 0.1);
      camera.zoom = scl_lerp;

      //Lerp to desired position at all times for fancy cinematics
      camera.position.lerp(camera.battle_position, 0.1);

    }


    if(player_turn == true && player_moves.length < 2 && this.in_progress == false){

      this.can_attack = true;

    } else {

      this.can_attack = false;

    }

    if(this.can_attack == true && enemy_array.length > 0){

      var target_index = constrain(player_moves.length, 0, enemy_array.length-1);

      selector.heightchange = (Math.sin(millis()/100)*3);
      var posx_lerp = lerp(selector.position.x, enemy_array[target_index].spr.position.x, 0.1);
      selector.position.x = posx_lerp;
      var posy_lerp = lerp(selector.position.y, enemy_array[target_index].spr.position.y - 75 - selector.heightchange, 0.1);
      selector.position.y = posy_lerp;

      drawSprite(selector);

    } else if (enemy_array.length == 0){

      if(battle_mode == true){

        enemy_encounters[current_encounter].spr.remove();
        enemy_encounters.splice(current_encounter, 1);

        battle_end = true;
        battle_mode = false;
        txt_color = 255;

      }

    }

  }

  //Used for all modification of player health at the moment, may change to be
  //a more generalized function and have other functions do the calculations
  modify_health(value, _mode){

    switch (_mode) {

      //Adds VALUE to CURRENT health, negatives REMOVE health
      case 'add':
        this.current_health += value;
        indicators.push(new Indicator(value, this.spr.position.x, this.spr.position.y - 100));
        break;
      //Removes health
      case 'remove':
        this.current_health -= value;
        indicators.push(new Indicator(-value, this.spr.position.x, this.spr.position.y - 100));
        break;
      //Divides CURRENT health by VALUE
      case 'divide':
        if (value != 0 && this.current_health != 0){
          indicators.push(new Indicator(ceil(this.current_health/value) - this.current_health, this.spr.position.x, this.spr.position.y - 100));
          this.current_health = ceil(this.current_health/value);
        }
        break;
      //Adds a percent of MAX health
      case 'add_percent':
        if (value != 0){
          this.current_health += ceil(map(value, 0, 100, 0, this.max_health));
          indicators.push(new Indicator(ceil(map(value, 0, 100, 0, this.max_health)), this.spr.position.x, this.spr.position.y - 100));
        }
        break;
      //Removes percent of CURRENT health
      case 'remove_percent':
        if (value != 0){
          var health_removed = -(ceil(map(value, 0, 100, 0, this.current_health)));
          this.current_health -= ceil(map(value, 0, 100, 0, this.current_health));
          indicators.push(new Indicator(health_removed, this.spr.position.x, this.spr.position.y - 100));
        }
        break;
      //If no mode is specified, just simulate ADD
      default:
        this.current_health += value;
        indicators.push(new Indicator(value, this.spr.position.x, this.spr.position.y - 100));
        break;

    }

  }

  heal(){

    setTimeout("camera.battle_position = createVector(player.spr.position.x, player.spr.position.y - 50);camera.battle_zoom = 1.5;", 100);
    //setTimeout("camera.battle_zoom = 1.5;", 100);
    setTimeout("player.modify_health(3, 'add');", 900);
    setTimeout("camera.battle_position = camera.position.home;camera.battle_zoom = 1;", 1800);
    //setTimeout("camera.battle_zoom = 1;", 1800);
    setTimeout(runMoves, 3000);

  }
}

////////////////////////////////////////////////////////////////////////////////

class Encounter{

  //Set up the enemy
  constructor(encounter_number, x, y){

    //Create sprite and collisions
    this.spr = createSprite(x, y, 50, 100);

    //Due to a bug in p5.play, I cannot set a circle collider for the encounters
    //so they don't get stuck on corners. p5.play will visually move the circle
    //collider when offset in debug, but will not actually offset the calculations.
    this.spr.setCollider("rectangle", 0, 25, 50, 50);
    this.spr.debug = true;

    encount_spr.add(this.spr);

    this.encounter_number = encounter_number;

    this.enemy_group = encounters[encounter_number];

    this.spr.world_position = createVector(this.spr.position.x, this.spr.position.y);

    //var self = this;
    this.wanderID = setInterval(this.flip.bind(this), random(1500, 2500));
    this.wandering = false;

    this.direction = random(360);

  }

  flip(){
    this.wandering = !this.wandering;
  }

  display(){

    if(battle_mode == false){
      drawSprite(this.spr);
      //Debug radius and text
      fill(0,0);
      stroke(0);
      ellipse(this.spr.position.x, this.spr.position.y, 600,600);
      text(encounters[this.encounter_number].name, this.spr.position.x, this.spr.position.y);
    }

    //If player can be attacked, collide and start battle
    if(player.can_be_attacked == true && this.spr.collide(player.spr) == true && world_paused == false){
      this.enemy_spawn();
      player_turn = true;
    }

  }

  move(){

    if(dist(this.spr.position.x, this.spr.position.y, player.spr.position.x, player.spr.position.y) <= 300 && world_paused == false && player.can_be_attacked == true){

      this.wandering = false;
      this.spr.attractionPoint(3, player.spr.position.x, player.spr.position.y);

      this.spr.limitSpeed(8);
      this.spr.friction = 0.2;

    } else {

      if(this.wandering == true && world_paused == false && player.can_be_attacked == true){

        this.spr.setSpeed(2,this.direction);

      } else if(this.wandering == false && world_paused == false && player.can_be_attacked == true){

        this.direction = random(360);

      }

    }

    if(this.spr.position.x < 0)
      this.spr.position.x = 0;
    if(this.spr.position.y < -50)
      this.spr.position.y = -50;
    if(this.spr.position.x > SCENE_W)
      this.spr.position.x = SCENE_W;
    if(this.spr.position.y > SCENE_H)
      this.spr.position.y = SCENE_H;

  }

  enemy_spawn(){

    if (battle_end != true) {

      //Start battle
      world_paused = true;
      battle_setup = true;
      battle_start = true;

      current_encounter = enemy_encounters.indexOf(this);

      txt_color = 255;
    }

    for(var i=0; i<this.enemy_group.group.length; i++){

      //Create new enemy and pass it the position and name of the enemy to make
      enemy_array.push(new Enemy(getbyName(this.enemy_group.group[i].name), (SCENE_W/2) + 300 + (100*i), (SCENE_H/2)));

    }

  }

}

////////////////////////////////////////////////////////////////////////////////

//Used to get enemies in encounter group
function getbyName(key) {
  return enemies.filter(
      function(enemies){return enemies.name == key}
  );
}

////////////////////////////////////////////////////////////////////////////////

class Enemy{

  //Set up the enemy
  constructor(enemy_name, x, y){

    this.stats = enemy_name[enemy_name.length-1];

    //Create sprite and collisions
    this.spr = createSprite(SCENE_W + width, (SCENE_H/2), 50, 100);
    this.spr.setCollider("rectangle", 0, 25, 50, 50);
    //this.spr.debug = true;

    this.current_health = this.stats.health;

    this.spr.home_position = createVector(x, y);

    this.spr.debug = true;

    this.spr.mouseActive = true;
    //Due to a bug in p5.play, I cannot check if the mouse is over the enemy
    //if the camera has been moved. Because of this, I cannot show the Stats
    //of an enemy when you hover over them.

    //Create an array of probablilities of moves
    this.cumulative_weights = new Array();
    for (var i = 0; i < this.stats.moves.length; i++) {
      if (i == 0){
        this.cumulative_weights.push(this.stats.moves[i].weight);
      } else {
        this.cumulative_weights.push(this.stats.moves[i].weight + this.cumulative_weights[i-1]);
      }
    }


  }

  display(){

    //Remove this enemy if it dies
    if (this.current_health <= 0){
      this.spr.remove();
      var i = enemy_array.indexOf(this);
      enemy_array.splice(i, 1);
    }

    //Show name and health, possibly debug
    fill(0);
    text(this.stats.name, this.spr.position.x - 40, this.spr.position.y + 65);
    text(this.current_health + "/" + this.stats.health, this.spr.position.x - 40, this.spr.position.y + 95);

    //Health bar and stuff
    this.current_health = constrain(this.current_health, 0, this.stats.health);

    fill(200, 200, 200);
    stroke(0);
    rect(this.spr.position.x - 40,this.spr.position.y + 70, 80, 10);
    noStroke();
    fill(255, 0, 0);
    rect(this.spr.position.x - 38,this.spr.position.y + 72, 77*(this.current_health/this.stats.health),7);

    drawSprite(this.spr);

  }

  slideIn(){

    this.spr.position.lerp(this.spr.home_position, 0.1);

  }

  slideOut(){

    this.spr.position.lerp(createVector(SCENE_W + width, SCENE_H/2), 0.1);

  }

  //Chooses a random moves, taking into account the move's weighting
  getMove(){
    this.r = random() * this.cumulative_weights[this.cumulative_weights.length-1];

      for(var i = 0; i < this.stats.moves.length; i++)
      {
        if (this.cumulative_weights[i] > this.r)
        return(this.stats.moves[i]);
      }
  }

  attack(){

    //Get the move we are about to use
    this.move = this.getMove();

    //If it is an attack, do the attack
    // TODO: Make the move animations and add the ability to block moves
    if(this.move.type == "attack"){

      player.modify_health(this.move.power, this.move.method);

    }

    //If there is another enemy in the battle after this, run its attack function
    if(enemy_array[attacking_enemy + 1] != null){

      attacking_enemy++;
      setTimeout("enemy_array[attacking_enemy].attack();", 500);


    } else {

      setTimeout("player_turn = true;", 500);

    }

  }

  // TODO: Replace this with a more generalized function, and pass in all of the
  //damages from the attack functions
  modify_health(value, _mode){

    switch (_mode) {

      //Adds VALUE to CURRENT health, negatives REMOVE health
      case 'add':
        this.current_health += value;
        indicators.push(new Indicator(value, this.spr.position.x, this.spr.position.y - 75));
        break;
      //Divides CURRENT health by VALUE
      case 'divide':
        if (value != 0 && this.current_health != 0){
          indicators.push(new Indicator(ceil(this.current_health/value) - this.current_health, this.spr.position.x, this.spr.position.y - 75));
          this.current_health = ceil(this.current_health/value);
        }
        break;
      //Adds a percent of MAX health
      case 'add_percent':
        if (value != 0){
          this.current_health += ceil(map(value, 0, 100, 0, this.stats.health));
          indicators.push(new Indicator(ceil(map(value, 0, 100, 0, this.stats.health)), this.spr.position.x, this.spr.position.y - 75));
        }
        break;
      //Removes percent of CURRENT health
      case 'remove_percent':
        if (value != 0){
          var health_removed = -(ceil(map(value, 0, 100, 0, this.current_health)));
          this.current_health -= ceil(map(value, 0, 100, 0, this.current_health));
          indicators.push(new Indicator(health_removed, this.spr.position.x, this.spr.position.y - 75));
        }
        break;
      //If no mode is specified, just simulate ADD
      default:
        this.current_health += value;
        indicators.push(new Indicator(value, this.spr.position.x, this.spr.position.y - 75));
        break;

    }

    // TODO: Move this to the end of any attack function(s) once it is written,
    //it automatically calls the next move if there is any left in the queue
    if(enemy_array.length > 0){

      setTimeout(runMoves, 500);

    }

  }

}

////////////////////////////////////////////////////////////////////////////////

class Indicator{

  constructor(value, x, y){

    //Create sprite and collisions
    this.spr = createSprite(x, y, 25, 25);
    this.spr.shapeColor = 0;
    this.spr.setVelocity(0,-1);

    //this.xpos = x;
    //this.ypos = y;
    this.value = value;
    this.life = 25;

  }

  display(){

    if(this.value >= 1){
      fill(0, 200, 0);
    } else if (this.value <= -1){
      fill(200, 0, 0);
    }
    textSize(30);
    textAlign(CENTER);
    stroke(0);
    strokeWeight(2);
    text(this.value, this.spr.position.x, this.spr.position.y);
    this.life--;

    if(this.life <= 0){
      indicators.pop();
      this.spr.remove();
    }

  }

}

////////////////////////////////////////////////////////////////////////////////

class battle_button{

  constructor(x,y,name){

    //Create sprite and collisions
    this.spr = createSprite(width/5, height+this.height);
    this.spr.addAnimation("test", button_img);

    this.name = name;

    this.spr.mouseActive = true;
    this.spr.onMousePressed = function() {

      var target_index = constrain(player_moves.length, 0, enemy_array.length-1);

      if (player_turn == true && player.can_attack == true && enemy_array.length > 0){
        //Use this switch to call battle functions
        switch (name) {
          case 'Sword':
            print("Sword");
            player_moves_readable.push("Sword");
            player_moves.push(wrapFunction(enemy_array[target_index].modify_health, enemy_array[target_index], [-2]));
            break;
          case 'Bow':
            print("Bow");
            player_moves_readable.push("Bow");
            player_moves.push(wrapFunction(enemy_array[target_index].modify_health, enemy_array[target_index], [50, "remove_percent"]));
            break;
          case 'Special':
            print("Special");
            player_moves_readable.push("Special");
            player_moves.push(wrapFunction(player.modify_health, player, [50, "remove_percent"]));
            break;
          case 'Recover':
            print("Recover");
            player_moves_readable.push("Recover");
            player_moves.push(wrapFunction(player.heal, player));
            break;
          case 'Run!':
            print("Run");
            if(battle_mode == true){
              txt_color = 255;
              battle_end = true;
              battle_mode = false;
            }
            break;
          default:
            warn("Something's wrong! The button " + name + " doesn't have any case assigned to it!");
            break;
        }
      }
    }
  }

  display(){

    fill(0);
    textSize(12);
    textAlign(CENTER);
    text(this.name, this.spr.position.x, this.spr.position.y - 60);

    if(battle_mode == true){

      //Player's turn
      if(player_turn == true && player.can_attack == true){
        //Show the battle buttons
          var scl_lerp = lerp(this.spr.position.y, battle_button_height, 0.1);
          this.spr.position.y = scl_lerp;

        //Make buttons react to hovering
          if(this.spr.mouseIsOver){
              this.spr.scale = 1.2 * (3/battle_buttons.length);
              this.spr.rotation -= (Math.sin(millis()/100))/5;
            } else {
              var rot_lerp = lerp(this.spr.rotation, 0, 0.5);
              this.spr.rotation = rot_lerp;
              var scl_lerp = lerp(this.spr.scale, (3/battle_buttons.length), 0.1);
              this.spr.scale = scl_lerp;
            }
      }
      //Lower the battle buttons when the queue is full
      else if(player_turn == true && player.can_attack == false) {
          var pos_lerp = lerp(this.spr.position.y, height + this.spr.height/4, 0.1);
          this.spr.position.y = pos_lerp;
          var rot_lerp = lerp(this.spr.rotation, 0, 0.5);
          this.spr.rotation = rot_lerp;
          var scl_lerp = lerp(this.spr.scale, (3/battle_buttons.length), 0.1);
          this.spr.scale = scl_lerp;
      }

    } else {
      //Move battle buttons off screen
        scl_lerp = lerp(this.spr.position.y, canvas.height + this.spr.height, 0.1);
        this.spr.position.y = scl_lerp;
    }

    drawSprite(this.spr);

  }

}

////////////////////////////////////////////////////////////////////////////////

//Displays health bar, might move this to player someday
function playerHealth(){

  player.current_health = constrain(player.current_health, 0, player.max_health);

  fill(200, 200, 200);
  rect(20,20,200,20);
  noStroke();
  fill(255, 0, 0);
  rect(22,22,196*(player.current_health/player.max_health),16);

  if(player.current_health == 0){

    // TODO: Kill the player

  }

}

////////////////////////////////////////////////////////////////////////////////

//Confirm and delete queue in battle, debug code for switching battle_mode and player_turn
function keyPressed(){

  //Debug code for escaping battle
  // if (keyCode === 32){
  //
  //   if(battle_mode == true){
  //     battle_end = true;
  //     battle_mode = false;
  //
  //   }
  //
  // }

  //Bind the number keys to the battle buttons that exist
  if(keyCode >= 49 && keyCode <= 57){

    if(battle_buttons[keyCode - 49] != null){

      battle_buttons[keyCode - 49].spr.onMousePressed();

    }

  }

  //Press E to run queued moves
  if (keyCode === 69 && player.can_attack == false){

    print(player_moves);

    player.in_progress = true;

    runMoves();

  }

  //Press Q to remove most recent queued move
  if (keyCode === 81){

    if (player_moves.length != 0){

      player_moves.pop();
      player_moves_readable.pop();

      print(player_moves);

    }

  }

  //Debug code for switching player_turn
  // if (keyCode === 16){
  //
  //   player_turn = !player_turn;
  //
  // }

}

////////////////////////////////////////////////////////////////////////////////

//Used to wrap functions to be called later with .call(), used in move queue
wrapFunction = function(func, context, parameters) {
  return function() {
      func.apply(context, parameters);
  };
}

////////////////////////////////////////////////////////////////////////////////

//Runs though the moves in the queue, calling the attacks
function runMoves(){
  if (player_moves.length > 0 && enemy_array.length > 0 && player_turn == true){

    //player_turn = false;
    (player_moves.shift())();
    player_moves_readable.shift();

    print(player_moves);
    attacking_enemy = 0;

  } else if (enemy_array.length > 0) {

    player_turn = false;
    enemy_array[attacking_enemy].attack();
    print(enemy_array[attacking_enemy].stats.name);
    player.can_attack = true;
    player.in_progress = false;

  }
}
