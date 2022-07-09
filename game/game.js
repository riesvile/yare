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


function color_validity(color, clr_array){
	
	let user_color = color.replace("color", "")
	//if (user_color == 6) user_color = 5;
	//if (user_color == 5) user_color = 6;
	
	if (clr_array.includes(user_color)) return false;
	return false;
	
}

const config = require('../config');
const AWS = require('aws-sdk');
const compress = require('../compress/compress.js');
AWS.config.setPromisesDependency(null);

s3client = new AWS.S3({
	accessKeyId: config.s3.key,
	secretAccessKey: config.s3.secret,
	endpoint: config.s3.endpoint,
	s3ForcePathStyle: !config.s3.bucketEndpoint,
	s3BucketEndpoint: config.s3.bucketEndpoint
});

const pino = require('pino')
let logger; // this is pretty bad but idk any other way 🤷

async function end_game(was_p1 = 0, was_p2 = 0){
	logger.debug('END OF GAME INITIALIZED ------- STEP 1')
	game_finished = 1;
	//logger.debug(game_file);
	var game_data = JSON.stringify(game_file);

	var compressed = compress.compress(game_file);
	//logger.debug(JSON.stringify(game_file));
	
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
	
	logger.debug('END OF GAME INITIALIZED ------- STEP 3')
	
	//to handle client
	end_winner = gameWinner

	await s3client.putObject({
		Body: game_data,
		Bucket: config.s3.bucket,
		Key: workerData[0] + '.json',
	}).promise()
	

	s3client.putObject({
		Body: compressed,
		Bucket: config.s3.bucket,
		Key: 'replays/' + workerData[0] + '.json.comp',
	}).promise().catch(err => logger.error(err)).finally(() => {

		Game.find({game_id: workerData[0]})
			.then(async (result) => {
				logger.debug('END OF GAME INITIALIZED ------- STEP 4')
				var winnerShape;
				if (p2won == 1){
					gameWinner = players['p2'];
					winnerShape = result[0].p2_shape;
					winnerRating = result[0]['p2_rating'];
					gameLoser = players['p1'];
					loserRating = result[0]['p1_rating'];
				
					newWinnerRating = getNewRating(winnerRating, loserRating, 1);
					newLoserRating = getNewRating(loserRating, winnerRating, 0);
					logger.debug('newWinnerRating');
					logger.debug(newWinnerRating);
					logger.debug('newLoserRating');
					logger.debug(newLoserRating);
				} else {
					gameWinner = players['p1'];
					winnerShape = result[0].p1_shape;
					winnerRating = result[0]['p1_rating'];
					gameLoser = players['p2'];
					loserRating = result[0]['p2_rating'];
				
					newWinnerRating = getNewRating(winnerRating, loserRating, 1);
					newLoserRating = getNewRating(loserRating, winnerRating, 0);
					logger.debug('newWinnerRating');
					logger.debug(newWinnerRating);
					logger.debug('newLoserRating');
					logger.debug(newLoserRating);
				}

				if(gameLoser == 'qual-bot') {
					//await User.updateOne({user_id: gameWinner, $or: [{qualified: {$exists: false}}, {qualified: ""}]}, {qualified: workerData[0], qualified_shape: winnerShape}).exec();
				}
			
				logger.debug('result');
				if (result[0]['ranked'] == 0) {
					Game.updateOne({game_id: workerData[0]}, {active: 0, winner: gameWinner, game_history: game_history}, {upsert: true})
						.then((qq) => {
							logger.debug('winner updated to ' + gameWinner);
							setTimeout(function(){
								process.exit(0);
							}, 1000);
						});	
				} else if (result[0]['ranked'] == 1){
				
					Game.updateOne({game_id: workerData[0]}, {active: 0, winner: gameWinner, game_history: game_history}, {upsert: true})
						.then((qq) => {
							logger.debug('winner updated to ' + gameWinner);
							User.updateOne({user_id: gameWinner}, {rating: newWinnerRating}, {upsert: true})
								.then((qq) => {
									logger.debug('winner rating updated');
									User.updateOne({user_id: gameLoser}, {rating: newLoserRating}, {upsert: true})
										.then((qq) => {
											logger.debug('loser rating updated');
											setTimeout(function(){
												process.exit(0);
											}, 1000);
										});	
								});	
						});	
				}
			
			})
			.catch((error) => {
				logger.error(error);
				setTimeout(function(){
					process.exit(0);
				}, 3000);
				//process.exit(0);
			}) 
	});
}




const { parentPort, workerData, isMainThread } = require("worker_threads");


const zlib = require('zlib');

//const LZString = require('LZstring');
const botCodes = require('../bot-codes');
const util = require('util');
const mongoose = require('mongoose');
const {User, Session} = require('../models/users.js');
const Game = require('../models/newgame.js');
const {SourceMapConsumer} = require("source-map")


const dbURI = config.mongo;
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
	.then((result) => logger.info('connected to db'))
	.catch((error) => logger.error(error));


const min_beam = 200;
// histogram square - maximal, s.t. any two points inside are closer <= beam 
const h_square = min_beam / Math.sqrt(2);

function setBotCode(name, sand) {
	if (name == 'medium-bot'){
		sand.setPlayerCode(botCodes['medium-bot']);
	} else if (name == 'will-bot'){
		sand.setPlayerCode(botCodes['will-bot']);
	} else if (name == 'boom-bot'){
		sand.setPlayerCode(botCodes['boom-bot']);
	} else if (name == 'dumb-bot'){
		sand.setPlayerCode(botCodes['dumb-bot']);
	} else if (name == 'hard-bot'){
		sand.setPlayerCode(botCodes['hard-bot']);
	} else if (name == 'andersgee-bot'){
		sand.setPlayerCode(botCodes['andersgee-bot']);
	} else if (name == 'lego-bot'){
		sand.setPlayerCode(botCodes['lego-bot']);
	}
}

//initiate_world
parentPort.on("message", message => {
	logger = pino({
		transport: {
			targets: [
				{ target: "pino-pretty", level: "debug"},
				{ target: "pino/file", options: {destination: `/var/log/game-${workerData[0]}.log`}, level: "trace"},
			]
		},
		level: "trace",
	})
  if (message.data == "initiate world") {
	    if (workerData[1] == 'tutorial'){
			game_duration = 0;
			init_data = {
				'units': [],
				'stars': [],
				'bases': [],
				'outposts': [],
				'pylons': [],
				'fragments': [],
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
				'pylons': [],
				'fragments': [],
				'players': [],
				'colors': [],
				'shapes': [],
			}
	    }
		var all_spirits = living_spirits.length;
		//for (i = 0; i < all_spirits; i++){
		//	init_data.units.push(living_spirits[i]);
		//}

		//for (i = 0; i < stars.length; i++){
		//	init_data.stars.push(stars[i]);
		//}
		
		for (i = 0; i < bases.length; i++){
			init_data.bases.push(bases[i]);
		}
		
		//for (i = 0; i < outposts.length; i++){
		//	init_data.outposts.push(outposts[i]);
		//}
		//
		//for (i = 0; i < pylons.length; i++){
		//	init_data.pylons.push(pylons[i]);
		//}
		//
		//for (i = 0; i < fragments.length; i++){
		//	init_data.fragments.push(fragments[i]);
		//}
		
		init_data.players[0] = players['p1'];
		init_data.players[1] = players['p2'];
		
		init_data.colors[0] = colors['player1'];
		init_data.colors[1] = colors['player2'];
		
		init_data.shapes[0] = shapes['player1'];
		init_data.shapes[1] = shapes['player2'];
		
		if (players_update['p1'] != 'old'){
			init_data.players[0] = players_update['p1'];
		}
		
		parentPort.postMessage({data: JSON.stringify({meta: "initiate", data: init_data}), game_id: workerData[0], meta: 'initiate', client: message.client});
  } else if (message.data == "player code"){
	  //check who's code it is here
	  if (message.pl_num == "player1"){
		  if (message.session_id == player1_session || message.pl_id == 'anonymous'){
			  player1_code = message.pl_code;
			  sand1.setPlayerCode(message.pl_code);
			if (message.resigning == 1){
				logger.info(message.pl_id + 'is resigning !!!!!!!!!!!');
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
							logger.info(message.pl_id + 'is resigning !!!!!!!!!!!');
							end_game(0, 1);
						}
		  			} else { 
		  				parentPort.postMessage({data: 'session_id mismatch', meta: 'test'});
		  			}
				}
			})
			.catch((error) => {
				logger.error(error);
			}) 
		  }
		  
	  } else if (message.pl_num == "player2"){
		  if (message.session_id == player2_session || message.pl_id == 'anonymous'){
			  player2_code = message.pl_code;
			  sand2.setPlayerCode(message.pl_code);
			if (message.resigning == 1){
				logger.info(message.pl_id + 'is resigning !!!!!!!!!!!');
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
						  logger.info(message.pl_id + 'is resigning !!!!!!!!!!!');
						  end_game(1, 0);
					  }
					} else { 
						parentPort.postMessage({data: 'session_id mismatch', meta: 'test'});
					}
			  	}
			})
			.catch((error) => {
				logger.error(error);
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

			setBotCode(result[0].player1, sand1);

			setBotCode(result[0].player2, sand2);

			logger.debug('starting rating update');
			User.find({user_id: {$in: [players['p1'], players['p2']]}})
				.then((results) => {
					updates = {};
					for(var rp of results) {
						if(rp.user_id == players['p1']){
							updates.p1_rating = rp.rating;
						}
						if(rp.user_id == players['p2']){
							updates.p2_rating = rp.rating;
						}
					}
					Game.updateOne({game_id: workerData[0]}, updates, {upsert: true})
						.then((qq) => {
							logger.debug('p1 and p2 ratings updated');
						});	
					
				})
				.catch((error) => {
					logger.error(error);
				})
			
				
		})
  		.catch((error) => {
  			logger.error(error);
  		}) 
  } else if (message.data == "update anonymous"){
  	  players_update['p1'] = message.player1;
  } else if (message.data == "channel"){
	  if(message.user_id == players['p1']){
		  sand1.channel(message.channel, message.chan_data);
	  } else if(message.user_id == players['p2']){
		  sand2.channel(message.channel, message.chan_data);
	  }
  }
});

function to_html(txt){
	return txt.replace(/\n/g,'<br>').replace(/ /g,'&nbsp;');
}

async function clean_error(error, sourcemap){
	if(!(error instanceof Error)) {
		return String(error);
	}
	let message = "" + error;
	
	let stack = error.stack.split("\n");

	stack = stack.filter(l => /~sandbox/.test(l));
	if (sourcemap !== null) {
		stack = await Promise.all(stack.map(async l => {
			let coords = l.match(/\d+:\d+/)[0].split(":");
			let line = +coords[0];
			let col = +coords[1];

			let base64SourceMap = sourcemap.split(/^data:(application|text)\/json;base64,/)[2]

			let textSourceMap = Buffer.from(base64SourceMap, 'base64').toString('ascii');

			let rawSourceMap = JSON.parse(textSourceMap)
	
			let originalPosition = await SourceMapConsumer.with(rawSourceMap, null, consumer => {
				return consumer.originalPositionFor({
					line: line,
					column: col
				})
			})
			return l.replace(/\d+:\d+/, `${originalPosition.line}:${originalPosition.column}`)
		}))
	}
	
	message += "\n" + stack.join("\n");

	return message;
}

async function handle_error(error, player, code){
	let sourcemap = code.split("//# sourceMappingURL=").reverse()[0].trim();
	if (!(/^data:(application|text)\/json;base64,/.test(sourcemap))) {
		sourcemap = null
	}
	message = await clean_error(error, sourcemap);

	fill_error(player, to_html(message));
}

async function user_code(){
	if (workerData[1] == 'tutorial'){
		//logger.debug(player1_code);
		var helper_count = (player1_code.match(/my_spirits/g) || []).length;
		//logger.debug('my_spirits count');
		//logger.debug(helper_count);
		
		if (helper_count > 0){
			tutorial_flag1 = 1;
		}
	}
	
	all_commands = {};

	//
	// Start both players' code to take advantage of isolate parallelism
	//
	let p1_async = sand1.run();
	let p2_async = sand2.run();

	//
	// first player
	//
	
	let player = players['p1'];
	try {
		let run_err = null;
		try {
			await p1_async;
		} catch (error) {
			run_err = error;
		}

		let out = await sand1.output();
		all_commands[player] = out.commands;
		log1 = out.logs;
		user_error1 = out.errors.map(clean_error);
		chan1 = out.channels;

		// log compile err first, as that corresponds to the latest
		// user submitted code
		if(sand1.last_compile_err){
			fill_error(player, to_html(sand1.last_compile_err));
		}
		if(run_err) {
			handle_error(run_err, player, sand1.currentCode);
		}
	} catch (error){
		logger.error("error getting output p1" + error);
		handle_error(error, player, sand1.currentCode);
	}

	//
	// second player
	//

	
	player = players['p2'];
	try {
		let run_err = null;
		try {
			await p2_async;
		} catch (error) {
			run_err = error;
		}

		let out = await sand2.output();
		all_commands[player] = out.commands;
		log2 = out.logs;
		user_error2 = out.errors.map(clean_error);
		chan2 = out.channels;

		if(sand2.last_compile_err){
			fill_error(player, to_html(sand2.last_compile_err));
		}
		if(run_err) {
			handle_error(run_err, player, sand2.currentCode);
		}
	} catch (error){
		logger.error("error getting output p2" + error);
		handle_error(error, player, sand2.currentCode);
	}
}

//global
var started = 0;
var game_tick = 500; //
var base_speed = 20;
var stars = [];
var bases = [];
var outposts = [];
var pylons = [];
var fragments = [];
var living_spirits = [];
var spirit_lookup = {};
var star_lookup = {};
var base_lookup = {};
var outpost_lookup = {};
var pylon_lookup = {};
var structure_lookup = {};
var spirits = [];
var spirits2 = [];


var all_commands = {};

var birth_queue = [];
var death_queue = [];
var star_zxq;
var star_a2c;
var star_p89;
var star_nua;
var outpost_mdo;
var pylon_u3p;
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
	//var shape = shapes["player" + p_num];
	//if (shape == 'circles'){
	//	if (alives <= 50) bases[p_num-1].current_spirit_cost = 25;
	//	if (alives > 50) bases[p_num-1].current_spirit_cost = 50;
	//	if (alives > 100) bases[p_num-1].current_spirit_cost = 90;
	//	if (alives > 200) bases[p_num-1].current_spirit_cost = 150;
	//	if (alives > 500) bases[p_num-1].current_spirit_cost = 1000;
	//} else if (shape == 'squares'){
	//	if (alives <= 10) bases[p_num-1].current_spirit_cost = 360;
	//	if (alives > 10) bases[p_num-1].current_spirit_cost = 500;
	//	if (alives > 16) bases[p_num-1].current_spirit_cost = 700;
	//	if (alives > 400) bases[p_num-1].current_spirit_cost = 1100;
	//} else if (shape == 'triangles'){
	//	if (alives <= 30) bases[p_num-1].current_spirit_cost = 90;
	//	if (alives > 30) bases[p_num-1].current_spirit_cost = 160;
	//	if (alives > 120) bases[p_num-1].current_spirit_cost = 300;
	//	if (alives > 300) bases[p_num-1].current_spirit_cost = 1000;
	//}
	
	
	let shape = shapes["player" + p_num];
	for (let b = 0; b < bases.length; b++){
		if (bases[b].control != players["p" + p_num]) continue;
		if (shape == 'circles'){
			if (alives <= 50) bases[b].current_spirit_cost = 25;
			if (alives > 50) bases[b].current_spirit_cost = 50;
			if (alives > 100) bases[b].current_spirit_cost = 90;
			if (alives > 200) bases[b].current_spirit_cost = 150;
			if (alives > 500) bases[b].current_spirit_cost = 1000;
		} else if (shape == 'squares'){
			if (alives <= 10) bases[b].current_spirit_cost = 360;
			if (alives > 10) bases[b].current_spirit_cost = 500;
			if (alives > 16) bases[b].current_spirit_cost = 700;
			if (alives > 400) bases[b].current_spirit_cost = 1100;
		} else if (shape == 'triangles'){
			if (alives <= 30) bases[b].current_spirit_cost = 90;
			if (alives > 30) bases[b].current_spirit_cost = 160;
			if (alives > 120) bases[b].current_spirit_cost = 300;
			if (alives > 300) bases[b].current_spirit_cost = 1000;
		}
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

var game_duration = 0;
var waiting_time = 500;
var game_activity = 1;
var qqmonitoring = [0, 0, 0, 0, 0, 0, 0, 0];

var colors = {};
var shapes = {};
colors['player1'] = "rgba(255, 0, 0, 1)";
colors['player2'] = "rgba(0, 100, 255, 1)";
colors['neutral'] = "rgba(160, 168, 180, 1)";
var color_palettes = {};
color_palettes['color1'] = 'rgba(128,140,255,1)';
color_palettes['color2'] = 'rgba(232,97,97,1)';
color_palettes['color3'] = 'rgba(58,197,240,1)';
color_palettes['color4'] = 'rgba(201,161,101,1)';
color_palettes['color5'] = 'rgba(120,12,196,1)';
color_palettes['color6'] = 'rgba(148, 176, 108, 1)';

color_palettes['color7'] = 'rgba(180, 27, 227, 1)';
color_palettes['color8'] = 'rgba(198, 166, 224, 1)';
color_palettes['color9'] = 'rgba(138, 228, 122, 1)';
color_palettes['color10'] = 'rgba(232, 198, 179, 1)';
color_palettes['color11'] = 'rgba(78, 142, 250, 1)';
color_palettes['color12'] = 'rgba(240, 70, 60, 1)';

color_palettes['color13'] = 'rgba(18, 255, 248, 1)';
color_palettes['color14'] = 'rgba(235, 93, 0, 1)';
color_palettes['color15'] = 'rgba(212, 212, 212, 1)';




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

//var console1 = console;
//var console2 = console;

var log1 = [];
var log2 = [];

var chan1 = [];
var chan2 = [];

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
};

var init_data = {
	'units': [],
	'stars': [],
	'bases': [],
	'outposts': [],
	'pylons': [],
	'fragments': []
}

var memory1 = {a: 150};
var memory2 = {a: 155};

const {VM} = require('vm2');
const ivm = require('isolated-vm');
const fs = require('fs');
const addons = require('../addons');

function cutoff_log(log, cutoff){
	if(log.length > cutoff){
		let l1 = log.length;
		log.length = cutoff;
		log.push('WARN: output too long (>' + cutoff + ' lines), cutting off ' + (l1 - cutoff) + ' lines of log');
	}
	return log;
}

function push_chan(chan, name, data){
	if(chan[name] == undefined){
		chan[name] = [];
	}
	chan[name].push(data);
}

function fill_error(plid, err_msg){
	if (plid == players['p1']){
		push_chan(chan1, 'err', err_msg);
	} else if (plid == players['p2']){
		push_chan(chan2, 'err', err_msg);
	}
}

function jump_danger_zone(loc){
	if (Math.abs(stars[0].position[0] - loc[0]) < 100 && Math.abs(stars[0].position[1] - loc[1]) < 100
 	 || Math.abs(stars[1].position[0] - loc[0]) < 100 && Math.abs(stars[1].position[1] - loc[1]) < 100
	 || Math.abs(stars[2].position[0] - loc[0]) < 100 && Math.abs(stars[2].position[1] - loc[1]) < 100
	 || Math.abs(stars[3].position[0] - loc[0]) < 100 && Math.abs(stars[3].position[1] - loc[1]) < 100
	 || Math.abs(bases[0].position[0] - loc[0]) < 50 && Math.abs(bases[0].position[1] - loc[1]) < 50
	 || Math.abs(bases[1].position[0] - loc[0]) < 50 && Math.abs(bases[1].position[1] - loc[1]) < 50
	 || Math.abs(bases[2].position[0] - loc[0]) < 50 && Math.abs(bases[2].position[1] - loc[1]) < 50
	 || Math.abs(bases[3].position[0] - loc[0]) < 50 && Math.abs(bases[3].position[1] - loc[1]) < 50
	 || Math.abs(outposts[0].position[0] - loc[0]) < 50 && Math.abs(outposts[0].position[1] - loc[1]) < 50
	 || Math.abs(pylons[0].position[0] - loc[0]) < 50 && Math.abs(pylons[0].position[1] - loc[1]) < 50){
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
		this.currentCode = ""
		this.successful_compile = false;
		this.jail.setSync("global", this.jail.derefInto());
		this.jail.setSync("memory", {}, {copy: true});
		this.jail.setSync("client", {}, {copy: true});
		this.jail.setSync("server", {}, {copy: true});

		this.yd = this.context.evalClosureSync(sandboxCode, [], {result: {reference: true}});

		this.funcs = {};
		this.funcs.loadData = this.yd.getSync('loadData', {reference: true});
		this.funcs.getOutput = this.yd.getSync('getOutput', {reference: true});
		this.funcs.channel_in = this.yd.getSync('channel_in', {reference: true});
		this.err = false;
		this.last_compile_err = null;
	}

	loadAddons(names) {
		for(let name of names){
			this.context.evalClosureSync(addons.get(name), [], {result: {reference: true}});
		}
	}

	channel(name, data) {
		try {
			this.funcs.channel_in.applySync(this.yd.derefInto(), [name, data], {arguments: {copy: true}});
		} catch(e) {
			logger.error(e);
		}
	}

	setPlayerCode(code) {
		this.last_compile_err = null;
		try {
			this.currentCode = code
			this.script = this.isolate.compileScriptSync(code, {filename: "~sandbox/user.js"});
			this.successful_compile = true;
		}catch(err) {
			this.last_compile_err = "Submitted code has a compile error:\n    " + err.message;
			if(this.successful_compile)
				this.last_compile_err += "\nRunning Your previous valid code instead!!!\n"
		}
	}

	init(player_id) {
		this.yd.getSync('init', {reference: true}).applySync(this.yd.derefInto(), [player_id], {arguments: {copy: true}});
	}


	async loadData() {
		this.funcs.loadData.apply(this.yd.derefInto(), [{tick: ticks['now'], ttick: 't' + ticks['now'], spirits: rawSpirits, fragments: fragments, stars: JSON.parse(JSON.stringify(star_lookup)), bases: JSON.parse(JSON.stringify(base_lookup)), outposts: JSON.parse(JSON.stringify(outpost_lookup)), pylons: JSON.parse(JSON.stringify(pylon_lookup)), players: JSON.parse(JSON.stringify(players))}], {arguments: {copy: true}, result: {reference: true}});
	}

	async run() {
		try {
			await this.loadData();
			let pre = this.isolate.cpuTime;
			await this.script.run(this.context, {timeout: 220});
			let post = this.isolate.cpuTime;
			logger.debug("sandbox run in " + ((post - pre) / 1000000n).toString() + " ms");
		} catch (e) {
			console.log(e);
		}
		
	}

	async output() {
		return this.funcs.getOutput.apply(this.yd.derefInto(), [], {result: {copy: true}});
	}
}

var sand1 = new Sandbox();

sand1.loadAddons(['graphics.js', 'console.js']);

var sand2 = new Sandbox();

sand2.loadAddons(['graphics.js', 'console.js']);

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
			this.locked = false;
			this.range = min_beam;
		
			this.sight = {
				friends: [],
				enemies: [],
				structures: [],
				fragments: []
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
			this.energy_capacity = this.size * 10;
			this.last_energized = '';
			this.active_in = 0;
			this.active_at = active_at;
			this.regeneration = 2;
			if (id == 'star_nua') this.regeneration = 3;
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
	
	class Pylon {
		constructor(id, position){
			this.id = id
			this.position = position;
			this.size = 20;
			this.control = '';
			this.range = 400;
			this.structure_type = 'pylon';
			this.energy = 0;
			this.energy_capacity = 1000;
			this.range_min = 200;
			this.range_max = 400;
			//this.energy = energy;
			this.collision_radius = 50;
			
			this.sight = {
				friends: []
			}
		
			pylons.push(this);
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
			this.spirit_costs = [];
			
			//this.hp = 8;
			if (this.shape == 'circles'){
				this.energy_capacity = 400;
				this.spirit_costs = [[1, 25], [51, 50], [101, 90], [201, 150]];
			} else if (this.shape == 'squares'){
				this.energy_capacity = 1000;
				this.spirit_costs = [[1, 350], [11, 500], [17, 700]];
			} else if (this.shape == 'triangles'){
				this.energy_capacity = 600;
				this.spirit_costs = [[1, 90], [31, 160], [121, 300]];
			} else {
				this.energy_capacity = 100;
				this.spirit_costs = [];
			}
			
			this.player_id = player;
			this.control = player;
			this.color = color;
			//this.energy = energy;
			
			this.current_spirit_cost = 100;
		
			bases.push(this);
		}
	}

	function initiate_world(ws){
		logger.debug(init_data);
		ws.send(JSON.stringify(init_data));
	}

	function dist_sq(item1, item2){
		return ((item2[0]-item1[0])**2) + ((item2[1]-item1[1])**2);
	}

	function fast_dist_lt(item1, item2, range){
		return ((item2[0]-item1[0])**2) + ((item2[1]-item1[1])**2) < range**2;
	}

	function fast_dist_leq(item1, item2, range){
		return ((item2[0]-item1[0])**2) + ((item2[1]-item1[1])**2) <= range**2;
	}
	
	function fast_dist_simp(item1, item2, range){
		return ((Math.abs(item1[0] - item2[0]) <= range) && (Math.abs(item1[1] - item2[1]) <= range))
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
		const low_range_sq = (250)**2;
		const high_range_sq = (600)**2;
		const pylon_range_sq = (400)**2;
		const living_length = living_spirits.length;

		for (let h = 0; h < living_length; h++){
		  living_spirits[h].sight = {
				friends_beamable: [],
				enemies_beamable: [],
				friends: [],
				enemies: [],
				structures: [],
			    fragments: []
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
		for (let p = 0; p < pylons.length; p++){
  		  	pylons[p].sight = {
  				friends: []
		    }
		}

		function work(i, j){
			//logger.debug('work ' + living_spirits[i].id + " " + living_spirits[j].id)
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
				if(dsq <= visible_sq){
					let friend = bases[b].control == spirit.player_id;

					if (friend){
						bases[b].sight.friends.push(spirit.id);
					} else {
						bases[b].sight.enemies.push(spirit.id);
					}

					if (dsq <= beamable_sq){
						if (friend){
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
				
				if (dsq <= use_range){
					let friend = outpost.control == spirit.player_id;
					if (friend){
						//outposts[o].sight.friends.push(spirit.id);
					}else{
						outposts[o].sight.enemies.push(spirit.id);
					}

					if (dsq <= beamable_sq){
						spirit.sight.structures.push(outpost.id);
					}
				}
			}
			
			//pylons
			for (let p = 0; p < pylons.length; p++){
				let pylon = pylons[p];
				let use_range = pylon_range_sq;
				let dsq = dist_sq(spirit.position, pylon.position);
				//let dsqq = is_in_sight(spirit, pylon)
				
				//if (outpost.energy >= 500) use_range = high_range_sq;
				
				if (dsq <= use_range){
					let friend = pylon.control == spirit.player_id;
					if (friend){
						pylons[p].sight.friends.push(spirit.id);
					}else{
						//pylons[p].sight.enemies.push(spirit.id);
					}

					if (dsq <= beamable_sq){
						spirit.sight.structures.push(pylon.id);
					}
				}
			}
			
			//fragments
			for (let f = 0; f < fragments.length; f++){
				if (is_in_sight(spirit, fragments[f])){
					spirit.sight.fragments.push(fragments[f]);
				}
			}
			
			//fragments
			//for (let f = 0; f < fragments.length; f++){
			//	let fragment = fragments[f];
			//	let use_range = visible_sq;
			//	let dsq = dist_sq(spirit.position, fragment.position)
			//	
			//	if (dsq <= use_range){
			//		let friend = pylon.control == spirit.player_id;
			//		if (friend){
			//			pylons[p].sight.friends.push(spirit.id);
			//		}else{
			//			//pylons[p].sight.enemies.push(spirit.id);
			//		}
            //
			//		if (dsq <= beamable_sq){
			//			spirit.sight.fragments.push(fragment);
			//		}
			//	}
			//	
			//}
			
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

				//logger.debug("NB BIN: "+(bin[0][0]+dx)+ " " +(bin[0][1]+dy));
				// O(N^2) part
				for(let i = 1; i <bin.length;i++){
					for(let j = 1; j <nb.length;j++){
						let dsq = dist_sq(
							living_spirits[bin[i]].position,
							living_spirits[nb[j]].position,
						);
						if(dsq <= visible_sq)
							work(bin[i],nb[j]);
						if(dsq <= beamable_sq)
							work_beamable(bin[i],nb[j]);
					}
				}
			}
		});

		//base set defend flag
		for (let m = 0; m < bases.length; m++){
			// convert bool to number
			let trouble = 0 + (bases[m].sight.enemies.length > 0);

			if (bases[m].control == players['p1']){
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
				structures: [],
			    fragments: []
		  }
		  living_spirits[h].qcollisions = [];
			
		}
	
		//spirits root (it's longer than you think)
		for (i = 0; i < living_length; i++){
			for (j = i+1; j < living_length; j++){
				if (living_spirits[j].hp == 0) continue;
				//logger.debug(i + ', ' + j);
				if (is_in_sight(living_spirits[i], living_spirits[j])){
					//maybe add distance stuff later
					//distance_approx = distance_nonrooted(living_spirits[i].position, living_spirits[j].position);
					//logger.debug('distance between ' + living_spirits[i].id + ' and ' + living_spirits[j].id + 'is ' + distance_approx);
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
			
			//pylons
			for (p = 0; p < pylons.length; p++){
				if (is_in_sight(living_spirits[i], pylons[p])){
					living_spirits[i].sight.structures.push(pylons[p].id);
				}
			}
			
			//fragments
			for (f = 0; f < fragments.length; f++){
				if (is_in_sight(living_spirits[i], fragments[f])){
					living_spirits[i].sight.fragments.push(fragments[f]);
				}
			}
			
			
			//logger.debug('living_spirits[i].qcollisions');
			//logger.debug(living_spirits[i].qcollisions);
			
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
					//logger.debug(bases[m].id + ' controlled by ' + bases[m].control);
					if (bases[m].control == players['p1']){
						if (living_spirits[n].player_id == players['p1']){
							bases[m].sight.friends.push(living_spirits[n].id);
						} else {
							bases[m].sight.enemies.push(living_spirits[n].id);
						}
					} else if (bases[m].control == players['p2']){
						if (living_spirits[n].player_id == players['p1']){
							bases[m].sight.enemies.push(living_spirits[n].id);
						} else {
							bases[m].sight.friends.push(living_spirits[n].id);
						}
					} else {
						bases[m].sight.enemies.push(living_spirits[n].id);
					}
				}
			}
			
			//if (bases[m].sight.enemies.length > 0){
			//	if (bases[m].control == players['p1']){
			//		p1_defend = 1;
			//	} else {
			//		p2_defend = 1;
			//	}
			//} else {
			//	if (bases[m].control == players['p1']){
			//		p1_defend = 0;
			//	} else {
			//		p2_defend = 0;
			//	}
		    //}
			
		}
	
	}


	function resolve_collision(){
	
	}

	function jitter(scale){
		return 2 * (Math.random() - 0.5) * scale;
	}

	function progress_tut(phase_done, log=false){
		if(log)
		logger.debug('tutorial phase ' + phase_done +' done');
		let i = phase_done - 1;

		try {
			tutorial_phase[i] = 1;
			if (qqmonitoring[i] == 0){
				qqmonitoring[i] = 1;
				parentPort.postMessage({data: i+1, game_id: workerData[0], meta: 'monitoring'});
			}
		} catch (error){
			logger.error('ERROR progress tutorial error, phase_done = ' + phase_done);
			logger.error(error);
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
					logger.info("WTF: null or possible hack: player " + player + 
						" calls "  + id + ".move()");
					return;
				}

				const spirit = spirit_lookup[id];
				if (spirit.hp == 0)
					return;
				if(spirit.locked) return;
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
						//logger.debug(' ------------------------------- structure potential collisions');
						//logger.debug(potential_structure_collisions[k]);
						
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
		let energize_apply_fragment = [];
		let energize_apply_outpost = [];
		let energize_apply_base = [];
		let energize_apply_pylon = [];
		let low_range_sq = (200)**2;
		
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
				//logger.debug(spirit + ' is about to explode');
				let explodee = spirit_lookup[spirit];
				for (let j = 0; j < explodee.sight.enemies_beamable.length; j++){
					let potential_target = spirit_lookup[explodee.sight.enemies_beamable[j]];
					//logger.debug('boom check = ' + fast_dist_lt(explodee.position, potential_target.position, 100));
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
			let enemy = spirit_lookup[enemies[Math.floor(enemies.length * Math.random())]];
			
			energize_apply.push([enemy, -2 * beam_strength]);
			outpost.energy -= beam_strength;
			render_data3.e.push([outpost.id, enemy.id, 2 * beam_strength]);
		}
		
		for (let p = 0; p < pylons.length; p++){
			let pylon = pylons[p];
			let friends = pylons[p].sight.friends;
			let friends_damaged = [];
			let friends_final = [];
			if (friends.length == 0 || pylon.control == '')
				continue;
			
			for (let f = 0; f < friends.length; f++){
				let friend_real = spirit_lookup[friends[f]];
				if (friend_real.energy < (friend_real.energy_capacity)){
					if (dist_sq(friend_real.position, pylon.position) > low_range_sq) friends_final.push(friend_real);
				}
				
			}
			
			let beam_strength = 1;
			let targets = pylon.energy;
			if (friends_final.length < pylon.energy) targets = friends_final.length;
			
			//TODO: order friends array by energy from lowest to highest
			
			for (let t = 0; t < targets; t++){
				energize_apply.push([friends_final[t], 1 * beam_strength]);
				pylon.energy -= beam_strength;
				render_data3.e.push([pylon.id, friends_final[t].id, 1 * beam_strength]);
			}
			 
		}

		let last_beam = {};
		for (let player in all_commands){
			let queue = all_commands[player].spirit;

			Object.keys(queue).forEach((from_id) => {
				let temp_target_id = [];
				
				if (from_id == 'merge') return;
				
				//if ()
				
				const to_id = queue[from_id].energize;

				if(!to_id){
					//logger.debug('thisss happened');
					return;
				} 
				if(!from_id || !player_owns_spirit(from_id, player) || !to_id){
					logger.info("WTF: null or possible hack player " + player + 
						" calls "  + from_id + ".energize(" + to_id+")");
					return;
				}

				if(last_beam[from_id] != undefined)
					return;
				last_beam[from_id] = to_id;
				
				const from_obj = spirit_lookup[from_id] || structure_lookup[from_id];
				var to_obj;
				
				if (Array.isArray(to_id) && to_id.length == 2){
					logger.debug('to_id is a position array !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
					to_obj = to_id;
				} else {
					to_obj = spirit_lookup[to_id] || structure_lookup[to_id];
				}
				
				
				//logger.debug('from_obj.id = ' + from_obj.id);
				//logger.debug('to_obj.id = ' + to_obj.id);

				if(!from_obj || !to_obj || from_obj.hp == 0 || to_obj.hp == 0){
					logger.debug('tthis happened');
					return;
				}
				
				//logger.debug('from_obj.id = ' + from_obj.id);
				//logger.debug('to_obj.id = ' + to_obj.id);

				// harvest star or fragment (prioritize fragment)
				if (from_id == to_id){
					
					let is_harving = 0;
					
					for (let f = 0; f < from_obj.sight.fragments.length; f++){
						let fragment = from_obj.sight.fragments[f];
						let fragment_close = fast_dist_leq(from_obj.position, fragment.position, from_obj.range);
						if (!fragment_close) continue;
						
						from_obj.last_energized = to_id;
						energize_apply_fragment.push([from_obj, energy_value * from_obj.size, fragment]);
						is_harving = 1;
					}
					
					if (is_harving == 1) return;
					
					for (let j = 0; j < from_obj.sight.structures.length; j++){
						//logger.debug('ilook here');
						let struc_name = from_obj.sight.structures[j];

						// name prefix - safe (is structure)
						if (!struc_name.startsWith('star'))
							continue;

						let star = structure_lookup[struc_name];
						let star_close = fast_dist_leq(from_obj.position, star.position, from_obj.range);
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
				
				//logger.debug('to_obj is ' + to_obj);
				
				let to_check = to_obj.position;
				if (Array.isArray(to_obj)) to_check = to_obj;

				let target_close = fast_dist_leq(from_obj.position, to_check, from_obj.range);
				if(! target_close){
					//logger.debug('target not close enough');
					return;
				}
					

				let beam_strength = Math.min(energy_value * from_obj.size, from_obj.energy);
				if(beam_strength <= 0)
					return;

				from_obj.last_energized = to_id;

				let friendly_beam = from_obj.player_id == to_obj.player_id;
				let is_star = (to_obj.structure_type != undefined && to_obj.structure_type == 'star');
				let is_fragment = Array.isArray(to_id);
				
				
				//fragment first
				if (is_fragment){
					energize_apply.push([from_obj, -beam_strength]);
					energize_apply.push([to_obj, beam_strength]);
					render_data3.e.push([from_id, to_id, beam_strength]);
				}
				// name prefix - safe (is outpost)
				else if (to_obj.id.startsWith('outpost') && outpost_lookup[to_id]){
					energize_apply.push([from_obj, -beam_strength]);
					energize_apply_outpost.push([from_obj, beam_strength, to_obj]);
					render_data3.e.push([from_id, to_id, beam_strength]);
				} 
				else if (to_obj.id.startsWith('base') && base_lookup[to_id]){
					//logger.debug('energizing base---------------------------');
					energize_apply.push([from_obj, -beam_strength]);
					energize_apply_base.push([from_obj, beam_strength, to_obj]);
					render_data3.e.push([from_id, to_id, beam_strength]);
				} 
				// name prefix - safe (is pylon)
				else if (to_obj.id.startsWith('pylon') && pylon_lookup[to_id]){
					energize_apply.push([from_obj, -beam_strength]);
					energize_apply_pylon.push([from_obj, beam_strength, to_obj]);
					render_data3.e.push([from_id, to_id, beam_strength]);
				}
				else if (!friendly_beam){
					if (is_star){
						energize_apply.push([from_obj, -beam_strength]);
						energize_apply.push([to_obj, beam_strength]);
						render_data3.e.push([from_id, to_id, beam_strength]);
					} else {
						energize_apply.push([from_obj, -beam_strength]);
						energize_apply.push([to_obj, -2 * beam_strength]);
						render_data3.e.push([from_id, to_id, 2 * beam_strength]);
					}
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
			let is_fragment = (Array.isArray(target) && target.length == 2);
			let amount = energize_apply[i][1];
			
			if (is_fragment){
				logger.debug('energizing fragmentTTTTTT!!!!!!!!!!');
				let new_frag = 1;
				let frag_target = {
					'position': target,
					'energy': 0
				};
				for (let f = 0; f < fragments.length; f++){
					if (fast_dist_simp(target, fragments[f].position, 10)){
						frag_target = fragments[f];
						new_frag = 0;
						break;
					}
				}
				
				frag_target.energy += amount;
				
				if (new_frag) fragments.push(frag_target);
				
			} else {
				target.energy += amount;

				if(!applied_to[target.id]){
					applied_to[target.id] = true;
					check.push(target);
				}
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
		// harvest fragment
		for (let i = energize_apply_fragment.length - 1; i >= 0; i--){
			let spirit = energize_apply_fragment[i][0];
			let amount = energize_apply_fragment[i][1];
			let fragment = energize_apply_fragment[i][2];

			let can_harvest = Math.min(amount, fragment.energy);
			if (can_harvest <= 0) continue;

			// 
			
			let to_full_capacity = Math.max(0, spirit.energy_capacity - spirit.energy);
			let actually_harvested = Math.min(can_harvest, to_full_capacity);

			spirit.energy += actually_harvested;
			fragment.energy -= actually_harvested;
			render_data3.e.push([fragment.position, spirit.id, actually_harvested]);

			if(!applied_to[spirit.id]){
				applied_to[spirit.id] = true;
				check.push(spirit);
			}
		}
		
		// harvest star
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
				
				//if (target.structure_type == 'base' && target.hp > 1){
				//	target.hp--;
				//	target.energy = 0;
				//	continue;
				//}
				
				//if (target.structure_type == 'outpost' || target.structure_type == 'pylon'){
				//	continue;
				//}
				
				death_queue.push(target);

				if (target.structure_type == 'base' && game_finished != 1){
					
					//logger.debug('find out whether player controls any other structures - otherwise end the game')
					
					//game_finished = 1;
					//logger.debug(target.player_id + ' lost');
                    //
					//let p2won = target.player_id == players['p1'] ? 1 : 0;
					//end_game(1 - p2won, p2won);
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

			if (spirit.player_id == players['p1']){
				if (incoming_p1[outpost.id] == undefined) incoming_p1[outpost.id] = 0;
				incoming_p1[outpost.id] += amount;
			} else {
				if (incoming_p2[outpost.id] == undefined) incoming_p2[outpost.id] = 0;
				incoming_p2[outpost.id] += amount;
			}
		}
		
		for (let i = 0; i < outposts.length; i++){
			let outpost = outposts[i];

			let from_p1 = incoming_p1[outpost.id] || 0;
			let from_p2 = incoming_p2[outpost.id] || 0;

			if (outpost.control == ''){
				// the case where from_p1 == from_p2 will have 0 energy and control '' set below
				outpost.control = (from_p1 > from_p2) ? players['p1'] : players['p2'];
				outpost.energy = Math.abs(from_p1 - from_p2);
			} else {
				let from_me = (outpost.control == players['p1']) ? from_p1 : from_p2;
				let from_enemy = (outpost.control == players['p1']) ? from_p2 : from_p1;

				outpost.energy += from_me;
				outpost.energy -= 2 * from_enemy;
			}

			if (outpost.energy <= 0){
				outpost.control = '';
				check_structure_control();
			}
				
			outpost.energy = Math.max(0, Math.min(outpost.energy, outpost.energy_capacity));
			outpost.range = outpost.energy <= 500 ? 400 : 600;
		}
		
		//-- same for pylon
		
		for (let i = energize_apply_pylon.length - 1; i >= 0; i--){
			let spirit = energize_apply_pylon[i][0];
			let amount = energize_apply_pylon[i][1];
			let pylon = energize_apply_pylon[i][2];
        
			if (spirit.player_id == players['p1']){
				if(incoming_p1[pylon.id] == undefined)
					incoming_p1[pylon.id] = 0;
				incoming_p1[pylon.id] += amount;
				//logger.debug('incoming amount 1 = ' + incoming_p1[pylon.id]);
			} else {
				if(incoming_p2[pylon.id] == undefined)
					incoming_p2[pylon.id] = 0;
				incoming_p2[pylon.id] += amount;
				//logger.debug('incoming amount 2 = ' + incoming_p2[pylon.id]);
			}
		}
		
		for (let i = 0; i < pylons.length; i++){
			let pylon = pylons[i];
        
			let from_p1_pylon = incoming_p1[pylon.id] || 0;
			let from_p2_pylon = incoming_p2[pylon.id] || 0;
        
			if(pylon.control == ''){
				// the case where from_p1 == from_p2 will have 0 energy and control '' set below
				pylon.control = (from_p1_pylon > from_p2_pylon) ? players['p1'] : players['p2'];
				pylon.energy = Math.abs(from_p1_pylon - from_p2_pylon);
			} else{
				let from_me_pylon = (pylon.control == players['p1']) ? from_p1_pylon : from_p2_pylon;
				let from_enemy_pylon = (pylon.control == players['p1']) ? from_p2_pylon : from_p1_pylon;
        
				pylon.energy += from_me_pylon;
				pylon.energy -= 2 * from_enemy_pylon;
			}
        
			if (pylon.energy <= 0){
				pylon.control = '';
				check_structure_control();
			}
				
			pylon.energy = Math.max(0, Math.min(pylon.energy, pylon.energy_capacity));
			//pylon.range = pylon.energy <= 500 ? 400 : 600;
		}
		
		
		// similar for bases
		
		for (let i = energize_apply_base.length - 1; i >= 0; i--){
			let spirit = energize_apply_base[i][0];
			let amount = energize_apply_base[i][1];
			let base = energize_apply_base[i][2];

			if (spirit.player_id == players['p1']){
				if (incoming_p1[base.id] == undefined) incoming_p1[base.id] = 0;
				incoming_p1[base.id] += amount;
			} else {
				if (incoming_p2[base.id] == undefined) incoming_p2[base.id] = 0;
				incoming_p2[base.id] += amount;
			}
		}
		
		for (let i = 0; i < bases.length; i++){
			let base = bases[i];

			let from_p1 = incoming_p1[base.id] || 0;
			let from_p2 = incoming_p2[base.id] || 0;
			
			if (from_p1 == 0 && from_p2 == 0) continue;

			if (base.control == ''){
				// the case where from_p1 == from_p2 will have 0 energy and control '' set below
				if (from_p1 - from_p2 != 0){
					base.control = (from_p1 > from_p2) ? players['p1'] : players['p2'];
					let owner_shape = shapes['player1'];
					if (players['p2'] == base.control) owner_shape = shapes['player2'];
					base.shape = owner_shape;
					
					if (owner_shape == 'circles') base.energy_capacity = 400;
					if (owner_shape == 'squares') base.energy_capacity = 1000;
					if (owner_shape == 'triangles') base.energy_capacity = 600;
					
				}
				base.energy = Math.abs(from_p1 - from_p2);
			} else {
				let from_me = (base.control == players['p1']) ? from_p1 : from_p2;
				let from_enemy = (base.control == players['p1']) ? from_p2 : from_p1;

				base.energy += from_me;
				base.energy -= 2 * from_enemy;
			}

			if (base.energy < 0){
				base.control = '';
				base.shape = 'neutral';
				logger.debug('find out whether player controls any other structures - otherwise end the game');
				check_structure_control();
			}
			base.energy = Math.max(0, Math.min(base.energy, base.energy_capacity));
			
		}
		
		
	}
	
	function check_structure_control(){
		
		let p1_ok = 0;
		let p2_ok = 0;
		
		//bases
		for (let b = 0; b < bases.length; b++){
			if (bases[b].control == players['p1']) p1_ok = 1;
			if (bases[b].control == players['p2']) p2_ok = 1;
		}
		if (p1_ok && p2_ok) return;
		
		//outpost
		for (let ou = 0; ou < outposts.length; ou++){
			if (outposts[ou].control == players['p1']) p1_ok = 1;
			if (outposts[ou].control == players['p2']) p2_ok = 1;
		}
		if (p1_ok && p2_ok) return;
		
		//pylon
		for (let py = 0; py < pylons.length; py++){
			if (pylons[py].control == players['p1']) p1_ok = 1;
			if (pylons[py].control == players['p2']) p2_ok = 1;
		}
		
		if (!p1_ok) end_game(0, 1);
		if (!p2_ok) end_game(1, 0);
	}

	function process_stuff(){

		//
		// objects birth
		//
		
		//if (base_lookup['base_' + players['p1']].energy >= base_lookup['base_' + players['p1']].current_spirit_cost){
		//	if (workerData[1] == 'tutorial' && top_s > 20){
		//		//logger.debug('can not have more than 20 spirits in tutorial');
		//	} else {
		//		if (p1_defend != 1){
		//			top_s++;
		//			global[players['p1'] + top_s] = new Spirit(players['p1'] + '_' + top_s, [-690, -520], get_def_size(shapes['player1']), get_def_size(shapes['player1']) * 10, players['p1'], colors['player1'], shapes['player1']);
		//			base_lookup['base_' + players['p1']].energy -= base_lookup['base_' + players['p1']].current_spirit_cost;
		//			//global[players['p1'] + top_s].move([-710, -540]);
		//			//logger.debug('spirit was born!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
		//			if (workerData[1] == 'tutorial')
		//				progress_tut(5, true);
		//		}
		//	}
		//}
		//if (base_lookup['base_' + players['p2']].energy >= base_lookup['base_' + players['p2']].current_spirit_cost){
		//	if (p2_defend != 1){
		//		top_q++;
		//		global[players['p2'] + top_q] = new Spirit(players['p2'] + '_' + top_q, [520, 690], get_def_size(shapes['player2']), get_def_size(shapes['player2']) * 10, players['p2'], colors['player2'], shapes['player2']);
		//		base_lookup['base_' + players['p2']].energy -= base_lookup['base_' + players['p2']].current_spirit_cost;
		//		//global[players['p2'] + top_q].move([540, 710]);
		//		//logger.debug(top_q);
		//	}
		//}
		
		for (i = 0; i < bases.length; i++){
			let bs = bases[i];
			if (bs.energy < bs.current_spirit_cost) continue;
			if (bs.sight.enemies.length > 0) continue;
			let x_axis = 1;
			let y_axis = 1;
			if (bs.position[0] < 0) x_axis = -1;
			if (bs.position[1] < 0) y_axis = -1;
			
			if (bs.control == players['p1']){
				top_s++;
				global[players['p1'] + top_s] = new Spirit(players['p1'] + '_' + top_s, [bs.position[0] + (x_axis * 40), bs.position[1] + (y_axis * 40)], get_def_size(shapes['player1']), get_def_size(shapes['player1']) * 10, players['p1'], colors['player1'], shapes['player1']);
				bs.energy -= bs.current_spirit_cost;
			}
			
			if (bs.control == players['p2']){
				top_q++;
				global[players['p2'] + top_q] = new Spirit(players['p2'] + '_' + top_q, [bs.position[0] + (x_axis * 40), bs.position[1] + (y_axis * 40)], get_def_size(shapes['player2']), get_def_size(shapes['player2']) * 10, players['p2'], colors['player2'], shapes['player2']);
				bs.energy -= bs.current_spirit_cost;
			}
		}
		
		//for (i = 0; i < bases.length; i++){
		//	let bs = bases[i];
		//	if (bs.energy < spirit_cost[bs.control])
		//
		//}
		
		
		
			
		
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
		logger.debug('get_sight took = ' + took1);
		*/



		//logger.debug('TIME: get_sight_fast = ' + elapsed_ms_from(sight_t0));

		//logger.debug('spirit_lookup[s1].sight');
		//logger.debug(spirit_lookup['s1'].sight);
		//logger.debug(spirit_lookup['sp1'].sight);
		
		
		// stars energy update
		
		for (let i = 0; i < stars.length; i++){
			stars[i].active_in = stars[i].active_at - game_duration;
			if(game_duration >= stars[i].active_at) {
				if (stars[i].id == 'star_nua'){
					stars[i].energy += Math.round(3 + (stars[i].energy * 0.03));
				} else {
					stars[i].energy += Math.round(2 + (stars[i].energy * 0.02));
					stars[i].active_in = 0;
				}
			}
			if (stars[i].energy >= stars[i].energy_capacity) stars[i].energy = stars[i].energy_capacity;

			render_data3.st[i] = stars[i].energy;
		}
		
		//fragments update
		for (let f = fragments.length - 1; f >= 0; f--){
			if (fragments[f].energy <= 0) fragments.splice(f, 1);
		}
		
	
		//objects death & vm sandbox objects update
		for (let i = death_queue.length - 1; i >= 0; i--){
			//logger.debug(death_queue[i].id + ' died');
			if (workerData[1] == 'tutorial'){
				if (death_queue[i].id == 'easy-bot_2')
					progress_tut(8, true);
			}
			
//			if (!death_queue[i].structure_type == 'outpost') 
				death_queue[i].hp = 0;
			//logger.debug(death_queue[i]);
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
				if(t.merged.length + s.merged.length + 2 > 100) continue;

				if(dist_sq(t.position, s.position) > 10**2) continue;
				if(s.hp == 0 || t.hp == 0) continue;
				t.merged.push(s.id);
				t.merged = t.merged.concat(s.merged);
				s.merged = [];
				t.size += s.size;
				t.energy += s.energy;
				t.energy_capacity += s.energy_capacity;
				s.hp = 0;
				s.size = 0;
				s.energy = 0;
				s.position = t.position;
				merged[tid] = true;

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
				
				// we are dividing the orig spirit
				// into orig.size spirits of size 1
				
				let orig = spirit_lookup[spirit];
				let capacity_per_one = orig.energy_capacity / orig.size;
				// right now, this holds:
				// assert(capacity_per_one == 10);
				
				let energy_per_one = Math.floor(orig.energy / orig.size);
				let energy_leftover = orig.energy % orig.size;

				for(let did of orig.merged) {
					var d = spirit_lookup[did];
					d.hp = 1;
					d.size = 1;
					d.energy_capacity = capacity_per_one;
					d.energy = energy_per_one;
					if(energy_leftover > 0){
						d.energy += 1;
						energy_leftover -= 1;
					}
					// implied by orig.energy <= orig.energy_capacity
					// assert(d.energy <= d.energy_capacity);

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
				// otw, the energy per_one could be increased by one
				// assert(energy_leftover == 0);
				orig.energy = energy_per_one;
				orig.energy_capacity = capacity_per_one;

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
				if(!commands[spirit].jump) continue;
				if(spirit_lookup[spirit].locked) continue;
				if(spirit_lookup[spirit].energy == 0) continue;

				let s = spirit_lookup[spirit];

				let tpos = commands[spirit].jump;
				let incr = sub(tpos, s.position);

				let dist = Math.sqrt(norm_sq(incr));
				console.log('jump distanceEdistanceEdistanceEdistanceEdistanceEdistanceEdistanceEdistanceEdistanceE = ' + dist);
				let cost = dist/4 + (s.size**2) / 4;
				console.log('cost distanceEdistanceEdistanceEdistanceEdistanceEdistanceEdistanceEdistanceEdistanceE = ' + cost);
				if(cost > s.energy) {
					let remainder = s.energy - (s.size**2)/4;
					if (remainder <= 0) remainder = 20;
					incr = mult((remainder * 5) / dist, incr);
					tpos = add(s.position, incr);
					dist = remainder * 5;
					if (dist <= 0 && s.energy > 0) dist = 20;
					cost = s.energy;
				}

				for (var object_name in structure_lookup){
					//logger.debug(' ------------------------------- structure potential collisions');
					//logger.debug(potential_structure_collisions[k]);
					
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

		// update locked spirit ranges
		for(let sid in spirit_lookup) {
			let spirit = spirit_lookup[sid];
			if(!spirit.locked) continue;
			spirit.range += 25;
			if(spirit.range > 300) {
				spirit.range = 300;
			}
		}

		// spirit lock
		for(let player in all_commands) {
			let commands = all_commands[player].spirit;
			for(let spirit in commands) {
				if(spirit == 'merge') continue;
				if(!player_owns_spirit(spirit, player)) continue;
				if(!(spirit in spirit_lookup) || spirit_lookup[spirit].hp == 0) continue;
				if(!commands[spirit].lock) continue;

				let s = spirit_lookup[spirit];
				
				if(s.shape != 'squares') continue;

				if(s.locked) continue;

				s.locked = true;
			}
		}

		// spirit unlock
		for(let player in all_commands) {
			let commands = all_commands[player].spirit;
			for(let spirit in commands) {
				if(spirit == 'merge') continue;
				if(!player_owns_spirit(spirit, player)) continue;
				if(!(spirit in spirit_lookup) || spirit_lookup[spirit].hp == 0) continue;
				if(!commands[spirit].unlock) continue;

				let s = spirit_lookup[spirit];
				
				if(s.shape != 'squares') continue;

				if(!s.locked) continue;

				s.locked = false;
				s.range = min_beam;
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
				let cutoff_parts = spt.id.split('_');
				let cutoff_id = cutoff_parts.pop();
				//logger.debug(spt);	
				if (spt.player_id == players['p2']){
					
					//render3 part
					render_data3.p2.push([cutoff_id, [Math.round(spt.position[0] * 100) / 100, Math.round(spt.position[1] * 100) / 100], spt.size, spt.energy, spt.hp]);

					if (spt.hp == 1){
						p2_living++;
						if (spt.shape == 'circles' && spt.size > 1) p2_living += spt.size - 1;
					}

				} else if (spt.player_id == players['p1']) {
					
					//render3 part
					render_data3.p1.push([cutoff_id, [Math.round(spt.position[0] * 100) / 100, Math.round(spt.position[1] * 100) / 100], spt.size, spt.energy, spt.hp]);

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
			//logger.debug('objects processing');
			temp_flag = 0;
			//logger.debug('my_spirits1.length = ' + my_spirits1.length);
			//consolelogger.debug('living_spirits.length = ' + living_spirits.length + " p1 = " + p1_living + " p2 = " + p2_living );
				spirit_cost(1, p1_living);
				spirit_cost(2, p2_living);
		} 
		logger.debug(bases[2].id + " control = " + bases[2].control)
		
		if (p1_living == 0) end_game(0, 1);
		if (p2_living == 0) end_game(1, 0);
	}
			

	async function update_state(){
		if (waiting_time >= 0) waiting_time--;
		let update_t0 = process.hrtime();
		game_duration++;
		

		if (game_duration == 1 && !(sand1.successful_compile && sand2.successful_compile) && waiting_time >= 0) {
			game_duration = 0;
		}

		ticks['now'] = game_duration;
		//logger.debug('game_duration = ' + game_duration);
		//after everything is calculated
			
	//logger.debug(player2_code);
	//logger.debug('player2_code');
			//render_data = [[],[],[],[],[]];
			
			render_data3 = {
				't': 0,
				'p1': [],
				'p2': [],
				'b1': [],
				'b2': [],
				'b3': [],
				'st': [],
				'ou': [],
				'py': [],
				'ef': [],
				'e': [],
				's': [],
				'end': end_winner
			};
			
			
			if (workerData[1] == 'tutorial'){
				
				render_data3 = {
					't': 0,
					'p1': [],
					'p2': [],
					'b1': [],
					'b2': [],
					'b3': [],
					'st': [],
					'ou': [],
					'py': [],
					'ef': [],
					'e': [],
					's': [],
					'tutorial': [],
					'end': end_winner
				};
				
				//logger.debug(tutorial_phase);
				
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
				} else if (game_duration == 4000){
					end_game(0, 0);
					tutorial_phase[0] = 'end';
				}
			} else {
				render_data3 = {
					't': 0,
					'pl1': players['p1'],
					'pl2': players['p2'],
					'p1': [],
					'p2': [],
					'b1': [],
					'b2': [],
					'b3': [],
					'st': [],
					'ou': [],
					'py': [],
					'ef': [],
					'e': [],
					's': [],
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
			}
			
			user_error1 = [];
			user_error2 = [];
		
			//tutorial data update
			if (workerData[1] == 'tutorial'){
				render_data3.tutorial.push(tutorial_phase);
			}
		
			render_data3.t = game_duration;
			render_data3.b1 = [bases[0].energy, bases[0].current_spirit_cost, bases[0].sight.enemies.length, bases[0].control];
			render_data3.b2 = [bases[1].energy, bases[1].current_spirit_cost, bases[1].sight.enemies.length, bases[1].control];
			render_data3.b3 = [bases[2].energy, bases[2].current_spirit_cost, bases[2].sight.enemies.length, bases[2].control];
			render_data3.b4 = [bases[3].energy, bases[3].current_spirit_cost, bases[3].sight.enemies.length, bases[3].control];
			
			render_data3.ou = [outposts[0].energy, outposts[0].control];
			render_data3.py = [pylons[0].energy, pylons[0].control];
			
			for (let f = 0; f < fragments.length; f++){
				render_data3.ef.push([fragments[f].position, fragments[f].energy]);
			}
		
			//broadcast to clients
			//logger.debug(JSON.stringify(render_data2))
			//logger.debug(render_data2);
			//parentPort.postMessage({data: JSON.stringify(render_data2), game_id: workerData[0], meta: ''});
			//wss.broadcast();
			
			update_vm_sandbox();

			let user_data = {};
			user_data[players['p1']] = chan1;
			user_data[players['p2']] = chan2;

			// FIXME - ugly hack
			// JM:
			// this is here so that we report the compile error BEFORE the game starts
			// so that user has at least some feedback on the err (and time to fix it).
			// without this, on submitting code with compile error, the user does get no
			// feedback && the countdown continues as if no Update code btn was pressed
			if (game_duration < 0) {
				if(sand1.last_compile_err){
					user_data[players['p1']] = {"err": [to_html(sand1.last_compile_err)]};
				}
				if(sand2.last_compile_err){
					user_data[players['p2']] = {"err": [to_html(sand2.last_compile_err)]};
				}
			}
			
			parentPort.postMessage({data: JSON.stringify(render_data3), user_data: user_data, game_id: workerData[0], meta: ''});
			
			if (game_duration < 0) {
				return;
			}

			if (workerData[1] != 'tutorial' && game_duration != 0){
				game_file.push(render_data3);
				//logger.debug(render_data3);
			}

			log1 = [];
			log2 = [];

			let update_no_players = elapsed_ms_from(update_t0);
			await user_code();
			let update_total = elapsed_ms_from(update_t0);

			logger.debug('TIME: update_state = ' + update_no_players + " (" + update_total + " total)");
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
				global[players['p1'] + s] = new Spirit(players['p1'] + '_' + s, [-620-s*20,-600], get_def_size(shapes['player1']), get_def_size(shapes['player1']) * 10, players['p1'], colors['player1'], shapes['player1']);
				spirits.push(global[players['p1'] + s]);
				top_s = s;
			} else {
				global[players['p1'] + s] = new Spirit(players['p1'] + '_' + s, [-750-s*20,-580], get_def_size(shapes['player1']), get_def_size(shapes['player1']) * 10, players['p1'], colors['player1'], shapes['player1']);
				spirits.push(global[players['p1'] + s]);
				top_s = s;
			}
			
		}

		for (q = 1; q < 1+start_num_spirits-start_num_adjust2; q++){
			if (q > 6){
				global[players['p2'] + q] = new Spirit(players['p2'] + '_' + q, [450+q*20,770], get_def_size(shapes['player2']), get_def_size(shapes['player2']) * 10, players['p2'], colors['player2'], shapes['player2']);
				spirits2.push(global[players['p2'] + q]);
				top_q = q;
			} else {
				global[players['p2'] + q] = new Spirit(players['p2'] + '_' + q, [580+q*20,750], get_def_size(shapes['player2']), get_def_size(shapes['player2']) * 10, players['p2'], colors['player2'], shapes['player2']);
				spirits2.push(global[players['p2'] + q]);
				top_q = q;
			}
		}
		
		//*/
		
		// -- //
	
	
		global['base_zxq'] = new Base('base_zxq', [-650, -480], players['p1'], colors['player1'], shapes['player1']);
		global['base_a2c'] = new Base('base_a2c', [480, 650], players['p2'], colors['player2'], shapes['player2']);
		global['base_p89'] = new Base('base_p89', [-800, 800], '', colors['neutral'], 'neutral');
		global['base_nua'] = new Base('base_nua', [860, -860], '', colors['neutral'], 'neutral');

	
		base_lookup['base_zxq'] = global['base_zxq'];
		base_lookup['base_a2c'] = global['base_a2c'];
		base_lookup['base_p89'] = global['base_p89'];
		base_lookup['base_nua'] = global['base_nua'];
	
		star_zxq = new Star('star_zxq', [-1200, -340], 100, 100, 0);
		star_lookup['star_zxq'] = star_zxq;
	
		star_a2c = new Star('star_a2c', [340, 1200], 100, 100, 0);
		star_lookup['star_a2c'] = star_a2c;
		
		star_p89 = new Star('star_p89', [-540, 540], 0, 100, 0);
		star_lookup['star_p89'] = star_p89;
		
		star_nua = new Star('star_nua', [420, -420], 0, 300, 0);
		star_lookup['star_nua'] = star_nua;
		
		outpost_mdo = new Outpost('outpost_mdo', [-230, 230]);
		outpost_lookup['outpost_mdo'] = outpost_mdo;
		
		pylon_u3p = new Pylon('pylon_u3p', [232, -232]);
		pylon_lookup['pylon_u3p'] = pylon_u3p;

		structure_lookup['outpost_mdo'] = outpost_mdo;
		structure_lookup['pylon_u3p'] = pylon_u3p;
		structure_lookup['star_zxq'] = star_zxq;
		structure_lookup['star_a2c'] = star_a2c;
		structure_lookup['star_p89'] = star_p89;
		structure_lookup['star_nua'] = star_nua;
		structure_lookup['base_zxq'] = global['base_zxq'];
		structure_lookup['base_a2c'] = global['base_a2c'];
		structure_lookup['base_p89'] = global['base_p89'];
		structure_lookup['base_nua'] = global['base_nua'];
		//structure_lookup['base_p89'] = global['base_p89'];
	
		mainLoop();
	}

	async function mainLoop() {
		const t1 = (+new Date());
		logger.debug("tick " + workerData[0]);
		await update_state();
		if(game_duration % 30 == 0){
			logger.debug("updating game " + workerData[0]);
			Game.updateOne({game_id: workerData[0]}, {last_update: (+new Date())}).catch(err => {
				logger.error(err)
			});
		}
		setTimeout(mainLoop, Math.max(0, game_tick - (+new Date()) + t1));
	}
}


