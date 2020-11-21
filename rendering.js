const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;
c.scale (1, 1);

var game_tick = 1000; // 1s
var fps = 60;

var living_spirits = [];
var spirit_lookup = {}



class Spirit {
	constructor(id, position, size, energy, player){
		this.id = id
		this.position = position;
		this.size = size;
		this.energy = energy;
		
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
		this.draw();
	}
	
	draw() {
		c.beginPath();
		c.arc(this.position[0], this.position[1], this.size, 0, Math.PI * 2, false);
		c.fill();
		c.fillStyle = "rgba(255, 0, 0, 1)";
	}
	
	
}

function render_state(){
	//c.clearRect(0, 0, canvas.width, canvas.height);
	
	
	//objects birth
	birthlings = birth_queue.length;
	for (i = 0; i < birthlings; i++){
		spirit_lookup[birth_queue[i].id] = new Spirit(birth_queue[i].id, birth_queue[i].position, birth_queue[i].size, birth_queue[i].energy, birth_queue[i].player_id);
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


	//objects energize



	//objects death


	console.log('ticks');
	setTimeout(() => {
	    requestAnimationFrame(render_state);
	}); //game_tick?
}


render_state();







