// just some elo stuff here

function getRatingDelta(playerRating, opponentRating, playerResult) {
	if ([0, 0.5, 1].indexOf(playerResult) === -1) {
		return null;
	}
	var chanceToWin = 1 / ( 1 + Math.pow(10, (opponentRating - playerRating) / 400));
	return Math.round(32 * (playerResult - chanceToWin));
}

function getNewRating(playerRating, opponentRating, playerResult) {
	return playerRating + getRatingDelta(playerRating, opponentRating, playerResult);
}

//




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
	  console.log(workerData);
	  
	    if (workerData[1] == 'tutorial'){
			init_data = {
				'units': [],
				'stars': [],
				'bases': [],
				'players': [],
				'tut': 1
			}
	    } else {
			init_data = {
				'units': [],
				'stars': [],
				'bases': [],
				'players': []
			}
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
		
		if (players_update['p1'] != 'old'){
			init_data.players[0] = players_update['p1'];
		}
		
		parentPort.postMessage({data: JSON.stringify(init_data), game_id: workerData[0], meta: 'initiate', client: message.client});
  } else if (message.data == "player code"){
	  //check who's code it is here
	  if (message.pl_num == "player1"){
		  if (message.session_id == player1_session || message.pl_id == 'anonymous'){
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
  } else if (message.data == "start world"){
	  players['p1'] = message.player1;
	  players['p2'] = message.player2;
	  players['p1_shape'] = message.p1_shape;
	  players['p2_shape'] = message.p2_shape;
	  colors['player1'] = color_palettes[message.p1_color];
	  colors['player2'] = color_palettes[message.p2_color];
	  console.log('game started');
	  console.log(players);
	  console.log(colors);
	  game_start();
	  
	  Game.find({game_id: workerData[0]})
	  	.then((result) => {
			console.log('p1_color');
			console.log(result[0].p1_color);
			if (result[0].player2 == 'medium-bot'){
				player2_code = player2_code = `
					
				var this_player_id = players['p2'];		
				
				//var my_spirits = [];
				
				
				
				//for (q = 0; q < (Object.keys(spirits)).length; q++){
				//	if(spirits[Object.keys(spirits)[q]].hp > 0 && this_player_id == spirits[Object.keys(spirits)[q]].player_id){
				//		my_spirits.push(spirits[Object.keys(spirits)[q]]);
				//	}
				//}
				
				global['base'] = Object.values(bases)[1];
				global['enemy_base'] = Object.values(bases)[0];
				global['star_zxq'] = stars['star_zxq'];
				global['star_a1c'] = stars['star_a1c'];
				
				for (i=0; i<my_spirits.length; i++){
					my_spirits[i].move(star_a1c.position);
					my_spirits[i].energize(my_spirits[i]);
	
				    if (my_spirits[i].energy == my_spirits[i].energy_capacity){
						memory[my_spirits[i].id] = 'charging';
					} else if (my_spirits[i].energy == 0){
						memory[my_spirits[i].id] = 'harvesting';
					}

					if (memory[my_spirits[i].id] == 'charging'){
				    	my_spirits[i].move(base.position);
				    	my_spirits[i].energize(base);
					} else if (memory[my_spirits[i].id] == 'harvesting'){
				    	my_spirits[i].move(star_a1c.position);
						my_spirits[i].energize(my_spirits[i]);
					}
				}

				if (base.sight.enemies.length > 0){
					console.log('i see you');
					var invader = spirits[base.sight.enemies[0]];
					for (j=0; j<my_spirits.length; j++){
						if (my_spirits[j].energy == my_spirits[j].energy_capacity){
							memory[my_spirits[j].id] = "attacker";
						}
						if (memory[my_spirits[j].id] == "attacker" && j < my_spirits.length / 2){
							console.log('this should be last');
							my_spirits[j].move(invader.position);
							my_spirits[j].energize(invader);
						}
					}
	
				} else {
					memory['atck'] = 0; 
				}

				if (my_spirits.length >= 20 && memory['phase'] != 1){
				    if (memory['phase'] == undefined || memory['phase'] == ''){
				        memory['phase'] = 1;
				    }
				}

				if (memory['phase'] == 1){
				    for (j = 0; j < 11; j++){
				        if (my_spirits[j].energy == my_spirits[j].energy_capacity){
				    		memory[my_spirits[j].id] = 'invader';
				    		my_spirits[j].move([2200, 1000]);
					    }
					    my_spirits[0].move([2000,1100]);
				    }
				}

				if (memory['phase'] == 1 && my_spirits[0].position[0] == 2100 && my_spirits[5].position[0] == 2100){
				    memory['phase'] = 2;
				}

				if (memory['phase'] == 2){
				    for (j=1; j<11; j++){
				        my_spirits[j].move(enemy_base.position);
				        my_spirits[j].energize(enemy_base)
				    }
				    my_spirits[0].move([1000, 1000])
				}
				
				`;
			}
			
			User.find({user_id: players['p1']})
				.then((result_p1) => {
					User.find({user_id: players['p2']})
						.then((result_p2) => {
							Game.updateOne({game_id: workerData[0]}, {p1_rating: result_p1[0]['rating'], p2_rating: result_p2[0]['rating']}, {upsert: true})
								.then((qq) => {
									console.log('p1 and p2 ratings updated');
								});	
						})
						.catch((error) => {
							console.log(error);
						})
				})
				.catch((error) => {
					console.log(error);
				})
			
				
		})
  		.catch((error) => {
  			console.log(error);
  		}) 
  } else if (message.data == "update anonymous"){
  	  players_update['p1'] = message.player1;
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
		if (workerData[1] == 'tutorial'){
			//console.log(player1_code);
			var helper_count = (player1_code.match(/my_spirits/g) || []).length;
			//console.log('my_spirits count');
			//console.log(helper_count);
			
			if (helper_count > 2){
				console.log('tutorial phase 6 half-done');
				tutorial_flag1 = 1;
			}
		}
		vm.run(player1_code, 'vm.js');
		//vm.run(player2_code, 'vm.js');
	} catch (error){
		fill_error(players['p1'], error.message);
		//console.error(error);
	}
	
	try {
		vm2.run(player2_code, 'vm2.js');
		//vm.run(player2_code, 'vm.js');
	} catch (error){
		fill_error(players['p2'], error.message);
		//console.error(error);
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
var merge_queue = [];
var divide_queue = [];
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
var players_update = {};
players_update['p1'] = 'old';

var spirit_p1_cost = 100;
var spirit_p2_cost = 100;
var p1_defend = 0;
var p2_defend = 0;

var temp_flag = 0;

//tutorial
if (workerData[1] == 'tutorial'){
	var tutorial_phase = [0, 0, 0, 0, 0, 0, 0, 0];
	var tutorial_flag1 = 0;
	spirit_p2_cost = 30;
	
	
	player2_code = `
				//all = spirits.length;
				//for (s = 0; s < all; s++){
				//	global['s' + s] = spirits[s];
				//}
					
				var this_player_id = players['p2'];		
				
				//var my_spirits = [];
				
				
				//
				//for (q = 0; q < (Object.keys(spirits)).length; q++){
				//	if(spirits[Object.keys(spirits)[q]].hp > 0 && this_player_id == spirits[Object.keys(spirits)[q]].player_id){
				//		my_spirits.push(spirits[Object.keys(spirits)[q]]);
				//	}
				//}
				//
			
				
				global['base'] = Object.values(bases)[1];
				global['enemy_base'] = Object.values(bases)[0];
				global['star_zxq'] = stars['star_zxq'];
				global['star_a1c'] = stars['star_a1c'];
				
				my_spirits[0].move(star_a1c.position);
				my_spirits[0].energize(my_spirits[0]);
				if (my_spirits[0].energy == my_spirits[0].energy_capacity) {
					my_spirits[0].move(base.position)
					my_spirits[0].energize(base);
				}
				
				if (spirits['anonymous2'].energy == 0){
					my_spirits[1].move(enemy_base.position);
				}
				
				`;
}

var colors = {};
colors['player1'] = "rgba(255, 0, 0, 1)";
colors['player2'] = "rgba(0, 100, 255, 1)";
var color_palettes = {};
color_palettes['color1'] = 'rgba(128,140,255,1)';
color_palettes['color2'] = 'rgba(232,97,97,1)';
color_palettes['color3'] = 'rgba(58,197,240,1)';
color_palettes['color4'] = 'rgba(201,161,101,1)';

var pl1_units = {};
var pl2_units = {};
var my_spirits1 = [];
var my_spirits2 = [];

var top_s = 0;
var top_q = 0;

var firstCode = 0;

var energy_value = 1;


var processTime1 = 0;
var processTime2 = 0;
var processTimeRes = 0;
var game_finished = 0;

var user_error1 = [];
var user_error2 = [];

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
	'error_msg1': [],
	'error_msg2': [],
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



function fill_error(plid, err_msg){
	if (plid == players['p1']){
		user_error1.push(err_msg);
	} else if (plid == players['p2']){
		user_error2.push(err_msg);
	}
}



//sandbox is the keyword, moron
const vm = new VM({ timeout: 350, sandbox: {console: console1, memory: memory1} });
const vm2 = new VM({ timeout: 350, sandbox: {console: console2, memory: memory2} });


//vm.freeze(spirits, 'spirits');
vm.freeze(players, 'players');
vm.freeze(pl1_units, 'spirits');
vm.freeze(my_spirits1, 'my_spirits');
vm.freeze(star_lookup, 'stars');
vm.freeze(base_lookup, 'bases');
//vm2.freeze(spirits2, 'spirits');
vm2.freeze(players, 'players');
vm2.freeze(pl2_units, 'spirits');
vm2.freeze(my_spirits2, 'my_spirits');
vm2.freeze(star_lookup, 'stars');
vm2.freeze(base_lookup, 'bases');

if (!isMainThread){
	class Spirit {
		constructor(id, position, size, energy, player, color, cost){
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
			this.merged = [];
			this.qcollisions = [];
		
		
			//const properties
			this.hp = 1;
			this.move_speed = 1;
			this.energy_capacity = size * 10;
			this.player_id = player;
			this.cost = cost;
		
			living_spirits.push(this);
			birth_queue.push(this);
			move_queue.push([this, [0,0], this.position]);
		}
	
		birth() {
		
		}
		
	
		move(target) {
			var adj1 = Math.floor(Math.random() * 100) / 70;
			var adj2 = Math.floor(Math.random() * 100) / 70;
			//check that target is array, otherwise throw error
			if (Array.isArray(target) == false){
				//user_error = '.move() argument must be an array. E.g. s1.move([100, 100]) or s1.move(s2.position)';
				console.log(this.player_id);
				var err_msg = '.move() argument must be an array. E.g. my_spirits[0].move([100, 100]) or my_spirits[0].move(my_spirits[0].position). Received: ' + target;
				
				fill_error(this.player_id, err_msg);
				
				return
			} else {
				if (target.length != 2){
					console.log('player id');
					console.log(this.player_id);
					var err_msg = '.move() argument must be an array of length 2. E.g. my_spirits[0].move([100, 100]) or my_spirits[0].move(my_spirits[0].position)';
				
					fill_error(this.player_id, err_msg);
					return
				}
			}
		
			var tarX = target[0];
			var tarY = target[1];
			var incr = [0, 0];
			var entry_index = move_queue.findIndex(entry => entry[0]['id'] === this.id);
			//console.log('entry_index = ' + entry_index);
		
				
			if (Math.abs(target[0] - this.position[0]) < 0.6 && Math.abs(target[1] - this.position[1]) < 0.6){
				var update_needed = 0;
				
				//console.log('not going anywhere');
				incr[0] = 0;
				incr[1] = 0;
				this.position[0] = target[0];
				this.position[1] = target[1];
				
				/*
				
				for (q = 0; q < this.qcollisions.length; q++){
					if (spirit_lookup[this.qcollisions[q]].position[0] == this.position[0] && spirit_lookup[this.qcollisions[q]].position[1] == this.position[1]){
						update_needed = 1;
					}
				}
				
				if (update_needed == 1){
					this.position[0] += 2;
					this.position[1] += 2;
					incr[0] = 2;
					incr[1] = 2;
				}*/
			
			} else {
				//check if spirit still alive
				if (this.hp != 0){
					
					var angle = Math.atan2(target[1] - this.position[1], target[0] - this.position[0]);
					incr[0] = adj1 + Number(((Math.round(Math.cos(angle) * 10000) / 10000) * base_speed).toFixed(5));
					incr[1] = adj2 + Number(((Math.round(Math.sin(angle) * 10000) / 10000) * base_speed).toFixed(5));
		
					if ( ((Math.abs(tarX - this.position[0]) <= Math.abs(incr[0])) && (Math.abs(tarY - this.position[1]) <= Math.abs(incr[1]))) || ((Math.abs(tarX - this.position[0]) <= 15) && (Math.abs(tarY - this.position[1]) <= 15)) )  {
						incr[0] = tarX - this.position[0];
						incr[1] = tarY - this.position[1];
					}
					
				} else {
					//console.log('spirit is dead');
				}
						
			}
		
			move_queue[entry_index] = [this, incr, target];
		}
	
	
		energize(target) {
			//console.log('target = ');
			//console.log(target);
			var entry_index2 = energize_queue.findIndex(entry2 => entry2[0]['id'] === this.id);
			
			if (Array.isArray(target) == true){
				var err_msg = ".energize() argument must be a spirit object, not an array. E.g. my_spirits[0].energize(my_spirits[0]) or my_spirits[0].energize(spirits['" + this.player_id + "1'])";
				fill_error(this.player_id, err_msg);
				return;
			} else if (typeof target !== 'object' || target === null){
				var err_msg = ".energize() argument must be a spirit object. E.g. my_spirits[0].energize(my_spirits[0]) or my_spirits[0].energize(spirits['" + this.player_id + "1'])";
				fill_error(this.player_id, err_msg);
				return;
			}
			
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
			
			if (workerData[1] == 'tutorial'){
				try {
					if (target.id == 'easy-bot2'){
						console.log('tutorial phase 7 done');
						tutorial_phase[6] = 1;
					}
				} catch (error){
					console.log(error);
				}
			}
			
			//this, this.energy, this.size, target)
			if (target.hp != 0){
				if (entry_index2 == -1){
					energize_queue.push([this, target]);
				} else {
					energize_queue[entry_index2] = [this, target];
				}
				
				//energize_queue[entry_index2] = [this, target];
			}
			
		}
		
		merge(target){
			
			if (target.id == this.id){
				var err_msg = "You can't merge spirit into itself";
				fill_error(this.player_id, err_msg);
				return;
			}
			
			var entry_index3 = merge_queue.findIndex(entry3 => entry3[0]['id'] === this.id);
			
			try {
				if (Array.isArray(target) == true){
					var err_msg = ".merge() argument must be a friendly spirit object, not an array. E.g. my_spirits[0].merge(my_spirits[1])";
					fill_error(this.player_id, err_msg);
					return;
				} else if (typeof target !== 'object' || target === null){
					var err_msg = ".merge() argument must be a friendly spirit object. E.g. my_spirits[0].merge(my_spirits[1])";
					fill_error(this.player_id, err_msg);
					return;
				}
			
				if (Math.abs(target.position[0] - this.position[0]) < 12 && Math.abs(target.position[1] - this.position[1]) < 12 && this.player_id == target.player_id){
				
				} else {
					return;
				}
			} catch (error){
				fill_error(this.player_id, error.message);
				
			}
			
						
			if (target.hp != 0 && this.hp != 0){
				if (entry_index3 == -1){
					merge_queue.push([this, target]);
				} else {
					merge_queue[entry_index3] = [this, target];
				}
			}
			
		}
		
		divide(){
			
			var entry_index4 = merge_queue.findIndex(entry4 => entry4[0]['id'] === this.id);
			
			if (this.hp != 0 && this.merged.length > 0){
				if (entry_index4 == -1){
					divide_queue.push(this);
				} else {
					divide_queue[entry_index4] = this;
				}
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
			this.energy_capacity = 200;
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
	
	function get_distance_fast(item1, item2){
		return ((item2[0]-item1[0])**2) + ((item2[1]-item1[1])**2)
	}
	
	function intersection(x0, y0, r0, x1, y1, r1) {
	        var a, dx, dy, d, h, rx, ry;
	        var x2, y2;

	        /* dx and dy are the vertical and horizontal distances between
	         * the circle centers.
	         */
	        dx = x1 - x0;
	        dy = y1 - y0;

	        /* Determine the straight-line distance between the centers. */
	        d = Math.sqrt((dy*dy) + (dx*dx));

	        /* Check for solvability. */
	        if (d > (r0 + r1)) {
	            /* no solution. circles do not intersect. */
	            return false;
	        }
	        if (d < Math.abs(r0 - r1)) {
	            /* no solution. one circle is contained in the other */
	            return false;
	        }

	        /* 'point 2' is the point where the line through the circle
	         * intersection points crosses the line between the circle
	         * centers.  
	         */

	        /* Determine the distance from point 0 to point 2. */
	        a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d) ;

	        /* Determine the coordinates of point 2. */
	        x2 = x0 + (dx * a/d);
	        y2 = y0 + (dy * a/d);

	        /* Determine the distance from point 2 to either of the
	         * intersection points.
	         */
	        h = Math.sqrt((r0*r0) - (a*a));

	        /* Now determine the offsets of the intersection points from
	         * point 2.
	         */
	        rx = -dy * (h/d);
	        ry = dx * (h/d);

	        /* Determine the absolute intersection points. */
	        var xi = x2 + rx;
	        var xi_prime = x2 - rx;
	        var yi = y2 + ry;
	        var yi_prime = y2 - ry;

	        return [xi, xi_prime, yi, yi_prime];
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
	
	
	
	function isCollision(item1, item2){
		
	}

	function is_in_sight(item1, item2, range = 400){
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
		  living_spirits[h].qcollisions = [];
			
		}
	
		//spirits root (it's longer than you think)
		for (i = 0; i < living_length; i++){
			for (j = i+1; j < living_length; j++){
				if (living_spirits[j].hp == 0) continue;
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
							//collision-sight
							if (is_in_sight(living_spirits[i], living_spirits[j], 50)){
								living_spirits[i].qcollisions.push(living_spirits[j].id);
								living_spirits[j].qcollisions.push(living_spirits[i].id);
							}
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
			
			//bases
			for (l = 0; l < bases.length; l++){
				if (is_in_sight(living_spirits[i], bases[l])){
					living_spirits[i].sight.structures.push(bases[l].id);
				}
			}
			
			
			//console.log('living_spirits[i].qcollisions');
			//console.log(living_spirits[i].qcollisions);
			
		}
		
		//bases sight
		for (m = 0; m < bases.length; m++){
  		  bases[m].sight = {
  				friends: [],
  				enemies: [],
  				structures: []
		  }
			  
			for (n = 0; n < living_length; n++){
				if (living_spirits[n].hp == 0) continue;
				
				if (is_in_sight(living_spirits[n], bases[m], 400)){
					if (bases[m].player_id == players['p1']){
						if (living_spirits[n].player_id == players['p1']){
							bases[m].sight.friends.push(living_spirits[n].id);
						} else {
							bases[m].sight.enemies.push(living_spirits[n].id);
						}
					} else {
						if (living_spirits[n].player_id == players['p1']){
							bases[m].sight.enemies.push(living_spirits[n].id);
						} else {
							bases[m].sight.friends.push(living_spirits[n].id);
						}
					}
				}
			}
			
			if (bases[m].sight.enemies.length > 0){
				if (bases[m].player_id == players['p1']){
					p1_defend = 1;
				} else {
					p2_defend = 1;
				}
			} else {
				if (bases[m].player_id == players['p1']){
					p1_defend = 0;
				} else {
					p2_defend = 0;
				}
			}
			
		}
	
	}


	function resolve_collision(){
	
	}


	function update_state(){
		//after everything is calculated
		
	//console.log(player2_code);
	//console.log('player2_code');
			//render_data = [[],[],[],[],[]];
			
			if (workerData[1] == 'tutorial'){
				render_data2 = {
					'move': [],
					'energize': [],
					'special': [],
					'death': [],
					'birth': [],
					'error_msg1': [],
					'error_msg2': [],
					'console1': [],
					'console2': [],
					'tutorial': []
				}
			} else {
				render_data2 = {
					'move': [],
					'energize': [],
					'special': [],
					'death': [],
					'birth': [],
					'error_msg1': [],
					'error_msg2': [],
					'console1': [],
					'console2': []
				}
			}
			
			var qcollisions_stay = {};
			var prev_position = {};
		
		
			//objects birth
			
			if (base_lookup['base_' + players['p1']].energy >= spirit_p1_cost){
				if (workerData[1] == 'tutorial' && top_s > 20){
					console.log('can not have more than 20 spirits in tutorial');
				} else {
					if (p1_defend != 1){
						top_s++;
						global[players['p1'] + top_s] = new Spirit(players['p1'] + top_s, [1450, 600], 1, 10, players['p1'], colors['player1'], spirit_p1_cost);
						base_lookup['base_' + players['p1']].energy -= spirit_p1_cost;
						global[players['p1'] + top_s].move([1430, 600]);
						//console.log('spirit was born!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
						if (workerData[1] == 'tutorial'){
							console.log('tutorial phase 5 done');
							tutorial_phase[4] = 1;
						}
					}
				}
			}
			if (base_lookup['base_' + players['p2']].energy >= spirit_p2_cost){
				if (p2_defend != 1){
					top_q++;
					global[players['p2'] + top_q] = new Spirit(players['p2'] + top_q, [2350, 1400], 1, 10, players['p2'], colors['player2'], spirit_p2_cost);
					base_lookup['base_' + players['p2']].energy -= spirit_p2_cost;
					global[players['p2'] + top_q].move([2380, 1400]);
					//console.log(top_q);
				}
			}
				
			
			birthlings = birth_queue.length;
			for (i = birthlings - 1; i >= 0; i--){
				spt = birth_queue[i];	
				render_data2.birth.push(birth_queue[i]);
				spirit_lookup[spt.id] = spt;
				birth_queue.splice(i, 1);
			}
		
		
		
			//
		    //objects move
			//
			
			moveables = move_queue.length;
			//console.log('moveables = ' + moveables);
			for (i = (moveables - 1); i >= 0; i--){
				if (move_queue[i][0].hp == 0) continue;
				prev_position[move_queue[i][0].id] = JSON.parse(JSON.stringify(move_queue[i][0].position));
				
				//tutorial
				if (workerData[1] == 'tutorial'){
					try {
						//console.log('tutorial, star position');
						//console.log(move_queue[0][2]);
						if (move_queue[0][2][0] == 900 && move_queue[0][2][1] == 800){
							console.log('tutorial phase 1 done');
							tutorial_phase[0] = 1;
						} else if (move_queue[0][2][0] == 1500 && move_queue[0][2][1] == 600){
							console.log('tutorial phase 3 done');
							tutorial_phase[2] = 1;
						}
					} catch (error){
						console.log(error);
					}
					
				}
			
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
						collidie = spirit_lookup[move_queue[i][0].sight.friends[j]];
						if (isCollision(move_queue[i][0], collidie)){
							//this is always false now, until you figure out how to do this
							
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
											
						}
					}
					
					//console.log('qcollisions');
					//console.log(move_queue[i][0]);
					
					var potential_structure_collisions = move_queue[i][0].sight.structures;
					for (k = 0; k < potential_structure_collisions.length; k++){
						//console.log(' ------------------------------- structure potential collisions');
						//console.log(potential_structure_collisions[k]);
						
						
						if (potential_structure_collisions[k].startsWith('star') == true){
							var object_position = star_lookup[potential_structure_collisions[k]].position;
							var min_distance = 100;
						} else if (potential_structure_collisions[k].startsWith('base') == true){
							var object_position = base_lookup[potential_structure_collisions[k]].position;
							var min_distance = 50;
						}	
						var spirit_position = move_queue[i][0].position;
						var spirit_before = [0,0];
						spirit_before[0] = move_queue[i][0].position[0] - move_queue[i][1][0];
						spirit_before[1] = move_queue[i][0].position[1] - move_queue[i][1][1];
							
						//console.log('position now = ' + spirit_position);
						//console.log('position before = ' + spirit_before);
						if (get_distance(spirit_position, object_position) < min_distance){
							//console.log('inside');
							//intersection(x0, y0, r0, x1, y1, r1)
							inter_points = intersection(spirit_before[0], spirit_before[1], base_speed, object_position[0], object_position[1], min_distance);
							if (inter_points == false) continue;
							//console.log('intersection points:');
							//console.log(inter_points);
							
							
							var quick_dist1 = get_distance_fast([inter_points[0], inter_points[2]], move_queue[i][2]);
							var quick_dist2 = get_distance_fast([inter_points[1], inter_points[3]], move_queue[i][2]);
							
							if (Math.abs(quick_dist1 - quick_dist2) > 5){
								if (quick_dist1 < quick_dist2){
									move_queue[i][0].position[0] = inter_points[0];
									move_queue[i][0].position[1] = inter_points[2];
									move_queue[i][1][0] = inter_points[0] - spirit_before[0];
									move_queue[i][1][1] = inter_points[2] - spirit_before[1];
								} else {
									move_queue[i][0].position[0] = inter_points[1];
									move_queue[i][0].position[1] = inter_points[3];
									move_queue[i][1][0] = inter_points[1] - spirit_before[0];
									move_queue[i][1][1] = inter_points[3] - spirit_before[1];
								}
							} else {
								move_queue[i][0].position[0] = inter_points[0];
								move_queue[i][0].position[1] = inter_points[2];
								move_queue[i][1][0] = inter_points[0] - spirit_before[0];
								move_queue[i][1][1] = inter_points[2] - spirit_before[1];
							}
							
						}
							
					}
					
					if (qcollisions_stay[move_queue[i][0].id] != 1){
						for (q = (move_queue[i][0].qcollisions.length - 1); q >= 0; q--){
							//make min_distance the larger size of the two
					
							//console.log('collision processed');
							//console.log(qcollisions_stay);
							
							
							/*
						
							var col_min_distance = 3;
							var spirit_position = move_queue[i][0].position;
							var qollie = spirit_lookup[move_queue[i][0].qcollisions[q]].position;
							var spirit_before = [0,0];
							spirit_before[0] = move_queue[i][0].position[0] - move_queue[i][1][0];
							spirit_before[1] = move_queue[i][0].position[1] - move_queue[i][1][1];
						
							if (get_distance(spirit_position, qollie) < col_min_distance){
								
								console.log([spirit_position[0], spirit_position[1], 2, qollie[0], qollie[1], col_min_distance]);
								q_points = intersection(spirit_position[0], spirit_position[1], 2, qollie[0], qollie[1], col_min_distance);
								console.log('q_points');
								console.log(q_points);
								
								if (q_points != false){
									var quick_dist1 = get_distance_fast([q_points[0], q_points[2]], move_queue[i][0].position);
									var quick_dist2 = get_distance_fast([q_points[1], q_points[3]], move_queue[i][0].position);
									
									if (quick_dist1 < quick_dist2){
										move_queue[i][0].position[0] = q_points[0];
										move_queue[i][0].position[1] = q_points[2];
										move_queue[i][1][0] = q_points[0] - spirit_before[0];
										move_queue[i][1][1] = q_points[2] - spirit_before[1];
									} else {
										move_queue[i][0].position[0] = q_points[1];
										move_queue[i][0].position[1] = q_points[3];
										move_queue[i][1][0] = q_points[1] - spirit_before[0];
										move_queue[i][1][1] = q_points[3] - spirit_before[1];
									}
									
									
								
									qcollisions_stay[move_queue[i][0].id] = 1;
									qcollisions_stay[spirit_lookup[move_queue[i][0].qcollisions[q]].id] = 1;
								}
							
								
							}
						
							*/
						
						}
					}
					
					
						
						
						//if (get_distance(move_queue[i][0], )
						
					
				
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
		
		
			//
			//objects energize
			//
			
			var energize_apply = [];
			e_targets = energize_queue.length;
			for (i = (e_targets - 1); i >= 0; i--){
				//if (energize_queue[i][1].hp == 0) break;
				//if origin == target —> attempt harvest from star
				if (energize_queue[i][0] == energize_queue[i][1]){
					for (j = 0; j < energize_queue[i][0].sight.structures.length; j++){
						//console.log('ilook here');
						//console.log(energize_queue[i][0].sight.structures[j]);
						if ((energize_queue[i][0].sight.structures[j]).startsWith('star') == true){
							//console.log('its a star its a star its a star its a star its a star its a star its a star its a star');
							star_distance = get_distance(energize_queue[i][0].position, star_lookup[energize_queue[i][0].sight.structures[j]].position);
							if (star_distance < 200){
								if (workerData[1] == 'tutorial' && energize_queue[i][0].id == 'anonymous1'){
									tutorial_phase[1] = 1;
								}
								//console.log('harvesting');
								energize_queue[i][0].energy += energy_value * energize_queue[i][0].size;
								if (energize_queue[i][0].energy > energize_queue[i][0].energy_capacity) energize_queue[i][0].energy = energize_queue[i][0].energy_capacity;
								//render energize: [origin, target, energy]
								render_data2.energize.push([star_lookup[energize_queue[i][0].sight.structures[j]].id, energize_queue[i][0].id, energy_value * energize_queue[i][0].size]);
							} else {
								//console.log('out of reach');
							}
							//console.log(get_distance(energize_queue[i][0].position, star_lookup[energize_queue[i][0].sight.structures[j]].position) + ' far away');
							//console.log(energize_queue[i][0].energy);
						}
					}
				}
			
				//if target is friend
				else if (energize_queue[i][0].player_id == energize_queue[i][1].player_id){
					
					if (workerData[1] == 'tutorial'){
						if (energize_queue[i][1].id.startsWith('base') && energize_queue[i][0].energy < 10 && energize_queue[i][0].id == 'anonymous1'){
							console.log('tutorial phase 4 done');
							tutorial_phase[3] = 1;
						}
						if (energize_queue[i][1].id.startsWith('base') && energize_queue[i][0].id == 'anonymous2' && tutorial_flag1 == 1){
							console.log('tutorial phase 6 done');
							tutorial_phase[5] = 1;
							
							player2_code = `
										//all = spirits.length;
										//for (s = 0; s < all; s++){
										//	global['s' + s] = spirits[s];
										//}
					
										var this_player_id = players['p2'];		
				
										var my_spirits = [];
				
				
				
										for (q = 0; q < (Object.keys(spirits)).length; q++){
											if(spirits[Object.keys(spirits)[q]].hp > 0 && this_player_id == spirits[Object.keys(spirits)[q]].player_id){
												my_spirits.push(spirits[Object.keys(spirits)[q]]);
											}
										}
				
										global['base'] = Object.values(bases)[1];
										global['enemy_base'] = Object.values(bases)[0];
										global['star_zxq'] = stars['star_zxq'];
										global['star_a1c'] = stars['star_a1c'];
				
										my_spirits[0].move(star_a1c.position);
										my_spirits[0].energize(my_spirits[0]);
										if (my_spirits[0].energy == my_spirits[0].energy_capacity) {
											my_spirits[0].move(base.position)
											my_spirits[0].energize(base);
										}
										
										if (!memory['attacker']){
											memory['attacker'] = my_spirits[1];
										}
										
										memory['attacker'].move(enemy_base.position);
										//my_spirits[1].energize(enemy_base);
				
										`;
						}
					}
					
					
					target_distance = get_distance(energize_queue[i][0].position, energize_queue[i][1].position);
					if (target_distance < 200){
						if (energize_queue[i][0].energy > energy_value * energize_queue[i][0].size){
							energize_queue[i][0].energy -= energy_value * energize_queue[i][0].size;
							energize_queue[i][1].energy += energy_value * energize_queue[i][0].size;
							if (energize_queue[i][1].energy > energize_queue[i][1].energy_capacity) energize_queue[i][1].energy = energize_queue[i][1].energy_capacity;
							render_data2.energize.push([energize_queue[i][0].id, energize_queue[i][1].id, energy_value * energize_queue[i][0].size]);
						} else if (energize_queue[i][0].energy > 0){
							render_data2.energize.push([energize_queue[i][0].id, energize_queue[i][1].id, energize_queue[i][0].energy]);
							energize_queue[i][1].energy += energize_queue[i][0].energy;
							energize_queue[i][0].energy = 0;
						} else {
							console.log('no energy to give');
						}
						//console.log('origin energy: ' + energize_queue[i][0].energy);
						//console.log('target energy: ' + energize_queue[i][1].energy);
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
						//console.log('origin energy: ' + energize_queue[i][0].energy);
						//console.log('target energy: ' + energize_queue[i][1].energy);
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
					if (energize_apply[i][0].structure_type == 'base' && game_finished != 1){
						game_finished = 1;
						console.log('GAME OVER');
						console.log('GAME OVER');
						console.log('GAME OVER');
						console.log('GAME OVER');
						console.log('GAME OVER');
						console.log('GAME OVER');
						console.log('GAME OVER');
						console.log('GAME OVER');
						console.log('GAME OVER');
						console.log('GAME OVER');
						console.log('GAME OVER');
						console.log('GAME OVER');
						console.log('GAME OVER');
						console.log('GAME OVER');
						console.log(energize_apply[i][0].player_id + ' lost');
						var p1won = 0;
						var p2won = 0;
						var gameWinner = '';
						var winnerRating = 0;
						var newWinnerRating = 0;
						var gameLoser = '';
						var loserRating = 0;
						var newLoserRating = 0;
						
						if (energize_apply[i][0].player_id == players['p1']){
							p2won = 1;
						} else {
							p1won = 1;
						}
						
						
					    Game.find({game_id: workerData[0]})
						  	.then((result) => {
								if (p2won == 1){
									gameWinner = players['p2'];
									winnerRating = result[0]['p2_rating'];
									gameLoser = players['p1'];
									loserRating = result[0]['p1_rating'];
									
									newWinnerRating = getNewRating(winnerRating, loserRating, 1);
									newLoserRating = getNewRating(loserRating, winnerRating, 0);
									console.log('newWinnerRating');
									console.log(newWinnerRating);
									console.log('newLoserRating');
									console.log(newLoserRating);
								} else {
									gameWinner = players['p1'];
									winnerRating = result[0]['p1_rating'];
									gameLoser = players['p2'];
									loserRating = result[0]['p2_rating'];
									
									newWinnerRating = getNewRating(winnerRating, loserRating, 1);
									newLoserRating = getNewRating(loserRating, winnerRating, 0);
									console.log('newWinnerRating');
									console.log(newWinnerRating);
									console.log('newLoserRating');
									console.log(newLoserRating);
								}
								
								console.log('result');
								if (result[0]['ranked'] == 0) {
									Game.updateOne({game_id: workerData[0]}, {active: 0, winner: gameWinner}, {upsert: true})
										.then((qq) => {
											console.log('winner updated to ' + gameWinner);
											process.exit(0);
										});	
								} else if (result[0]['ranked'] == 1){
									
									Game.updateOne({game_id: workerData[0]}, {active: 0, winner: gameWinner}, {upsert: true})
										.then((qq) => {
											console.log('winner updated to ' + gameWinner);
											User.updateOne({user_id: gameWinner}, {rating: newWinnerRating}, {upsert: true})
												.then((qq) => {
													console.log('winner rating updated');
													User.updateOne({user_id: gameLoser}, {rating: newLoserRating}, {upsert: true})
														.then((qq) => {
															console.log('loser rating updated');
															process.exit(0);
														});	
												});	
										});	
								}
								
							})
					  		.catch((error) => {
					  			console.log(error);
								//process.exit(0);
					  		}) 
						
						
					}
				}
				energize_apply.splice(i, 1);			
			}
			
		
		
			//objects death & vm sandbox objects update
			deaths = death_queue.length;
			for (i = (deaths - 1); i >= 0; i--){
				console.log(death_queue[i].id + ' died');
				if (workerData[1] == 'tutorial'){
					try {
						if (death_queue[i].id == 'easy-bot2'){
							console.log('tutorial phase 8 done');
							tutorial_phase[7] = 1;
						}
					} catch (error){
						console.log(error);
					}
				}
				
				death_queue[i].hp = 0;
				console.log(death_queue[i]);
				render_data2.death.push(death_queue[i].id);
				
				//delete spirit_lookup[suid];
				//var index = living_spirits.findIndex(x => x.id == death_queue[i].id);
				//living_spirits.splice(index);
				
			
				death_queue.splice(i, 1);
			}
			
			
			
			
			//
			//objects merge
			//
			
			for (i = (merge_queue.length - 1); i >= 0; i--){
				
				//var m_origin = merge_queue[i][0];
				//var m_dest = merge_queue[i][1];
				
				merge_queue[i][1].merged.push(merge_queue[i][0].id);
				
				for (m = 0; m < merge_queue[i][0].merged.length; m++){
					merge_queue[i][1].merged.push(merge_queue[i][0].merged[m])
				}
				
				merge_queue[i][1].size += merge_queue[i][0].size;
				merge_queue[i][1].energy += merge_queue[i][0].energy;
				merge_queue[i][1].energy_capacity = merge_queue[i][1].size * 10;
				
				merge_queue[i][0].hp = 0;
				merge_queue[i][0].size = 0;
				merge_queue[i][0].energy = 0;
				merge_queue[i][0].position = merge_queue[i][1].position;
				//merge_queue[i][0].position = JSON.parse(JSON.stringify(merge_queue[i][1].position));
				
				
				render_data2.special.push(['m', merge_queue[i][0].id, merge_queue[i][1].id])
				//render_data2.death.push(merge_queue[i][0].id);
				
				merge_queue.splice(i, 1);
			
			}
			
			
			//
			//objects divide
			//
			
			for (i = (divide_queue.length - 1); i >= 0; i--){
				var original = divide_queue[i]
				var original_size = original.size
				
				for (d = 0; d < divide_queue[i].merged.length; d++){
					
					var divided = spirit_lookup[divide_queue[i].merged[d]]
					//console.log('dividing ' + divided.id);
					var temp_posX = JSON.parse(JSON.stringify(original.position[0])); 
					var temp_posY = JSON.parse(JSON.stringify(original.position[1])); 
					 
					//divided.position[0] = temp_posX;
					//divided.position[1] = temp_posY; 
					divided.position = JSON.parse(JSON.stringify(prev_position[original.id]));
					divided.hp = 1;
					divided.size = 1;
					divided.energy = Math.floor(original.energy / original_size);
					
					//var adj1 = 5;
					//var adj2 = 5;
					
					var adj1 = (Math.ceil(Math.random() * 10) * (Math.round(Math.random()) ? 1 : -1));
					var adj2 = (Math.ceil(Math.random() * 10) * (Math.round(Math.random()) ? 1 : -1));
					
					//var adj1 = Math.floor(Math.random() * 100) / 20;
					//var adj2 = Math.floor(Math.random() * 100) / 20;
					//console.log('divided');
					//console.log(divided);
					
					//console.log(divided.position);
					//console.log(prev_position[original.id]);
					
					render_data2.move.push([divided.id, prev_position[original.id], [adj1, adj2], [divided.position[0] + adj1, divided.position[1] + adj2]]);
					
					divided.position[0] += adj1;
					divided.position[1] += adj2;
					
					
					
				}
				
				original.merged = [];
				original.size = 1;
				original.energy = Math.floor(original.energy / original_size);
				original.energy_capacity = original.energy_capacity / original_size;
				
				
				render_data2.special.push(['d', divide_queue[i].id]);
				
				divide_queue.splice(i, 1);
			}
			
			
			
			
			
		
		
			//errors
			render_data2.error_msg1 = user_error1;
			render_data2.error_msg2 = user_error2;
			render_data2.console1 = log1;
			render_data2.console2 = log2;
			user_error1 = [];
			user_error2 = [];
		
		
			//tutorial data update
			if (workerData[1] == 'tutorial'){
				render_data2.tutorial.push(tutorial_phase);
			}
		
			//broadcast to clients
			//console.log(JSON.stringify(render_data2))
			//console.log(render_data2);
			parentPort.postMessage({data: JSON.stringify(render_data2), game_id: workerData[0], meta: ''});
			//wss.broadcast();
			
			
			
			
			
						
			//update vm sandbox objects
			if (temp_flag == 0){
				var p1_top = 0;
				var p2_top = 0;
				console.log('living_spirits.length = ' + living_spirits.length);
				//console.log('my_spirits1.length = ' + my_spirits1.length);
				for (i = 0; i < living_spirits.length; i++){
					spt = living_spirits[i];
					//console.log(spt);	
					if (spt.player_id == players['p2']){
						pl2_units[spt.id] = spt;
						
						//if (spt.hp != 0) {
							my_spirits2[p2_top] = spt;
							p2_top++;
						//}
						
						//pl1_units[spt.id] = {};
					
						//Object.assign(pl1_units[spt.id], spt)
					
						var tempJSON = JSON.stringify(spt);
						pl1_units[spt.id] = JSON.parse(tempJSON);
					
						/*pl1_units[spt.id] = {
							id: spt.id,
							position: spt.position,
							size: spt.size,
							energy: spt.energy,
							color: spt.color,
							sight: spt.sight,
							qcollisions: spt.qcollisions,
							hp: spt.hp,
							move_speed: spt.move_speed,
							energy_capacity: spt.energy_capacity,
							player_id: spt.player_id,
							cost: spt.cost
						}*/
					
					
					} else if (spt.player_id == players['p1']) {
						pl1_units[spt.id] = spt;
						
						//if (spt.hp != 0) {
							my_spirits1[p1_top] = spt;
							p1_top++;
						//}
						
						//pl2_units[spt.id] = {};
					
						//Object.assign(pl2_units[spt.id], spt)
					
						var tempJSON = JSON.stringify(spt);
						pl2_units[spt.id] = JSON.parse(tempJSON);
						
						
						/*pl2_units[spt.id] = {
							id: spt.id,
							position: spt.position,
							size: spt.size,
							energy: spt.energy,
							color: spt.color,
							sight: spt.sight,
							qcollisions: spt.qcollisions,
							hp: spt.hp,
							move_speed: spt.move_speed,
							energy_capacity: spt.energy_capacity,
							player_id: spt.player_id,
							cost: spt.cost
						}*/
					}
					//what is this doing here? (maybe important)
					spt.move(spt.position);
				}
				//console.log('objects processing');
				temp_flag = 0;
				//console.log('my_spirits1.length = ' + my_spirits1.length);
			} 
			
			
			log1 = [];
			log2 = [];
			
			
		
			user_code();
			processTime2 = process.hrtime(processTime1);
			processTimeRes = (processTime2[0] * 1000000000 + processTime2[1]) / 1000000;
			console.log('calculated in = ' + processTimeRes);
			//user_error = 'calculated in = ' + processTimeRes;
			
			
			//tutorial
			
			
		
	}
	
	
	
	function game_start(){
		//map creation
		// -----------------
		
		
		// --- if tutorial --- //
		
		 /*

		for (s = 1; s < 2; s++){
			global[players['p1'] + s] = new Spirit(players['p1'] + s, [1300+s*10,480], 5, 0, players['p1'], colors['player1'], 100);
			spirits.push(global[players['p1'] + s]);
			top_s = s;
		}

		for (q = 1; q < 2; q++){
			global[players['p2'] + q] = new Spirit(players['p2'] + q, [2500+q*10,1520], 5, 0, players['p2'], colors['player2'], 100);
			spirits2.push(global[players['p2'] + q]);
			top_q = q;
		}
		
		 */
		
		// -- //
		
		
		
		// --- if real --- //
		
		// /*
		
		for (s = 1; s < 6; s++){
			if (s > 3){
				global[players['p1'] + s] = new Spirit(players['p1'] + s, [1250+s*20,520], 1, 0, players['p1'], colors['player1'], 100);
				spirits.push(global[players['p1'] + s]);
				top_s = s;
			} else {
				global[players['p1'] + s] = new Spirit(players['p1'] + s, [1300+s*20,500], 1, 0, players['p1'], colors['player1'], 100);
				spirits.push(global[players['p1'] + s]);
				top_s = s;
			}
			
		}

		for (q = 1; q < 6; q++){
			if (q > 3){
				global[players['p2'] + q] = new Spirit(players['p2'] + q, [2450+q*20,1500], 1, 0, players['p2'], colors['player2'], 100);
				spirits2.push(global[players['p2'] + q]);
				top_q = q;
			} else {
				global[players['p2'] + q] = new Spirit(players['p2'] + q, [2500+q*20,1520], 1, 0, players['p2'], colors['player2'], 100);
				spirits2.push(global[players['p2'] + q]);
				top_q = q;
			}
			
		}
		
		// */
		
		// -- //
	
	
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










