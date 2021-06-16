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

function cancel_game(){
	setTimeout(function(){
		process.exit(0);
	}, 2000);
}

function end_game(was_p1 = 0, was_p2 = 0){
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
	
	
	
	var p1won = was_p1;
	var p2won = was_p2;
	var gameWinner = '';
	var winnerRating = 0;
	var newWinnerRating = 0;
	var gameLoser = '';
	var loserRating = 0;
	var newLoserRating = 0;
	
	if (p2won == 1){
		gameWinner = players['p2'];
	} else if (p1won == 1) {
		gameWinner = players['p1'];
	} else {
		end_winner = 'No one';
		cancel_game();
		return;
	}
	
	//to handle client
	end_winner = gameWinner
	
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
						setTimeout(function(){
							process.exit(0);
						}, 1000);
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
										setTimeout(function(){
											process.exit(0);
										}, 1000);
									});	
							});	
					});	
			}
		
		})
  		.catch((error) => {
  			console.log(error);
			setTimeout(function(){
				process.exit(0);
			}, 3000);
			//process.exit(0);
  		}) 
	
}




const { parentPort, workerData, isMainThread } = require("worker_threads");

const util = require('util');
const mongoose = require('mongoose');
const User = require('./models/users.js');
const Game = require('./models/newgame.js');
const dbURI = 'mongodb+srv://levmiseri:02468a13579A@cluster0.us90f.mongodb.net/yare-io?retryWrites=true&w=majority'
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
	.then((result) => console.log('connected to db'))
	.catch((error) => console.log(error));


const min_beam = 200;
// histogram square - maximal, s.t. any two points inside are closer <= beam 
const h_square = min_beam / Math.sqrt(2);

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
				'outposts': [],
				'players': [],
				'colors': [],
				'shapes': [],
				'tut': 1
			}
	    } else {
			init_data = {
				'units': [],
				'stars': [],
				'bases': [],
				'outposts': [],
				'players': [],
				'colors': [],
				'shapes': [],
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
		
		for (i = 0; i < outposts.length; i++){
			init_data.outposts.push(outposts[i]);
		}
		
		init_data.players[0] = players['p1'];
		init_data.players[1] = players['p2'];
		
		init_data.colors[0] = colors['player1'];
		init_data.colors[1] = colors['player2'];
		
		init_data.shapes[0] = shapes['player1'];
		init_data.shapes[1] = shapes['player2'];
		
		if (players_update['p1'] != 'old'){
			init_data.players[0] = players_update['p1'];
		}
		
		parentPort.postMessage({data: JSON.stringify(init_data), game_id: workerData[0], meta: 'initiate', client: message.client});
  } else if (message.data == "player code"){
	  //check who's code it is here
	  if (message.pl_num == "player1"){
		  if (message.session_id == player1_session || message.pl_id == 'anonymous'){
		  	player1_code = message.pl_code;
			if (message.resigning == 1){
				console.log(message.pl_id + 'is resigning !!!!!!!!!!!');
				end_game(0, 1);
			}
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
						if (message.resigning == 1){
							console.log(message.pl_id + 'is resigning !!!!!!!!!!!');
							end_game(0, 1);
						}
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
			if (message.resigning == 1){
				console.log(message.pl_id + 'is resigning !!!!!!!!!!!');
				end_game(1, 0);
			}
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
						if (message.resigning == 1){
							console.log(message.pl_id + 'is resigning !!!!!!!!!!!');
							end_game(1, 0);
						}
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
	  shapes['player1'] = message.p1_shape;
	  shapes['player2'] = message.p2_shape;
	  colors['player1'] = color_palettes[message.p1_color];
	  colors['player2'] = color_palettes[message.p2_color];
	  console.log('game started');
	  console.log(players);
	  console.log(colors);
	  console.log(shapes);
	  game_start();
	  
	  Game.find({game_id: workerData[0]})
	  	.then((result) => {
			console.log('p1_color');
			console.log(result[0].p1_color);
			if (result[0].player2 == 'medium-bot'){
				player2_code = `
var bot_code = true;
if(bot_code){
	global['base'] = Object.values(bases)[1];
	global['enemy_base'] = Object.values(bases)[0];
	global['star_zxq'] = stars['star_zxq'];
	global['star_a1c'] = stars['star_a1c'];
	global['outpost'] = outposts['outpost_mdo'];
	global['star_p89'] = stars['star_p89'];
}

if(memory['time'] == undefined)
	memory['time'] = 0;
memory['time'] += 1;

function dist_sq(coor1, coor2){
	let a = coor1[0] - coor2[0];
	let b = coor1[1] - coor2[1];
	return a*a + b*b;
}

function norm_sq(coor){
	return coor[0]**2 + coor[1]**2;
}

function dist(coor1, coor2){
	return Math.sqrt(dist_sq(coor1, coor2));
}

function mult(a, coor){
	return [a * coor[0], a*coor[1]];
}

function add(coor1, coor2){
	return [coor1[0] + coor2[0], coor1[1] + coor2[1]];
}

function linc(coor1, coor2, alpha){
	return add(mult(alpha, coor1), mult(1-alpha, coor2));
}

function sub(coor1, coor2){
	return [coor1[0] - coor2[0], coor1[1] - coor2[1]];
}

function round_to(number, places){
	return [+coor[0].toFixed(places), +coor[1].toFixed(places)];
}

var min_beam = 200;
var min_beam_sq = min_beam**2;

var my_star = star_zxq;
var e_star = star_a1c;

if(dist_sq(star_a1c.position, base.position) < dist_sq(star_zxq.position, base.position)){
    my_star = star_a1c;
    e_star = star_zxq;
}

function minimizing_unit(l, objective, selector){
	var min = null;
	var min_val = null;

	for(var i = 0; i< l.length ;i++){
		var unit = spirits[l[i]];
		if(selector != null && !selector(unit))
			continue;

		var val = objective(unit);
		if(min_val == null || val < min_val){
			min_val =  val;
			min = unit;
		}
	}
	return min;
}


function closest_unit(ref, l, min_dist,  pred){
	var pick = null;
	var pickd = null;

	for(var i = 0; i< l.length ;i++){
		var unit = spirits[l[i]];
		var ud = dist_sq(unit.position, ref.position);

		if(min_dist > 0 &&  ud >= min_dist**2)
			continue;

		if(pred != null && !pred(unit))
			continue;

		if(pickd==null ||ud < pickd){
			pickd = ud;
			pick = unit;
		}
	}
	return pick;
}

function beam_from_to(from, to, shorten=1){
    return mult(shorten/dist(from.position, to.position), add(mult(-1, from.position), to.position));
}

var base_to_star_beam = beam_from_to(base, my_star, 0.99*min_beam);
var h_pos = add(base.position, mult(2.6, base_to_star_beam));
var h0_pos = add(my_star.position, beam_from_to(my_star, base, 0.99*min_beam));

var l = [-100, 0];
var r = [100, 0];
var u = [0, -100];
var d = [0, 100];
var n = [0, 0];
var dr = [100,100];
var dl = [100,-100];
var ur = [-100,100];
var ul = [-100,-100];

var default_plan = 'b';
var teams = [1000];
var attack_groups = []

if(bot_code){
	teams = [5, 2, 5,
		5, 10, 16, 20, 1000];
	attack_groups = [3, 5, 7];
	if(memory['plans'] == undefined)
		memory['plans'] = ['B', 'B', 'B',
			default_plan, 'B', default_plan, 'B', default_plan];

	// do not waste time on start
	if(memory['time'] > 40){
		memory['plans'][1] ='b';
	}
} else {
    // H - harvest star
    // d - defend star, only visible
    // D - defend star, seek all in unit.sight
    // b - defend base, only visible, harvest
    // B - defend base, seek all in base.sight, harvest
    // g - gather point
    // A - attack enemy star
    // a - attack enemy base
    // S - attack supply chain :-)
    // n - no seek, attack on sight, move by moves
    // s - seek attack enemy, move by moves

    // PLAYER CONSOLE
	teams = [5, 2, 15, 10, 1000]
	memory['plans'] = ['H', 'a', 'H', 'H', 'a'];
}
var moves = [];


var a_min_life = 0.2;
var h_min_life = 0.0;
var gather_prop = 0.5;
var gather_pos = linc(base.position, enemy_base.position, gather_prop);
// enemy
var supply_pos = linc(enemy_base.position, e_star.position, 0.4);
// our - for defense
//var supply_pos = linc(base.position, my_star.position, 0.2);

// END OF CONSOLE


if(bot_code){
	supply_pos = linc(enemy_base.position, e_star.position, 0.4);
}

var plans = memory['plans'];
var my_alive = [];
var team_counts = teams.map(function(e){return 0;});
var no_teams = [];

// alive/counts/teamcounts
for (var i = 0; i < my_spirits.length;i++){

	//console.log(my_spirits[i]);
	var s = my_spirits[i];

	var t = memory[s.id+'team'];
	var no_team = t == undefined || t == null;

	var alive = s.hp == 1;

	if(no_team && alive){
		no_teams.push(s.id);
	}
	if (!no_team && !alive){
		memory[s.id+'team'] = null;
	}
    //console.log(t + " " +s.id + " " + alive + " " + no_team);

	if(!no_team && alive){
	    if(team_counts[t] >= teams[t] || t >= team_counts.length){
	        memory[s.id+'team'] = null;
	        no_teams.push(s.id);
	    }else
		    team_counts[t] = team_counts[t] + 1;
	}
	if(alive){
		my_alive.push(s.id);
	}
}

// assign unasigned spirits to teams
for (var i = 0; i < no_teams.length;i++){
	for(var t=0 ; t<team_counts.length;t++){
		if(team_counts[t] < teams[t] && (attack_groups.indexOf(t) == -1 || plans[t] == default_plan)){
		    //console.log(t + " " + no_teams[i])
			memory[no_teams[i]+'team'] = t;
			team_counts[t] += 1;
			break;
		}
	}
}
// attack plan
if(bot_code){
	for(var i = 0 ; i < attack_groups.length; i++){
		var idx = attack_groups[i];

		var long_ago = memory['plan_start'+idx] != undefined
						&& memory['time'] - memory['plan_start'+idx] > 200;
		if(memory['time'] > 50 && (team_counts[idx] == teams[idx] || team_counts[idx] > 15) &&
			(plans[idx] == default_plan || long_ago)){
			var rnd = Math.random();
			if(rnd < 0.66 && !(long_ago))
				plans[idx] =  'S';
			else
				plans[idx] =  'a';

			memory['plan']=plans;
			memory['plan_start'+idx]=memory['time'];
		}

		if(team_counts[idx] < 2 && plans[idx] != default_plan){
			plans[idx] = default_plan;
			memory['plan']=plans;
			memory['plan_start'+idx] = undefined;
		}

		console.log("bot attack group " +idx + " count = "
			+team_counts[idx] + " goal = " +teams[idx] + " plan = " + plans[idx]);
	}
}
if(!bot_code){
	console.log(team_counts);
	console.log(plans);
}

//

var damage_plan = {};
var seek_plan = {};
var help_plan = {};

function pick_enemy (e, follow=false){
	if(e.hp != 1)
		return false;

	if(damage_plan[e.id] == null || damage_plan[e.id] == undefined)
		damage_plan[e.id] = e.energy;

	if(follow && (seek_plan[e.id] == null || seek_plan[e.id] == undefined))
		seek_plan[e.id] = e.energy;

	return damage_plan[e.id] >= 0 && (!follow || seek_plan[e.id] >= 0);// && dist(spirits[e.position], s.position) <= min_beam;
}

//plan
for (var i = 0; i < my_alive.length;i++){
    s = spirits[my_alive[i]];
	var t = memory[s.id+'team'];

	// disperse, so that they do not move in one batch
	if(bot_code && t == 0 && 3*(i+1) >= memory['time']){
		continue;
	}

	var plan = plans[t];
	var d2base = dist_sq(s.position, base.position);
	var d2star = dist_sq(s.position, my_star.position);
	var d2estar = dist_sq(s.position, e_star.position);
	var near_base = d2base < min_beam_sq;
	var near_star = d2star < min_beam_sq;
	var near_estar = d2estar < min_beam_sq;
	var base_in_trouble = base.sight.enemies.length > 0;
	// charge by default
	if(near_star || near_estar){
		s.energize(s);
	}

	if(plan == 'H' || (plan == 'B' && base.sight.enemies.length == 0)){
		// state
		if (memory[s.id] != 'charged' && memory[s.id] != 'harvestor') {
			if(d2base > d2star)
				memory[s.id] = 'harvestor';
			else
				memory[s.id] = 'charged';
		}

		if (s.energy <= h_min_life * s.energy_capacity) {
			memory[s.id] = 'harvestor';
		}

		if (s.energy == s.energy_capacity && memory[s.id] != 'charged'){
			memory[s.id] = 'charged';
		}

		// behavior
		var e = null;
		if(s.energy > h_min_life * s.energy_capacity){
			// pick unit that most needs help
			e = minimizing_unit(s.sight.friends_beamable, (u) => -help_plan[u.id], function(u){
						if(memory[u.id] != 'fighter' || u.energy == u.energy_capacity)
							return false;

						if(help_plan[u.id]==undefined){
							help_plan[u.id] = u.energy_capacity-u.energy;
						}
						return help_plan[u.id] > 0;
					});
		}

		if(e != null){
			help_plan[e.id] -= s.size;
			s.energize(e);
		} else if (memory[s.id] == 'harvestor'){
			if(d2star > min_beam_sq)
				s.move(my_star.position);
			if(d2star < 0.8 * min_beam_sq)
				s.move(base.position);
		} else if (memory[s.id] == 'charged'){
			if(d2base < 0.8 * min_beam_sq)
				s.move(my_star.position);
			if(d2base > min_beam_sq)
				s.move(base.position);
			s.energize(base);
		}
	} else {
		// state transitions
		if(memory[s.id] != 'fighter' && memory[s.id] != 'recharging'){
			memory[s.id] = 'fighter';
		}
		if (s.energy == 0) {
			memory[s.id] = 'recharging';
		}
		if (s.energy == s.energy_capacity){
			memory[s.id] = 'fighter';
		}

		// behavior

		if (plan == 'D' || plan == 'd'){
			if(d2star > min_beam_sq)
				s.move(my_star.position);
			if(d2star < 0.8 * min_beam_sq)
				s.move(base.position);
		}
		if ( memory[s.id] == 'recharging' ){
			if(d2star < d2estar)
				s.move(my_star.position);
			else
				s.move(e_star.position);
		}

		if (memory[s.id] == 'fighter'){
			if(plan == 'g'){
				s.move(gather_pos);
			}

			if(plan == 'a'){
				var near_enemy = dist_sq(s.position, enemy_base.position) < min_beam_sq;
				if(!near_enemy)
					s.move(enemy_base.position);
				else
					s.energize(enemy_base);
			}

			if(plan == 'A'){
				if(!near_estar)
					s.move(e_star.position);
			}

			if(plan == 'S'){
				s.move(supply_pos);
			}

			if(plan == 'b' || plan == 'B'){
				s.move(base.position);
				/*
				var min = 0;
				if(plan =='b')
					min = min_beam;

				var e = closest_unit(s, base.sight.enemies, min, (e)=>pick_enemy(e, true));
				if(e != null){
					s.move(e.position);
					seek_plan[e.id] -= s.size;
					if(dist_sq(s.position, e.position) < min_beam_sq)
						damage_plan[e.id] -= 2*s.size;
					s.energize(e);
				}else{
					s.move(base.position);
				}
				*/
			}

			if(plan == 'n' || plan == 's'){
				var move = moves[t];
				if(move != null && move != undefined){
					if(move.length > 2){
						var which = Math.floor(memory['time'] / move[0]) % (move.length - 1);
						s.move(add(s.position, move[1+which]));
					}else{
						s.move(add(s.position, move));
					}
				}
			}
		}
	}

	if(s.energy > 0){
		var seek = memory[s.id] == 'fighter' && plan != 'b' && plan != 'n';
		e = closest_unit(s, s.sight.enemies_beamable, 0, (e) => pick_enemy(e, seek));

		if(e != null){
			if(seek){
				s.move(e.position);
				seek_plan[e.id] -= s.size;
			}
			if(dist_sq(s.position, e.position) < min_beam_sq)
				damage_plan[e.id] -= 2* s.size;
			s.energize(e);
		}
	}
}


/*
console.log('T ' + memory['time'] + ' total ' +my_alive.length + " / H "+ harvestors +
' / C '+ beamers+ '-' + passers + '-'+chargers0 +' / A '+ attackers+
            ' / BE ' +base.sight.enemies.length + ' / ' + team_counts);
*/
				`;
			} else if (result[0].player2 == 'dumb-bot'){
				player2_code = `
				
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
				global['outpost'] = outposts['outpost_mdo'];
				global['star_p89'] = stars['star_p89'];
				
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

				if (my_spirits.length >= 600 && memory['phase'] != 1){
				    if (memory['phase'] == undefined || memory['phase'] == ''){
				        memory['phase'] = 1;
				    }
				}

				if (memory['phase'] == 1){
				    for (j = 0; j < 11; j++){
				        if (my_spirits[j].energy == my_spirits[j].energy_capacity){
				    		memory[my_spirits[j].id] = 'invader';
				    		my_spirits[j].move([2600, 1050]);
					    }
						memory[my_spirits[0].id] = 'bait';
					    my_spirits[0].move([2150,1250]);
				    }
				}

				if (memory['phase'] == 1 && my_spirits[1].position[0] == 2600 && my_spirits[5].position[0] == 2600){
				    memory['phase'] = 2;
				}

				if (memory['phase'] == 2){
				    for (j=1; j<11; j++){
				        my_spirits[j].move(enemy_base.position);
				        my_spirits[j].energize(enemy_base)
				    }
					
					if (my_spirits[0].sight.enemies.length > 0){
						var enemy = spirits[my_spirits[0].sight.enemies[0]];
						if (Math.abs(enemy.position[0] - my_spirits[0].position[0]) < 250 && Math.abs(enemy.position[1] - my_spirits[0].position[1]) < 250){
							my_spirits[0].move(base.position);
						} else {
							my_spirits[0].move([1000, 800])
						}
					} else {
						my_spirits[0].move([1000, 800])
					}
				    
				}
				
				`;
			}
			
			console.log('starting rating update');
			User.find({user_id: players['p1']})
				.then((result_p1) => {
					console.log(result_p1);
					User.find({user_id: players['p2']})
						.then((result_p2) => {
							console.log(result_p2);
							var p222_rating = '';
							if (players['p2'] == 'easy-bot'){
								p222_rating = 100;
							} else if (players['p2'] == 'medium-bot'){
								p222_rating = 1000;
							} else {
								p222_rating = result_p2[0]['rating'];
							}
							Game.updateOne({game_id: workerData[0]}, {p1_rating: result_p1[0]['rating'], p2_rating: p222_rating}, {upsert: true})
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

function to_html(txt){
	return txt.replace(/\n/g,'<br>').replace(/ /g,'&nbsp;');
}

function handle_error(error, player, fileregex, line_offset){
	let message = "" + error;

	let stack = error.stack.split("\n");
	let file_num = new RegExp(/(^|.*at )/.source + fileregex.source + /:(\d+)/.source);
	let match = error.stack.match(file_num);

	if(match != null){
		// TODO add link for editor scrolling
		let raw_line_num = match[2];

		// error on line in user code
		if(raw_line_num > line_offset){
			let linenum = raw_line_num - line_offset;
			message = "line " + linenum + ": " + message;
		}
		// raw_line_num == 1 means e.g. multiple definitions of the same var, or similar
		// between 1 and line_offset => we have bug in player init code (see server.js)
		if(raw_line_num > 1 && raw_line_num <= line_offset){
			console.log('WTF: linenum not positive, either bug in our player_code prefix, or in bot around start');
			console.log("error: "+error);
			console.log(stack);
		}
	}else{
		// exception outside user code, but inside VM
		// => TIMEOUT
	}

	let starts_w_file = new RegExp(/^/.source + fileregex.source);
	// the vm hijacks the stack and adds useful info
	if(stack.length >= 4 && stack[0].match(starts_w_file)){
		for(let i = 1 ; i < 4; i++){
			if(stack[i].length > 0)
				message += "\n > "+ stack[i];
		}
	}

	///*
	console.log("error: "+error);
	console.log(stack);
	console.log('message:' +message);
	// */
	//
	fill_error(player, to_html(message));
}

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
	//
	
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
		
		//p1_process_time = process.hrtime();
		
		vm.run(player1_code, 'vm.js');
		
		//p1_process_time_check = process.hrtime(p1_process_time);
		//p1_process_time_res = (p1_process_time_check[0] * 1000000000 + p1_process_time_check[1]) / 1000000;
		//console.log('p1 calculated in = ' + p1_process_time_res);
		//vm.run(player2_code, 'vm.js');
	} catch (error){
		handle_error(error, players['p1'], /vm\.js/, 12);
	}
	
	try {
		//p2_process_time = process.hrtime();
		
		vm2.run(player2_code, 'vm2.js');
		
		//p2_process_time_check = process.hrtime(p2_process_time);
		//p2_process_time_res = (p1_process_time_check[0] * 1000000000 + p2_process_time_check[1]) / 1000000;
		//console.log('p2 calculated in = ' + p2_process_time_res);
		
		//vm.run(player2_code, 'vm.js');
	} catch (error){
		handle_error(error, players['p2'], /vm2\.js/, 12);
	}
}

//global
var started = 0;
var game_tick = 1000; // 1s
var base_speed = 20;
var stars = [];
var bases = [];
var outposts = [];
var living_spirits = [];
var spirit_lookup = {};
var star_lookup = {};
var base_lookup = {};
var outpost_lookup = {};
var structure_lookup = {};
var spirits = [];
var spirits2 = [];
var move_queue = [];
var move_queue_ids = [];
var energize_queue = [];
var merge_queue = [];
var divide_queue = [];
var jump_queue = [];
var shout_queue = [];
var birth_queue = [];
var death_queue = [];
var star_zxq;
var star_a1c;
var star_p89;
var outpost_mdo;
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


var p1_process_time = 0;
var p1_process_time_check = 0;
var p1_process_time_res = 0;
var p2_process_time_check = 0;
var p2_process_time_res = 0;

function spirit_cost(p_num, alives){
	if (p_num == 1){
		if (shapes["player1"] == 'circles'){
			if (alives <= 100) base_lookup['base_' + players['p1']].current_spirit_cost = 50;
			if (alives > 100) base_lookup['base_' + players['p1']].current_spirit_cost = 100;
			if (alives > 200) base_lookup['base_' + players['p1']].current_spirit_cost = 200;
			if (alives > 300) base_lookup['base_' + players['p1']].current_spirit_cost = 400;
			if (alives > 500) base_lookup['base_' + players['p1']].current_spirit_cost = 1000;
		} else if (shapes["player1"] == 'squares'){
			if (alives <= 10) base_lookup['base_' + players['p1']].current_spirit_cost = 400;
			if (alives > 10) base_lookup['base_' + players['p1']].current_spirit_cost = 800;
			if (alives > 400) base_lookup['base_' + players['p1']].current_spirit_cost = 1000;
		}
	} else if (p_num == 2){
		if (shapes["player2"] == 'circles'){
			if (alives <= 100) base_lookup['base_' + players['p2']].current_spirit_cost = 50;
			if (alives > 100) base_lookup['base_' + players['p2']].current_spirit_cost = 100;
			if (alives > 200) base_lookup['base_' + players['p2']].current_spirit_cost = 200;
			if (alives > 300) base_lookup['base_' + players['p2']].current_spirit_cost = 400;
			if (alives > 500) base_lookup['base_' + players['p2']].current_spirit_cost = 1000;
		} else if (shapes["player2"] == 'squares'){
			if (alives <= 10) base_lookup['base_' + players['p2']].current_spirit_cost = 400;
			if (alives > 10) base_lookup['base_' + players['p2']].current_spirit_cost = 800;
			if (alives > 400) base_lookup['base_' + players['p2']].current_spirit_cost = 1000;
		}
	}
	
	if (workerData[1] == 'tutorial'){
		base_lookup['base_' + players['p1']].current_spirit_cost = 100;
		base_lookup['base_' + players['p2']].current_spirit_cost = 50;
	}
		
}

function get_def_size(pshape){
	if (pshape == 'circles') return 1;
	if (pshape == 'squares') return 10;
}


var spirit_p1_cost = 100;
var spirit_p2_cost = 100;
var p1_defend = 0;
var p2_defend = 0;

var temp_flag = 0;
var end_winner = 0;

var game_duration = 0;
var game_activity = 1;
var qqmonitoring = [0, 0, 0, 0, 0, 0, 0, 0];

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
				global['star_p89'] = stars['star_p89'];
				global['outpost'] = outposts['outpost_mdo'];
				
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
var shapes = {};
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

var render_data3 = {
	't': 0,
	'p1': [],
	'p2': [],
	'e': [],
	's': [],
	'er1': [],
	'er2': [],
	'c1': [],
	'c2': []
};

var init_data = {
	'units': [],
	'stars': [],
	'bases': [],
	'outposts': []
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

function jump_danger_zone(loc){
	if (Math.abs(stars[0].position[0] - loc[0]) < 100 && Math.abs(stars[0].position[1] - loc[1]) < 100
 	 || Math.abs(stars[1].position[0] - loc[0]) < 100 && Math.abs(stars[1].position[1] - loc[1]) < 100
	 || Math.abs(stars[2].position[0] - loc[0]) < 100 && Math.abs(stars[2].position[1] - loc[1]) < 100
	 || Math.abs(bases[0].position[0] - loc[0]) < 50 && Math.abs(bases[0].position[1] - loc[1]) < 50
	 || Math.abs(bases[1].position[0] - loc[0]) < 50 && Math.abs(bases[1].position[1] - loc[1]) < 50
	 || Math.abs(outposts[0].position[0] - loc[0]) < 50 && Math.abs(outposts[0].position[1] - loc[1]) < 50){
		return true;
	} else {
		return false;
	}
}

function shuffle_array(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}



//sandbox is the keyword, moron
const vm = new VM({ timeout: 350, sandbox: {console: console1, memory: memory1} });
const vm2 = new VM({ timeout: 350, sandbox: {console: console2, memory: memory2} });


//vm.freeze(spirits, 'spirits');
vm.freeze(players, 'players');
vm.freeze(pl1_units, 'spirits');
vm.freeze(my_spirits1, 'my_spirits');
vm.freeze(structure_lookup, 'structures');
vm.freeze(star_lookup, 'stars');
vm.freeze(base_lookup, 'bases');
vm.freeze(outpost_lookup, 'outposts');
//vm2.freeze(spirits2, 'spirits');
vm2.freeze(players, 'players');
vm2.freeze(pl2_units, 'spirits');
vm2.freeze(my_spirits2, 'my_spirits');
vm2.freeze(structure_lookup, 'structures');
vm2.freeze(star_lookup, 'stars');
vm2.freeze(base_lookup, 'bases');
vm2.freeze(outpost_lookup, 'outposts');



if (!isMainThread){
	class Spirit {
		constructor(id, position, size, energy, player, color, shape){
			this.shape = shape;
			this.id = id
			this.position = position;
			this.size = size;
			this.energy = energy;
			this.last_energized = '';
			this.color = color;
			this.mark = '';
		
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
		
			living_spirits.push(this);
			birth_queue.push(this);
			move_queue.push([this.id, this.position[0], this.position[1]]);
		}

		birth() {
		
		}
		
		move(target) {
			if (!Array.isArray(target) || target.length != 2){
				let err_msg = '.move() argument must be an array of 2 numbers.\n > E.g. my_spirits[0].move([100, 100]) or my_spirits[0].move(my_spirits[1].position).\n > Received: ' + target;
				
				throw new Error(err_msg);
			}

			const tarX = Number(target[0]);
			const tarY = Number(target[1]);
			
			if(isNaN(tarX) || isNaN(tarY)){
				throw new Error('.move() arguments must be numbers, got ['+ tarX + ", " + tarY + ']');
			}

			move_queue.push([this.id, tarX, tarY]);
			return;

			// JM TU
			let plus_minus = Math.random() < 0.5 ? -1 : 1;
			let adj1 = Math.floor(Math.random() * 100) / 70 * plus_minus;
			let adj2 = Math.floor(Math.random() * 100) / 70 * plus_minus;

		
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
					
					//console.log('spirit is dead');
					move_queue[entry_index] = [this, incr, target];
				} else {
				}
			}
		}
	
	
		energize(target) {
			//console.log('target = ');
			
			
			var entry_index2 = energize_queue.findIndex(entry2 => entry2[0]['id'] === this.id);
			
			if (Array.isArray(target) == true){
				var err_msg = ".energize() argument must be a spirit object, not an array. E.g. my_spirits[0].energize(my_spirits[0]) or my_spirits[0].energize(spirits['" + this.player_id + "1']). Received: " + target;
				fill_error(this.player_id, err_msg);
				return;
			} else if (typeof target !== 'object' || target === null){
				var err_msg = ".energize() argument must be an object. E.g. my_spirits[0].energize(my_spirits[0]) or my_spirits[0].energize(spirits['" + this.player_id + "1']). Received: " + target;
				fill_error(this.player_id, err_msg);
				return;
			} else if (!target.position){
				var err_msg = ".energize() argument must be an object. E.g. my_spirits[0].energize(my_spirits[0]) or my_spirits[0].energize(spirits['" + this.player_id + "1']). Received: " + target;
				fill_error(this.player_id, err_msg);
				return;
			}
			
			try {
				if (typeof target.id === 'string' || target.id instanceof String){
					if (target.structure_type == 'base'){
						target = base_lookup[target.id];
					} else if (target.structure_type == 'outpost') {
						target = outpost_lookup[target.id];
					} else {
						target = spirit_lookup[target.id];
					}
				} else {
					var err_msg = ".energize() received something it can't process as its argument. Received: " + target;
					fill_error(this.player_id, err_msg);
					return;
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
						if (qqmonitoring[6] == 0){
							qqmonitoring[6] = 1;
							parentPort.postMessage({data: 7, game_id: workerData[0], meta: 'monitoring'});
						}
					}
				} catch (error){
					console.log(error);
				}
			}
			
			
			
			//this, this.energy, this.size, target)
			var are_beamable = fast_dist_lt(this.position, target.position, min_beam);
			if (target.hp != 0 && are_beamable){
				if (entry_index2 == -1){
					energize_queue.push([this, target]);
				} else {
					energize_queue[entry_index2] = [this, target];
				}
			}
			
		}
		
		merge(target){
			
			if (target.id == this.id){
				var err_msg = "You can't merge spirit into itself";
				fill_error(this.player_id, err_msg);
				return;
			} else if (this.shape != 'circles'){
				var err_msg = "Only circles can use merge(). See Documentation for available methods.";
				fill_error(this.player_id, err_msg);
				return;
			}
			
			var entry_index3 = merge_queue.findIndex(entry3 => entry3[0]['id'] === this.id);
			
			try {
				if (Array.isArray(target) == true){
					var err_msg = ".merge() argument must be a friendly spirit object, not an array. E.g. my_spirits[0].merge(my_spirits[1]). Received: " + target;
					fill_error(this.player_id, err_msg);
					return;
				} else if (typeof target !== 'object' || target === null){
					var err_msg = ".merge() argument must be a friendly spirit object. E.g. my_spirits[0].merge(my_spirits[1]). Received: " + target;
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
			
			if (this.shape != 'circles'){
				var err_msg = "Only circles can use divide(). See Documentation for available methods.";
				fill_error(this.player_id, err_msg);
				return;
			}
			
			var entry_index4 = divide_queue.findIndex(entry4 => entry4['id'] === this.id);
			
			if (this.hp != 0 && this.merged.length > 0){
				if (entry_index4 == -1){
					divide_queue.push(this);
				} else {
					divide_queue[entry_index4] = this;
				}
			}
			
		}
		
		jump(target){
			if (this.shape != 'squares'){
				var err_msg = "Only squaress can use jump(). See Documentation for available methods.";
				fill_error(this.player_id, err_msg);
				return;
			}
			
			if (Array.isArray(target) == false){
				var err_msg = '.jump() argument must be an array. E.g. my_spirits[0].jump([100, 100]). Received: ' + target;
				
				fill_error(this.player_id, err_msg);
				return;
			} else if (target.length != 2){
				var err_msg = '.jump() argument must be an array of length 2. E.g. my_spirits[0].jump([100, 100]). Received: ' + target;
			
				fill_error(this.player_id, err_msg);
				return;
				
			} else if (this.energy < this.energy_capacity / 2){
				var err_msg = 'Not enough energy to jump. Cost: ' + this.energy_capacity / 2 + ' energy';
			
				fill_error(this.player_id, err_msg);
				return;
				
			} else {
				try {
					if (Math.abs(target[0] - this.position[0]) > 300 || Math.abs(target[1] - this.position[1]) > 300){
						var err_msg = 'Target is too far away. Max. distance is 300 units in both x and y direction.';
			
						fill_error(this.player_id, err_msg);
						return;
					} else if (Math.abs(target[0] - this.position[0]) < 50 && Math.abs(target[1] - this.position[1]) < 50){
						var err_msg = 'Target is too close. Min. distance is 50 units in both x and y direction.';
			
						fill_error(this.player_id, err_msg);
						return;
					} else if (jump_danger_zone(target)){
						var err_msg = 'Target is too close to a star or a base.';
			
						fill_error(this.player_id, err_msg);
						return;
					}
				} catch (e) {
					console.log(e);
				}
			}
			
			var entry_index5 = jump_queue.findIndex(entry5 => entry5[0]['id'] === this.id);
			
			if (this.hp != 0){
				if (entry_index5 == -1){
					jump_queue.push([this, target]);
				} else {
					jump_queue[entry_index5] = [this, target];
				}
			}
			
			
		}
		
		//kill() { }???????
		kill(suid){
			delete spirit_lookup[suid];
			var index = living_spirits.findIndex(x => x.id == suid);
			living_spirits.splice(index);
		}
		
		
		set_mark(mrk){
			if (typeof mrk !== 'string'){
				var err_msg = "mark must be a string. Received: " + mrk;
				fill_error(this.player_id, err_msg);
				return;
			}
			if (mrk.length > "60"){
				var err_msg = "Max length of mark is 60 characters";
				fill_error(this.player_id, err_msg);
				return;
			}
			
			this.mark = mrk;
		}
		
		
		shout(msg){
			if (typeof msg !== 'string'){
				var err_msg = "Shout argument must be a string. Received: " + msg;
				fill_error(this.player_id, err_msg);
				return;
			}
			if (msg.length > "20"){
				var err_msg = "Max length of shout message is 20 characters";
				fill_error(this.player_id, err_msg);
				return;
			}
			
			var entry_index6 = jump_queue.findIndex(entry6 => entry6[0]['id'] === this.id);
			
			if (this.hp != 0){
				if (entry_index6 == -1){
					shout_queue.push([this.id, this.player_id, msg]);
				} else {
					shout_queue[entry_index6] = [this.id, this.player_id, msg];
				}
			}
			
			//console.log(msg);
			
			
			
			
		}
	
	}

	class Star {
		constructor(id, position, energy, size){
			this.id = id
			this.position = position;
			this.size = size;
			this.structure_type = 'star';
			this.energy = energy;
			//this.energy = energy;
		
			stars.push(this);
		}
	}
	
	class Outpost {
		constructor(id, position){
			this.id = id
			this.position = position;
			this.size = 20;
			this.control = '';
			this.range = 400;
			this.structure_type = 'outpost';
			this.energy = 0;
			this.energy_capacity = 1000;
			//this.energy = energy;
			
			this.sight = {
				enemies: []
			}
		
			outposts.push(this);
		}
	}
	
	class Base {
		constructor(id, position, player, color, shape){
			this.shape = shape;
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
			if (this.shape == 'circles'){
				this.energy_capacity = 400;
			} else if (this.shape == 'squares'){
				this.energy_capacity = 1000;
			}
			
			this.player_id = player;
			this.color = color;
			//this.energy = energy;
			
			this.current_spirit_cost = 100;
		
			bases.push(this);
		}
	}

	function initiate_world(ws){
		console.log(init_data);
		ws.send(JSON.stringify(init_data));
	}

	function dist_sq(item1, item2){
		return ((item2[0]-item1[0])**2) + ((item2[1]-item1[1])**2);
	}

	function fast_dist_lt(item1, item2, range){
		return ((item2[0]-item1[0])**2) + ((item2[1]-item1[1])**2) < range**2;
	}

	function fast_dist_leq(item1, item2, range){
		return ((item2[0]-item1[0])**2) + ((item2[1]-item1[1])**2) < range**2;
	}

	function norm_sq(coor){
		return coor[0]**2 + coor[1]**2;
	}

	function mult(a, coor){
		return [a * coor[0], a*coor[1]];
	}

	function add(coor1, coor2){
		return [coor1[0] + coor2[0], coor1[1] + coor2[1]];
	}

	function linc(coor1, coor2, alpha){
		return add(mult(alpha, coor1), mult(1-alpha, coor2));
	}

	function sub(coor1, coor2){
		return [coor1[0] - coor2[0], coor1[1] - coor2[1]];
	}

	function round_to(number, places){
		return +number.toFixed(places);
	}
	
	function intersection(x0, y0, r0, x1, y1, r1) {
	        let a, dx, dy, d, h, rx, ry;
	        let x2, y2;

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
	        let xi = x2 + rx;
	        let xi_prime = x2 - rx;
	        let yi = y2 + ry;
	        let yi_prime = y2 - ry;

	        return [[xi, yi], [xi_prime, yi_prime]];
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
		return fast_dist_lt(item1.position, item2.position, range);
	}



	function get_sight_fast(){
		const beamable_sq = min_beam**2;
		const visible_sq = (2*min_beam)**2;
		const living_length = living_spirits.length;

		for (let h = 0; h < living_length; h++){
		  living_spirits[h].sight = {
				friends_beamable: [],
				enemies_beamable: [],
				friends: [],
				enemies: [],
				structures: []
		  }
		  living_spirits[h].qcollisions = [];
		}
		for (let m = 0; m < bases.length; m++){
  		  	bases[m].sight = {
				friends_beamable: [],
				enemies_beamable: [],
  				friends: [],
  				enemies: [],
  				structures: []
		    }
		}

		function work(i, j){
			//console.log('work ' + living_spirits[i].id + " " + living_spirits[j].id)
			let pi = living_spirits[i].player_id;
			let pj = living_spirits[j].player_id;
			if (pi == pj){
				// friend
				living_spirits[i].sight.friends.push(living_spirits[j].id);
				living_spirits[j].sight.friends.push(living_spirits[i].id);
			}
			else{
				// enemy
				living_spirits[i].sight.enemies.push(living_spirits[j].id);
				living_spirits[j].sight.enemies.push(living_spirits[i].id);
			}
		}

		function work_beamable(i, j){
			let pi = living_spirits[i].player_id;
			let pj = living_spirits[j].player_id;
			if (pi == pj){
				// friend
				living_spirits[i].sight.friends_beamable.push(living_spirits[j].id);
				living_spirits[j].sight.friends_beamable.push(living_spirits[i].id);
			}
			else{
				// enemy
				living_spirits[i].sight.enemies_beamable.push(living_spirits[j].id);
				living_spirits[j].sight.enemies_beamable.push(living_spirits[i].id);
			}
		}

		let hist = {};
		// per spirit processing
		for (let i = 0; i < living_length; i++){
			let spirit = living_spirits[i];
			// ugh
			if (spirit.hp == 0) continue;
			let pos = spirit.position;

			// 1. init histogram

			let xbin = Math.floor(pos[0] / h_square);
			let ybin = Math.floor(pos[1] / h_square);
			if (hist[[xbin, ybin]] == undefined){
				// first element is the x,y, since js has no tuples
				// and converts the key to string
				hist[[xbin, ybin]] = [[xbin, ybin, -1]];
			}
			hist[[xbin, ybin]].push(i);

			// 2. compute sight for structures
			// (no need to use the histogram, there is only a few structs, so this is quick
			// O(1) for each spirit
			
			//stars
			for (let k = 0; k < stars.length; k++){
				if (is_in_sight(spirit, stars[k])){
					spirit.sight.structures.push(stars[k].id);
				}
			}
			//bases
			for (let b = 0; b < bases.length; b++){
				let dsq = dist_sq(pos, bases[b].position);
				// base sees spirit
				if(dsq < visible_sq){
					let friend = bases[b].player_id == spirit.player_id;

					if(friend){
						bases[b].sight.friends.push(spirit.id);
					}else{
						bases[b].sight.enemies.push(spirit.id);
					}

					if(dsq < beamable_sq){
						if(friend){
							bases[b].sight.friends_beamable.push(spirit.id);
						}else{
							bases[b].sight.enemies_beamable.push(spirit.id);
						}
						// spirit sees base
						spirit.sight.structures.push(bases[b].id);
					}
				}
			}
			//outposts
			for (let o = 0; o < outposts.length; o++){
				let outpost = outposts[o];
				let dsq = dist_sq(spirit.position, outpost.position);

				if(dsq < visible_sq){
					let friend = outpost.control == spirit.player_id;
					if (friend){
						//outposts[o].sight.friends.push(spirit.id);
					}else{
						outposts[o].sight.enemies.push(spirit.id);
					}

					if(dsq < beamable_sq){
						spirit.sight.structures.push(outpost.id);
					}
				}
			}
		}

		// histogram, handle sights for all
		// of the potentially O(N^2)-many spirit <> spirit pairs

		Object.values(hist).forEach(function(bin){
			// this bin, all are visible && beamable
			// because of h_square size
			for(let i = 1; i <bin.length;i++){
				for(j = i+1; j <bin.length;j++){
					work(bin[i],bin[j]);
					work_beamable(bin[i],bin[j]);
				}
			}

			// iterate neighboring bins
			// a rectangle 7x4, the bin is at position [3, 0] (top row, center)
			for(d = 3; d < 7*4-1 ; d++){
				// lower left corner, too far away
				if(d==21) continue;

				let dy = Math.floor(d / 7);
				let dx = (d % 7) - 3;
				if(dx==0 && dy==0) continue;

				// neighbor bin
				let nb = hist[[bin[0][0]+dx, bin[0][1]+dy]];
				if(nb == undefined)
					continue;

				//console.log("NB BIN: "+(bin[0][0]+dx)+ " " +(bin[0][1]+dy));
				// O(N^2) part
				for(let i = 1; i <bin.length;i++){
					for(let j = 1; j <nb.length;j++){
						let dsq = dist_sq(
							living_spirits[bin[i]].position,
							living_spirits[nb[j]].position,
						);
						if(dsq < visible_sq)
							work(bin[i],nb[j]);
						if(dsq < beamable_sq)
							work_beamable(bin[i],nb[j]);
					}
				}
			}
		});

		//base set defend flag
		for (let m = 0; m < bases.length; m++){
			// convert bool to number
			let trouble = 0 + (bases[m].sight.enemies.length > 0);

			if (bases[m].player_id == players['p1']){
				p1_defend = trouble;
			} else {
				p2_defend = trouble;
			}
		}
	}


	function get_sight(){
		var living_length = living_spirits.length;
		for (h = 0; h < living_length; h++){
		  living_spirits[h].sight = {
				friends_beamable: [],
				friends: [],
				enemies: [],
				enemies_beamable: [],
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
			
			//outposts
			for (o = 0; o < outposts.length; o++){
				if (is_in_sight(living_spirits[i], outposts[o])){
					living_spirits[i].sight.structures.push(outposts[o].id);
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

	function jitter(scale){
		return 2 * (Math.random() - 0.5) * scale;
	}

	function move_objects(){
		const prev_position = {};

		for (let i = move_queue.length - 1; i >= 0; i--){
			const target = move_queue[i];
			const id = target[0];
			const spirit = spirit_lookup[id];

			if (spirit.hp == 0 || prev_position[id] != undefined) continue;
			const tpos = [target[1], target[2]];
			const pos = spirit.position;
			prev_position[id] = pos;

			//tutorial
			if (workerData[1] == 'tutorial' && i == 0){
				try {
					//console.log('tutorial, star position');
					//console.log(move_queue[0][2]);
					if (t_x == 1000 && t_y == 1000){
						//console.log('tutorial phase 1 done');
						tutorial_phase[0] = 1;
						if (qqmonitoring[0] == 0){
							qqmonitoring[0] = 1;
							parentPort.postMessage({data: 1, game_id: workerData[0], meta: 'monitoring'});
						}
					} else if (t_x == 1600 && t_y == 700){
						console.log('tutorial phase 3 done');
						tutorial_phase[2] = 1;
						if (qqmonitoring[2] == 0){
							qqmonitoring[2] = 1;
							parentPort.postMessage({data: 3, game_id: workerData[0], meta: 'monitoring'});
						}
					}
				} catch (error){
					console.log(error);
				}
			}
			
			// move_queue[entry_index] = [this, incr, target];
			
			let incr = sub(tpos, pos);

			/*
			incr = incr.map((d) => d + jitter(100/70));
			if (dist_sq(pos, tpos) < 0.6**2){
				incr = [0, 0]
			}
			//*/

			// JM TU
		
			let len_sq = norm_sq(incr);
			// work with data only if there is movement
			if (len_sq > 0){
				// if not getting there in one tick
				if(len_sq > base_speed**2){
					// norm the incr vector so that its len is base_speed
					incr = mult(base_speed / Math.sqrt(len_sq), incr);
				}
				spirit.position = add(pos, incr).map((c) => round_to(c, 5));

				let potential_structure_collisions = spirit.sight.structures;
				for (let k = 0; k < potential_structure_collisions.length; k++){
					//console.log(' ------------------------------- structure potential collisions');
					//console.log(potential_structure_collisions[k]);
					let object_name = potential_structure_collisions[k];
					let min_distance = object_name.startsWith('star') ? 100 : 50;
					let object_position = structure_lookup[object_name].position;

					let spirit_before = pos;
					// JM TODO check - tady se to spirit before dopocitava
					// tzn, odecita se PUVODNI inkrement & nebere se v potaz jitter
					// spirit_before[0] = spirit.position[0] - move_queue[i][1][0];
					// spirit_before[1] = spirit.position[1] - move_queue[i][1][1];

					if (fast_dist_lt(spirit.position, object_position, min_distance)){
						let inter_coor = intersection(spirit_before[0], spirit_before[1], base_speed,
														object_position[0], object_position[1], min_distance);
						if (inter_coor == false) continue;
						
						let quick_dist1 = dist_sq(inter_coor[0], tpos);
						let quick_dist2 = dist_sq(inter_coor[1], tpos);
						
						let pick_first = quick_dist1 < quick_dist2 || Math.abs(quick_dist1 - quick_dist2) <= 5;
						spirit.position = inter_coor[pick_first ? 0 : 1];
					}
				}
			}
		}

		return prev_position;
	}

	function process_stuff(){
			let qcollisions_stay = {};

			//objects birth
			
			if (base_lookup['base_' + players['p1']].energy >= base_lookup['base_' + players['p1']].current_spirit_cost){
				if (workerData[1] == 'tutorial' && top_s > 20){
					console.log('can not have more than 20 spirits in tutorial');
				} else {
					if (p1_defend != 1){
						top_s++;
						global[players['p1'] + top_s] = new Spirit(players['p1'] + '_' + top_s, [1580, 640], get_def_size(shapes['player1']), get_def_size(shapes['player1']) * 10, players['p1'], colors['player1'], shapes['player1']);
						base_lookup['base_' + players['p1']].energy -= base_lookup['base_' + players['p1']].current_spirit_cost;
						//global[players['p1'] + top_s].move([1600, 660]);
						//console.log('spirit was born!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
						if (workerData[1] == 'tutorial'){
							console.log('tutorial phase 5 done');
							tutorial_phase[4] = 1;
							if (qqmonitoring[4] == 0){
								qqmonitoring[4] = 1;
								parentPort.postMessage({data: 5, game_id: workerData[0], meta: 'monitoring'});
							}
						}
					}
				}
			}
			if (base_lookup['base_' + players['p2']].energy >= base_lookup['base_' + players['p2']].current_spirit_cost){
				if (p2_defend != 1){
					top_q++;
					global[players['p2'] + top_q] = new Spirit(players['p2'] + '_' + top_q, [2620, 1760], get_def_size(shapes['player2']), get_def_size(shapes['player2']) * 10, players['p2'], colors['player2'], shapes['player2']);
					base_lookup['base_' + players['p2']].energy -= base_lookup['base_' + players['p2']].current_spirit_cost;
					//global[players['p2'] + top_q].move([2800, 1760]);
					//console.log(top_q);
				}
			}
				
			
			birthlings = birth_queue.length;
			for (i = birthlings - 1; i >= 0; i--){
				spt = birth_queue[i];	
				//render_data2.birth.push(birth_queue[i]);
				spirit_lookup[spt.id] = spt;
				birth_queue.splice(i, 1);
			}
		
		
			//
		    // shouting
			//
			
			shouts = shout_queue.length;
			
			for (i = (shouts - 1); i >= 0; i--){
				render_data3.s.push(['sh', shout_queue[i][0], shout_queue[i][2]]);
				
				shout_queue.splice(i, 1);
			}
		
		
		
			
			//
			// objects energize
			//
			
			var energize_apply = [];
			var energize_apply_star = [];
			var energize_apply_outpost = [];
			e_targets = energize_queue.length;
			
			for (i = 0; i < outposts.length; i++){
				if (outposts[i].sight.enemies.length > 0 && outposts[i].control != ''){
					var beam_strength = 1
					var enemy = spirit_lookup[outposts[i].sight.enemies[outposts[i].sight.enemies.length * Math.random() | 0]];
					if (outposts[i].energy >= 500) beam_strength = 4;
					
					energize_apply.push([enemy, beam_strength * (-2)]);
					outposts[i].energy -= beam_strength;
					render_data3.e.push(['outpost_mdo', enemy.id, beam_strength]);
				}
			}

			// TODO RM dist checks, the queue now only contains close things
			for (i = (e_targets - 1); i >= 0; i--){
				//if (energize_queue[i][1].hp == 0) break;
				
				if (energize_queue[i][1].structure_type != undefined && energize_queue[i][1].structure_type == 'outpost'){
					//console.log('ENERGIZING OUTPOST');
					if (energize_queue[i][0].energy > energy_value * energize_queue[i][0].size){
						strength = energy_value * energize_queue[i][0].size;
						energize_apply_outpost.push([energize_queue[i][0], strength]);
					} else if (energize_queue[i][0].energy > 0){
						strength = energize_queue[i][0].energy;
						energize_apply_outpost.push([energize_queue[i][0], strength]);
					} else {
						
					}
					
					
					
				}
				
				
				//if origin == target —> attempt harvest from star
				else if (energize_queue[i][0] == energize_queue[i][1]){
					for (j = 0; j < energize_queue[i][0].sight.structures.length; j++){
						//console.log('ilook here');
						if (energize_queue[i][0].sight.structures[j] == undefined)
							console.log("WTF StartsWith 1");

						if ((energize_queue[i][0].sight.structures[j]).startsWith('star') == true){
							//console.log('its a star its a star its a star its a star its a star its a star its a star its a star');
							var star = star_lookup[energize_queue[i][0].sight.structures[j]];
							var star_close = fast_dist_lt(energize_queue[i][0].position, star.position, min_beam);
							if (star_close){
								if (workerData[1] == 'tutorial' && energize_queue[i][0].id == 'anonymous1'){
									tutorial_phase[1] = 1;
									if (qqmonitoring[1] == 0){
										qqmonitoring[1] = 1;
										parentPort.postMessage({data: 2, game_id: workerData[0], meta: 'monitoring'});
									}
								}
								//console.log('harvesting');
								//energize_queue[i][0].energy += energy_value * energize_queue[i][0].size;
								energize_apply_star.push([energize_queue[i][0], energy_value * energize_queue[i][0].size, star]);
								//energize_apply.push([energize_queue[i][0], energy_value * energize_queue[i][0].size]);
								//if (energize_queue[i][0].energy > energize_queue[i][0].energy_capacity) energize_queue[i][0].energy = energize_queue[i][0].energy_capacity;
								//render energize: [origin, target, energy]
								//render_data2.energize.push([star_lookup[energize_queue[i][0].sight.structures[j]].id, energize_queue[i][0].id, energy_value * energize_queue[i][0].size]);
								//render_data3.e.push([star_lookup[energize_queue[i][0].sight.structures[j]].id, energize_queue[i][0].id, energy_value * energize_queue[i][0].size]);
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
						if(energize_queue[i][1].id == undefined)
							console.log("WTF StartsWith 2");

						if (energize_queue[i][1].id.startsWith('base') && energize_queue[i][0].energy < 10 && energize_queue[i][0].id == 'anonymous1'){
							console.log('tutorial phase 4 done');
							tutorial_phase[3] = 1;
							if (qqmonitoring[3] == 0){
								qqmonitoring[3] = 1;
								parentPort.postMessage({data: 4, game_id: workerData[0], meta: 'monitoring'});
							}
						}
						if (energize_queue[i][1].id.startsWith('base') && energize_queue[i][0].id == 'anonymous2' && tutorial_flag1 == 1){
							console.log('tutorial phase 6 done');
							tutorial_phase[5] = 1;
							if (qqmonitoring[5] == 0){
								qqmonitoring[5] = 1;
								parentPort.postMessage({data: 6, game_id: workerData[0], meta: 'monitoring'});
							}
							
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
										global['star_p89'] = stars['star_p89'];
				
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
					
					
					target_close = fast_dist_lt(energize_queue[i][0].position, energize_queue[i][1].position, min_beam);
					if (target_close){
						var strength = 0;
						if (energize_queue[i][0].energy > energy_value * energize_queue[i][0].size){
							//energize_queue[i][0].energy -= energy_value * energize_queue[i][0].size;
							//energize_queue[i][1].energy += energy_value * energize_queue[i][0].size;
							strength = energy_value * energize_queue[i][0].size;
							energize_apply.push([energize_queue[i][0], strength * (-1)]);
							energize_apply.push([energize_queue[i][1], strength * (1)]);
							//if (energize_queue[i][1].energy > energize_queue[i][1].energy_capacity) energize_queue[i][1].energy = energize_queue[i][1].energy_capacity;
							//render_data2.energize.push([energize_queue[i][0].id, energize_queue[i][1].id, energy_value * energize_queue[i][0].size]);
							if (energize_queue[i][0].id != null || energize_queue[i][1].id != null) render_data3.e.push([energize_queue[i][0].id, energize_queue[i][1].id, energy_value * energize_queue[i][0].size]);
						} else if (energize_queue[i][0].energy > 0){
							//render_data2.energize.push([energize_queue[i][0].id, energize_queue[i][1].id, energize_queue[i][0].energy]);
							strength = energize_queue[i][0].energy;
							if (energize_queue[i][0].id != null || energize_queue[i][1].id != null) render_data3.e.push([energize_queue[i][0].id, energize_queue[i][1].id, energize_queue[i][0].energy]);
							energize_apply.push([energize_queue[i][0], strength * (-1)]);
							energize_apply.push([energize_queue[i][1], strength * (1)]);
							//energize_queue[i][1].energy += energize_queue[i][0].energy;
							//energize_queue[i][0].energy = 0;
							//if (energize_queue[i][1].energy > energize_queue[i][1].energy_capacity) energize_queue[i][1].energy = energize_queue[i][1].energy_capacity;
							
						} else {
							//console.log('no energy to give');
						}
						//console.log('origin energy: ' + energize_queue[i][0].energy);
						//console.log('target energy: ' + energize_queue[i][1].energy);
					}
				
				}
			
				//if target is enemy
				else if (energize_queue[i][0].player_id != energize_queue[i][1].player_id){
					target_close = fast_dist_lt(energize_queue[i][0].position, energize_queue[i][1].position, min_beam);
					var strength = 0;
					if (target_close){
						if (energize_queue[i][0].energy > energy_value * energize_queue[i][0].size){
							strength = energy_value * energize_queue[i][0].size;
							energize_apply.push([energize_queue[i][0], strength * (-1)]);
							energize_apply.push([energize_queue[i][1], strength * (-2)]);
							//render_data2.energize.push([energize_queue[i][0].id, energize_queue[i][1].id, 2 * strength]);
							if (energize_queue[i][0].id != null || energize_queue[i][1].id != null) render_data3.e.push([energize_queue[i][0].id, energize_queue[i][1].id, 2 * strength]);
							//if below 0, kill
							
						} else if (energize_queue[i][0].energy > 0){
							strength = energize_queue[i][0].energy;
							energize_apply.push([energize_queue[i][0], strength * (-1)]);
							energize_apply.push([energize_queue[i][1], strength * (-2)]);
							//render_data2.energize.push([energize_queue[i][0].id, energize_queue[i][1].id, 2 * strength]);
							if (energize_queue[i][0].id != null || energize_queue[i][1].id != null) render_data3.e.push([energize_queue[i][0].id, energize_queue[i][1].id, 2 * strength]);
						} else {
							//console.log('no energy to give');
						}
						//console.log('origin energy: ' + energize_queue[i][0].energy);
						//console.log('target energy: ' + energize_queue[i][1].energy);
					}				
				}
				
				energize_queue.splice(i, 1);
			}
			
			e_applies = energize_apply.length;
			for (i = (e_applies - 1); i >= 0; i--){
				if (energize_apply[i][0].structure_type == 'base'){
					base_lookup[energize_apply[i][0].id].energy += energize_apply[i][1];
				} else {
					spirit_lookup[energize_apply[i][0].id].energy += energize_apply[i][1];
				}
			}
			
			
			
			for (i = (e_applies - 1); i >= 0; i--){
				if (energize_apply[i][0].energy < 0){
					death_queue.push(energize_apply[i][0]);
					if (energize_apply[i][0].structure_type == 'base' && game_finished != 1){
						game_finished = 1;
						console.log(energize_apply[i][0].player_id + ' lost');
						var p1won = 0;
						var p2won = 0;
						
						if (energize_apply[i][0].player_id == players['p1']){
							p2won = 1;
						} else {
							p1won = 1;
						}
						
						end_game(p1won, p2won);
						
					}
				} else if (energize_apply[i][0].energy > energize_apply[i][0].energy_capacity){
					if (energize_apply[i][0].structure_type == 'base'){
						base_lookup[energize_apply[i][0].id].energy = base_lookup[energize_apply[i][0].id].energy_capacity;
					} else {
						spirit_lookup[energize_apply[i][0].id].energy = spirit_lookup[energize_apply[i][0].id].energy_capacity
					}
				}
				energize_apply.splice(i, 1);			
			}
		
		
			e_applies_star = energize_apply_star.length;
			shuffle_array(energize_apply_star);
			//console.log(energize_apply_star);
			for (i = (e_applies_star - 1); i >= 0; i--){
				if (energize_apply_star[i][2].energy == 0) continue;
				if (energize_apply_star[i][1] > energize_apply_star[i][2].energy){
					energize_apply[i][0].energy += energize_apply_star[i][2].energy;
					energize_apply_star[i][2].energy = 0;
					render_data3.e.push([energize_apply_star[i][2].id, energize_apply_star[i][0].id, energize_apply_star[i][2].energy]);
				} else {
					energize_apply_star[i][0].energy += energize_apply_star[i][1];
					energize_apply_star[i][2].energy -= energize_apply_star[i][1];
					render_data3.e.push([energize_apply_star[i][2].id, energize_apply_star[i][0].id, energize_apply_star[i][1]]);
				}
				
				if (energize_apply_star[i][0].energy > energize_apply_star[i][0].energy_capacity) energize_apply_star[i][0].energy = energize_apply_star[i][0].energy_capacity;
				
				energize_apply_star.splice(i, 1);
			}
			
			
			e_applies_outpost = energize_apply_outpost.length;
			var incoming_energy1 = 0;
			var incoming_energy2 = 0;
			var outpost_neutral = 0;
			for (i = (e_applies_outpost - 1); i >= 0; i--){
				//console.log('calculating outpost!!!!!!!!!!!!!!!!!!!!')
				//outpost is neutral
				if (outpost_lookup['outpost_mdo'].control == ''){
					outpost_neutral = 1;
					if (energize_apply_outpost[i][0].player_id == players['p1']){
						incoming_energy1 += energize_apply_outpost[i][1];
						energize_apply_outpost[i][0].energy -= energize_apply_outpost[i][1];
						render_data3.e.push([energize_apply_outpost[i][0].id, 'outpost_mdo', energize_apply_outpost[i][1]]);
					} else if (energize_apply_outpost[i][0].player_id == players['p2']){
						incoming_energy2 += energize_apply_outpost[i][1];
						energize_apply_outpost[i][0].energy -= energize_apply_outpost[i][1];
						render_data3.e.push([energize_apply_outpost[i][0].id, 'outpost_mdo', energize_apply_outpost[i][1]]);
					}
				} else {
					//friend
					if (energize_apply_outpost[i][0].player_id == outpost_lookup['outpost_mdo'].control){
						outpost_lookup['outpost_mdo'].energy += energize_apply_outpost[i][1];
						energize_apply_outpost[i][0].energy -= energize_apply_outpost[i][1];
						if (outpost_lookup['outpost_mdo'].energy >= outpost_lookup['outpost_mdo'].energy_capacity) outpost_lookup['outpost_mdo'].energy = outpost_lookup['outpost_mdo'].energy_capacity;
						render_data3.e.push([energize_apply_outpost[i][0].id, 'outpost_mdo', energize_apply_outpost[i][1]]);
					} else {
						outpost_lookup['outpost_mdo'].energy -= 2 * energize_apply_outpost[i][1];
						energize_apply_outpost[i][0].energy -= energize_apply_outpost[i][1];
						render_data3.e.push([energize_apply_outpost[i][0].id, 'outpost_mdo', energize_apply_outpost[i][1]]);
					}
				}
				
			}
			
			if (outpost_neutral == 1){
				console.log('incoming_energies');
				console.log(incoming_energy1);
				console.log(incoming_energy2);
				if (incoming_energy1 > incoming_energy2){
					outpost_lookup['outpost_mdo'].control = players['p1'];
					outpost_lookup['outpost_mdo'].energy = incoming_energy1 - incoming_energy2;
				} else if (incoming_energy2 > incoming_energy1){
					outpost_lookup['outpost_mdo'].control = players['p2'];
					outpost_lookup['outpost_mdo'].energy = incoming_energy2 - incoming_energy1;
				} else {
					outpost_lookup['outpost_mdo'].control = '';
					outpost_lookup['outpost_mdo'].energy = 0;
				}
				
			}
			
			if (outpost_lookup['outpost_mdo'].energy <= 0){
				outpost_lookup['outpost_mdo'].control = '';
				outpost_lookup['outpost_mdo'].energy = 0;
			} else if (outpost_lookup['outpost_mdo'].energy <= 500){
				outpost_lookup['outpost_mdo'].range = 400;
			} else if (outpost_lookup['outpost_mdo'].energy > 500){
				outpost_lookup['outpost_mdo'].range = 600;
			}


		let prev_position = move_objects();
	
	
		//objects sight
		//console.log('spirit_lookup[sp1].sight');
		//console.log(spirit_lookup['sp1'].sight);
		//
		
	/*
		var start = process.hrtime();
		get_sight();
		var diff = process.hrtime(start);
		var took1 = (diff[0] * 1000000000 + diff[1]) / 1000000;
		console.log('get_sight took = ' + took1);
		*/


		var start = process.hrtime();
		get_sight_fast();
		var diff = process.hrtime(start);
		var took2 = (diff[0] * 1000000000 + diff[1]) / 1000000;
		console.log('get_sight_fast took = ' + took2);

		//console.log('spirit_lookup[s1].sight');
		//console.log(spirit_lookup['s1'].sight);
		//console.log(spirit_lookup['sp1'].sight);
	
		
		
		
		// stars energy update
		
		for (i = 0; i < stars.length; i++){
			stars[i].energy += Math.round(2 + (stars[i].energy * 0.01));
			if (stars[i].energy >= 1000) stars[i].energy = 1000;
			console.log('star ' + i + ' energy = ' + stars[i].energy);
			if (game_duration < 100){
				if (stars[i].id == 'star_p89') stars[i].energy = 0;
			}
			render_data3.st[i] = stars[i].energy;
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
						if (qqmonitoring[7] == 0){
							qqmonitoring[7] = 1;
							parentPort.postMessage({data: 8, game_id: workerData[0], meta: 'monitoring'});
						}
					}
				} catch (error){
					console.log(error);
				}
			}
			
			death_queue[i].hp = 0;
			console.log(death_queue[i]);
			//render_data2.death.push(death_queue[i].id);
			
			//delete spirit_lookup[suid];
			//var index = living_spirits.findIndex(x => x.id == death_queue[i].id);
			//living_spirits.splice(index);
			
		
			death_queue.splice(i, 1);
		}
		
		
		
		
		//
		// objects merge
		//
		
		for (i = (merge_queue.length - 1); i >= 0; i--){
			
			//var m_origin = merge_queue[i][0];
			//var m_dest = merge_queue[i][1];
			try {
				if (merge_queue[i][0].hp != 0 && merge_queue[i][1].hp != 0){
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
			
			
					//render_data2.special.push(['m', merge_queue[i][0].id, merge_queue[i][1].id])
					render_data3.s.push(['m', merge_queue[i][0].id, merge_queue[i][1].id])
					//render_data2.death.push(merge_queue[i][0].id);
				}
			
			
				merge_queue.splice(i, 1);
			} catch (e) {
				console.log(e)
			}
			
			
		
		}
		
		
		//
		// objects divide
		//
		
		for (i = (divide_queue.length - 1); i >= 0; i--){
			
			try {
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
				
				
					divided.position[0] += adj1;
					divided.position[1] += adj2;
				
				
				}
			
				original.merged = [];
				original.size = 1;
				original.energy = Math.floor(original.energy / original_size);
				original.energy_capacity = original.energy_capacity / original_size;
			
			
				//render_data2.special.push(['d', divide_queue[i].id]);
				render_data3.s.push(['d', divide_queue[i].id]);
			
				divide_queue.splice(i, 1);
			} catch (e) {
				console.log(e);
			}
			
			
		}
		
		
		
		//
		// objects jump
		//
		
		for (i = (jump_queue.length - 1); i >= 0; i--){
			
			jump_queue[i][0].position = jump_queue[i][1];
			jump_queue[i][0].energy -= jump_queue[i][0].energy_capacity / 2;
		
			
			render_data3.s.push(['j', jump_queue[i][0].id]);
			
			jump_queue.splice(i, 1);
		}
	}

	function update_vm_sandbox(){
		if (temp_flag == 0){
			var p1_top = 0;
			var p2_top = 0;
			var p1_living = 0;
			var p2_living = 0;
			for (i = 0; i < living_spirits.length; i++){
				spt = living_spirits[i];
				//console.log(spt);	
				if (spt.player_id == players['p2']){
					
					//render3 part
					render_data3.p2.push([spt.id, spt.position, spt.size, spt.energy, spt.hp]);
					
					//
					
					pl2_units[spt.id] = spt;
					
					//if (spt.hp != 0) {
						if (spt.hp == 1){
							p2_living++;
							if (spt.shape == 'circles' && spt.size > 1) p2_living += spt.size - 1;
						}
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
					
					//render3 part
					render_data3.p1.push([spt.id, spt.position, spt.size, spt.energy, spt.hp]);
					
					
					pl1_units[spt.id] = spt;
					
					//if (spt.hp != 0) {
						if (spt.hp == 1){
							p1_living++;
							if (spt.shape == 'circles' && spt.size > 1) p1_living += spt.size - 1;
						}
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
			console.log('living_spirits.length = ' + living_spirits.length + " p1 = " + p1_living + " p2 = " + p2_living );
				spirit_cost(1, p1_living);
				spirit_cost(2, p2_living);
		} 
	}
			

	function update_state(){
		game_duration++;
		console.log('game_duration = ' + game_duration);
		//after everything is calculated
			
	//console.log(player2_code);
	//console.log('player2_code');
			//render_data = [[],[],[],[],[]];
			
			render_data3 = {
				't': 0,
				'p1': [],
				'p2': [],
				'b1': [],
				'b2': [],
				'st': [],
				'ou': [],
				'e': [],
				's': [],
				'er1': [],
				'er2': [],
				'c1': [],
				'c2': [],
				'end': end_winner
			};
			
			
			if (workerData[1] == 'tutorial'){
				
				render_data3 = {
					't': 0,
					'p1': [],
					'p2': [],
					'b1': [],
					'b2': [],
					'st': [],
					'ou': [],
					'e': [],
					's': [],
					'er1': [],
					'er2': [],
					'c1': [],
					'c2': [],
					'tutorial': [],
					'end': end_winner
				};
				
				//console.log(tutorial_phase);
				
				if (game_duration == 400){
					if (tutorial_phase[0] == 0){
						end_game(0, 0);
						tutorial_phase[0] = 'end';
					}
				} else if (game_duration == 500){
					if (tutorial_phase[1] == 0){
						end_game(0, 0);
						tutorial_phase[0] = 'end';
					}
				} else if (game_duration == 800){
					if (tutorial_phase[2] == 0){
						end_game(0, 0);
						tutorial_phase[0] = 'end';
					}
				} else if (game_duration == 2000){
					end_game(0, 0);
					tutorial_phase[0] = 'end';
				}
			} else {
				render_data3 = {
					't': 0,
					'p1': [],
					'p2': [],
					'b1': [],
					'b2': [],
					'st': [],
					'ou': [],
					'e': [],
					's': [],
					'er1': [],
					'er2': [],
					'c1': [],
					'c2': [],
					'end': end_winner
				};
				if (game_duration == 600){
					if (top_s == 11){
						end_game(0, 0);
					}
				} else if (game_duration == 2400){
					end_game(0, 0);
				}
			}
			
		
		
			process_stuff();
		
			
			
			const cutoff =30;
			if(log1.length > cutoff){
				let l1 = log1.length;
				log1.length = cutoff;
				log1.push('WARN: output too long (>' + cutoff + ' lines), cutting off ' + (l1 - cutoff) + ' lines of log');
			}
			if(log2.length > cutoff){
				let l1 = log2.length;
				log2.length = cutoff;
				log2.push('WARN: output too long (>' + cutoff + ' lines), cutting off ' + (l1 - cutoff) + ' lines of log');
			}
		
			//errors
			//render_data2.error_msg1 = user_error1;
			//render_data2.error_msg2 = user_error2;
			//render_data2.console1 = log1;
			//render_data2.console2 = log2;
			
			render_data3.er1 = user_error1;
			render_data3.er2 = user_error2;
			render_data3.c1 = log1;
			render_data3.c2 = log2;
			
			user_error1 = [];
			user_error2 = [];
		
		
			//tutorial data update
			if (workerData[1] == 'tutorial'){
				render_data3.tutorial.push(tutorial_phase);
			}
		
		
			
			render_data3.t = game_duration;
			render_data3.b1 = [bases[0].energy, base_lookup['base_' + players['p1']].current_spirit_cost, p1_defend];
			render_data3.b2 = [bases[1].energy, base_lookup['base_' + players['p2']].current_spirit_cost, p2_defend];
			
			render_data3.ou = [outposts[0].energy, outposts[0].control];
		
			//broadcast to clients
			//console.log(JSON.stringify(render_data2))
			//console.log(render_data2);
			//parentPort.postMessage({data: JSON.stringify(render_data2), game_id: workerData[0], meta: ''});
			//wss.broadcast();
			
			
			update_vm_sandbox();


		
			parentPort.postMessage({data: JSON.stringify(render_data3), game_id: workerData[0], meta: ''});

			log1 = [];
			log2 = [];
			
			user_code();

			processTime2 = process.hrtime(processTime1);
			processTimeRes = (processTime2[0] * 1000000000 + processTime2[1]) / 1000000;
			console.log('calculated in = ' + processTimeRes);
			//console.log('outpost sight = ');
			//console.log(outposts[0].sight);
			if (processTimeRes > 1000) cancel_game();
			//user_error = 'calculated in = ' + processTimeRes;
	}
	
	
	
	function game_start(){
		//map creation
		// -----------------
		
		
		// --- if tutorial --- //
		
		 /*

		for (s = 1; s < 2; s++){
			global[players['p1'] + s] = new Spirit(players['p1'] + '_' + s, [1230+s*10,620], 5, 0, players['p1'], colors['player1']);
			spirits.push(global[players['p1'] + s]);
			top_s = s;
		}

		for (q = 1; q < 2; q++){
			global[players['p2'] + q] = new Spirit(players['p2'] + '_' + q, [2820+q*10,1820], 5, 0, players['p2'], colors['player2']);
			spirits2.push(global[players['p2'] + q]);
			top_q = q;
		}
		
		 */
		
		// -- //
		
		
		
		// --- if real --- //
		
		///*
				
		var start_num_spirits = 11;
		var start_num_adjust1 = 0;
		var start_num_adjust2 = 0;
		if (shapes['player1'] == 'squares') start_num_adjust1 = 9;
		if (shapes['player2'] == 'squares') start_num_adjust2 = 9;
		
		for (s = 1; s < 1+start_num_spirits-start_num_adjust1; s++){
			if (s > 6){
				global[players['p1'] + s] = new Spirit(players['p1'] + '_' + s, [1230+s*20,620], get_def_size(shapes['player1']), get_def_size(shapes['player1']) * 10, players['p1'], colors['player1'], shapes['player1']);
				spirits.push(global[players['p1'] + s]);
				top_s = s;
			} else {
				global[players['p1'] + s] = new Spirit(players['p1'] + '_' + s, [1340+s*20,600], get_def_size(shapes['player1']), get_def_size(shapes['player1']) * 10, players['p1'], colors['player1'], shapes['player1']);
				spirits.push(global[players['p1'] + s]);
				top_s = s;
			}
			
		}

		for (q = 1; q < 1+start_num_spirits-start_num_adjust2; q++){
			if (q > 6){
				global[players['p2'] + q] = new Spirit(players['p2'] + '_' + q, [2630+q*20,1800], get_def_size(shapes['player2']), get_def_size(shapes['player2']) * 10, players['p2'], colors['player2'], shapes['player2']);
				spirits2.push(global[players['p2'] + q]);
				top_q = q;
			} else {
				global[players['p2'] + q] = new Spirit(players['p2'] + '_' + q, [2740+q*20,1820], get_def_size(shapes['player2']), get_def_size(shapes['player2']) * 10, players['p2'], colors['player2'], shapes['player2']);
				spirits2.push(global[players['p2'] + q]);
				top_q = q;
			}
		}
		
		//*/
		
		// -- //
	
	
		global['base_' + players['p1']] = new Base('base_' + players['p1'], [1600, 700], players['p1'], colors['player1'], shapes['player1']);
		global['base_' + players['p2']] = new Base('base_' + players['p2'], [2600, 1700], players['p2'], colors['player2'], shapes['player2']);

	
		base_lookup['base_' + players['p1']] = global['base_' + players['p1']];
		base_lookup['base_' + players['p2']] = global['base_' + players['p2']];
	
		star_zxq = new Star('star_zxq', [1000, 1000], 100, 220);
		star_lookup['star_zxq'] = star_zxq;
	
		star_a1c = new Star('star_a1c', [3200, 1400], 100, 220);
		star_lookup['star_a1c'] = star_a1c;
		
		star_p89 = new Star('star_p89', [2000, 1300], 1, 80);
		star_lookup['star_p89'] = star_p89;
		
		outpost_mdo = new Outpost('outpost_mdo', [2200, 1100])
		outpost_lookup['outpost_mdo'] = outpost_mdo;

		structure_lookup['outpost_mdo'] = outpost_mdo;
		structure_lookup['star_zxq'] = star_zxq;
		structure_lookup['star_a1c'] = star_a1c;
		structure_lookup['star_p89'] = star_p89;
		structure_lookup['base_' + players['p1']] = global['base_' + players['p1']];
		structure_lookup['base_' + players['p2']] = global['base_' + players['p2']];
		
		
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










