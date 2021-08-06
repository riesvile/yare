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

function elapsed_ms_from(t0) {
	let diff = process.hrtime(t0);
	return round_to((diff[0] * 1e9 + diff[1]) / 1e6, 3);
}

function end_game(was_p1 = 0, was_p2 = 0){
	game_finished = 1;
	//console.log(game_file);
	var compressed_file = zlib.deflateSync(JSON.stringify(game_file)).toString('base64');
	//console.log(JSON.stringify(game_file));
	
	//game history
	var game_history = 'test';
	
	
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
				Game.updateOne({game_id: workerData[0]}, {active: 0, winner: gameWinner, game_file: compressed_file, game_history: game_history}, {upsert: true})
					.then((qq) => {
						console.log('winner updated to ' + gameWinner);
						setTimeout(function(){
							process.exit(0);
						}, 1000);
					});	
			} else if (result[0]['ranked'] == 1){
			
				Game.updateOne({game_id: workerData[0]}, {active: 0, winner: gameWinner, game_file: compressed_file, game_history: game_history}, {upsert: true})
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


const zlib = require('zlib');

//const LZString = require('LZstring');
const botCodes = require('../bot-codes');
const util = require('util');
const mongoose = require('mongoose');
const {User, Session} = require('../models/users.js');
const Game = require('../models/newgame.js');
const config = require('../config');

const dbURI = config.mongo;
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
	.then((result) => console.log('connected to db'))
	.catch((error) => console.log(error));


const min_beam = 200;
// histogram square - maximal, s.t. any two points inside are closer <= beam 
const h_square = min_beam / Math.sqrt(2);

//initiate_world
parentPort.on("message", message => {
  if (message.data == "initiate world") {
	    if (workerData[1] == 'tutorial'){
			game_duration = 0;
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
			  sand1.setPlayerCode(message.pl_code);
			if (message.resigning == 1){
				console.log(message.pl_id + 'is resigning !!!!!!!!!!!');
				end_game(0, 1);
			}
		  } else {
			  Session.findOne({"session_id": message.session_id}).then((session) => {
				  if (session){
					  if (session.user_id == message.pl_id){
						  //all good, update session id and prolong expiration date
						player1_code = message.pl_code;
		  				player1_session = message.session_id;
						sand1.setPlayerCode(message.pl_code);
						if (message.resigning == 1){
							console.log(message.pl_id + 'is resigning !!!!!!!!!!!');
							end_game(0, 1);
						}
		  			} else { 
		  				parentPort.postMessage({data: 'session_id mismatch', meta: 'test'});
		  			}
				}
			})
			.catch((error) => {
				console.log(error);
			}) 
		  }
		  
	  } else if (message.pl_num == "player2"){
		  if (message.session_id == player2_session){
			  player2_code = message.pl_code;
			  sand2.setPlayerCode(message.pl_code);
			if (message.resigning == 1){
				console.log(message.pl_id + 'is resigning !!!!!!!!!!!');
				end_game(1, 0);
			}
		  } else {
			Session.findOne({"session_id": message.session_id}).then((session) => {
				if (session){
					if (session.user_id == message.pl_id){
						//all good, update session id and prolong expiration date
					  player2_code = message.pl_code;
						player2_session = message.session_id;
					  sand2.setPlayerCode(message.pl_code);
					  if (message.resigning == 1){
						  console.log(message.pl_id + 'is resigning !!!!!!!!!!!');
						  end_game(0, 1);
					  }
					} else { 
						parentPort.postMessage({data: 'session_id mismatch', meta: 'test'});
					}
			  	}
			})
			.catch((error) => {
				console.log(error);
			}) 
		  }
	  }
  } else if (message.data == "start world"){
	  game_file = [];
	  players['p1'] = message.player1;
	  players['p2'] = message.player2;
	  shapes['player1'] = message.p1_shape;
	  shapes['player2'] = message.p2_shape;
	  colors['player1'] = color_palettes[message.p1_color];
	  colors['player2'] = color_palettes[message.p2_color];
	  sand1.init(message.player1);
	  sand2.init(message.player2);
	  //tutorial
	if (workerData[1] == 'tutorial'){
		tutorial_phase = [0, 0, 0, 0, 0, 0, 0, 0];
		tutorial_flag1 = 0;
		spirit_p2_cost = 30;
		sand2.setPlayerCode(botCodes['tutorial0']);
	}
	  game_start();
	  
	  Game.find({game_id: workerData[0]})
	  	.then((result) => {
			console.log('p1_color');
			console.log(result[0].p1_color);
			if (result[0].player2 == 'medium-bot'){
				sand2.setPlayerCode(botCodes['medium-bot']);
			} else if (result[0].player2 == 'will-bot'){
				sand2.setPlayerCode(botCodes['will-bot']);
			} else if (result[0].player2 == 'dumb-bot'){
				sand2.setPlayerCode(botCodes['dumb-bot']);
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

function clean_error(error){
	if(!(error instanceof Error)) {
		return String(error);
	}
	let message = "" + error;
	
	let stack = error.stack.split("\n");

	stack = stack.filter(l => /~sandbox/.test(l));
	
	message += "\n" + stack.join("\n");

	return message;
}

function handle_error(error, player){
	message = clean_error(error);

	fill_error(player, to_html(message));
}

async function user_code(){
	if (workerData[1] == 'tutorial'){
		//console.log(player1_code);
		var helper_count = (player1_code.match(/my_spirits/g) || []).length;
		//console.log('my_spirits count');
		//console.log(helper_count);
		
		if (helper_count > 0){
			tutorial_flag1 = 1;
		}
	}
	
	all_commands = {};
	
	//
	// first player
	//

	let p1_async = sand1.run();
	let p2_async = sand2.run();
	try {
		let run_err = null;
		try {
			await p1_async;
		} catch (error) {
			run_err = error;
		}
		let out = await sand1.output();
		all_commands[players['p1']] = out.commands;
		log1 = out.logs;
		user_error1 = out.errors.map(clean_error);
		gqueue1 = out.gqueue;
		if(run_err) {
			handle_error(run_err, players['p1']);
		}
		if(sand1.code_err){
			user_error1.push(to_html(sand1.code_err));
		}
		
	} catch (error){
		console.log("error getting output" + error);
		handle_error(error, players['p1']);
	}

	//
	// second player
	//
	
	try {
		let run_err = null;
		try {
			await p2_async;
		} catch (error) {
			run_err = error;
		}
		let out = await sand2.output();
		all_commands[players['p2']] = out.commands;
		log2 = out.logs;
		user_error2 = out.errors.map(clean_error);
		gqueue2 = out.gqueue;
		if(run_err) {
			handle_error(run_err, players['p2']);
		}
		if(sand2.code_err){
			user_error2.push(to_html(sand2.code_err));
		}
		
	} catch (error){
		console.log("error getting output" + error);
		handle_error(error, players['p2']);
	}
}

//global
var started = 0;
var game_tick = 600; // 1s
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


var all_commands = {};

var birth_queue = [];
var death_queue = [];
var star_zxq;
var star_a1c;
var star_p89;
var outpost_mdo;
var base1;
var base2;

var player1_code = '';
var player1_session = '';
var player2_code = '';
var player2_session = '';
var players = {};
var ticks = {};
players['p1'] = 'ab1';
players['p2'] = 'zx2';
var players_update = {};
players_update['p1'] = 'old';

var game_file = [];


var p1_process_time = 0;
var p1_process_time_check = 0;
var p1_process_time_res = 0;
var p2_process_time_check = 0;
var p2_process_time_res = 0;

function spirit_cost(p_num, alives){
	var shape = shapes["player" + p_num];
	if (shape == 'circles'){
		if (alives <= 50) bases[p_num-1].current_spirit_cost = 25;
		if (alives > 50) bases[p_num-1].current_spirit_cost = 50;
		if (alives > 100) bases[p_num-1].current_spirit_cost = 100;
		if (alives > 200) bases[p_num-1].current_spirit_cost = 200;
		if (alives > 300) bases[p_num-1].current_spirit_cost = 400;
		if (alives > 500) bases[p_num-1].current_spirit_cost = 1000;
	} else if (shape == 'squares'){
		if (alives <= 10) bases[p_num-1].current_spirit_cost = 360;
		if (alives > 10) bases[p_num-1].current_spirit_cost = 700;
		if (alives > 400) bases[p_num-1].current_spirit_cost = 1100;
	} else if (shape == 'triangles'){
		if (alives <= 30) bases[p_num-1].current_spirit_cost = 90;
		if (alives > 30) bases[p_num-1].current_spirit_cost = 120;
		if (alives > 120) bases[p_num-1].current_spirit_cost = 300;
		if (alives > 300) bases[p_num-1].current_spirit_cost = 1000;
	}
	
	if (workerData[1] == 'tutorial'){
		bases[0].current_spirit_cost = 100;
		bases[1].current_spirit_cost = 50;
	}
		
}

function get_def_size(pshape){
	if(workerData[1] == 'tutorial'){
		return 5;
	}
	if (pshape == 'circles') return 1;
	if (pshape == 'squares') return 10;
	if (pshape == 'triangles') return 3;
}


var spirit_p1_cost = 100;
var spirit_p2_cost = 100;
var p1_defend = 0;
var p2_defend = 0;

var temp_flag = 0;
var end_winner = 0;

var tutorial_phase;
var tutorial_flag1;

var game_duration = -50;
var game_activity = 1;
var qqmonitoring = [0, 0, 0, 0, 0, 0, 0, 0];

var colors = {};
var shapes = {};
colors['player1'] = "rgba(255, 0, 0, 1)";
colors['player2'] = "rgba(0, 100, 255, 1)";
var color_palettes = {};
color_palettes['color1'] = 'rgba(128,140,255,1)';
color_palettes['color2'] = 'rgba(232,97,97,1)';
color_palettes['color3'] = 'rgba(58,197,240,1)';
color_palettes['color4'] = 'rgba(201,161,101,1)';
color_palettes['color5'] = 'rgba(120,12,196,1)';
color_palettes['color6'] = 'rgba(148, 176, 108, 1)';



var rawSpirits = {};
var my_spirits1 = [];
var my_spirits2 = [];

var top_s = 0;
var top_q = 0;

var firstCode = 0;

var energy_value = 1;

var game_finished = 0;

var user_error1 = [];
var user_error2 = [];

var test_s1 = {};
var test_s2 = {};

//var console1 = console;
//var console2 = console;

var log1 = [];
var log2 = [];

var gqueue1 = [];
var gqueue2 = [];

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
	'c2': [],
	'g1': [],
	'g2': [],
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
const ivm = require('isolated-vm');
const fs = require('fs');

function cutoff_log(log, cutoff){
	if(log.length > cutoff){
		let l1 = log.length;
		log.length = cutoff;
		log.push('WARN: output too long (>' + cutoff + ' lines), cutting off ' + (l1 - cutoff) + ' lines of log');
	}
	return log;
}

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

var sandboxCode = fs.readFileSync(__dirname + "/sandbox.js", { encoding: 'utf8' });

class Sandbox {
	constructor() {
		this.isolate = new ivm.Isolate({memoryLimit: 128});
		this.context = this.isolate.createContextSync();
		this.jail = this.context.global;
		this.script = this.isolate.compileScriptSync(``);
		this.ready = false;
		this.jail.setSync("global", this.jail.derefInto());
		this.jail.setSync("memory", {}, {copy: true});

		this.yd = this.context.evalClosureSync(sandboxCode, [], {result: {reference: true}});

		this.funcs = {};
		this.funcs.loadData = this.yd.getSync('loadData', {reference: true});
		this.funcs.getOutput = this.yd.getSync('getOutput', {reference: true});
		this.err = false;
		this.code_err = null;
	}

	setPlayerCode(code) {
		this.code_err = null;
		try {
			this.script = this.isolate.compileScriptSync(code, {filename: "~sandbox/user.js"});
			this.ready = true;
		}catch(err) {
			this.code_err = "Last code compile error: " + err.message;
		}
	}

	init(player_id) {
		this.yd.getSync('init', {reference: true}).applySync(this.yd.derefInto(), [player_id], {arguments: {copy: true}});
	}

	async loadData() {
		this.funcs.loadData.apply(this.yd.derefInto(), [{tick: ticks['now'], spirits: rawSpirits, stars: JSON.parse(JSON.stringify(star_lookup)), bases: JSON.parse(JSON.stringify(base_lookup)), outposts: JSON.parse(JSON.stringify(outpost_lookup)), players: JSON.parse(JSON.stringify(players))}], {arguments: {copy: true}, result: {reference: true}});
	}

	async run() {
		await this.loadData();
		let pre = this.isolate.cpuTime;
		await this.script.run(this.context, {timeout: 250});
		let post = this.isolate.cpuTime;
		console.log("sandbox run in " + ((post - pre) / 1000000n).toString() + " ms");
	}

	async output() {
		return this.funcs.getOutput.apply(this.yd.derefInto(), [], {result: {copy: true}});
	}
}

var sand1 = new Sandbox();
var sand2 = new Sandbox();

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
		}

		birth() {
		
		}
	}

	class Star {
		constructor(id, position, energy, size, active_at){
			this.id = id
			this.position = position;
			this.size = size;
			this.structure_type = 'star';
			this.energy = energy;
			this.energy_capacity = 1000;
			this.last_energized = '';
			this.active_in = 0;
			this.active_at = active_at;
			//this.energy = energy;
			this.collision_radius = 100;
		
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
			this.last_energized = '';
			//this.energy = energy;
			this.collision_radius = 50;
			
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
			this.collision_radius = 50;
			
			this.hp = 5;
			if (this.shape == 'circles'){
				this.energy_capacity = 400;
			} else if (this.shape == 'squares'){
				this.energy_capacity = 1000;
			} else if (this.shape == 'triangles'){
				this.energy_capacity = 600;
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
		return ((item2[0]-item1[0])**2) + ((item2[1]-item1[1])**2) <= range**2;
	}

	function fast_dist_leq(item1, item2, range){
		return ((item2[0]-item1[0])**2) + ((item2[1]-item1[1])**2) <= range**2;
	}

	function norm_sq(coor){
		return coor[0]**2 + coor[1]**2;
	}

	function normalize(coor){
		let norm = Math.sqrt(norm_sq(coor));
		return [coor[0]/norm, coor[1]/norm];
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
		return fast_dist_leq(item1.position, item2.position, range);
	}


	function get_sight_fast(){
		const beamable_sq = min_beam**2;
		const visible_sq = (2*min_beam)**2;
		const high_range_sq = (600)**2;
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
		for (let o = 0; o < outposts.length; o++){
  		  	outposts[o].sight = {
  				enemies: []
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
				let use_range = visible_sq;
				let dsq = dist_sq(spirit.position, outpost.position);
				
				if (outpost.energy >= 500) use_range = high_range_sq;
				
				if (dsq < use_range){
					let friend = outpost.control == spirit.player_id;
					if (friend){
						//outposts[o].sight.friends.push(spirit.id);
					}else{
						outposts[o].sight.enemies.push(spirit.id);
					}

					if (dsq < beamable_sq){
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
			for(s = 3; s < 7*4-1 ; s++){
				// lower left corner, too far away
				if(s==21) continue;

				let dy = Math.floor(s / 7);
				let dx = (s % 7) - 3;
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

	function progress_tut(phase_done, log=false){
		if(log)
			console.log('tutorial phase ' + phase_done +' done');
		let i = phase_done - 1;

		try {
			tutorial_phase[i] = 1;
			if (qqmonitoring[i] == 0){
				qqmonitoring[i] = 1;
				parentPort.postMessage({data: i+1, game_id: workerData[0], meta: 'monitoring'});
			}
		} catch (error){
					console.log('ERROR progress tutorial error, phase_done = ' + phase_done);
					console.log(error);
				}
	}

	function player_owns_spirit(id, name){
		if(!id.startsWith(name))
			return false;
		// if the id does start with name, it is still not ok
		// consider players "pepa" and "pepa_the_best"
		let spirit_num = Number(id.slice(name.length + 1));
		return id == (name + "_" + spirit_num);
	}

	function move_objects(){
		const prev_position = {};
		for (let player in all_commands){
			let queue = all_commands[player].spirit;

			Object.keys(queue).forEach((id) => {
				if(id == 'merge') return;
				if(!id || !player_owns_spirit(id, player)){
					console.log("WTF: null or possible hack: player " + player + 
						" calls "  + id + ".move()");
					return;
				}

				const spirit = spirit_lookup[id];
				if (spirit.hp == 0)
					return;
				
				const tpos = queue[id].move;
				if(!tpos) return;
				const pos = spirit.position;
				prev_position[id] = pos;

				//tutorial
				if (workerData[1] == 'tutorial' && id == "anonymous_1"){
					if (tpos[0] == 1000 && tpos[1] == 1000){
						progress_tut(1);
					} else if (tpos[0] == 1600 && tpos[1] == 700){
						progress_tut(3, true);
					}
				}
				
				let incr = sub(tpos, pos);

				/*
				incr = incr.map((d) => d + jitter(100/70));
				if (dist_sq(pos, tpos) < 0.6**2){
					incr = [0, 0]
				}
				//*/

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
						// name prefix - safe (is structure)
						let min_distance = structure_lookup[object_name].collision_radius;
						let object_position = structure_lookup[object_name].position;
						let spirit_before = pos;

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
			});
		}

		return prev_position;
	}

	function energize_objects(){
		let energize_apply = [];
		let energize_apply_star = [];
		let energize_apply_outpost = [];
		
		for(let spirit of Object.values(spirit_lookup)){
			spirit.last_energized = '';
		}
		
		//explosions
		for(let player in all_commands) {
			let commands = all_commands[player].spirit;
			for(let spirit in commands) {
				if(spirit == 'merge') continue;
				if(!player_owns_spirit(spirit, player)) continue;
				if(!(spirit in spirit_lookup) || spirit_lookup[spirit].hp == 0) continue;
				if(spirit_lookup[spirit].shape != "triangles") continue;
				if(!commands[spirit].explode) continue;
				//console.log(spirit + ' is about to explode');
				let explodee = spirit_lookup[spirit];
				for (let j = 0; j < explodee.sight.enemies_beamable.length; j++){
					let potential_target = spirit_lookup[explodee.sight.enemies_beamable[j]];
					//console.log('boom check = ' + fast_dist_lt(explodee.position, potential_target.position, 100));
					if (fast_dist_leq(explodee.position, potential_target.position, 160)){
						energize_apply.push([potential_target, -10]);
					}
				}
				energize_apply.push([explodee, -100]);
				render_data3.s.push(['ex', spirit]);
			}
		}
		
		for (let i = 0; i < outposts.length; i++){
			let outpost = outposts[i];
			let enemies = outpost.sight.enemies;
			if (enemies.length == 0 || outpost.control == '')
				continue;

			let beam_strength = outpost.energy >= 500 ? 4 : 1;
			let enemy = spirit_lookup[enemies[enemies.length * Math.random() | 0]];
			
			energize_apply.push([enemy, -2 * beam_strength]);
			outpost.energy -= beam_strength;
			render_data3.e.push([outpost.id, enemy.id, 2 * beam_strength]);
		}

		let last_beam = {};
		for (let player in all_commands){
			let queue = all_commands[player].spirit;

			Object.keys(queue).forEach((from_id) => {
				if(from_id == 'merge') return;
				const to_id = queue[from_id].energize;
				if(!to_id) return;
				if(!from_id || !player_owns_spirit(from_id, player) || !to_id){
					console.log("WTF: null or possible hack player " + player + 
						" calls "  + from_id + ".energize(" + to_id+")");
					return;
				}

				if(last_beam[from_id] != undefined)
					return;
				last_beam[from_id] = to_id;
				
				const from_obj = spirit_lookup[from_id] || structure_lookup[from_id];
				const to_obj = spirit_lookup[to_id] || structure_lookup[to_id];

				if(from_obj.hp == 0 || to_obj.hp == 0) return;

				// harvest star
				if (from_id == to_id){
					for (let j = 0; j < from_obj.sight.structures.length; j++){
						//console.log('ilook here');
						let struc_name = from_obj.sight.structures[j];

						// name prefix - safe (is structure)
						if (!struc_name.startsWith('star'))
							continue;

						let star = structure_lookup[struc_name];
						let star_close = fast_dist_leq(from_obj.position, star.position, min_beam);
						if (!star_close)
							continue;

						from_obj.last_energized = to_id;
						energize_apply_star.push([from_obj, energy_value * from_obj.size, star]);

						// TODO VILEM CHECK - proc to tady delam jen kdyz je to anonymous?
						// 						to nejde delat tutorial jako logged in user?
						if (workerData[1] == 'tutorial' && from_obj.id == 'anonymous_1')
							progress_tut(2);

						// only harvest one star at once
						break;
					}
					// no need to check other cases (outpost, friend, ...)
					return;
				}

				let target_close = fast_dist_leq(from_obj.position, to_obj.position, min_beam);
				if(! target_close)
					return;

				let beam_strength = Math.min(energy_value * from_obj.size, from_obj.energy);
				if(beam_strength <= 0)
					return;

				from_obj.last_energized = to_id;

				let friendly_beam = from_obj.player_id == to_obj.player_id;
				
				// name prefix - safe (is outpost)
				if (to_obj.id.startsWith('outpost') && outpost_lookup[to_id]){
					energize_apply.push([from_obj, -beam_strength]);
					energize_apply_outpost.push([from_obj, beam_strength, to_obj]);
					render_data3.e.push([from_id, to_id, beam_strength]);
				} 
				else if (!friendly_beam){
					energize_apply.push([from_obj, -beam_strength]);
					energize_apply.push([to_obj, -2 * beam_strength]);
					render_data3.e.push([from_id, to_id, 2 * beam_strength]);
				}
				else {
					//else: target is friend
					energize_apply.push([from_obj, -beam_strength]);
					energize_apply.push([to_obj, beam_strength]);
					render_data3.e.push([from_id, to_id, beam_strength]);

					// JM TODO refactor tutorial player code elsewhere
					if (workerData[1] == 'tutorial'){
						// TODO VILEM CHECK - proc to tady delam jen kdyz je to anonymous?
						// 						to nejde delat tutorial jako logged in user?
						// name prefix - safe (is structure)
						let to_base = to_id.startsWith('base') && structure_lookup[to_id];

						if (to_base && from_obj.energy < 10 && from_id == 'anonymous_1'){
							progress_tut(4, true);
						}

						// TODO VILEM CHECK - proc je tady anon2, kdyz jinde je anon1 ??
						if (to_base && from_id == 'anonymous_2' && tutorial_flag1 == 1){
							progress_tut(6, true);
							sand2.setPlayerCode(botCodes['tutorial6']);
						}
					}
				}
			});
		}

		//
		// apply 
		//	

		let applied_to = {};
		let check = [];

		// apply energize call
		for (let i = energize_apply.length - 1; i >= 0; i--){
			let target = energize_apply[i][0];
			let amount = energize_apply[i][1];
			target.energy += amount;

			if(!applied_to[target.id]){
				applied_to[target.id] = true;
				check.push(target);
			}
		}

		// TODO Vilem check - presunul jsem tezbu PRED energize apply vyhodnoceni / death queue, aby
		//  spirity co zrovna tezi && zrovna na ne nekdo utoci nechcipli
		//  (imo je nespravedlivy, kdyby chcipli); pokud je tohle zamer, tak minimalne
		//  je imo potreba aby uz pak ty mrtvoly netezily (pze pak se ztraci energie hvezdy)

		// JM TODO discuss: more simultaneous harvestors (& almost empty star) could be solved by all of them getting 
		// 					some proportion
		// now, it is first come, first served, probably also ok
		shuffle_array(energize_apply_star);

		// apply harvest
		for (let i = energize_apply_star.length - 1; i >= 0; i--){
			let spirit = energize_apply_star[i][0];
			let amount = energize_apply_star[i][1];
			let star = energize_apply_star[i][2];

			let can_harvest = Math.min(amount, star.energy);
			if (can_harvest <= 0) continue;

			// TODO Vilem check - predtim to bylo tak, ze spirit natezil vse co mohl
			// a potom se energie nad capacity zahodila
			// to je podle me hrozne nespravedlivy vuci ctvereckum (/spiritum s velkou size)
			// kdyz ma hvezda malo energie (protoze si tim ubiraji vic z hvezdy, nez pouzijou,
			// a navic nema hrac moznost, jak to ovladat).
			// takze se to ted dela tak, ze vytezi max toho co muzou.

			// max needed, so that to_full_capacity >= 0
			// 	- in cases of overcharged spirits (energy > capacity after apply)
			let to_full_capacity = Math.max(0, spirit.energy_capacity - spirit.energy);
			let actually_harvested = Math.min(can_harvest, to_full_capacity);

			spirit.energy += actually_harvested;
			star.energy -= actually_harvested;
			render_data3.e.push([star.id, spirit.id, actually_harvested]);

			if(!applied_to[spirit.id]){
				applied_to[spirit.id] = true;
				check.push(spirit);
			}
		}

		// check death & energy cap
		for (let i = 0; i < check.length; i++){
			let target = check[i];
			target.energy = Math.min(target.energy, target.energy_capacity);

			if (target.energy < 0){
				
				if (target.structure_type == 'base' && target.hp > 1){
					target.hp--;
					target.energy = 0;
					continue;
				}
				
				death_queue.push(target);

				if (target.structure_type == 'base' && game_finished != 1){
					game_finished = 1;
					console.log(target.player_id + ' lost');

					let p2won = target.player_id == players['p1'] ? 1 : 0;
					end_game(1 - p2won, p2won);
				}
			}
		}
		
		
		// energize_apply_outpost.push([from_obj, strength, to_obj]);
		let incoming_p1 = {};
		let incoming_p2 = {};

		for (let i = energize_apply_outpost.length - 1; i >= 0; i--){
			let spirit = energize_apply_outpost[i][0];
			let amount = energize_apply_outpost[i][1];
			let outpost = energize_apply_outpost[i][2];

			if(spirit.player_id == players['p1']){
				if(incoming_p1[outpost.id] == undefined)
					incoming_p1[outpost.id] = 0;
				incoming_p1[outpost.id] += amount;
			} else {
				if(incoming_p2[outpost.id] == undefined)
					incoming_p2[outpost.id] = 0;
				incoming_p2[outpost.id] += amount;
			}
		}
		
		for(let i = 0 ; i < outposts.length; i++){
			let outpost = outposts[i];

			let from_p1 = incoming_p1[outpost.id] || 0;
			let from_p2 = incoming_p2[outpost.id] || 0;

			if(outpost.control == ''){
				// the case where from_p1 == from_p2 will have 0 energy and control '' set below
				outpost.control = (from_p1 > from_p2) ? players['p1'] : players['p2'];
				outpost.energy = Math.abs(from_p1 - from_p2);
			} else{
				let from_me = (outpost.control == players['p1']) ? from_p1 : from_p2;
				let from_enemy = (outpost.control == players['p1']) ? from_p2 : from_p1;

				outpost.energy += from_me;
				outpost.energy -= 2 * from_enemy;
			}

			if(outpost.energy <= 0)
				outpost.control = '';
			outpost.energy = Math.max(0, Math.min(outpost.energy, outpost.energy_capacity));
			outpost.range = outpost.energy <= 500 ? 400 : 600;
		}
	}

	function process_stuff(){

		//
		// objects birth
		//
		
		if (base_lookup['base_' + players['p1']].energy >= base_lookup['base_' + players['p1']].current_spirit_cost){
			if (workerData[1] == 'tutorial' && top_s > 20){
				//console.log('can not have more than 20 spirits in tutorial');
			} else {
				if (p1_defend != 1){
					top_s++;
					global[players['p1'] + top_s] = new Spirit(players['p1'] + '_' + top_s, [1580, 640], get_def_size(shapes['player1']), get_def_size(shapes['player1']) * 10, players['p1'], colors['player1'], shapes['player1']);
					base_lookup['base_' + players['p1']].energy -= base_lookup['base_' + players['p1']].current_spirit_cost;
					//global[players['p1'] + top_s].move([1600, 660]);
					//console.log('spirit was born!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
					if (workerData[1] == 'tutorial')
						progress_tut(5, true);
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
		// shout and mark
		//
		
		for(let player in all_commands) {
			let commands = all_commands[player].spirit;
			for(let spirit in commands) {
				if(spirit == 'merge') continue;
				if(!player_owns_spirit(spirit, player)) continue;
				if(!(spirit in spirit_lookup) || spirit_lookup[spirit].hp == 0) continue;
				if(commands[spirit].shout) render_data3.s.push(['sh', spirit, commands[spirit].shout]);
				if(commands[spirit].mark) spirit_lookup[spirit].mark = commands[spirit].mark;
			}
		}
		//
		// objects energize
		//
		
		energize_objects();

		//
		// objects move
		//

		let prev_position = move_objects();
		
		//
		//objects sight
		//
		
		/*
		var start = process.hrtime();
		get_sight();
		var diff = process.hrtime(start);
		var took1 = (diff[0] * 1000000000 + diff[1]) / 1000000;
		console.log('get_sight took = ' + took1);
		*/



		//console.log('TIME: get_sight_fast = ' + elapsed_ms_from(sight_t0));

		//console.log('spirit_lookup[s1].sight');
		//console.log(spirit_lookup['s1'].sight);
		//console.log(spirit_lookup['sp1'].sight);
		
		
		// stars energy update
		
		for (let i = 0; i < stars.length; i++){
			stars[i].energy += Math.round(3 + (stars[i].energy * 0.01));
			if (stars[i].energy >= 1000) stars[i].energy = 1000;
			//console.log('star ' + i + ' energy = ' + stars[i].energy);
			if (game_duration < stars[i].active_at){
				stars[i].energy = 0;
				stars[i].active_in = stars[i].active_at - game_duration;
			} else {
				stars[i].active_in = 0;
			}
			render_data3.st[i] = stars[i].energy;
		}
	
		//objects death & vm sandbox objects update
		for (let i = death_queue.length - 1; i >= 0; i--){
			//console.log(death_queue[i].id + ' died');
			if (workerData[1] == 'tutorial'){
				if (death_queue[i].id == 'easy-bot_2')
					progress_tut(8, true);
			}
			
			death_queue[i].hp = 0;
			//console.log(death_queue[i]);
			//render_data2.death.push(death_queue[i].id);
			
			//delete spirit_lookup[suid];
			//var index = living_spirits.findIndex(x => x.id == death_queue[i].id);
			//living_spirits.splice(index);
			
		
			death_queue.splice(i, 1);
		}
		
		
		
		
		//
		// objects merge
		//
		let merged = {};
		for(let player in all_commands) {
			let commands = all_commands[player];
			for(let [sid, tid] of commands.merge) {
				if(!player_owns_spirit(sid, player)) continue;
				if(!player_owns_spirit(tid, player)) continue;
				if(!(sid in spirit_lookup)) continue;
				if(!(tid in spirit_lookup)) continue;

				if(merged[sid]) continue;

				let s = spirit_lookup[sid];
				let t = spirit_lookup[tid];

				if(s.hp == 0 || t.hp == 0) continue;
				if(s.shape != 'circles' || t.shape != 'circles') continue;

				if(dist_sq(t.position, s.position) > 10**2) continue;
				if(s.hp == 0 || t.hp == 0) continue;
				t.merged.push(s.id);
				t.size += s.size;
				t.energy += s.energy;
				t.energy_capacity += s.energy_capacity;
				s.hp = 0;
				s.size = 0;
				s.energy = 0;
				s.position = t.position;
				merged[t] = true;

				render_data3.s.push(['m', s.id, t.id]);
			}
		}
		
		
		//
		// objects divide
		//
		
		for(let player in all_commands) {
			let commands = all_commands[player].spirit;
			for(let spirit in commands) {
				if(spirit == 'merge') continue;
				if(!player_owns_spirit(spirit, player)) continue;
				if(!(spirit in spirit_lookup) || spirit_lookup[spirit].hp == 0) continue;
				if(!commands[spirit].divide) continue;
				
				let orig = spirit_lookup[spirit];
				let orig_size = orig.size;
				for(let did of orig.merged) {
					var d = spirit_lookup[did];
					d.hp = 1;
					d.size = 1;
					d.energy = Math.floor(orig.energy / orig_size);
					d.energy_capacity = orig.energy_capacity / orig_size;
					d.position = [orig.position[0], orig.position[1]];
					let ang = Math.random() * Math.PI * 2;
					let dist = Math.random() * 10;
					d.position[0] += Math.sin(ang) * dist;
					d.position[1] += Math.cos(ang) * dist;
					for (let object_name in structure_lookup){
						let s = structure_lookup[object_name];
						let v = sub(d.position, s.position);
						let len_sq = norm_sq(v);
						if(len_sq < s.collision_radius**2) {
							v = mult(s.collision_radius / Math.sqrt(len_sq), v);
							d.position = add(s.position, v);
						}
					}
				}
				
				orig.merged = [];
				orig.size = 1;
				orig.energy = Math.floor(orig.energy / orig_size);
				orig.energy_capacity = orig.energy_capacity / orig_size;

				render_data3.s.push(['d', orig.id]);
			}
		}
		
		//
		// objects jump
		//
		for(let player in all_commands) {
			let commands = all_commands[player].spirit;
			for(let spirit in commands) {
				if(spirit == 'merge') continue;
				if(!player_owns_spirit(spirit, player)) continue;
				if(!(spirit in spirit_lookup) || spirit_lookup[spirit].hp == 0) continue;
				if(spirit_lookup[spirit].shape != "squares") continue;
				if(!commands[spirit].jump) continue;

				let s = spirit_lookup[spirit];

				let tpos = commands[spirit].jump;
				let incr = sub(tpos, s.position);

				let dist = Math.sqrt(norm_sq(incr));
				let cost = dist / 5;
				if(cost > s.energy) {
					incr = mult((s.energy * 5) / dist, incr);
					tpos = add(s.position, incr);
					dist = s.energy * 5;
					cost = s.energy;
				}

				for (var object_name in structure_lookup){
					//console.log(' ------------------------------- structure potential collisions');
					//console.log(potential_structure_collisions[k]);
					
					// name prefix - safe (is structure)
					let min_distance = structure_lookup[object_name].collision_radius;
					let object_position = structure_lookup[object_name].position;

					if (fast_dist_lt(tpos, object_position, min_distance)){
						let inter_coor = intersection(s.position[0], s.position[1], dist,
														object_position[0], object_position[1], min_distance);
						if (inter_coor == false) continue;
						
						let quick_dist1 = dist_sq(inter_coor[0], tpos);
						let quick_dist2 = dist_sq(inter_coor[1], tpos);
						
						let pick_first = quick_dist1 < quick_dist2 || Math.abs(quick_dist1 - quick_dist2) <= 5;
						tpos = inter_coor[pick_first ? 0 : 1];
					}
				}
				s.position = tpos;

				s.energy -= Math.ceil(cost);

				render_data3.s.push(['j', spirit]);
			}
		}

		let sight_t0 = process.hrtime();
		get_sight_fast();

	}

	function update_vm_sandbox(){
		if (temp_flag == 0){
			var p1_living = 0;
			var p2_living = 0;
			for (i = 0; i < living_spirits.length; i++){
				spt = living_spirits[i];
				//console.log(spt);	
				if (spt.player_id == players['p2']){
					
					//render3 part
					render_data3.p2.push([spt.id, spt.position, spt.size, spt.energy, spt.hp]);

					if (spt.hp == 1){
						p2_living++;
						if (spt.shape == 'circles' && spt.size > 1) p2_living += spt.size - 1;
					}

				} else if (spt.player_id == players['p1']) {
					
					//render3 part
					render_data3.p1.push([spt.id, spt.position, spt.size, spt.energy, spt.hp]);

					if (spt.hp == 1){
						p1_living++;
						if (spt.shape == 'circles' && spt.size > 1) p1_living += spt.size - 1;
					}
					
				}
				var tempJSON = JSON.stringify(spt);
				rawSpirits[spt.id] = JSON.parse(tempJSON);

				//what is this doing here? (maybe important)
				//spt.move(spt.position);
			}
			//console.log('objects processing');
			temp_flag = 0;
			//console.log('my_spirits1.length = ' + my_spirits1.length);
			//console.log('living_spirits.length = ' + living_spirits.length + " p1 = " + p1_living + " p2 = " + p2_living );
				spirit_cost(1, p1_living);
				spirit_cost(2, p2_living);
		} 
	}
			

	async function update_state(){
		let update_t0 = process.hrtime();
		game_duration++;

		if(game_duration < -3 && sand1.ready && sand2.ready) {
			game_duration = -3;
		}

		ticks['now'] = game_duration;
		//console.log('game_duration = ' + game_duration);
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
				
				if (game_duration == 600){
					if (tutorial_phase[0] == 0){
						end_game(0, 0);
						tutorial_phase[0] = 'end';
					}
				} else if (game_duration == 800){
					if (tutorial_phase[1] == 0){
						end_game(0, 0);
						tutorial_phase[0] = 'end';
					}
				} else if (game_duration == 1200){
					if (tutorial_phase[2] == 0){
						end_game(0, 0);
						tutorial_phase[0] = 'end';
					}
				} else if (game_duration == 3000){
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
				if (game_duration == 2000){
					if (top_s == 11){
						end_game(0, 0);
					}
				} else if (game_duration == 3000){
					end_game(0, 0);
				}
			}
			
			if(game_duration > 0) {
		
				process_stuff();
			
				log1 = cutoff_log(log1, 30);
				log2 = cutoff_log(log2, 30);
			
				render_data3.er1 = user_error1;
				render_data3.er2 = user_error2;

				const gqueue_cutoff = 100;
				render_data3.g1 = gqueue1;
				render_data3.g2 = gqueue2;
				if(render_data3.g1.length > gqueue_cutoff){
					let l1 = render_data3.g1.length;
					render_data3.g1.length = gqueue_cutoff;
					log1.push('WARN: graphics output too long (>' + gqueue_cutoff + ' commands), cutting off ' + (l1 - gqueue_cutoff) + ' commands');
				}
				if(render_data3.g2.length > gqueue_cutoff){
					let l2 = render_data3.g2.length;
					render_data3.g2.length = gqueue_cutoff;
					log2.push('WARN: graphics output too long (>' + gqueue_cutoff + ' commands), cutting off ' + (l2 - gqueue_cutoff) + ' commands');
				}
				render_data3.c1 = log1;
				render_data3.c2 = log2;
			}
			
			user_error1 = [];
			user_error2 = [];
		
			//tutorial data update
			if (workerData[1] == 'tutorial'){
				render_data3.tutorial.push(tutorial_phase);
			}
		
			render_data3.t = game_duration;
			render_data3.b1 = [bases[0].energy, bases[0].current_spirit_cost, p1_defend, bases[0].hp];
			render_data3.b2 = [bases[1].energy, bases[1].current_spirit_cost, p2_defend, bases[1].hp];
			
			render_data3.ou = [outposts[0].energy, outposts[0].control];
		
			//broadcast to clients
			//console.log(JSON.stringify(render_data2))
			//console.log(render_data2);
			//parentPort.postMessage({data: JSON.stringify(render_data2), game_id: workerData[0], meta: ''});
			//wss.broadcast();
			
			
			update_vm_sandbox();
			
			parentPort.postMessage({data: JSON.stringify(render_data3), game_id: workerData[0], meta: ''});
			
			if (game_duration < 0) {
				return;
			}

			delete render_data3["er1"];
			delete render_data3["er2"];
			delete render_data3["c1"];
			delete render_data3["c2"];
			
			if (workerData[1] != 'tutorial'){
				game_file.push(render_data3);
			}
			

			log1 = [];
			log2 = [];

			let update_no_players = elapsed_ms_from(update_t0);
			await user_code();
			let update_total = elapsed_ms_from(update_t0);

			console.log('TIME: update_state = ' + update_no_players + " (" + update_total + " total)");
			if (update_total > 1000) cancel_game();
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
			global[players['p2'] + q] = new Spirit(players['p2'] + '_' + q, [2820+q*10,1820], 10, 0, players['p2'], colors['player2']);
			spirits2.push(global[players['p2'] + q]);
			top_q = q;
		}
		
		 */
		
		// -- //
		
		
		
		// --- if real --- //
		
		///*
				
		var start_num_spirits = 12;
		var start_num_adjust1 = 0;
		var start_num_adjust2 = 0;
		if (shapes['player1'] == 'squares') start_num_adjust1 = 9;
		if (shapes['player2'] == 'squares') start_num_adjust2 = 9;
		if (shapes['player1'] == 'triangles') start_num_adjust1 = 6;
		if (shapes['player2'] == 'triangles') start_num_adjust2 = 6;

		if(workerData[1] == 'tutorial'){
			start_num_adjust1 = 11;
			start_num_adjust2 = 10;
		}

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
				global[players['p2'] + q] = new Spirit(players['p2'] + '_' + q, [2970-q*20,1780], get_def_size(shapes['player2']), get_def_size(shapes['player2']) * 10, players['p2'], colors['player2'], shapes['player2']);
				spirits2.push(global[players['p2'] + q]);
				top_q = q;
			} else {
				global[players['p2'] + q] = new Spirit(players['p2'] + '_' + q, [2860-q*20,1800], get_def_size(shapes['player2']), get_def_size(shapes['player2']) * 10, players['p2'], colors['player2'], shapes['player2']);
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
	
		star_zxq = new Star('star_zxq', [1000, 1000], 100, 220, 0);
		star_lookup['star_zxq'] = star_zxq;
	
		star_a1c = new Star('star_a1c', [3200, 1400], 100, 220, 0);
		star_lookup['star_a1c'] = star_a1c;
		
		star_p89 = new Star('star_p89', [2000, 1300], 0, 80, 100);
		star_lookup['star_p89'] = star_p89;
		
		outpost_mdo = new Outpost('outpost_mdo', [2200, 1100])
		outpost_lookup['outpost_mdo'] = outpost_mdo;

		structure_lookup['outpost_mdo'] = outpost_mdo;
		structure_lookup['star_zxq'] = star_zxq;
		structure_lookup['star_a1c'] = star_a1c;
		structure_lookup['star_p89'] = star_p89;
		structure_lookup['base_' + players['p1']] = global['base_' + players['p1']];
		structure_lookup['base_' + players['p2']] = global['base_' + players['p2']];
	
		mainLoop();
	}

	async function mainLoop() {
		const t1 = (+new Date());
		await update_state();
		Game.updateOne({game_id: workerData[0]}, {last_update: (+new Date())});
		setTimeout(mainLoop, Math.max(0, game_tick - (+new Date()) + t1));
	}
}


