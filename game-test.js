

//initiate_world
/*
parentPort.on("message", message => {
  if (message.data == "initiate world") {
	  console.log('hmm');
		init_data = {
			'units': [],
			'stars': [],
			'bases': []
		}
		var all_spirits = living_spirits.length;
		for (i = 0; i < all_spirits; i++){
			init_data.units.push(living_spirits[i]);
		}

		for (i = 0; i < stars.length; i++){
			init_data.stars.push(stars[i]);
		}
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
  	
  }
});

*/

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
var living_spirits = [];
var spirit_lookup = {};
var star_lookup = {};
var spirits = [];
//player 2 test
var spirits2 = [];
var move_queue = [];
var move_queue_ids = [];
var energize_queue = [];
var birth_queue = [];
var star_zxq;

var player1_id = 'ab1';
var player2_id = 'zx2';
var player1_code;
var player1_session = '';
var player2_code;
var player2_session = '';
var player1_color = "rgba(255, 0, 0, 1)";
var player2_color = "rgba(0, 100, 255, 1)";
var firstCode = 0;

var energy_value = 1;


var processTime1 = 0;
var processTime2 = 0;
var processTimeRes = 0;

var user_error;

var render_data2 = {
	'move': [],
	'energize': [],
	'death': [],
	'birth': [],
	'error_msg': []
}

var init_data = {
	'units': [],
	'stars': [],
	'bases': []
}

const {VM} = require('vm2');
var sandbox = {
	player1_code: player1_code,
	star_zxq: star_zxq
}
var sandbox2 = {
	player2_code: player2_code,
	star_zxq: star_zxq
}
const vm = new VM({ sandbox });
const vm2 = new VM({ sandbox2 });
vm.freeze(spirits, 'spirits');
vm2.freeze(spirits2, 'spirits');

//if (!isMainThread){
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
			
				var angle = Math.atan2(target[1] - this.position[1], target[0] - this.position[0]);
				incr[0] = Number(((Math.round(Math.cos(angle) * 10000) / 10000) * base_speed).toFixed(5));
				incr[1] = Number(((Math.round(Math.sin(angle) * 10000) / 10000) * base_speed).toFixed(5));
		
				if ((Math.abs(tarX - this.position[0]) <= Math.abs(incr[0])) && (Math.abs(tarY - this.position[1]) <= Math.abs(incr[1]))){
					incr[0] = tarX - this.position[0];
					incr[1] = tarY - this.position[1];
				}
			
			}
		
			move_queue[entry_index] = [this, incr, target];
		}
	
	
		energize(target) {
			if (target == null){
				target = this;
			}
			//this, this.energy, this.size, target)
			energize_queue.push([this, target]);
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
					if (living_spirits[j].player_id == player1_id){
						if (living_spirits[i].player_id == player1_id){
							//is friend
							living_spirits[i].sight.friends.push(living_spirits[j].id);
							living_spirits[j].sight.friends.push(living_spirits[i].id);
						} else if (living_spirits[i].player_id == player2_id){
							//is enemy
							living_spirits[i].sight.enemies.push(living_spirits[j].id);
							living_spirits[j].sight.enemies.push(living_spirits[i].id);
						}
						
					} else if (living_spirits[j].player_id == player2_id){
						if (living_spirits[i].player_id == player2_id){
							//is friend
							living_spirits[i].sight.friends.push(living_spirits[j].id);
							living_spirits[j].sight.friends.push(living_spirits[i].id);
						} else if (living_spirits[i].player_id == player1_id){
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
				'error_msg': []
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
			e_targets = energize_queue.length;
			for (i = (e_targets - 1); i >= 0; i--){
				//if origin == target —> attempt harvest from star
				if (energize_queue[i][0] == energize_queue[i][1]){
					for (j = 0; j < energize_queue[i][0].sight.structures.length; j++){
						if (star_lookup[energize_queue[i][0].sight.structures[j]].structure_type == 'star'){
							star_distance = get_distance(energize_queue[i][0].position, star_lookup[energize_queue[i][0].sight.structures[j]].position);
							if (star_distance < 400){
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
			
			
			
			
				energize_queue.splice(i, 1);
			}
		
		
			//objects death
		
		
		
			//errors
			render_data2.error_msg = user_error;
			user_error = '';
		
		
			//broadcast to clients
			//console.log(JSON.stringify(render_data2))
			
			//parentPort.postMessage({data: JSON.stringify(render_data2), game_id: workerData, meta: ''});
			
			//wss.broadcast();
		
			user_code();
			processTime2 = process.hrtime(processTime1);
			processTimeRes = (processTime2[0] * 1000000000 + processTime2[1]) / 1000000;
			console.log('calculated in = ' + processTimeRes);
			user_error = 'calculated in = ' + processTimeRes;
			console.log('living_spirits[36].sight');
			console.log(living_spirits[36].sight);
		
	}


	//map creation
	// -----------------

	for (s = 1; s < 20; s++){
		global['s' + s] = new Spirit('s' + s, [200+s*10,252], 4, 10, player1_id, player1_color);
		spirits.push(global['s' + s]);
	}

	for (q = 1; q < 20; q++){
		global['q' + q] = new Spirit('q' + q, [600+q*10,452], 4, 10, player2_id, player2_color);
		spirits2.push(global['q' + q]);
	}

	star_zxq = new Star('star_zxq', [600, 500]);
	star_lookup['star_zxq'] = star_zxq;
	
	
	
	function game_start(){
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

	game_start();
	
	
	
	
	
	
	
	
	//}










