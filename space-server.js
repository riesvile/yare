//global

var living_spirits = [];
var move_queue = [];
var move_queue_ids = [];
var player1_id = 'ab1';
var player2_id = 'zx2'


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
		this.player_id = player;
		living_spirits.push(this);
	}
		
	draw() { 
		c.beginPath();
		c.arc(this.position[0], this.position[1], this.size, 0, Math.PI * 2, false);
		c.fill();
	}
	
	move(target) {
		
		// check if target == position
		if (Math.abs(target[0] - this.position[0]) > 1 || Math.abs(target[1] - this.position[1]) > 1){
			var angle = Math.atan2(target[1] - this.position[1], target[0] - this.position[0]);
			var incr = [0, 0]
			incr[0] = (Math.round(Math.cos(angle) * 10000) / 10000);
			incr[1] = (Math.round(Math.sin(angle) * 10000) / 10000);
			if(move_queue_ids.indexOf(this.id) === -1) {
			    move_queue_ids.push(this.id);
				move_queue.push([this, incr, target]);
			    console.log(move_queue_ids);
			} else {
				var entry_index;
				entry_index = move_queue.findIndex(entry => entry[0]['id'] === this.id);
				move_queue[entry_index] = [this, incr, target];
				console.log('entry_index = ' + entry_index);
			}
			
		}
		
		//animateMove(this, incr, target);
		
		//this.draw()
		//this.position[0] = target[0] + 10;
		//this.position[1] = target[1] + 10;
	}
	
	update(incr){
		this.draw();
		this.position[0] = Number((this.position[0] + incr[0]).toFixed(3));
		this.position[1] = Number((this.position[1] + incr[1]).toFixed(3));
	}
	
	
}

class Structure {
	constructor(id, type, position, size, sight){
		this.id = id;
		this.energy = Number.POSITIVE_INFINITY;
		
		this.sight = {
			'friends': [sight.friends]
		}
		
		
		//const properties
		this.type = type;
		this.position = position;
		this.size = size;
		this.energy_capacity = Number.POSITIVE_INFINITY;
		this.hp = Number.POSITIVE_INFINITY;
		this.move_speed = 0;
	}
}
//var incr = [];

function is_in_sight(item1, item2, range = 10){
	if (Math.abs(item1.position[0] - item2.position[0]) < range && Math.abs(item1.position[1] - item2.position[1]) < range){
		return true;
	} else {
		return false;
	}
}


function distance_nonrooted(pos1, pos2){
//pos1 and pos2 are arrays ([x, y])

	
}

function get_sight(){
	var living_length = living_spirits.length;
	for (i = 0; i < living_length; i++){
		for (j = i+1; j < living_length; j++){
			console.log(i + ', ' + j);
			if (is_in_sight(living_spirits[i], living_spirits[j], 1000)){
				//maybe add distance stuff later
				//distance_approx = distance_nonrooted(living_spirits[i].position, living_spirits[j].position);
				//console.log('distance between ' + living_spirits[i].id + ' and ' + living_spirits[j].id + 'is ' + distance_approx);
				if (living_spirits[j].player_id == player_id){
					//is friend
					living_spirits[i].sight.friends.push(living_spirits[j]);
					living_spirits[j].sight.friends.push(living_spirits[i]);
					
				}
			}
		}
	}
}

function update_state(){
	//after everything is calculated
	
	setInterval(function () {
		
	    //objects move
		moveables = move_queue.length;
		for (i = 0; i < moveables; i++){
			
			//posX = move_queue[i][0].position[0];
			//posY = move_queue[i][0].position[1];
			//incrX = move_queue[i][1][0];
			//incrY = move_queue[i][1][1];
			//posX = Number((posX + incrX).toFixed(3));
			//posY = Number((posY + incrY).toFixed(3));
			move_queue[i][0].position = [Number((move_queue[i][0].position[0]
			+ move_queue[i][1][0]).toFixed(5)), Number((move_queue[i][0].position[1] + move_queue[i][1][1]).toFixed(5))];
			console.log(move_queue[i][0].id);
			console.log(move_queue[i][0].position);
			console.log(move_queue[i][2]);
			
			
			//if changed position is close enough to EMPTY target, put it there and remove item from move_queue and move_queue_ids
			posX = move_queue[i][0].position[0];
			posY = move_queue[i][0].position[1];
			targetX = move_queue[i][2][0];
			targetY = move_queue[i][2][1];
			if (Math.abs(posX - targetX) <= 1 && Math.abs(posY - targetY) <= 1){
				var rmv_index = move_queue_ids.indexOf(move_queue[i][0].id);
				if (rmv_index >= 0) {
				  move_queue_ids.splice(rmv_index, 1);
				}
				move_queue[i][0].position = [targetX, targetY]
				move_queue.splice(i, 1);
				i--;
				break;
			}
		}
		
		
		
		
		//objects energize
		
		
		
		//objects death
		
		
		
		//objects birth
		
		
	}, 10);
}

function animate(){
	requestAnimationFrame(animate)
	spirits.forEach((spirit) => {
		spirit.move();
	})
}

function moveSpirit(s, target){
	requestAnimationFrame(function() {moveSpirit(s, target); });
	s.move(target);
}

function animateMove(s, incr, target){
	setTimeout(() => {
	    requestAnimationFrame(function() {animateMove(s, incr, target); });
	}, 1000 / 60);
	
	c.clearRect(0, 0, canvas.width, canvas.height);
	s.update(incr);
	spirit2.draw();
	console.log('spirit position: [' + s.position[0] + ', ' + s.position[1] + ']');
	console.log('increment = ' + incr);
}




var spirit1 = new Spirit('sp1', [200,206], 2, 10, player1_id);
var spirit2 = new Spirit('sp2', [400,250], 20, 10, player1_id);

var spirit3 = new Spirit('sp3', [150,120], 2, 10, player2_id);
var spirit4 = new Spirit('sp4', [160,120], 2, 10, player1_id);
var spirit5 = new Spirit('sp5', [9705,120], 2, 10, player1_id);
var spirit6 = new Spirit('sp6', [170,120], 2, 10, player1_id);

//spirit1.draw();
//spirit2.draw();

//spirits = [spirit1, spirit2];

update_state();

spirit1.move(spirit2.position)
//spirit3.move(spirit2.position)
//spirit4.move(spirit2.position)
//spirit4.move(spirit6.position)
//spirit4.move(spirit5.position)

