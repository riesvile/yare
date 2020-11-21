function user_code(){
	try {
		eval(player1_code);
	} catch (error) {
		console.error(error);
	}
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
var spirit_lookup = {};
var move_queue = [];
var move_queue_ids = [];
var birth_queue = [];
var player1_id = 'ab1';
var player2_id = 'zx2';
var player1_code;
var player2_code;

var processTime1 = 0;
var processTime2 = 0;
var processTimeRes = 0;

var render_data2 = {
	'move': [],
	'energize': [],
	'death': [],
	'birth': []
}

const {NodeVM} = require('vm2');
var sandbox = {
	spirit_lookup: spirit_lookup
}
const vm = new NodeVM({ sandbox });
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
		move_queue.push([this, [0,0], this.position]);
	}
	
	birth() {
		
	}
		
	
	move(target) {
		
		var tarX = target[0];
		var tarY = target[1];
		var incr = [0, 0];
		var entry_index = move_queue.findIndex(entry => entry[0]['id'] === this.id);
		console.log('entry_index = ' + entry_index);
		
				
		if (Math.abs(target[0] - this.position[0]) < 0.6 && Math.abs(target[1] - this.position[1]) < 0.6){
			
			console.log('not going anywhere');
			incr[0] = 0;
			incr[1] = 0;
			this.position[0] = target[0];
			this.position[1] = target[1];
			
		} else {
			
			var angle = Math.atan2(target[1] - this.position[1], target[0] - this.position[0]);
			incr[0] = (Math.round(Math.cos(angle) * 10000) / 10000) * base_speed;
			incr[1] = (Math.round(Math.sin(angle) * 10000) / 10000) * base_speed;
		
			if ((Math.abs(tarX - this.position[0]) <= Math.abs(incr[0])) && (Math.abs(tarY - this.position[1]) <= Math.abs(incr[1]))){
				incr[0] = tarX - this.position[0];
				incr[1] = tarY - this.position[1];
			}
			
		}
		
		move_queue[entry_index] = [this, incr, target];
		
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
		for (i = birthlings - 1; i >= 0; i--){
			render_data2.birth.push(birth_queue[i]);
			spirit_lookup[birth_queue[i].id] = birth_queue[i];
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
			
			// work with data only if there is movement
			if ((move_queue[i][1][0] != 0) && (move_queue[i][1][1] != 0)){
				var posX = move_queue[i][0].position[0];
				var posY = move_queue[i][0].position[1];
				var incrX = move_queue[i][1][0];
				var incrY = move_queue[i][1][1];
				var targetX = move_queue[i][2][0];
				var targetY = move_queue[i][2][1];
				
				move_queue[i][0].position[0] += move_queue[i][1][0];
				move_queue[i][0].position[1] += move_queue[i][1][1];
			
				console.log('---');
				console.log(move_queue[i][0].id);
				console.log(move_queue[i][0].position);
				console.log(move_queue[i][1]);
				console.log(move_queue[i][2]);
			
				//render_data2.move.push([move_queue[i][0].id, move_queue[i][0].position, move_queue[i][1], move_queue[i][2]]);
				render_data2.move.push([move_queue[i][0].id, [posX, posY], move_queue[i][1], move_queue[i][2]]);
			}
			
			
						
		}
		
		
		
		
		
		
		//objects energize
		
		
		
		//objects death
		
		
		
		
		user_code();
}


var spirit1 = new Spirit('sp1', [200,206], 1, 10, player1_id);
var spirit2 = new Spirit('sp2', [400,250], 1, 10, player1_id);
var spirit3 = new Spirit('sp3', [500,230], 2, 10, player1_id);
var spirit4 = new Spirit('sp4', [900,650], 1, 10, player1_id);
var spirit5 = new Spirit('sp5', [240,206], 1, 10, player1_id);

birth_queue.push([spirit1,
				  spirit2,
				  spirit3,
				  spirit4,
	spirit5]);
	

	birth_queue = birth_queue.flat(1);









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
		player1_code = message;
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
app.get('/style.css', (req, res) => res.sendFile(__dirname + '/style.css'));
app.get('/src-min-noconflict/ace.js', (req, res) => res.sendFile(__dirname + '/src-min-noconflict/ace.js'));
app.get('/src-min-noconflict/theme-clouds_midnight.js', (req, res) => res.sendFile(__dirname + '/src-min-noconflict/theme-clouds_midnight.js'));
app.get('/src-min-noconflict/mode-javascript.js', (req, res) => res.sendFile(__dirname + '/src-min-noconflict/mode-javascript.js'));
app.get('/src-min-noconflict/worker-javascript.js', (req, res) => res.sendFile(__dirname + '/src-min-noconflict/worker-javascript.js'));







server.listen(5000, () => console.log('Listening on port :5000'))
