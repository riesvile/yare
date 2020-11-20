class Spirit {
	constructor(id, position, size, energy, sight){
		this.id = id
		this.position = position;
		this.size = size;
		this.energy = energy;
		
		this.sight = {
			'friends': [sight.friends]
		}
		
		
		//const properties
		this.hp = 1
		this.move_speed = 1;
		this.energy_capacity = size * 10;
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


var spirit1 = new Spirit('sp1', [3,2], 1, 10, {'friends': ['sp2', 'sp3']});
var spirit2 = new Spirit('sp2', [5,2], 1, 10, {'friends': ['sp1', 'sp3']});
var spirit3 = new Spirit('sp3', [5,4], 1, 10, {'friends': ['sp1', 'sp2']});

var star1 = new Structure('star1', 'star', [5,9], 100, {'friends': ['sp1', 'sp2', 'sp3']})

console.log(spirit1);


console.log(spirit2.position[0]);
console.log(spirit3.sight.friends);
console.log(star1);










//remove when target reached
if (Math.abs(posX - targetX) <= 1 && Math.abs(posY - targetY) <= 1){
	var rmv_index = move_queue_ids.indexOf(move_queue[i][0].id);
	if (rmv_index >= 0) {
	  move_queue_ids.splice(rmv_index, 1);
	}
	render_data2.move.push([move_queue[i][0].id, [targetX, targetY], [0,0]]);
	//render_data[0].push(move_queue[i][0].id, [targetX, targetY], [0,0]);
	move_queue[i][0].position = [targetX, targetY]
	move_queue.splice(i, 1);
	i--;
	break;
}














//objects move
moveables = move_queue.length;
for (i = (moveables - 1); i >= 0; i--){
	
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
	
	
	//send to render_data (id, current position, increment)
	//render_data[0].push(move_queue[i][0].id, move_queue[i][0].position, move_queue[i][1]);
	render_data2.move.push([move_queue[i][0].id, move_queue[i][0].position, move_queue[i][1], move_queue[i][2]]);
	
	
	//remove when target reached
	if (Math.abs(posX - targetX) <= 1 && Math.abs(posY - targetY) <= 1){
		var rmv_index = move_queue_ids.indexOf(move_queue[i][0].id);
		if (rmv_index >= 0) {
		  move_queue_ids.splice(rmv_index, 1);
		}
		//render_data2.move.push([move_queue[i][0].id, [targetX, targetY], [0,0]]);
		//render_data[0].push(move_queue[i][0].id, [targetX, targetY], [0,0]);
		move_queue[i][0].position = [targetX, targetY]
		move_queue.splice(i, 1);
		i++;
		//break;
	}
	
	//if next increment overshoots, position = target
	if (Math.abs(posX - targetX) <= Math.abs(move_queue[i][1][0]) && Math.abs(posY - targetY) <= Math.abs(move_queue[i][1][1])){
		move_queue[i][0].position = [targetX, targetY];
		move_queue[i][1] = [0,0];
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
			spirit_lookup[move_queue[i][0]].move(move_queue[i][1], move_queue[i][2], move_queue[i][3]);
		}
		move_queue = [];


		//objects energize
	
	
	
		//objects death
	
	
		console.log('ticks');
	}, game_tick);
}



// -------- 


function user_code(){
	spirit1.move(spirit2.position);
	spirit3.move(spirit2.position);
	spirit4.move(spirit2.position);
	spirit5.move(spirit2.position);
	spirit6.move(spirit2.position);
	spirit7.move(spirit4.position);
	spirit8.move(spirit2.position);
	spirit9.move(spirit2.position);
	spirit10.move(spirit2.position);
	spirit11.move(spirit2.position);
	spirit12.move(spirit2.position);
	spirit13.move(spirit2.position);
	spirit14.move(spirit2.position);
	spirit15.move(spirit2.position);
	spirit16.move(spirit2.position);
	spirit17.move(spirit2.position);
	spirit18.move(spirit2.position);
	spirit19.move(spirit2.position);
	spirit20.move(spirit2.position);
	spirit21.move(spirit2.position);
	
	console.log('spirit4 position = ');
	console.log(spirit4.position);
}


//setup
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });


//global
var game_tick = 1000; // 1s
var base_speed = 10;
var living_spirits = [];
var move_queue = [];
var move_queue_ids = [];
var birth_queue = [];
var player1_id = 'ab1';
var player2_id = 'zx2';


var render_data2 = {
	'move': [],
	'energize': [],
	'death': [],
	'birth': []
}
//var render_data = [[],[],[],[],[]];


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
		
		var tarX = target[0];
		var tarY = target[1];
		
				
		if (Math.abs(target[0] - this.position[0]) < 1 && Math.abs(target[1] - this.position[1]) < 1){
		
		} 
		
		var angle = Math.atan2(target[1] - this.position[1], target[0] - this.position[0]);
		var incr = [0, 0]
		incr[0] = (Math.round(Math.cos(angle) * 10000) / 10000) * base_speed;
		incr[1] = (Math.round(Math.sin(angle) * 10000) / 10000) * base_speed;
		
		
				
		
		// check if target != position
		if (Math.abs(target[0] - this.position[0]) > 1 || Math.abs(target[1] - this.position[1]) > 1){
			var angle = Math.atan2(target[1] - this.position[1], target[0] - this.position[0]);
			var incr = [0, 0]
			incr[0] = (Math.round(Math.cos(angle) * 10000) / 10000) * base_speed;
			incr[1] = (Math.round(Math.sin(angle) * 10000) / 10000) * base_speed;
			if (move_queue_ids.indexOf(this.id) === -1) {
			    move_queue_ids.push(this.id);
				move_queue.push([this, incr, target]);
			    console.log(move_queue_ids);
			} else {
				var entry_index;
				entry_index = move_queue.findIndex(entry => entry[0]['id'] === this.id);
				//skip if no change to target
				if ((move_queue[entry_index][1][0] == incr[0]) && (move_queue[entry_index][1][1] == incr[1])){
					console.log('move_queue would update with the same increment');
				} else {
					move_queue[entry_index] = [this, incr, target];
					console.log('entry_index = ' + entry_index);
				}
				
			}
		}
	}
	
}


function is_in_sight(item1, item2, range = 10){
	if (Math.abs(item1.position[0] - item2.position[0]) < range && Math.abs(item1.position[1] - item2.position[1]) < range){
		return true;
	} else {
		return false;
	}
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
	
		//render_data = [[],[],[],[],[]];
		render_data2 = {
			'move': [],
			'energize': [],
			'death': [],
			'birth': []
		}
		
		
		//objects birth
		birthlings = birth_queue.length;
		for (i = 0; i < birthlings; i++){
			render_data2.birth.push(birth_queue[i]);
			birth_queue.splice(i, 1);
		}
		
		
	    //objects move
		moveables = move_queue.length;
		for (i = (moveables - 1); i >= 0; i--){
			
			//remove when target reached
			
			//posX = move_queue[i][0].position[0];
			//posY = move_queue[i][0].position[1];
			//incrX = move_queue[i][1][0];
			//incrY = move_queue[i][1][1];
			//posX = Number((posX + incrX).toFixed(3));
			//posY = Number((posY + incrY).toFixed(3));
			
			
			//pos + incr
			// THIS IS THE ONLY THING THAT MATTERS HERE, NO OTHER CALCULATIONS!
			move_queue[i][0].position[0] += move_queue[i][1][0];
			move_queue[i][0].position[1] += move_queue[i][1][1];
			
			var posX = move_queue[i][0].position[0];
			var posY = move_queue[i][0].position[1];
			var incrX = move_queue[i][1][0];
			var incrY = move_queue[i][1][1];
			var targetX = move_queue[i][2][0];
			var targetY = move_queue[i][2][1];
			
			if (Math.abs(targetX - posX) <= 0.1 && Math.abs(targetY - posY) <= 0.1){
				var rmv_index = move_queue_ids.indexOf(move_queue[i][0].id);
				if (rmv_index >= 0) {
				  move_queue_ids.splice(rmv_index, 1);
				}
				move_queue.splice(i, 1);
				continue;
			}
			
			if ((Math.abs(targetX - posX) <= Math.abs(incrX)) && (Math.abs(targetY - posY) <= Math.abs(incrY))){
				move_queue[i][1][0] = targetX - posX;
				move_queue[i][1][1] = targetY - posY;
			}
			
			console.log(move_queue[i][0].position);
			console.log(move_queue[i][1]);
			console.log(move_queue[i][2]);
			
			render_data2.move.push([move_queue[i][0].id, move_queue[i][0].position, move_queue[i][1], move_queue[i][2]]);
						
		}
		
		
		
		
		
		
		//objects energize
		
		
		
		//objects death
		
		
		
		
		user_code();
}


var spirit1 = new Spirit('sp1', [200,206], 2, 10, player1_id);
var spirit2 = new Spirit('sp2', [400,250], 1, 10, player1_id);
var spirit3 = new Spirit('sp3', [500,230], 10, 10, player1_id);
var spirit4 = new Spirit('sp4', [900,650], 20, 10, player1_id);
var spirit5 = new Spirit('sp5', [240,206], 2, 10, player1_id);
var spirit6 = new Spirit('sp6', [410,220], 1, 10, player1_id);
var spirit7 = new Spirit('sp7', [600,215], 5, 10, player1_id);
var spirit8 = new Spirit('sp8', [408,610], 5, 10, player1_id);
var spirit9 = new Spirit('sp9', [200,206], 2, 10, player1_id);
var spirit10 = new Spirit('sp10', [410,250], 1, 10, player1_id);
var spirit11 = new Spirit('sp11', [500,230], 2, 10, player1_id);
var spirit12 = new Spirit('sp12', [450,240], 1, 10, player1_id);
var spirit13 = new Spirit('sp13', [500,230], 3, 10, player1_id);
var spirit14 = new Spirit('sp14', [420,150], 1, 10, player1_id);
var spirit15 = new Spirit('sp15', [520,230], 4, 10, player1_id);
var spirit16 = new Spirit('sp16', [400,230], 1, 10, player1_id);
var spirit17 = new Spirit('sp17', [700,236], 2, 10, player1_id);
var spirit18 = new Spirit('sp18', [470,258], 1, 10, player1_id);
var spirit19 = new Spirit('sp19', [535,210], 3, 10, player1_id);
var spirit20 = new Spirit('sp20', [370,200], 1, 10, player1_id);
var spirit21 = new Spirit('sp21', [360,230], 2, 10, player1_id);


birth_queue.push([spirit1,
				  spirit2,
				  spirit3,
				  spirit4,
				  spirit5,
		 	 	  spirit6,
				  spirit7,
				  spirit8,
				  spirit9,
				  spirit10,
				  spirit11,
		 	 	  spirit12,
				  spirit13,
				  spirit14,
				  spirit15,
				  spirit16,
				  spirit17,
		 	 	  spirit18,
				  spirit19,
				  spirit20,
				  spirit21])









d1 = 0;
d2 = 0;



wss.on('connection', function connection(ws) {
	console.log('new client connected');
	ws.send('welcome!');
	
	user_code();
	
	
	
	setInterval(function () {
		update_state();
		ws.send('sending render_data');	
		ws.send(JSON.stringify(render_data2));
		//ws.send(JSON.stringify(render_data));
		//ws.send(render_data);
		console.log(render_data2);
		//var render_data = [[],[],[],[],[]];
		
	}, game_tick);
	
	
	
	ws.on('message', function incoming(message) {
		d1 = process.hrtime();
    	console.log('received: %s', message);
		for (i = 0; i < 100000000; i++){
			if (i < 5){
				distanceHypot = i;
			}
		}
		d2 = process.hrtime(d1);
		taskDuration = (d2[0] * 1000000000 + d2[1]) / 1000000;
		ws.send('distanceHypot is ' + distanceHypot + ' and it took ' + taskDuration);	
  });

});








app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
app.get('/rendering.js', (req, res) => res.sendFile(__dirname + '/rendering.js'));


server.listen(5000, () => console.log('Listening on port :5000'))






