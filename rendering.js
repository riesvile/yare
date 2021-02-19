//Hello


// ------
// Pointer handling
// ------

var mousey = 0;
var pointer_originX = 0;
var pointer_originY = 0;
var pointer_offsetX = 0;
var pointer_offsetY = 0;
var current_offsetX = 0;
var current_offsetY = 0;
var panning = 0;
var disableSelection = 0;

function offsetUpdate(){
	
	//c_base.fillStyle = 'rgba(6,8,100,0.1)'
	c_base.clearRect(-offsetX, -offsetY, main_canvas.width, main_canvas.height);
	
	//c.fillStyle = 'rgba(6,8,100,0.1)';
	c.clearRect(-offsetX, -offsetY, main_canvas.width, main_canvas.height);
	
	
	//c.setTransform(1, 0, 0, 1, 0, 0);
	c_base.setTransform(1, 0, 0, 1, 0, 0);
	c_base.translate(offsetX, offsetY);
	//c.translate(offsetX, offsetY);
	
	//world_spirits = living_spirits.length;
	//for (i = 0; i < world_spirits; i++){
	//	spirit_lookup[living_spirits[i].id].draw();
	//}
	
	world_stars = stars.length;
	for (i = 0; i < world_stars; i++){
		star_lookup[stars[i].id].draw();
	}
	
	world_bases = bases.length;
	for (i = 0; i < world_bases; i++){
		base_lookup[bases[i].id].draw();
	}
	
	draw_grid();
	
}

function onPointerDown(e){ 
	e = e || window.event;
	var el_id = (e.target || e.srcElement).id;
	console.log('down id= ' + el_id);
	
	console.log(el_id);
	if (el_id != 'base_canvas'){
		return;
	} else if (el_id == 'tutorial_wrap' || el_id == 'tut_helper'){
		console.log('thissisis');
		disableSelection = 0;
	} else {
		disableSelection = 1;
	}
	
	if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
	    var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
	    var touch = evt.touches[0] || evt.changedTouches[0];
	    x = touch.pageX;
	    y = touch.pageY;
		mousey = 1;
	} else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
	    x = e.clientX;
	    y = e.clientY;
		if (e.which === 1){
			mousey = 1;
		}
	}
	
	console.log('mouse down');
	pointer_originX = x;
	pointer_originY = y;
	current_offsetX = offsetX;
	current_offsetY = offsetY;
}
function onPointerMove(e){
	console.log(disableSelection);
	if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
	    var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
	    var touch = evt.touches[0] || evt.changedTouches[0];
	    x = touch.pageX;
	    y = touch.pageY;
	} else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
	    x = e.clientX;
	    y = e.clientY;
	}
	
	if (disableSelection == 1){
		e.preventDefault();
	}
	
	
	if (mousey == 1){
		//console.log('mouse moving');
		panning = 1;
		//console.log(x + " / " + y);
		
		
		pointer_offsetX = x - pointer_originX;
		pointer_offsetY = y - pointer_originY;
		
		offsetX = pointer_offsetX + current_offsetX;
		offsetY = pointer_offsetY + current_offsetY;
		//offsetUpdate();
	}
}
function onPointerUp(e){ 
	console.log('mouse up');
	mousey = 0;
	panning = 0;
	disableSelection = 0;
}

// Add event listeners
document.addEventListener("touchstart", onPointerDown, false);
document.addEventListener("touchmove", onPointerMove, false);
document.addEventListener("touchend", onPointerUp, false);

document.addEventListener("mousedown", onPointerDown, false);
document.addEventListener("mousemove", onPointerMove, false);
document.addEventListener("mouseup", onPointerUp, false);

document.getElementById("panel").addEventListener("mouseenter", function(e) {
	if (mousey != 1){
		document.getElementById("panel").style.backgroundColor = "rgba(8, 10, 16, 0.6)";
		document.getElementById("panel").style.backdropFilter = "blur(12px)";
	}

}, false);

document.getElementById("panel").addEventListener("mousedown", function(e) {
	if (mousey != 1){
		document.getElementById("panel").style.backgroundColor = "rgba(8, 10, 16, 0.6)";
		document.getElementById("panel").style.backdropFilter = "blur(12px)";
	}
    if (tutorial_started == 0){
	//    tutorial_started = 1;
	//    tut_start();
    }

}, false);

document.getElementById("panel").addEventListener("mouseleave", function(e) {
	if (mousey != 1){
		document.getElementById("panel").style.backgroundColor = "rgba(8, 10, 16, 0)";
		document.getElementById("panel").style.backdropFilter = "blur(0px)";
	}

}, false);




// ------
// Game rendering
// ------

const main_canvas = document.getElementById('main_canvas');
const base_canvas = document.getElementById('base_canvas');
const c = main_canvas.getContext('2d');
const c_base = base_canvas.getContext('2d');
main_canvas.width = innerWidth;
main_canvas.height = innerHeight;
base_canvas.width = innerWidth;
base_canvas.height = innerHeight;
c.scale (1, 1);
c_base.scale (1, 1);

var offsetX = 0;
var offsetY = 0;

var game_tick = 1000; // 1s
var fps = 60;
var tick_counter = 0;
var tick_counter_max = 0;
var tick_counter_avg = 0;

var living_spirits = [];
var stars = [];
var bases = [];
var spirit_lookup = {};
var star_lookup = {};
var base_lookup = {};

var player1_color;
var player2_color;

var colors = {};
colors['color1'] = 'rgba(128,140,255,1)';
colors['color2'] = 'rgba(232,97,97,1)';


var img = new Image();
img.src = '/assets/game/innerSh1x.png';


//flags

var world_initiated = 0;

function draw_grid(){
	for (i = 0; i < 100; i++){
		for (j = 0; j < 100; j++){
			c_base.beginPath();
			c_base.arc(i*100, j*100, 1, 0, Math.PI * 2, false);
			c_base.fillStyle = "rgba(244, 246, 248, 0.16)";
			c_base.fill();
		}
	}
}


class Spirit {
	constructor(id, position, size, energy, player, color){
		this.id = id
		this.position = position;
		this.size = size;
		this.energy = energy;
		this.color = color;
		
		this.sight = {
			friends: [],
			enemies: [],
			structures: []
		}
		
		//const properties
		this.hp = 1;
		this.move_speed = 1;
		this.energy_capacity = size * 10;
		//this.player_id = player; set up later
		living_spirits.push(this);
	}
		
	birth() { 
		c.beginPath();
		c.arc(this.position[0], this.position[1], this.size, 0, Math.PI * 2, false);
		c.fill();
		c.fillStyle = "rgba(255, 0, 0, 0.5)";
	}
	
	
	move(origin, incr, target) {
	//incr is array [incrX, incrY]
	
		//change this later to only check for origin data (everything synced properly?)
		this.position = origin;
		//if next increment overshoots, position = target
		//if (Math.abs(origin[0] - target[0]) <= Math.abs(incr[0]) && Math.abs(origin[1] - target[1]) <= Math.abs(incr[1])){
		//	move_queue[i][0].position = [targetX, targetY];
		//	move_queue[i][1] = [0,0];
		//}
		
		
		this.position[0] = origin[0] + (incr[0] / tick_counter_avg);
		this.position[1] = origin[1] + (incr[1] / tick_counter_avg);
		//this.draw();
	}
	
	death() {
		var that = this;
		var counter = 0;
		var alpha = 10;
		var interval = setInterval(function() {
		    if (counter > 10) {
				//var index = living_spirits.findIndex(x => x.id == that.id);
				//living_spirits.splice(index);
		        clearInterval(interval);
		    }
			that.size = that.size + (0.1 * that.size);
			that.color = that.color.replace(/[^,]+(?=\))/, alpha/10);
			counter++;
			alpha--;
		}, 16);
		
		//this.hp = 0;
		
	}
	
	draw() {
		c.beginPath();
		c.arc(this.position[0], this.position[1], this.size, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}
	
}

class Star {
	constructor(id, position){
		this.id = id
		this.position = position;
		this.size = 220;
		this.structure_type = 'star';
		//this.energy = energy;
		
		stars.push(this);
	}
	
	draw() {
		//console.log('drawing star');
		c_base.beginPath();
		c_base.arc(this.position[0], this.position[1], this.size, 0, Math.PI * 2, false);
		c_base.fillStyle = "rgba(255, 255, 255, 0.2)";
		//c_base.fill();
		
		c_base.beginPath();
		c_base.arc(this.position[0], this.position[1], 5, 0, Math.PI * 2, false);
		c_base.fillStyle = "rgba(248, 247, 255, 1)";
		c_base.fill();
		
		c_base.beginPath();
		c_base.arc(this.position[0], this.position[1], 420, 0, Math.PI * 2, false);
		c_base.fillStyle = "rgba(54, 195, 255, 0.02)";
		c_base.fill();
		
		var teX = this.position[0];
		var teY = this.position[1];
		
	    
	    img.addEventListener('load', drawInnerSh(teX, teY), false);
		
	}
}

class Base {
	constructor(id, position, player, color){
		this.id = id
		this.position = position;
		this.size = 24;
		this.structure_type = 'base';
		this.energy = 0;
		this.sight = {
			friends: [],
			enemies: [],
			structures: []
		}
		
		this.hp = 1;
		this.energy_capacity = 100;
		this.player_id = player;
		this.color = color;
		//this.energy = energy;
	
		bases.push(this);
	}
	
	draw() {
		c_base.beginPath();
		c_base.arc(this.position[0], this.position[1], this.size, 0, Math.PI * 2, false);
		c_base.lineWidth = 2;
		c_base.strokeStyle = this.color;
		c_base.stroke();
	}
}

function draw_death(id, size, color){
	var spir = spirit_lookup[id];
	var alpha = 100;
	var sizee = size;
	var colorr = color;
	
	
	var interval = setInterval(function() {
		c.beginPath();
		c.arc(spir.position[0], spir.position[1], sizee, 0, Math.PI * 2, false);
		c.fillStyle = colorr;
		c.fill();
		sizee++;
	    if (sizee > 100) {
	        clearInterval(interval);
	    }
	}, 16);
	
	
}

function draw_energize(origin, target, energy_strength, color){
	c.beginPath();
	c.moveTo(origin[0], origin[1]);
	c.lineTo(target[0], target[1]);
	c.strokeStyle = color;
	c.globalAlpha = energy_strength/10 + 0.1;
	c.stroke();
	c.globalAlpha = 1;
}



function drawInnerSh(teX, teY) {
			c_base.drawImage(img, teX - 225, teY - 225);
			//console.log('drawing image at ' + teX + ', ' + teY);
}


function initiate_world(){
	world_spirits = units_queue.length;
	for (i = 0; i < world_spirits; i++){
		spirit_lookup[units_queue[i].id] = new Spirit(units_queue[i].id, units_queue[i].position, units_queue[i].size, units_queue[i].energy, units_queue[i].player_id, units_queue[i].color);
		spirit_lookup[units_queue[i].id].draw();
		console.log(spirit_lookup[units_queue[i].id]);
		//birth_queue.splice(i, 1);
	}
	units_queue = [];
	
	world_stars = stars_queue.length;
	for (i = 0; i < world_stars; i++){
		console.log('star created');
		star_lookup[stars_queue[i].id] = new Star(stars_queue[i].id, stars_queue[i].position, stars_queue[i].size);
		star_lookup[stars_queue[i].id].draw();
	}
	stars_queue = [];
	
	world_bases = bases_queue.length;
	for (i = 0; i < world_bases; i++){
		console.log('base created');
		base_lookup[bases_queue[i].id] = new Base(bases_queue[i].id, bases_queue[i].position, bases_queue[i].player_id, bases_queue[i].color);
		base_lookup[bases_queue[i].id].draw();
	}
	
	draw_grid();
	offsetUpdate();
	
	world_initiated = 1;
}

function render_state(){
	
	//offsetX = offsetX + 1;
	//offsetY = offsetY + 1;
	
	
	c.fillStyle = 'rgba(6,8,10,1)';
	//c.fillRect(0, 0, main_canvas.width, main_canvas.height);
	c.fillRect(-offsetX, -offsetY, main_canvas.width, main_canvas.height);
	
	c.setTransform(1, 0, 0, 1, 0, 0);
	c.translate(offsetX, offsetY);
	
	if (panning == 1){
		offsetUpdate();
	}
	
	
	
	//c_base.fillStyle = 'rgba(6,8,10,1)'
	//c_base.fillRect(-offsetX, -offsetY, main_canvas.width, main_canvas.height);
	//c.clearRect(0, 0, main_canvas.width, main_canvas.height);
	
	//world initiation (page refresh)
	if (world_initiated == 0 && units_queue.length > 0){
		initiate_world();
	}
	
	
	
	//objects birth
	birthlings = birth_queue.length;
	for (i = 0; i < birthlings; i++){
		spirit_lookup[birth_queue[i].id] = new Spirit(birth_queue[i].id, birth_queue[i].position, birth_queue[i].size, birth_queue[i].energy, birth_queue[i].player_id, birth_queue[i].color);
		spirit_lookup[birth_queue[i].id].draw();
		console.log(spirit_lookup[birth_queue[i].id]);
		//birth_queue.splice(i, 1);
	}
	birth_queue = [];


	//objects move
	moveables = move_queue.length;
	for (i = 0; i < moveables; i++){
		//console.log('move_queue[i]');
		//console.log(move_queue[i]);
		spirit_lookup[move_queue[i][0]].move(move_queue[i][1], move_queue[i][2], move_queue[i][3]);
	}
	//move_queue = [];

	all_living = living_spirits.length;
	for (i = 0; i < all_living; i++){
		spirit_lookup[living_spirits[i].id].draw();
	}
	
	
	//structures
	//for (i = 0; i < stars.length; i++){
	//	stars[i].draw();
	//}


	//objects energize
	
	for (i = 0; i < energize_queue.length; i++){
		//draw_energize(energize_queue[i])
		//console.log('energize_queue[i]');
		//console.log(energize_queue[i]);
		if (energize_queue[i][0].startsWith('star')) {
			draw_energize(star_lookup[energize_queue[i][0]].position, spirit_lookup[energize_queue[i][1]].position, energize_queue[i][2], spirit_lookup[energize_queue[i][1]].color);
		} else if (energize_queue[i][1].startsWith('base')) {
			draw_energize(spirit_lookup[energize_queue[i][0]].position, base_lookup[energize_queue[i][1]].position, energize_queue[i][2], spirit_lookup[energize_queue[i][0]].color);
		} else {
			if (spirit_lookup[energize_queue[i][0]].hp != 0 && spirit_lookup[energize_queue[i][1]].hp != 0){
				draw_energize(spirit_lookup[energize_queue[i][0]].position, spirit_lookup[energize_queue[i][1]].position, energize_queue[i][2], spirit_lookup[energize_queue[i][0]].color);
			} 
			
		}
	}



	//objects death
	for (i = 0; i < death_queue.length; i++){
		console.log(death_queue[i]);
		if (death_queue[i].startsWith('base')){
			var loser = base_lookup[death_queue[i]].player_id;
			alert('game over, ' + loser + ' lost');
		} else {
			spirit_lookup[death_queue[i]].hp = 0;
			//draw_death(spirit_lookup[death_queue[i]].id, spirit_lookup[death_queue[i]].size, spirit_lookup[death_queue[i]].color);
			spirit_lookup[death_queue[i]].death();
			
			//delete spirit_lookup[suid];
			//var index = living_spirits.findIndex(x => x.id == death_queue[i].id);
			//living_spirits.splice(index);
		}
		//draw_death(death_queue[i]);
		
	}
	death_queue = [];


	tick_counter++;
	if (tick_counter > tick_counter_max){
		tick_counter_max = tick_counter;
		//console.log('tick_counter_max = ' + tick_counter_max);
	} else {
		tick_counter_avg = tick_counter_max;
		tick_counter_max = 0;
	}
	//console.log('ticks');
	//console.log('tick_counter_avg = ' + tick_counter_avg);
	//console.log(spirit_lookup);
	setTimeout(() => {
	    requestAnimationFrame(render_state);
	}); //game_tick?
}


render_state();







