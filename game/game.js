function getRatingDelta(playerRating, opponentRating, playerResult) {
	if ([0, 0.5, 1].indexOf(playerResult) === -1) {
		return null;
	}
	const chanceToWin = 1 / ( 1 + Math.pow(10, (opponentRating - playerRating) / 400));
	return Math.round(GAME_CONSTANTS.ELO_K_FACTOR * (playerResult - chanceToWin));
}

function getNewRating(playerRating, opponentRating, playerResult) {
	return playerRating + getRatingDelta(playerRating, opponentRating, playerResult);
}

function cancel_game(){
	setTimeout(function(){
		process.exit(0);
	}, 2000);
}

function round_to_top(number, places) {
	return +number.toFixed(places);
}

function elapsed_ms_from(t0) {
	let diff = process.hrtime(t0);
	return round_to_top((diff[0] * 1e9 + diff[1]) / 1e6, 3);
}



const config = require('../config');
const AWS = require('aws-sdk');
const compress = require('../compress/compress.js');
AWS.config.setPromisesDependency(null);

const s3client = new AWS.S3({
	accessKeyId: config.s3.key,
	secretAccessKey: config.s3.secret,
	endpoint: config.s3.endpoint,
	s3ForcePathStyle: !config.s3.bucketEndpoint,
	s3BucketEndpoint: config.s3.bucketEndpoint
});

const pino = require('pino')
let logger;

async function end_game(was_p1 = 0, was_p2 = 0){
	game_finished = 1;
	const game_data = JSON.stringify(game_file);
	const compressed = compress.compress(game_file);
	
	
	let p1won = was_p1;
	let p2won = was_p2;
	let gameWinner = '';
	let winnerRating = 0;
	let newWinnerRating = 0;
	let gameLoser = '';
	let loserRating = 0;
	let newLoserRating = 0;
	
	if (p2won == 1){
		gameWinner = players['p2'];
	} else if (p1won == 1) {
		gameWinner = players['p1'];
	} else {
		end_winner = 'No one';
		cancel_game();
		return;
	}

	end_winner = gameWinner;

	let loserName = p2won ? players['p1'] : players['p2'];
	let winnerCodeCount = p2won ? p2_code_count : p1_code_count;
	let winnerCode = p2won ? player2_code : player1_code;

	if (loserName === 'champion-bot' && winnerCodeCount === 1 && winnerCode) {
		end_champion_eligible = true;
		s3client.putObject({
			Body: winnerCode,
			Bucket: config.s3.bucket,
			Key: 'champion-eligible/' + workerData[0] + '.js',
		}).promise().catch(err => logger.error(err));

		Game.updateOne({game_id: workerData[0]}, {champion_eligible: true})
			.catch(err => logger.error(err));
	}

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
				if (p2won == 1){
					gameWinner = players['p2'];
					winnerRating = result[0]['p2_rating'];
					gameLoser = players['p1'];
					loserRating = result[0]['p1_rating'];
				} else {
					gameWinner = players['p1'];
					winnerRating = result[0]['p1_rating'];
					gameLoser = players['p2'];
					loserRating = result[0]['p2_rating'];
				}

				newWinnerRating = getNewRating(winnerRating, loserRating, 1);
				newLoserRating = getNewRating(loserRating, winnerRating, 0);
				logger.info('Game ended: winner=%s (%d->%d), loser=%s (%d->%d)',
					gameWinner, winnerRating, newWinnerRating,
					gameLoser, loserRating, newLoserRating);

				if (result[0]['ranked'] == 0) {
					await Game.updateOne({game_id: workerData[0]}, {active: 0, winner: gameWinner}, {upsert: true});
					setTimeout(() => process.exit(0), 1000);
				} else if (result[0]['ranked'] == 1){
					await Game.updateOne({game_id: workerData[0]}, {active: 0, winner: gameWinner}, {upsert: true});
					await User.updateOne({user_id: gameWinner}, {$set: {rating: newWinnerRating}, $inc: {games_count: 1}}, {upsert: true});
					await User.updateOne({user_id: gameLoser}, {$set: {rating: newLoserRating}, $inc: {games_count: 1}}, {upsert: true});
					setTimeout(() => process.exit(0), 1000);
				}
			})
			.catch((error) => {
				logger.error(error);
				setTimeout(() => process.exit(0), 3000);
			});
	});
}




const { parentPort, workerData, isMainThread } = require("worker_threads");
const botCodes = require('../bot-codes');
const mongoose = require('mongoose');
const {User, Session} = require('../models/users.js');
const Game = require('../models/newgame.js');
const ChampionBot = require('../models/champion-bot.js');
const {SourceMapConsumer} = require("source-map");


const dbURI = config.mongo;
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
	.then(() => logger.info('Connected to MongoDB'))
	.catch((error) => logger.error(error));


const GAME_CONSTANTS = {
	TICK_MS: 500,
	BASE_SPEED: 20,
	MIN_BEAM_RANGE: 200,
	SIGHT_RANGE: 400,
	KITTEN_ENERGY: 10,
	KITTEN_ENERGY_CAPACITY: 10,
	KITTEN_HP: 1,
	KITTEN_MOVE_SPEED: 1,
	ENERGY_VALUE: 1,
	START_NUM_KITTENS: 9,
	KITTEN_SPACING: 25,
	KITTEN_START_X: 200,
	KITTEN_START_Y_OFFSET: -100,
	BARRICADE_SIZE: 100,
	WAITING_TICKS: 500,
	ELO_K_FACTOR: 32,
	AOE_RADIUS: 20,
	CIRCLE_START_RADIUS: 1200,
	CIRCLE_MIN_RADIUS: 50,
	CIRCLE_SHRINK_RATE: 2,
	CIRCLE_DRAIN: 2,
};

const min_beam = GAME_CONSTANTS.MIN_BEAM_RANGE;
const aoe_radius = GAME_CONSTANTS.AOE_RADIUS;
const h_square = min_beam / Math.sqrt(2);

function setBotCode(name, sand) {
	if (name == 'muffin-bot'){
		sand.setPlayerCode(botCodes['muffin-bot']);
	} else if (name == 'cleo-bot'){
		sand.setPlayerCode(botCodes['cleo-bot']);
	} else if (name == 'clowder-bot'){
		sand.setPlayerCode(botCodes['clowder-bot']);
	} else if (name == 'champion-bot' && botCodes['champion-bot']){
		sand.setPlayerCode(botCodes['champion-bot']);
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
				'players': [],
				'colors': [],
				'tut': 1
			}
	    } else {
			init_data = {
				'units': [],
				'players': [],
				'colors': [],
			}
	    }
		init_data.players[0] = players['p1'];
		init_data.players[1] = players['p2'];
		
		init_data.colors[0] = colors['player1'];
		init_data.colors[1] = colors['player2'];
		
		if (players_update['p1'] != 'old'){
			init_data.players[0] = players_update['p1'];
		}
		
		let start_num = 9;
		let x_offsets = [10, 0, -10, 0];
		init_data.initial_cats = { p1: [], p2: [] };
		for (let si = 1; si <= start_num; si++){
			let sy = -100 + (si - 1) * 25;
			let xo = x_offsets[(si - 1) % 4];
			init_data.initial_cats.p1.push({ id: init_data.players[0] + '_' + si, position: [-200 + xo, sy] });
			init_data.initial_cats.p2.push({ id: init_data.players[1] + '_' + si, position: [200 - xo, sy] });
		}
		
		parentPort.postMessage({data: JSON.stringify({meta: "initiate", data: init_data}), game_id: workerData[0], meta: 'initiate', client: message.client});
  } else if (message.data == "player code"){
	  if (message.pl_num == "player1"){
		  if (message.session_id == player1_session || message.pl_id == 'anonymous'){
			  player1_code = message.pl_code;
			  p1_code_count++;
			  sand1.setPlayerCode(message.pl_code);
			if (message.resigning == 1){
				logger.info('%s is resigning', message.pl_id);
				end_game(0, 1);
			}
		  } else {
			  Session.findOne({"session_id": message.session_id}).then((session) => {
				  if (session){
					  if (session.user_id == message.pl_id){
						player1_code = message.pl_code;
						p1_code_count++;
						player1_session = message.session_id;
						sand1.setPlayerCode(message.pl_code);
						if (message.resigning == 1){
							logger.info('%s is resigning', message.pl_id);
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
			  p2_code_count++;
			  sand2.setPlayerCode(message.pl_code);
			if (message.resigning == 1){
				logger.info('%s is resigning', message.pl_id);
				end_game(1, 0);
			}
		  } else {
			Session.findOne({"session_id": message.session_id}).then((session) => {
				if (session){
					if (session.user_id == message.pl_id){
					  player2_code = message.pl_code;
					  p2_code_count++;
						player2_session = message.session_id;
					  sand2.setPlayerCode(message.pl_code);
					  if (message.resigning == 1){
						  logger.info('%s is resigning', message.pl_id);
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
	  colors['player1'] = color_palettes[message.p1_color];
	  colors['player2'] = color_palettes[message.p2_color];
	  sand1.init(message.player1);
	  sand2.init(message.player2);
	if (workerData[1] == 'tutorial'){
		tutorial_phase = [0, 0, 0, 0, 0, 0, 0, 0];
		tutorial_flag1 = 0;
		sand2.setPlayerCode(botCodes['tutorial0']);
	}
	  game_start(); // eslint-disable-line no-undef

	  Game.find({game_id: workerData[0]})
		.then(async (result) => {
			if (result[0].player1 === 'champion-bot' || result[0].player2 === 'champion-bot') {
				const champ = await ChampionBot.findOne().sort({createdAt: -1});
				if (champ) {
					botCodes['champion-bot'] = champ.code;
				}
			}
			setBotCode(result[0].player1, sand1);
			setBotCode(result[0].player2, sand2);
			User.find({user_id: {$in: [players['p1'], players['p2']]}})
				.then((results) => {
				let updates = {};
				for(let rp of results) {
					if(rp.user_id == players['p1']){
						updates.p1_rating = rp.rating;
					}
					if(rp.user_id == players['p2']){
						updates.p2_rating = rp.rating;
					}
				}
				Game.updateOne({game_id: workerData[0]}, updates, {upsert: true})
						.catch((error) => {
							logger.error(error, 'Failed to update ratings');
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
	return txt.toString().replace(/\n/g,'<br>').replace(/ /g,'&nbsp;');
}

function adjustUserJsLines(str) {
	return str.replace(/user\.js:(\d+)/g, (m, line) => 'user.js:' + (parseInt(line) - 1));
}

async function clean_error(error, sourcemap){
	if(!(error instanceof Error)) {
		return adjustUserJsLines(String(error));
	}
	let message = "" + error;
	
	let stack = error.stack.split("\n");

	stack = stack.filter(l => /~sandbox/.test(l));
	if (sourcemap !== null) {
		stack = await Promise.all(stack.map(async l => {
			let coords = l.match(/\d+:\d+/)[0].split(":");
			let line = +coords[0] - 1;
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
	} else {
		stack = stack.map(l => adjustUserJsLines(l));
	}
	
	message += "\n" + stack.join("\n");

	return message;
}

async function handle_error(error, player, code){
	let sourcemap = code.split("//# sourceMappingURL=").reverse()[0].trim();
	if (!(/^data:(application|text)\/json;base64,/.test(sourcemap))) {
		sourcemap = null
	}
	let message = await clean_error(error, sourcemap);

	fill_error(player, to_html(message));
}

async function user_code(){
	if (workerData[1] == 'tutorial'){
		const helper_count = (player1_code.match(/my_cats/g) || []).length;
		
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
		await p1_async.catch((error) => {
			run_err = error;
		})

		let out = await sand1.output();
		all_commands[player] = out.commands;
		log1 = out.logs;
		user_error1 = out.errors.map(clean_error);
		chan1 = out.channels;
		if (chan1.err) {
			chan1.err = chan1.err.map(adjustUserJsLines);
		}

		// log compile err first, as that corresponds to the latest
		// user submitted code
		if(sand1.last_compile_err){
			if(sand1.last_compile_err instanceof Error){
				await handle_error(sand1.last_compile_err, player, sand1.currentCode);
			} else {
				fill_error(player, to_html(sand1.last_compile_err));
			}
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
		await p2_async.catch((error) => {
			run_err = error;
		})

		let out = await sand2.output();
		all_commands[player] = out.commands;
		log2 = out.logs;
		user_error2 = out.errors.map(clean_error);
		chan2 = out.channels;
		if (chan2.err) {
			chan2.err = chan2.err.map(adjustUserJsLines);
		}

		if(sand2.last_compile_err){
			if(sand2.last_compile_err instanceof Error){
				await handle_error(sand2.last_compile_err, player, sand2.currentCode);
			} else {
				fill_error(player, to_html(sand2.last_compile_err));
			}
		}
		if(run_err) {
			handle_error(run_err, player, sand2.currentCode);
		}
	} catch (error){
		logger.error("error getting output p2" + error);
		handle_error(error, player, sand2.currentCode);
	}
}

let game_tick = GAME_CONSTANTS.TICK_MS;
const base_speed = GAME_CONSTANTS.BASE_SPEED;
const barricades = [[0, -200], [0, 200], [370, 0], [-370, 0]];
const BARRICADE_COLLISION_RADIUS = GAME_CONSTANTS.BARRICADE_SIZE;
const pods = [[-110, -300], [110, -300], [-260, 320], [260, 320], [-500, 84], [500, 84]];
const POD_HALF_SIZE = 20;
let living_cats = [];
const cat_lookup = {};
const structure_lookup = {};


let all_commands = {};

let birth_queue = [];
let death_queue = [];

let player1_code = '';
let player1_session = '';
let player2_code = '';
let player2_session = '';
const players = {};
const ticks = {};
players['p1'] = 'ab1';
players['p2'] = 'zx2';
const players_update = {};
players_update['p1'] = 'old';

let game_file = [];


let end_winner = 0;
let end_champion_eligible = false;

let p1_code_count = 0;
let p2_code_count = 0;

let tutorial_phase;
let tutorial_flag1;

let game_duration = 0;
let waiting_time = GAME_CONSTANTS.WAITING_TICKS;
let qqmonitoring = [0, 0, 0, 0, 0, 0, 0, 0];

const colors = {};
colors['player1'] = "rgba(255, 0, 0, 1)";
colors['player2'] = "rgba(0, 100, 255, 1)";
colors['neutral'] = "rgba(160, 168, 180, 1)";
const color_palettes = {};
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
color_palettes['color15'] = 'rgba(255, 255, 255, 1)';

const rawCats = {};

let top_s = 0;

let energy_value = GAME_CONSTANTS.ENERGY_VALUE;

let game_finished = 0;

let circle_radius = GAME_CONSTANTS.CIRCLE_START_RADIUS;

let user_error1 = [];
let user_error2 = [];

let log1 = [];
let log2 = [];

let chan1 = [];
let chan2 = [];

let render_data3 = {
	't': 0,
	'p1': [],
	'p2': [],
	'e': [],
	's': [],
	'a': [],
};

let init_data = {
	'units': [],
}

let memory1 = {a: 150};
let memory2 = {a: 155};

const ivm = require('isolated-vm');
const fs = require('fs');
const addons = require('../addons');

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


function shuffle_array(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const sandboxCode = fs.readFileSync(__dirname + "/sandbox.js", { encoding: 'utf8' });

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
			this.script = this.isolate.compileScriptSync("{\n" + code + "\n}", {filename: "~sandbox/user.js"});
			this.successful_compile = true;
		}catch(err) {
			let lineInfo = '';
			if (err.stack) {
				let match = err.stack.match(/user\.js:(\d+)(?::(\d+))?/);
				if (match) {
					lineInfo = '\n    at line ' + (parseInt(match[1]) - 1);
					if (match[2]) lineInfo += ', column ' + match[2];
				}
			}
			this.last_compile_err = "Submitted code has a compile error:\n    " + err.message + lineInfo;
			if(this.successful_compile)
				this.last_compile_err += "\nRunning Your previous valid code instead!!!\n"
		}
	}

	init(player_id) {
		this.yd.getSync('init', {reference: true}).applySync(this.yd.derefInto(), [player_id], {arguments: {copy: true}});
	}


	async loadData() {
		this.funcs.loadData.apply(this.yd.derefInto(), [{tick: ticks['now'], ttick: 't' + ticks['now'], cats: rawCats, barricades: barricades, pods: pods, players: JSON.parse(JSON.stringify(players)), death_circle: circle_radius}], {arguments: {copy: true}, result: {reference: true}});
	}

	async run() {
		try {
			await this.loadData();
			await this.script.run(this.context, {timeout: 220});
		} catch (e) {
			this.last_compile_err = e;
		}
	}

	async output() {
		return this.funcs.getOutput.apply(this.yd.derefInto(), [], {result: {copy: true}});
	}
}

const sand1 = new Sandbox();

sand1.loadAddons(['graphics.js', 'console.js']);

const sand2 = new Sandbox();

sand2.loadAddons(['graphics.js', 'console.js']);

if (!isMainThread){
	class Cat {
		constructor(id, position, player, color){
			this.id = id;
			this.position = position;
		this.energy = GAME_CONSTANTS.KITTEN_ENERGY;
		this.energy_capacity = GAME_CONSTANTS.KITTEN_ENERGY_CAPACITY;
			this.last_pewed = '';
			this.color = color;
			this.mark = '';
			this.range = min_beam;
		
			this.sight = {
				friends: [],
				enemies: [],
			}
			this.qcollisions = [];
		
		this.hp = GAME_CONSTANTS.KITTEN_HP;
		this.move_speed = GAME_CONSTANTS.KITTEN_MOVE_SPEED;
		this.player_id = player;
		
			living_cats.push(this);
			birth_queue.push(this);
		}
	}

	

	function initiate_world(ws){
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
	
	function is_in_sight(item1, item2, range = GAME_CONSTANTS.SIGHT_RANGE){
		return fast_dist_leq(item1.position, item2.position, range);
	}


	function get_sight_fast(){
		const pewable_sq = min_beam**2;
		const visible_sq = (2*min_beam)**2;
		const living_length = living_cats.length;

		for (let h = 0; h < living_length; h++){
		  living_cats[h].sight = {
				friends_pewable: [],
				enemies_pewable: [],
				friends: [],
				enemies: [],
		  }
		  living_cats[h].qcollisions = [];
		}

		function work(i, j){
			let pi = living_cats[i].player_id;
			let pj = living_cats[j].player_id;
			if (pi == pj){
				// friend
				living_cats[i].sight.friends.push(living_cats[j].id);
				living_cats[j].sight.friends.push(living_cats[i].id);
			}
			else{
				// enemy
				living_cats[i].sight.enemies.push(living_cats[j].id);
				living_cats[j].sight.enemies.push(living_cats[i].id);
			}
		}

		function work_pewable(i, j){
			let pi = living_cats[i].player_id;
			let pj = living_cats[j].player_id;
			if (pi == pj){
				// friend
				living_cats[i].sight.friends_pewable.push(living_cats[j].id);
				living_cats[j].sight.friends_pewable.push(living_cats[i].id);
			}
			else{
				// enemy
				living_cats[i].sight.enemies_pewable.push(living_cats[j].id);
				living_cats[j].sight.enemies_pewable.push(living_cats[i].id);
			}
		}

		let hist = {};
		// per cat processing
		for (let i = 0; i < living_length; i++){
			let cat = living_cats[i];
			// ugh
			if (cat.hp == 0) continue;
			let pos = cat.position;

			// 1. init histogram

			let xbin = Math.floor(pos[0] / h_square);
			let ybin = Math.floor(pos[1] / h_square);
			if (hist[[xbin, ybin]] == undefined){
				// first element is the x,y, since js has no tuples
				// and converts the key to string
				hist[[xbin, ybin]] = [[xbin, ybin, -1]];
			}
			hist[[xbin, ybin]].push(i);
			
		}

		// histogram, handle sights for all
		// of the potentially O(N^2)-many cat <> cat pairs

		Object.values(hist).forEach(function(bin){
			// this bin, all are visible && pewable
			// because of h_square size
			for(let i = 1; i <bin.length;i++){
			for(let j = i+1; j <bin.length;j++){
				work(bin[i],bin[j]);
				work_pewable(bin[i],bin[j]);
			}
			}

			// iterate neighboring bins
			// a rectangle 7x4, the bin is at position [3, 0] (top row, center)
			for(let s = 3; s < 7*4-1 ; s++){
				// lower left corner, too far away
				if(s==21) continue;

				let dy = Math.floor(s / 7);
				let dx = (s % 7) - 3;
				if(dx==0 && dy==0) continue;

				// neighbor bin
				let nb = hist[[bin[0][0]+dx, bin[0][1]+dy]];
				if(nb == undefined)
					continue;

				// O(N^2) part
				for(let i = 1; i <bin.length;i++){
					for(let j = 1; j <nb.length;j++){
						let dsq = dist_sq(
							living_cats[bin[i]].position,
							living_cats[nb[j]].position,
						);
						if(dsq <= visible_sq)
							work(bin[i],nb[j]);
						if(dsq <= pewable_sq)
							work_pewable(bin[i],nb[j]);
					}
				}
			}
		});

	}


	function get_sight(){
		const living_length = living_cats.length;
		for (let h = 0; h < living_length; h++){
		  living_cats[h].sight = {
				friends_pewable: [],
				friends: [],
				enemies: [],
				enemies_pewable: [],
		  }
		  living_cats[h].qcollisions = [];
			
		}
	
	//cats root (it's longer than you think)
	for (let i = 0; i < living_length; i++){
		for (let j = i+1; j < living_length; j++){
				if (living_cats[j].hp == 0) continue;
				if (is_in_sight(living_cats[i], living_cats[j])){
					//maybe add distance stuff later
					//distance_approx = distance_nonrooted(living_cats[i].position, living_cats[j].position);
					if (living_cats[j].player_id == players['p1']){
						if (living_cats[i].player_id == players['p1']){
							//is friend
							living_cats[i].sight.friends.push(living_cats[j].id);
							living_cats[j].sight.friends.push(living_cats[i].id);
							//collision-sight
							if (is_in_sight(living_cats[i], living_cats[j], 50)){
								living_cats[i].qcollisions.push(living_cats[j].id);
								living_cats[j].qcollisions.push(living_cats[i].id);
							}
						} else if (living_cats[i].player_id == players['p2']){
							//is enemy
							living_cats[i].sight.enemies.push(living_cats[j].id);
							living_cats[j].sight.enemies.push(living_cats[i].id);
						}
						
					} else if (living_cats[j].player_id == players['p2']){
						if (living_cats[i].player_id == players['p2']){
							//is friend
							living_cats[i].sight.friends.push(living_cats[j].id);
							living_cats[j].sight.friends.push(living_cats[i].id);
						} else if (living_cats[i].player_id == players['p1']){
							//is enemy
							living_cats[i].sight.enemies.push(living_cats[j].id);
							living_cats[j].sight.enemies.push(living_cats[i].id);
						}
					}
				}
			}
		
		}
		
	}


	function progress_tut(phase_done){
		let i = phase_done - 1;

		try {
			tutorial_phase[i] = 1;
			if (qqmonitoring[i] == 0){
				qqmonitoring[i] = 1;
				parentPort.postMessage({data: i+1, game_id: workerData[0], meta: 'monitoring'});
			}
		} catch (error){
			logger.error(error, 'Tutorial progress error at phase %d', phase_done);
		}
	}

	function player_owns_cat(id, name){
		if(!id.startsWith(name))
			return false;
		// if the id does start with name, it is still not ok
		// consider players "pepa" and "pepa_the_best"
		let cat_num = Number(id.slice(name.length + 1));
		return id == (name + "_" + cat_num);
	}

	function move_objects(){
		const prev_position = {};
		for (let player in all_commands){
			let queue = all_commands[player].cat;

			Object.keys(queue).forEach((id) => {
				if(!id || !player_owns_cat(id, player)){
					logger.info("Invalid move: player %s tried to move %s", player, id);
					return;
				}

				const cat = cat_lookup[id];
				if (cat.hp == 0)
					return;
				const tpos = queue[id].move;
				if(!tpos) return;
				if (!Array.isArray(tpos) || tpos.length !== 2 || !Number.isFinite(tpos[0]) || !Number.isFinite(tpos[1])) return;
				const pos = cat.position;
				prev_position[id] = pos;

				//tutorial
				if (workerData[1] == 'tutorial' && id == "anonymous_1"){
					if (tpos[0] == 1000 && tpos[1] == 1000){
						progress_tut(1);
					} else if (tpos[0] == 1600 && tpos[1] == 700){
						progress_tut(3);
					}
				}
				
				let incr = sub(tpos, pos);
				let len_sq = norm_sq(incr);
				// work with data only if there is movement
				if (len_sq > 0){
					// if not getting there in one tick
					if(len_sq > base_speed**2){
						// norm the incr vector so that its len is base_speed
						incr = mult(base_speed / Math.sqrt(len_sq), incr);
					}
					cat.position = add(pos, incr).map((c) => round_to(c, 5));

					for (let k = 0; k < barricades.length; k++){
						let object_position = barricades[k];
						if (fast_dist_lt(cat.position, object_position, BARRICADE_COLLISION_RADIUS)){
							let inter_coor = intersection(pos[0], pos[1], base_speed,
															object_position[0], object_position[1], BARRICADE_COLLISION_RADIUS);
							if (inter_coor == false) continue;
							
							let quick_dist1 = dist_sq(inter_coor[0], tpos);
							let quick_dist2 = dist_sq(inter_coor[1], tpos);
							
							let pick_first = quick_dist1 < quick_dist2 || Math.abs(quick_dist1 - quick_dist2) <= 5;
							cat.position = inter_coor[pick_first ? 0 : 1];
						}
					}
				}
			});
		}

		return prev_position;
	}

	function pew_objects(){
		let pew_apply = [];
		
		for(let cat of Object.values(cat_lookup)){
			cat.last_pewed = '';
		}

		let last_beam = {};
		for (let player in all_commands){
			let queue = all_commands[player].cat;

			Object.keys(queue).forEach((from_id) => {
				const to_id = queue[from_id].pew;

				if(!to_id){
					return;
				} 
				if(!from_id || !player_owns_cat(from_id, player) || !to_id){
					logger.info("Invalid pew: player %s tried %s.pew(%s)", player, from_id, to_id);
					return;
				}

				if(last_beam[from_id] != undefined)
					return;
				last_beam[from_id] = to_id;
				
				const from_obj = cat_lookup[from_id];
				const to_obj = cat_lookup[to_id];

				if(!from_obj || !to_obj || from_obj.hp == 0 || to_obj.hp == 0){
					return;
				}

				if (from_id == to_id){
					return;
				}
				
				let target_close = fast_dist_leq(from_obj.position, to_obj.position, from_obj.range);
				if(! target_close){
					return;
				}

				let beam_strength = Math.min(energy_value, from_obj.energy);
				if(beam_strength <= 0)
					return;

				from_obj.last_pewed = to_id;

				let friendly_beam = from_obj.player_id == to_obj.player_id;

				if (!friendly_beam){
					pew_apply.push([from_obj, -beam_strength]);
					pew_apply.push([to_obj, -2 * beam_strength]);
					render_data3.e.push([from_id, to_id, 2 * beam_strength]);

					for (let i = 0; i < living_cats.length; i++){
						let s = living_cats[i];
						if (s.hp == 0 || s.id == to_id || s.id == from_id) continue;
						if (s.player_id == from_obj.player_id) continue;
						if (!fast_dist_leq(s.position, to_obj.position, aoe_radius)) continue;
						pew_apply.push([s, -2 * beam_strength]);
						render_data3.a.push([from_id, to_id, s.id, 2 * beam_strength]);
					}
				}
				else {
					pew_apply.push([from_obj, -beam_strength]);
					pew_apply.push([to_obj, beam_strength]);
					render_data3.e.push([from_id, to_id, beam_strength]);
				}
			});
		}

		let applied_to = {};
		let check = [];

		for (let i = pew_apply.length - 1; i >= 0; i--){
			let target = pew_apply[i][0];
			let amount = pew_apply[i][1];
			
			target.energy += amount;

			if(!applied_to[target.id]){
				applied_to[target.id] = true;
				check.push(target);
			}
		}

		for (let i = 0; i < check.length; i++){
			let target = check[i];
			target.energy = Math.min(target.energy, target.energy_capacity);

			if (target.energy < 0){
				death_queue.push(target);
			}
		}
	}

	function process_stuff(){
	let birthlings = birth_queue.length;
	for (let i = birthlings - 1; i >= 0; i--){
		let spt = birth_queue[i];	
			cat_lookup[spt.id] = spt;
			birth_queue.splice(i, 1);
		}
	
	
		//
		// shout and mark
		//
		
		for(let player in all_commands) {
			let commands = all_commands[player].cat;
			for(let cat in commands) {
				if(!player_owns_cat(cat, player)) continue;
				if(!(cat in cat_lookup) || cat_lookup[cat].hp == 0) continue;
				if(commands[cat].shout) render_data3.s.push(['sh', cat, commands[cat].shout]);
				if(commands[cat].mark) cat_lookup[cat].mark = commands[cat].mark;
			}
		}
		//
		// objects pew
		//
		
		pew_objects();

		//
		// objects move
		//

		let prev_position = move_objects();

		//
		// death circle shrink + drain
		//

		circle_radius = Math.max(GAME_CONSTANTS.CIRCLE_MIN_RADIUS, circle_radius - GAME_CONSTANTS.CIRCLE_SHRINK_RATE);
		const circle_radius_sq = circle_radius * circle_radius;
		for (let i = 0; i < living_cats.length; i++){
			let spt = living_cats[i];
			if (spt.hp == 0) continue;
			let dx = spt.position[0];
			let dy = spt.position[1];
			if (dx * dx + dy * dy > circle_radius_sq){
				spt.energy -= GAME_CONSTANTS.CIRCLE_DRAIN;
				if (spt.energy < 0){
					death_queue.push(spt);
				}
			}
		}

		for (let i = 0; i < living_cats.length; i++){
			let spt = living_cats[i];
			if (spt.hp == 0) continue;
			for (let p = 0; p < pods.length; p++){
				if (Math.abs(spt.position[0] - pods[p][0]) <= POD_HALF_SIZE &&
					Math.abs(spt.position[1] - pods[p][1]) <= POD_HALF_SIZE){
					spt.energy = Math.min(spt.energy + 1, spt.energy_capacity);
					break;
				}
			}
		}

		
		for (let i = death_queue.length - 1; i >= 0; i--){
			if (workerData[1] == 'tutorial'){
				if (death_queue[i].id == 'easy-bot_2')
					progress_tut(8);
			}
			death_queue[i].hp = 0;
			death_queue.splice(i, 1);
		}
		
		
		
		
		get_sight_fast();
	}

	function update_vm_sandbox(){
		let p1_living = 0;
		let p2_living = 0;
		for (let i = 0; i < living_cats.length; i++){
			let spt = living_cats[i];
			let cutoff_parts = spt.id.split('_');
			let cutoff_id = cutoff_parts.pop();
			if (spt.player_id == players['p2']){
				render_data3.p2.push([cutoff_id, [Math.round(spt.position[0] * 100) / 100, Math.round(spt.position[1] * 100) / 100], spt.energy, spt.hp]);
				if (spt.hp == 1) p2_living++;
			} else if (spt.player_id == players['p1']) {
				render_data3.p1.push([cutoff_id, [Math.round(spt.position[0] * 100) / 100, Math.round(spt.position[1] * 100) / 100], spt.energy, spt.hp]);
				if (spt.hp == 1) p1_living++;
			}
			rawCats[spt.id] = JSON.parse(JSON.stringify(spt));
		}

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
			
			render_data3 = {
				't': 0,
				'pl1': players['p1'],
				'pl2': players['p2'],
				'p1': [],
				'p2': [],
				'e': [],
				's': [],
				'a': [],
				'cr': circle_radius,
				'end': end_winner,
				'champion_eligible': end_champion_eligible
			};
			
			
			if (workerData[1] == 'tutorial'){
				
				render_data3 = {
					't': 0,
					'pl1': players['p1'],
					'pl2': players['p2'],
					'p1': [],
				'p2': [],
				'e': [],
				's': [],
				'a': [],
				'cr': circle_radius,
				'tutorial': [],
				'end': end_winner
				};
				
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
					'st': [],
					'e': [],
					's': [],
					'a': [],
					'cr': circle_radius,
					'end': end_winner,
					'champion_eligible': end_champion_eligible
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
		update_vm_sandbox();
			
			user_error1 = [];
			user_error2 = [];
		
			if (workerData[1] == 'tutorial'){
				render_data3.tutorial.push(tutorial_phase);
			}
		
			render_data3.t = game_duration;

			let user_data = {};
			user_data[players['p1']] = chan1;
			user_data[players['p2']] = chan2;

			parentPort.postMessage({data: JSON.stringify(render_data3), user_data: user_data, game_id: workerData[0], meta: ''});

			if (workerData[1] != 'tutorial' && game_duration != 0){
				game_file.push(render_data3);
			}

			log1 = [];
			log2 = [];

			await user_code();
			let update_total = elapsed_ms_from(update_t0);

			if (update_total > 1000) cancel_game();
	}
	
	
	
	const KITTEN_START_X_OFFSETS = [10, 0, -10, 0];

	function game_start(){
	const start_num_cats = GAME_CONSTANTS.START_NUM_KITTENS;

	for (let s = 1; s <= start_num_cats; s++){
		let y = GAME_CONSTANTS.KITTEN_START_Y_OFFSET + (s - 1) * GAME_CONSTANTS.KITTEN_SPACING;
		let xo = KITTEN_START_X_OFFSETS[(s - 1) % KITTEN_START_X_OFFSETS.length];
		global[players['p1'] + s] = new Cat(players['p1'] + '_' + s, [-GAME_CONSTANTS.KITTEN_START_X + xo, y], players['p1'], colors['player1']);
		top_s = s;
	}

	for (let q = 1; q <= start_num_cats; q++){
		let y = GAME_CONSTANTS.KITTEN_START_Y_OFFSET + (q - 1) * GAME_CONSTANTS.KITTEN_SPACING;
		let xo = KITTEN_START_X_OFFSETS[(q - 1) % KITTEN_START_X_OFFSETS.length];
		global[players['p2'] + q] = new Cat(players['p2'] + '_' + q, [GAME_CONSTANTS.KITTEN_START_X - xo, y], players['p2'], colors['player2']);
	}

	
		mainLoop();
	}

	async function mainLoop() {
		const t1 = (+new Date());
		await update_state();
		if(game_duration % 30 == 0){
			Game.updateOne({game_id: workerData[0]}, {last_update: (+new Date())}).catch(err => {
				logger.error(err)
			});
		}
		setTimeout(mainLoop, Math.max(0, game_tick - (+new Date()) + t1));
	}
}


