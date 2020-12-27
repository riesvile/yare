const { parentPort, workerData, isMainThread } = require("worker_threads");

const util = require('util');
const mongoose = require('mongoose');
const User = require('./models/users.js');
const Game = require('./models/newgame.js');
const dbURI = 'mongodb+srv://levmiseri:02468a13579A@cluster0.us90f.mongodb.net/yare-io?retryWrites=true&w=majority'
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
	.then((result) => console.log('connected to db'))
	.catch((error) => console.log(error));

//initiate_world
parentPort.on("message", message => {
  if (message.data == "initiate world") {
	  console.log('hmm');
		init_data = {
			'units': [],
			'stars': [],
			'bases': [],
			'players': []
		}
		var all_spirits = living_spirits.length;
		for (i = 0; i < all_spirits; i++){
			init_data.units.push(living_spirits[i]);
		}

		for (i = 0; i < stars.length; i++){
			init_data.stars.push(stars[i]);
		}
		
		for (i = 0; i < bases.length; i++){
			init_data.bases.push(bases[i]);
		}
		
		init_data.players[0] = players['p1'];
		init_data.players[1] = players['p2'];
		
		parentPort.postMessage({data: JSON.stringify(init_data), game_id: workerData, meta: 'initiate', client: message.client});
  } else if (message.data == "player code"){
	  //check who's code it is here
	  if (message.pl_num == "player1"){
		  if (message.session_id == player1_session){
		  	player1_code = message.pl_code;
		  } else {
		  	User.find({user_id: message.pl_id})
		  		.then((result) => {
		  			//res.send(result);
		  			console.log('db result');
					//parentPort.postMessage({data: 'db initiated', meta: 'test'});
		  			if (result[0]['session_id'] == message.session_id){
		  				//all good, update session id and prolong expiration date
		  				player1_session = message.session_id;
						player1_code = message.pl_code;
		  			} else {
		  				parentPort.postMessage({data: 'session_id mismatch', meta: 'test'});
		  			}
		  		})
		  		.catch((error) => {
		  			console.log(error);
		  		}) 
		  }
		  
	  } else if (message.pl_num == "player2"){
		  if (message.session_id == player2_session){
		  	player2_code = message.pl_code;
		  } else {
		  	User.find({user_id: message.pl_id})
		  		.then((result) => {
		  			//res.send(result);
		  			console.log('db result');
					//parentPort.postMessage({data: 'db initiated', meta: 'test'});
		  			if (result[0]['session_id'] == message.session_id){
		  				//all good, update session id and prolong expiration date
		  				player2_session = message.session_id;
						player2_code = message.pl_code;
		  			} else {
		  				parentPort.postMessage({data: 'session_id mismatch', meta: 'test'});
		  			}
		  		})
		  		.catch((error) => {
		  			console.log(error);
		  		}) 
		  }
	  }
  } else if (message.data="start world"){
	  players['p1'] = message.player1;
	  players['p2'] = message.player2;
	  Game.find({game_id: workerData})
	  	.then((result) => {
			console.log('p1_color');
			console.log(result[0].p1_color);
			colors['player1'] = color_palettes[result[0].p1_color];
			colors['player2'] = color_palettes[result[0].p2_color];
			game_start();
		})
  		.catch((error) => {
  			console.log(error);
  		}) 
	  
  }
});

function user_code(){
	//try {
	//	eval(player1_code);
	//} catch (error) {
	//	console.error(error);
	//}
	
	//spirit1.move(spirit2.position);
	//for (i = 1; i < 18; i++){
	//	spirits[i].move([i*10 + 600, i*10 + 200]);
	//}
	
	
	try {
		vm.run(player1_code, 'vm.js');
		//vm.run(player2_code, 'vm.js');
	} catch (error){
		console.error(error);
	}
	
	try {
		vm2.run(player2_code, 'vm2.js');
		//vm.run(player2_code, 'vm.js');
	} catch (error){
		console.error(error);
	}
	
	
	
}

//global
var started = 0;
var game_tick = 1000; // 1s
var base_speed = 20;
var stars = [];
var bases = [];
var living_spirits = [];
var spirit_lookup = {};
var star_lookup = {};
var base_lookup = {};
var spirits = [];
var spirits2 = [];
var move_queue = [];
var move_queue_ids = [];
var energize_queue = [];
var birth_queue = [];
var death_queue = [];
var star_zxq;
var star_a1c;
var base1;
var base2;


var player1_code;
var player1_session = '';
var player2_code;
var player2_session = '';
var players = {};
players['p1'] = 'ab1';
players['p2'] = 'zx2';

var colors = {};
colors['player1'] = "rgba(255, 0, 0, 1)";
colors['player2'] = "rgba(0, 100, 255, 1)";
var color_palettes = {};
color_palettes['color1'] = 'rgba(128,140,255,1)';
color_palettes['color2'] = 'rgba(232,97,97,1)';

var pl1_units = {};
var pl2_units = {};

var top_s = 0;
var top_q = 0;

var firstCode = 0;

var energy_value = 1;


var processTime1 = 0;
var processTime2 = 0;
var processTimeRes = 0;

var user_error;

var test_s1 = {};
var test_s2 = {};

//var console1 = console;
//var console2 = console;

var log1 = [];
var log2 = [];

var console1 = {};
var console2 = {};

console1['log'] = function(stringo) {
	log1.push(util.format(stringo));
    return console.log.apply( console, arguments );
};
console2['log'] = function(stringo) {
	log2.push(util.format(stringo));
	return console.log.apply( console, arguments );
};

var render_data2 = {
	'move': [],
	'energize': [],
	'death': [],
	'birth': [],
	'error_msg': [],
	'console1': [],
	'console2': []
}

var init_data = {
	'units': [],
	'stars': [],
	'bases': []
}

var memory1 = {a: 150};
var memory2 = {a: 155};

const {VM} = require('vm2');


var sandbox = {
	get_y(data) {
	    return data;
	},
	console: console
	//player1_code: player1_code,
	//base: base_lookup['base_' + players['p1']],
	//enemy_base: base_lookup['base_' + players['p2']],
	//test_s1: test_s1,
	//star_zxq: star_zxq
};

var sandboxx = {
	get_y(data) {
	    return data;
	},
	console: console
	//player1_code: player1_code,
	//base: base_lookup['base_' + players['p1']],
	//enemy_base: base_lookup['base_' + players['p2']],
	//test_s1: test_s1,
	//star_zxq: star_zxq
};


//sandbox is the keyword, moron
const vm = new VM({ timeout: 100, sandbox: {console: console1, memory: memory1} });
const vm2 = new VM({ timeout: 100, sandbox: {console: console2, memory: memory2} });


//vm.freeze(spirits, 'spirits');
vm.freeze(players, 'players');
//try creating and accessing a new spirit to check for freeze
vm.freeze(pl1_units, 'spirits');
vm.freeze(star_lookup, 'stars');
vm.freeze(base_lookup, 'bases');
//vm2.freeze(spirits2, 'spirits');
vm2.freeze(players, 'players');
vm2.freeze(pl2_units, 'spirits');
vm2.freeze(star_lookup, 'stars');
vm2.freeze(base_lookup, 'bases');

if (!isMainThread){
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
			this.player_id = player;
		
			living_spirits.push(this);
			birth_queue.push(this);
			move_queue.push([this, [0,0], this.position]);
		}
	
		birth() {
		
		}
		
	
		move(target) {
			//check that target is array, otherwise throw error
			if (Array.isArray(target) == false){
				user_error = '.move() argument must be an array. E.g. s1.move([100, 100]) or s1.move(s2.position)';
				return
			} else {
				if (target.length != 2){
					user_error = '.move() argument must be an array with two items [x, y]. E.g. s1.move([100, 100]) or s1.move(s2.position)';
					return
				}
			}
		
			var tarX = target[0];
			var tarY = target[1];
			var incr = [0, 0];
			var entry_index = move_queue.findIndex(entry => entry[0]['id'] === this.id);
			//console.log('entry_index = ' + entry_index);
		
				
			if (Math.abs(target[0] - this.position[0]) < 0.6 && Math.abs(target[1] - this.position[1]) < 0.6){
			
				console.log('not going anywhere');
				incr[0] = 0;
				incr[1] = 0;
				this.position[0] = target[0];
				this.position[1] = target[1];
			
			} else {
				//check if spirit still alive
				if (this.hp != 0){
					
					var angle = Math.atan2(target[1] - this.position[1], target[0] - this.position[0]);
					incr[0] = Number(((Math.round(Math.cos(angle) * 10000) / 10000) * base_speed).toFixed(5));
					incr[1] = Number(((Math.round(Math.sin(angle) * 10000) / 10000) * base_speed).toFixed(5));
		
					if ((Math.abs(tarX - this.position[0]) <= Math.abs(incr[0])) && (Math.abs(tarY - this.position[1]) <= Math.abs(incr[1]))){
						incr[0] = tarX - this.position[0];
						incr[1] = tarY - this.position[1];
					}
					
				} else {
					console.log('spirit is dead');
				}
						
			}
		
			move_queue[entry_index] = [this, incr, target];
		}
	
	
		energize(target) {
			console.log('target = ');
			console.log(target);
			
			try {
				if (typeof target.id === 'string' || target.id instanceof String){
					if (target.structure_type == 'base'){
						target = base_lookup[target.id];
					} else {
						target = spirit_lookup[target.id];
					}
				}
			} catch (error){
				console.error(error);
			}
			
			if (target == null){
				target = this;
			}
			//this, this.energy, this.size, target)
			if (target.hp != 0){
				energize_queue.push([this, target]);
			}
			
		}
		
		
		//kill() { }???????
		kill(suid){
			delete spirit_lookup[suid];
			var index = living_spirits.findIndex(x => x.id == suid);
			living_spirits.splice(index);
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
	}
	
	class Base {
		constructor(id, position, player, color){
			this.id = id
			this.position = position;
			this.size = 40;
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
	}

	function initiate_world(ws){
		
	
		console.log(init_data);
		ws.send(JSON.stringify(init_data));
	}


	function get_distance(item1, item2){
		return Math.hypot(item2[0]-item1[0], item2[1]-item1[1]);
	}


	function isCollision(item1, item2){
		return false;
	  minDistance = (item1.size + item2.size);
	  var posX1 = item1.position[0];
	  var posY1 = item1.position[1];
	  var posX2 = item2.position[0];
	  var posY2 = item2.position[1];
  
	  if (Math.abs(posX1 - posX2) >= minDistance){
	    return false;
	  } else {
	    if (Math.abs(posY1 - posY2) >= minDistance){
	      return false;
	    } else {
	      return true;
	    }
	  }
  
	}

	function is_in_sight(item1, item2, range = 500){
		if (Math.abs(item1.position[0] - item2.position[0]) < range && Math.abs(item1.position[1] - item2.position[1]) < range){
			return true;
		} else {
			return false;
		}
	}


	function get_sight(){
		var living_length = living_spirits.length;
		for (h = 0; h < living_length; h++){
		  living_spirits[h].sight = {
				friends: [],
				enemies: [],
				structures: []
			}
		}
	
		for (i = 0; i < living_length; i++){
			for (j = i+1; j < living_length; j++){
				//console.log(i + ', ' + j);
				if (is_in_sight(living_spirits[i], living_spirits[j])){
					//maybe add distance stuff later
					//distance_approx = distance_nonrooted(living_spirits[i].position, living_spirits[j].position);
					//console.log('distance between ' + living_spirits[i].id + ' and ' + living_spirits[j].id + 'is ' + distance_approx);
					if (living_spirits[j].player_id == players['p1']){
						if (living_spirits[i].player_id == players['p1']){
							//is friend
							living_spirits[i].sight.friends.push(living_spirits[j].id);
							living_spirits[j].sight.friends.push(living_spirits[i].id);
						} else if (living_spirits[i].player_id == players['p2']){
							//is enemy
							living_spirits[i].sight.enemies.push(living_spirits[j].id);
							living_spirits[j].sight.enemies.push(living_spirits[i].id);
						}
						
					} else if (living_spirits[j].player_id == players['p2']){
						if (living_spirits[i].player_id == players['p2']){
							//is friend
							living_spirits[i].sight.friends.push(living_spirits[j].id);
							living_spirits[j].sight.friends.push(living_spirits[i].id);
						} else if (living_spirits[i].player_id == players['p1']){
							//is enemy
							living_spirits[i].sight.enemies.push(living_spirits[j].id);
							living_spirits[j].sight.enemies.push(living_spirits[i].id);
						}
					}
				}
			}
		
			//stars
			for (k = 0; k < stars.length; k++){
				if (is_in_sight(living_spirits[i], stars[k])){
					living_spirits[i].sight.structures.push(stars[k].id);
				}
			}
		}
	
	}


	function resolve_collision(){
	
	}


	function update_state(){
		//after everything is calculated
		
	
			//render_data = [[],[],[],[],[]];
			render_data2 = {
				'move': [],
				'energize': [],
				'death': [],
				'birth': [],
				'error_msg': [],
				'console1': [],
				'console2': []
			}
		
		
			//objects birth
			if (base_lookup['base_' + players['p1']].energy >= 50){
				top_s++;
				global[players['p1'] + top_s] = new Spirit(players['p1'] + top_s, [1500, 600], 1, 10, players['p1'], colors['player1']);
				base_lookup['base_' + players['p1']].energy -= 50;
				global[players['p1'] + top_s].move([1400, 640]);
				console.log('spirit was born!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
			}
			if (base_lookup['base_' + players['p2']].energy >= 50){
				top_q++;
				global[players['p2'] + top_q] = new Spirit(players['p2'] + top_q, [2900, 1200], 4, 10, players['p2'], colors['player2']);
				base_lookup['base_' + players['p2']].energy -= 50;
				global[players['p2'] + top_q].move([2860, 1160]);
				console.log('spirit was born')
			}
				
			
			birthlings = birth_queue.length;
			for (i = birthlings - 1; i >= 0; i--){
				spt = birth_queue[i];	
				render_data2.birth.push(birth_queue[i]);
				spirit_lookup[spt.id] = spt;
				birth_queue.splice(i, 1);
			}
		
		
		    //objects move
			moveables = move_queue.length;
			console.log('moveables = ' + moveables);
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
			
				if (Math.abs(move_queue[i][2][0] - move_queue[i][0].position[0]) < 0.6 && Math.abs(move_queue[i][2][1] - move_queue[i][0].position[1]) < 0.6){
					move_queue[i][1] = [0,0];
				}
			
				// work with data only if there is movement
				if ((Math.abs(move_queue[i][1][0]) > 0) || (Math.abs(move_queue[i][1][1]) > 0)){
					var posX = move_queue[i][0].position[0];
					var posY = move_queue[i][0].position[1];
					var incrX = move_queue[i][1][0];
					var incrY = move_queue[i][1][1];
					var targetX = move_queue[i][2][0];
					var targetY = move_queue[i][2][1];
				
					//basic pathfinding here? save position into obstacle_queue and then check against it?
				
					move_queue[i][0].position[0] = Number((move_queue[i][0].position[0] + move_queue[i][1][0]).toFixed(5));
					move_queue[i][0].position[1] = Number((move_queue[i][0].position[1] + move_queue[i][1][1]).toFixed(5));
				
					potential_collisions = move_queue[i][0].sight.friends.length;
					for (j = 0; j < potential_collisions; j++){
						collidie = spirit_lookup[move_queue[i][0].sight.friends[j]]
						if (isCollision(move_queue[i][0], collidie)){
							//console.log('COLLISION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
							//move_queue[i][0].position[0]
							var incrX_sign;
							var incrY_sign;
							(incrX > 0) ? incrX_sign = -1 : incrX_sign = 1;
							(incrY > 0) ? incrY_sign = -1 : incrY_sign = 1;
						
							tempX = collidie.position[0] + (collidie.size + move_queue[i][0].size)*incrX_sign;
							tempY = collidie.position[1] + (collidie.size + move_queue[i][0].size)*incrY_sign;
							//collidie.position = [200,200];
						
							if (Math.abs(tempX - move_queue[i][0].position[0]) < Math.abs(tempY - move_queue[i][0].position[1])){
								move_queue[i][0].position[0] = tempX;
								move_queue[i][1][0] = move_queue[i][0].position[0] - posX;
							} else {
								move_queue[i][0].position[1] = tempY;
								move_queue[i][1][1] = move_queue[i][0].position[1] - posY;
							}
						
							//if (isCollision(move_queue[i][0], collidie)){
						
						}
					}
				
					//console.log('move_queue[i][0].sight.friends');
					//console.log(move_queue[i][0].sight.friends);
				
					//if (isCollision(move_queue[i], ))
				
					/*
					console.log('---');
					console.log(move_queue[i][0].id);
					console.log(move_queue[i][0].position);
					console.log(move_queue[i][1]);
					console.log(move_queue[i][2]);
					*/
				
					//render_data2.move.push([move_queue[i][0].id, move_queue[i][0].position, move_queue[i][1], move_queue[i][2]]);
				
					render_data2.move.push([move_queue[i][0].id, [posX, posY], move_queue[i][1], move_queue[i][2]]);
				}
			
			
						
			}
		
		
		
			//objects sight
			//console.log('spirit_lookup[sp1].sight');
			//console.log(spirit_lookup['sp1'].sight);
			get_sight();
			//console.log('spirit_lookup[s1].sight');
			//console.log(spirit_lookup['s1'].sight);
			//console.log(spirit_lookup['sp1'].sight);
		
		
			//objects energize
			var energize_apply = [];
			e_targets = energize_queue.length;
			for (i = (e_targets - 1); i >= 0; i--){
				//if (energize_queue[i][1].hp == 0) break;
				//if origin == target —> attempt harvest from star
				if (energize_queue[i][0] == energize_queue[i][1]){
					for (j = 0; j < energize_queue[i][0].sight.structures.length; j++){
						if (star_lookup[energize_queue[i][0].sight.structures[j]].structure_type == 'star'){
							star_distance = get_distance(energize_queue[i][0].position, star_lookup[energize_queue[i][0].sight.structures[j]].position);
							if (star_distance < 200){
								console.log('harvesting');
								energize_queue[i][0].energy += energy_value * energize_queue[i][0].size;
								if (energize_queue[i][0].energy > energize_queue[i][0].energy_capacity) energize_queue[i][0].energy = energize_queue[i][0].energy_capacity;
								//render energize: [origin, target, energy]
								render_data2.energize.push([star_lookup[energize_queue[i][0].sight.structures[j]].id, energize_queue[i][0].id, energy_value * energize_queue[i][0].size]);
							} else {
								console.log('out of reach');
							}
							console.log(get_distance(energize_queue[i][0].position, star_lookup[energize_queue[i][0].sight.structures[j]].position) + ' far away');
							console.log(energize_queue[i][0].energy);
						}
					}
				}
			
				//if target is friend
				else if (energize_queue[i][0].player_id == energize_queue[i][1].player_id){
					target_distance = get_distance(energize_queue[i][0].position, energize_queue[i][1].position);
					if (target_distance < 200){
						if (energize_queue[i][0].energy > energy_value * energize_queue[i][0].size){
							energize_queue[i][0].energy -= energy_value * energize_queue[i][0].size;
							energize_queue[i][1].energy += energy_value * energize_queue[i][0].size;
							if (energize_queue[i][1].energy > energize_queue[i][1].energy_capacity) energize_queue[i][1].energy = energize_queue[i][1].energy_capacity;
							render_data2.energize.push([energize_queue[i][0].id, energize_queue[i][1].id, energy_value * energize_queue[i][0].size]);
						} else if (energize_queue[i][0].energy > 0){
							render_data2.energize.push([energize_queue[i][0].id, energize_queue[i][1].id, energize_queue[i][1].energy]);
							energize_queue[i][1].energy += energize_queue[i][0].energy;
							energize_queue[i][0].energy = 0;
						} else {
							console.log('no energy to give');
						}
						console.log('origin energy: ' + energize_queue[i][0].energy);
						console.log('target energy: ' + energize_queue[i][1].energy);
					}
				
				}
			
				//if target is enemy
				else if (energize_queue[i][0].player_id != energize_queue[i][1].player_id){
					target_distance = get_distance(energize_queue[i][0].position, energize_queue[i][1].position);
					var strength = 0;
					if (target_distance < 200){
						if (energize_queue[i][0].energy > energy_value * energize_queue[i][0].size){
							strength = energy_value * energize_queue[i][0].size;
							energize_apply.push([energize_queue[i][0], strength * (-1)]);
							energize_apply.push([energize_queue[i][1], strength * (-2)]);
							render_data2.energize.push([energize_queue[i][0].id, energize_queue[i][1].id, 2 * strength]);
							//if below 0, kill
							
						} else if (energize_queue[i][0].energy > 0){
							strength = energize_queue[i][0].energy;
							energize_apply.push([energize_queue[i][0], strength * (-1)]);
							energize_apply.push([energize_queue[i][1], strength * (-2)]);
							render_data2.energize.push([energize_queue[i][0].id, energize_queue[i][1].id, 2 * strength]);
						} else {
							console.log('no energy to give');
						}
						console.log('origin energy: ' + energize_queue[i][0].energy);
						console.log('target energy: ' + energize_queue[i][1].energy);
					}				
				}
				
				energize_queue.splice(i, 1);
			}
			
			e_applies = energize_apply.length;
			for (i = (e_applies - 1); i >= 0; i--){
				energize_apply[i][0].energy += energize_apply[i][1];
			}
			
			for (i = (e_applies - 1); i >= 0; i--){
				if (energize_apply[i][0].energy < 0){
					death_queue.push(energize_apply[i][0]);
				}
				energize_apply.splice(i, 1);			
			}
			
			
		
		
			//objects death & vm sandbox objects update
			deaths = death_queue.length;
			for (i = (deaths - 1); i >= 0; i--){
				console.log(death_queue[i].id + ' died');
				death_queue[i].hp = 0;
				render_data2.death.push(death_queue[i].id);
				
				//delete spirit_lookup[suid];
				//var index = living_spirits.findIndex(x => x.id == death_queue[i].id);
				//living_spirits.splice(index);
				
			
				death_queue.splice(i, 1);
			}
		
		
			//errors
			render_data2.error_msg = user_error;
			render_data2.console1 = log1;
			render_data2.console2 = log2;
			user_error = '';
		
		
			//broadcast to clients
			//console.log(JSON.stringify(render_data2))
			parentPort.postMessage({data: JSON.stringify(render_data2), game_id: workerData, meta: ''});
			//wss.broadcast();
			
			//update vm sandbox objects
			for (i = 0; i < living_spirits.length; i++){
				spt = living_spirits[i];	
				if (spt.player_id == players['p2']){
					pl2_units[spt.id] = spt;
					var tempJSON = JSON.stringify(spt);
					pl1_units[spt.id] = JSON.parse(tempJSON);
				} else if (spt.player_id == players['p1']) {
					pl1_units[spt.id] = spt;
					var tempJSON = JSON.stringify(spt);
					pl2_units[spt.id] = JSON.parse(tempJSON);
				}
			}
			
			log1 = [];
			log2 = [];
			
			
			
		
			user_code();
			processTime2 = process.hrtime(processTime1);
			processTimeRes = (processTime2[0] * 1000000000 + processTime2[1]) / 1000000;
			console.log('calculated in = ' + processTimeRes);
			user_error = 'calculated in = ' + processTimeRes;
			
			
		
	}
	
	
	
	function game_start(){
		//map creation
		// -----------------

		for (s = 1; s < 3; s++){
			global[players['p1'] + s] = new Spirit(players['p1'] + s, [1300+s*10,480], 4, 40, players['p1'], colors['player1']);
			spirits.push(global[players['p1'] + s]);
			top_s = s;
		}

		for (q = 1; q < 3; q++){
			global[players['p2'] + q] = new Spirit(players['p2'] + q, [2500+q*10,1520], 4, 40, players['p2'], colors['player2']);
			spirits2.push(global[players['p2'] + q]);
			top_q = q;
		}
	
	
		global['base_' + players['p1']] = new Base('base_' + players['p1'], [1500, 600], players['p1'], colors['player1']);
		global['base_' + players['p2']] = new Base('base_' + players['p2'], [2300, 1400], players['p2'], colors['player2']);
	
		base_lookup['base_' + players['p1']] = global['base_' + players['p1']];
		base_lookup['base_' + players['p2']] = global['base_' + players['p2']];
	
		star_zxq = new Star('star_zxq', [900, 800]);
		star_lookup['star_zxq'] = star_zxq;
	
		star_a1c = new Star('star_a1c', [2900, 1200]);
		star_lookup['star_a1c'] = star_a1c;
		
		
		
		user_code();
	
		setInterval(function () {
			processTime1 = process.hrtime();
			update_state();
			//ws.send('sending render_data');	
			//ws.send(JSON.stringify(render_data2));
			//ws.send(JSON.stringify(render_data));
			//ws.send(render_data);
			//console.log(render_data2);
			//var render_data = [[],[],[],[],[]];
		
		}, game_tick);
	}

	
	
	
	
	
	
	
	
}










