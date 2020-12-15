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

var game_tick = 1000; // 1s
var fps = 60;

var living_spirits = [];
var stars = [];
var spirit_lookup = {};
var star_lookup = {};

var img = new Image();
img.src = '/assets/game/innerSh1x.png';


//flags

var world_initiated = 0;



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
		
		
		this.position[0] = origin[0] + (incr[0] / fps);
		this.position[1] = origin[1] + (incr[1] / fps);
		//this.draw();
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
		console.log('drawing star');
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

function draw_energize(origin, target, energy_strength){
	c.beginPath();
	c.moveTo(origin[0], origin[1]);
	c.lineTo(target[0], target[1]);
	c.strokeStyle = '#fff';
	c.stroke();
}


function drawInnerSh(teX, teY) {
			c_base.drawImage(img, teX - 225, teY - 225);
			console.log('drawing image at ' + teX + ', ' + teY);
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
	world_initiated = 1;
}

function render_state(){
	c.fillStyle = 'rgba(0,0,0,1)'
	c.fillRect(0, 0, main_canvas.width, main_canvas.height);
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
			draw_energize(star_lookup[energize_queue[i][0]].position, spirit_lookup[energize_queue[i][1]].position, energize_queue[i][2]);
		} else {
			draw_energize(spirit_lookup[energize_queue[i][0]].position, spirit_lookup[energize_queue[i][1]].position, energize_queue[i][2]);
		}
	}



	//objects death


	console.log('ticks');
	setTimeout(() => {
	    requestAnimationFrame(render_state);
	}); //game_tick?
}


render_state();







