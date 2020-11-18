const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;
c.scale (1, 1);

game_tick = 100; // 1s

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
	}
	
	
	move(origin, incr) {
	//incr is array [incrX, incrY]
	
		//change this later to only check for origin data (everything synced properly?)
		this.position = origin;
		this.position[0] = origin[0] + incr[0];
		this.position[1] = origin[1] + incr[1];
		this.draw();
	}
	
	draw() {
		c.beginPath();
		c.arc(this.position[0], this.position[1], this.size, 0, Math.PI * 2, false);
		c.fill();
	}
	
	
}

function render_state(){
	setInterval(function () {
		
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
			console.log('move_queue[i]');
			console.log(move_queue[i]);
			spirit_lookup[move_queue[i][0]].move(move_queue[i][1], move_queue[i][2]);
		}
		move_queue = [];


		//objects energize
	
	
	
		//objects death
	
	
		console.log('ticks');
	}, game_tick);
}


render_state();







