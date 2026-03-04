const express = require('express');
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const {Worker} = require('worker_threads');
const config = require('../config');
const path = require('path');
const fetch = require('node-fetch');
const pino = require('pino');
require('isolated-vm');

const { generateUniqueString, get_color_num } = require('../utils/helpers');

const this_server = process.env.SERVER || 'd1';
const this_server_type = process.env.SERVER_TYPE || 'real';

const logger = pino({
  transport: {
		targets: [
			{ target: "pino-pretty", level: "debug"},
			{ target: "pino/file", options: {destination: `/var/log/game-server-${this_server}.log`}, level: "trace"},
		]
	},
	level: "trace",
})

logger.info(`Starting ${this_server} (${this_server_type})`);

const mongoose = require('mongoose');
const Game = require('../models/newgame.js');
const {User, Session} = require('../models/users.js');
const Module = require("../models/modules.js")
const dbURI = config.mongo;
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
	.then(() => logger.info('Connected to MongoDB'))
	.catch((error) => logger.error(error));

const workers = {};
const active_games = {};
const connections = {};
const base = path.dirname(__dirname);

function discord_postmessage(hook, msg){
	if (!hook) return;
	try {
		fetch(hook, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ content: msg })
		}).then(response => response.json())
			.catch(err => { logger.error(err); });
	} catch (e) {
		logger.error(e);
	}
}

function create_worker(game_id, game_type) {
	const worker = new Worker(base + '/game/game.js', { workerData: [game_id, game_type] });
	worker.on('error', (err) => { throw err; });
	worker.on('message', (render_data) => {
		if (render_data.meta == 'initiate'){
			try {
				connections[render_data.client].send(render_data.data);
				delete connections[render_data.client];
			} catch (e){
				logger.error(e);
			}
		} else if (render_data.meta == 'test'){
			logger.debug(render_data.data);
		} else if (render_data.meta == 'monitoring'){
			trigger_monitoring(render_data.game_id, render_data.data);
		} else {
			wss.broadcast(render_data.data, render_data.user_data, render_data.game_id);
		}
	});
	worker.on('exit', () => {
		trigger_deactivation(game_id);
		delete active_games[game_id];
	});

	workers[game_id] = worker;
}

function is_bot(id) {
	return id == "muffin-bot" || id == "cleo-bot" || id == "clowder-bot" || id == "qual-bot";
}

function init_game(game_id, pla1, pla2, init_status = 1, server_id = this_server, pla1_color = 'color1', pla2_color = 'color2', game_type = 'tutorial'){
	create_worker(game_id, game_type);
	active_games[game_id] = [0, 0, 0, 0];
	active_games[game_id][0] = 1;
	active_games[game_id][1] = pla1;
	active_games[game_id][2] = pla2;
	active_games[game_id][3] = server_id;
	active_games[game_id][6] = pla1_color;
	active_games[game_id][7] = pla2_color;

	if(game_type == "real" && !is_bot(pla1) && !is_bot(pla2)) {
		discord_postmessage(config.hooks.new_match, "" + pla1 + " vs. " + pla2 + " : https://yare.io/" + server_id + "/" + game_id);
	}

	start_world(game_id);
}

function findAgain(req, res, g_id){
	Game.find({game_id: g_id})
		.then((result) => {
			if (result.length == 0){
				res.status(200).send({ data: "no game found" });
			} else if (result[0]['active'] == 0.5 && result[0]['server'] == this_server){
				init_game(g_id, result[0]['player1'], result[0]['player2'], 1, result[0]['server'], result[0]['p1_color'], result[0]['p2_color'], this_server_type);
				Game.updateOne({game_id: g_id}, {active: 1}, {upsert: true})
					.then(() => {
						res.status(200).send({ data: "game ready", server: this_server });
					});
			} else if (result[0]['active'] == 1 && result[0]['server'] == this_server){
				res.status(200).send({ data: "game already active", server: this_server });
			} else {
				res.status(404).send({ data: "something went wrong" });
			}
		})
		.catch((error) => {
			logger.error(error);
		});
}

function start_world(game_id){
	try {
		workers[game_id].postMessage({data: "start world", player1: active_games[game_id][1], player2: active_games[game_id][2], p1_color: active_games[game_id][6], p2_color: active_games[game_id][7]});
	} catch (error) {
	  logger.error(error);
	}
}



function initiate_world(ws, game_id){
	try {
		workers[game_id].postMessage({client: ws, data: "initiate world"});
	} catch (error) {
	  logger.error(error);
	}
}

function send_code(ws, pl_num, pl_id, pl_code, game_id, session_id, resign_state){
	workers[game_id].postMessage({client: ws, data: "player code", pl_num: pl_num, pl_id: pl_id, pl_code: pl_code, session_id: session_id, resigning: resign_state});
}

function trigger_deactivation(game_id){
	try {
		fetch(config.frontendAddress + '/deactivate', {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				game_id: game_id
			})
		}).then(response => response.json())
			.catch(err => {
				logger.error(err);
			});
	} catch (error) {
		logger.error(error);
	}
}

function trigger_monitoring(gid, val){
	try {
		fetch(config.frontendAddress + '/monitor', {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				game_id: gid,
				phase: val
			})
		}).then(response => response.json())
			.catch(err => {
				logger.error(err);
			});
	} catch (error) {
		logger.error(error);
	}
}

wss.broadcast = function broadcast(data, userData, game_id) {
	const render = JSON.parse(data);
	wss.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN && client.game_id == game_id) {
			client.send(JSON.stringify({render: render, chan: userData[client.user_id]}));
		}
	});
};

const AWS = require('aws-sdk');
AWS.config.setPromisesDependency(null);

const s3client = new AWS.S3({
	accessKeyId: config.s3.key,
	secretAccessKey: config.s3.secret,
	endpoint: config.s3.endpoint,
	s3ForcePathStyle: !config.s3.bucketEndpoint,
	s3BucketEndpoint: config.s3.bucketEndpoint
});

wss.on('connection', function connection(ws, req) {
	let g_id = /[^/]*$/.exec(req.url)[0];
	let resigning1 = 0;
	let resigning2 = 0;
	ws.game_id = g_id;
	ws.client_id = generateUniqueString();
	connections[ws.client_id] = ws;
	initiate_world(ws.client_id, g_id);

	ws.on('message', async function incoming(message) {
		let active_game = active_games[g_id];
		if (active_game == undefined){
			return;
		}

		if (message == 'reinitiate'){
			initiate_world(ws.client_id, g_id);
			return;
		} else {
			try {
				message = JSON.parse(message);
			} catch (error) {
				logger.error(error);
				return;
			}
			if (message.meta == "resign"){
				if (message['u_id'] == active_game[1]) resigning1 = 1;
				if (message['u_id'] == active_game[2]) resigning2 = 1;
			} else {
				resigning1 = 0;
				resigning2 = 0;
			}
		}

		if(message.meta == 'connect') {
			let session = await Session.findOne({session_id: message.session_id}).exec();
			if(session) {
				ws.user_id = session.user_id;
				ws.send(JSON.stringify({meta: 'connected', user_id: ws.user_id}));
			}
			return;
		}

		if(message.meta == 'channel') {
			workers[g_id].postMessage({data: "channel", user_id: ws.user_id || "anonymous", channel: message.channel, chan_data: message.data});
			return;
		}

		if (message['u_code_lang'] != undefined && message['u_code_lang'] != "javascript") {
			let req = await fetch(config.frontendAddress + "/transpiler/transpile", {method: "POST", body: JSON.stringify({code: message['u_code'], language: message['u_code_lang']}), headers: {'Content-Type': 'application/json', 'X-Transpiler-Secret': config.transpilerSecret}});
			let res = await req.json();
			if (res.result) message['u_code'] = res.result;
			if (res.error) {
				let tempJSON = JSON.stringify(JSON.stringify({error: res.error}));
				message['u_code'] = `throw JSON.parse(${tempJSON})["error"];`;
			}
		}

		let modulesInjectionStartTime = Date.now();
		let user = await User.findOne({"user_id": message['u_id']});
		let active_module_code_locations;
		if (user) {
			let promised_active_modules = user.active_modules.map(module_id => Module.findOne({module_id}));
			let active_modules = await Promise.all(promised_active_modules);
			active_module_code_locations = active_modules.map((mod, i) => {
				if (mod == null){
					return `local/${user.active_modules[i]}`
				}
				return `${mod.server_script_location}/${mod.module_id}`
			}).filter(loc => loc !== "local" && loc !== null);
		} else {
			active_module_code_locations = [];
		}

		let promised_active_module_codes = active_module_code_locations.map((loc) => {
			if (loc.startsWith("local/")) {
				return fetch(`${config.frontendAddress}/public-modules/${loc.replace("local", "server")}.js`).then(r => r.text());
			}
			return s3client.getObject({
				Bucket: config.s3.bucket,
				Key: `${loc}.js`,
			}).promise().then(r => r.Body.toString('utf8'));
		});

		let active_module_codes = await Promise.all(promised_active_module_codes);
		let active_module_codes_joined = `;${active_module_codes.join("\n\n\n")};`;
		message['u_code'] += active_module_codes_joined;
		let moduleInjectionTime = Date.now() - modulesInjectionStartTime;
		logger.debug('Module injection took %dms', moduleInjectionTime);

		connections[ws.client_id] = ws;
		try {
			if (message['u_id'] == active_game[1] || active_game[1] == 'anonymous'){
				send_code(ws.client_id, 'player1', message['u_id'], message['u_code'], g_id, message['session_id'], resigning1);
			} else if (message['u_id'] == active_game[2]){
				send_code(ws.client_id, 'player2', message['u_id'], message['u_code'], g_id, message['session_id'], resigning2);
			}
		} catch (error) {
			logger.error(error);
		}
	});


});app.get('/' + this_server + 'n/:game_id', (req, res) => {
	res.sendFile(base + '/public/wait.html');
});

app.post('/' + this_server + 'ns/:game_id', (req, res) => {
	let g_id = req.params.game_id;

	Game.find({game_id: g_id})
		.then((result) => {
			if (result.length == 0){
				findAgain(req, res, g_id);
			} else if (result[0]['active'] == 0.5 && result[0]['server'] == this_server){
				init_game(g_id, result[0]['player1'], result[0]['player2'], 1, result[0]['server'], result[0]['p1_color'], result[0]['p2_color'], this_server_type);
				Game.updateOne({game_id: g_id}, {active: 1}, {upsert: true})
					.then(() => {
						res.status(200).send({ data: "game ready", server: this_server });
					});
			} else if (result[0]['active'] == 1 && result[0]['server'] == this_server){
				res.status(200).send({ data: "game already active", server: this_server });
			} else {
				res.status(404).send({ data: "something went wrong" });
			}
		})
		.catch((error) => {
			logger.error(error);
		});
});


//app.get('/' + this_server + 'stripe', (req, res) => {
//	logger.debug('stripe pay works');
//	
//	res.status(200).send({
//		data: 'donezoa'
//    });
//	
//});

function handleCheckout(checkout){
	let arr = checkout.client_reference_id.split(',');
	let c_code = get_color_num(arr[0]);
	add_color_to_user(arr[1], c_code);
}

function add_color_to_user(userid, color_code){
	User.findOneAndUpdate({user_id: userid}, {"$push": {"colors": color_code}}, {new: true, safe: true, upsert: true})
		.then(() => {
			logger.debug('Updated color %d for user %s', color_code, userid);
		})
		.catch((error) => {
			logger.error(error, 'Failed to update color');
		});
}



app.post('/' + this_server + 'stripe', express.json({type: 'application/json'}), (request, response) => {
	const event = request.body;

	switch (event.type) {
		case 'payment_intent.succeeded':
			logger.debug('Payment intent succeeded');
			break;
		case 'checkout.session.completed':
			handleCheckout(event.data.object);
			break;
		case 'payment_method.attached':
			logger.debug('Payment method attached');
			break;
		default:
			logger.debug('Unhandled Stripe event type: %s', event.type);
	}

	response.json({received: true});
});


app.get('/' + this_server + '/:game_id', (req, res) => {
	let g_id = req.params.game_id;
	let active_game = active_games[g_id];
	if (active_game == undefined){
		Game.find({game_id: g_id})
			.then((result) => {
				if (result.length == 0){
					res.sendFile(base + '/public/nope.html');
				} else if (result.length == 1){
					res.sendFile(base + '/public/game-status.html');
				} else {
					res.sendFile(base + '/public/nope.html');
				}
			})
			.catch((error) => {
				logger.error(error);
			});
	} else if (active_game[0] == 1){
		res.sendFile(base + '/public/game.html');
	} else {
		if (this_server_type == "tutorial" && active_game[0] == 0){
			logger.debug('Game %s is being finalized', g_id);
		} else {
			logger.warn('Unexpected game state for %s', g_id);
			res.sendStatus(404);
		}
	}
});



app.use('/' + this_server + '/a/', express.static(base + '/public', {extensions: ["html"]}));

// Internal server error (500)
app.use((err,req,res,next)=>{
	logger.error(err)
	res.status(500).send("Something blew up, sorry!")
})

server.listen(5000, () => logger.info('Listening on port :5000'));