//setup
const express = require('express');
const app = express();
app.set('trust proxy', true);
const crypto = require("crypto");
const fetch = require('node-fetch');
const server = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const {Worker} = require('worker_threads');
const config = require('./config');
const ejs = require('ejs');
const os = require('os');
const pino = require('pino')
const fs = require('fs');
const mongoSanitize = require('express-mongo-sanitize');

const { generateUniqueString, get_color, get_color_num, color_validity } = require('./utils/helpers');
const createRateLimiter = require('./middleware/rateLimiter');

const logger = pino({
  transport: {
		targets: [
			{ target: "pino-pretty", level: "debug"},
			{ target: "pino/file", options: {destination: "/var/log/main.log"}, level: "trace"},
		]
	},
	level: "trace",
})

logger.info("Main server booting up!")

const check_limiter = createRateLimiter(logger);

const userSocketMap = {}

// // ----- automatching -----

function requestGameServerUpdate(srvr, gid){
		try {
			fetch(config.frontendAddress + '/' + srvr + 'ns/' + gid, { // CHANGE THIS BEFORE COMMIT
						method: "POST",
						headers: {
							Accept: "application/json",
							"Content-Type": "application/json"
						},
						body: JSON.stringify({
							game_id: gid
					})
			}).then(response => response.json())
					.then(response => {
					active_games[gid][0] = 1;
					// logger.debug(active_games[gid]);
					// logger.debug(response);
				})
					.catch(err => {
						logger.error(err);
				});
		} catch (error) {
			logger.error(error);
		}
}

function update_game_db(gid, srvr, p1id, p2id, p1color, p2color, p1rating, p2rating){
	const game = new Game({
		game_id: gid,
		server: srvr,
		player1: p1id,
		player2: p2id,
		p1_session_id: '',
		p2_session_id: '',
		p1_color: p1color,
		p2_color: p2color,
		p1_rating: p1rating,
		p2_rating: p2rating,
		winner: '',
		ranked: 1,
		active: 0.5,
		game_duration: 0,
		observers: 0,
		game_file: '',
		last_update: (+new Date())
	});

	game.save()
		.then((result)=>{
			logger.debug('Saved game to database');
			// logger.debug(result);
			return requestGameServerUpdate(srvr, gid);
		})
		.catch((error) => {
			logger.error(error);
		})
}

// new matchmaking system

let matchmaking_queue = [];

// let matchmaking_user_example = {
// 	id: 'test',
// 	rating: 1500,
// 	time_in_queue: 0, // in milliseconds
// 	color: '???',
// 	lives: 3, // if this number touches 0, the user is removed from the queue
// }

let users_joining_match = {};

// add time to users in queue
setInterval(()=>{
	for (let i = 0; i < matchmaking_queue.length; i++){
		matchmaking_queue[i].lives -= 1; // knocking on the /automatch-status endpoint adds a life
		matchmaking_queue[i].time_in_queue += 1000;
	}
	matchmaking_queue = matchmaking_queue.filter(user => user.lives > 0);
}, 1000)

function matchmake(){
	// if theres 1 or fewer users in the queue, you can't pair them up...
	if (matchmaking_queue.length < 2) return;
	logger.debug("Matchmaking...");

	// people that has been in the queue for the longest time should be prioritized
	let prioritized_queue = matchmaking_queue.sort((a,b)=>
		a.time_in_queue - b.time_in_queue
	);

	let matched_pairs = []
	const MAX_RATING_GAP_BASE = 200;
	const RATING_GAP_PER_SEC = 10;

	// Find pairs and add them to matched_pairs
	while (prioritized_queue.length >= 2) {
		let user = prioritized_queue[0];
		let rating_window = MAX_RATING_GAP_BASE + (user.time_in_queue / 1000) * RATING_GAP_PER_SEC;
		let candidates = prioritized_queue
			.filter((user2) => user2.id !== user.id && Math.abs(user.rating - user2.rating) <= rating_window)
			.sort(
				(a, b) =>
					Math.abs(user.rating - a.rating) - Math.abs(user.rating - b.rating)
			);
		let closest_rated_user = candidates[0];
		if (closest_rated_user == null) {
			prioritized_queue = prioritized_queue.filter(u => u.id !== user.id);
			continue;
		}
		matchmaking_queue = matchmaking_queue.filter(u =>
			u.id !== closest_rated_user.id &&
			u.id !== user.id
		);
		prioritized_queue = prioritized_queue.filter(u =>
			u.id !== closest_rated_user.id &&
			u.id !== user.id
		);
		matched_pairs.push([user, closest_rated_user]);
	}

	logger.info("Matchmaking matched pairs:", matched_pairs);

	// Start games with the matched pairs
	for (let pair of matched_pairs) {
		let chosen_server = pick_server('real');

		let user1 = pair[0];
		let user2 = pair[1];

		let init_status = 0.5;
		let game_id = new_game(user1.id, user2.id, init_status, chosen_server);
		
		//add server
		users_joining_match[user1.id] = {game_id, server: chosen_server};
		users_joining_match[user2.id] = {game_id, server: chosen_server};
		
		update_game_db(game_id, chosen_server, user1.id, user2.id, user1.color, user2.color, user1.rating, user2.rating);
	}

	for (let x of Object.entries(users_joining_match)) {
		let userid = x[0];
		let game = x[1];
		let user = matched_pairs.flat().find(u => u.id == userid);
		if (game == null || user.socket == null) {continue};
		user.socket.send(JSON.stringify({
			type: "match-found",
			data: {
				game_id: game.game_id,
				server: game.server
			}
		}))
		delete users_joining_match[userid];
	}
}

const { generateSecureString } = require('./utils/helpers');

const workers = {};
//active_games[game_id] = 0.5 means game is pending (e.g. waiting for p2 to connect)
//active games[game_id] = [status, player1_id, player2_id, server];
const active_games = {};
const tutorial_finishings = {};

let servers = {};
const server_count = {};

//pick random server from servers based on type, weighted by value and current count from server_count
function pick_server(type) {
	let type_servers = servers[type];
	let total_weight = Object.values(type_servers).reduce((a, s) => a + s, 0);
	let total_count = Object.keys(type_servers).reduce((a, s) => a + (server_count[s] || 0), 0) + 1;

	let bestdiff = Infinity;
	let best = null;
	for(let server in type_servers) {
		let server_goal = (type_servers[server] / total_weight) * total_count;
		let diff = (server_count[server]||0) - server_goal;
		if(diff < bestdiff) {
			bestdiff = diff;
			best = server;
		}
	}
	if(!(best in server_count)) {
		server_count[best] = 0;
	}
	server_count[best]++;
	return best;
}

const this_server = process.env.SERVER || 'd1';
const this_server_type = process.env.SERVER_TYPE || 'real'; //'real'

const user_sessions = {};

//connect to mongodb
const mongoose = require('mongoose');
const {User, Session} = require('./models/users.js');
const Game = require('./models/newgame.js');
const Server = require('./models/servers.js');
const dbURI = config.mongo;
mongoose.set('useCreateIndex', true);
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
	.then((result) => logger.info('Connected to MongoDB'))
	.catch((error) => logger.error(error));

function updateServers() {
	Server.find({}).then((db_servers) => {
		if(db_servers.length == 0) {
			servers = {
				real: {
					d1: 1
				},
				tutorial: {
					t2: 1
				}
			};
		} else {
			servers = {};
			for(let db_server of db_servers) {
				servers[db_server.type] = servers[db_server.type] || {};
				servers[db_server.type][db_server.server] = db_server.weight;
			}
		}
		logger.debug("Updated servers");
	})
	.catch((error) => logger.error(error));
}

updateServers();
setInterval(updateServers, 30000);

function new_game(pl1_id, pl2_id, init_status = 1, server_id = 'd4') {
	const g_id = generateUniqueString(3);
	active_games[g_id] = [0, 0, 0, 0];
	active_games[g_id][0] = init_status;
	active_games[g_id][1] = pl1_id;
	active_games[g_id][2] = pl2_id;
	active_games[g_id][3] = server_id;
	return g_id;
}


function handleCheckout(checkout){
	logger.debug('checkout reference id');
	logger.debug(checkout.client_reference_id);
	
	let arr = checkout.client_reference_id.split(',');
	logger.debug(arr[0]);
	logger.debug(arr[1]);
	
	let c_code = get_color_num(arr[0]);
	
	add_color_to_user(arr[1], c_code)
}

function add_color_to_user(userid, color_code){
	User.findOneAndUpdate({user_id: userid},{"$push": {"colors": color_code}},{new: true, safe: true, upsert: true }).then((result) => {
		logger.debug('updating color ' + color_code);
	}).catch((error) => {
		logger.debug('some error');
	});
}




app.post('/stripe', express.json({type: 'application/json'}), (request, response) => {
	logger.info('Stripe pay works');
	const event = request.body;
	
  // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
				logger.debug('payment intent succeeded');
				logger.debug(paymentIntent);
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case 'checkout.session.completed':
        const checkoutSession = event.data.object;
				logger.debug('checkout done');
				logger.debug(checkoutSession);
		handleCheckout(checkoutSession);
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        logger.debug('payment method')
        break;
      // ... handle other event types
      default:
        logger.debug(`Unhandled event type ${event.type}`);
    }
	
	response.json({received: true});
	
});




function tutorial_game(req, res, pl_id){
	
	const chosen_server = pick_server('tutorial');
	
	
	let g_id = new_game(pl_id, 'easy-bot', 1, chosen_server);
	

	res.status(200).send({
		g_id: g_id,
		meta: 'easy-bot',
		server: chosen_server
    });
	
	const game = new Game({
		game_id: g_id,
		server: chosen_server,
		player1: 'anonymous',
		player2: 'easy-bot',
		p1_session_id: req.body.session_id,
		p2_session_id: 'bot',
		p1_color: 'color1',
		p2_color: 'color2',
		p1_rating: 1000,
		p2_rating: 100,
		winner: '',
		ranked: 0,
		active: 0.5,
		game_duration: 0,
		observers: 0,
		game_file: '',
		last_update: (+new Date())
	});
	
	game.save()
		.then((result) => {
			logger.info('Game saved to db');
			requestGameServerUpdate(chosen_server, g_id);
		})
		.catch((error) => {
			logger.error(error);
		})
}

function bot_game(data, botinfo){

	// REMOVE FROM AUTO-MATCH QUEUE
	// actively_waiting[req.body.user_id] = 0;
	let basic_colors = ['color1', 'color2', 'color3', 'color4'];
	
	let chosen_server = pick_server('real');

	if (data.force_server != undefined){
		chosen_server = data.force_server;
	}

	let pl1 = {
		id: data.user_id,
		session_id: data.session_id,
		rating: 1000,
		color: get_color(data.user_color),
	}
	let pl2 = botinfo;

	if(Math.random() > 0.5) {
		[pl1, pl2] = [pl2, pl1];
	}
	
	let g_id = new_game(pl1.id, pl2.id, 0.5, chosen_server);
	
	const game = new Game({
		game_id: g_id,
		server: chosen_server,
		player1: pl1.id,
		player2: pl2.id,
		p1_session_id: pl1.session_id,
		p2_session_id: pl2.session_id,
		p1_color: pl1.color,
		p2_color: pl2.color,
		p1_rating: pl1.rating,
		p2_rating: pl2.rating,
		winner: '',
		ranked: 0,
		active: 0.5,
		game_duration: 0,
		observers: 0,
		game_file: '',
		last_update: (+new Date())
	});

	// let bot = [pl1,pl2].find(x => x.session_id === "bot");
	let playerIndex = [pl1,pl2].findIndex(x => x.session_id !== "bot");
	let player = [pl1,pl2][playerIndex];

	User.findOne({user_id: player.id}).then(result => {
		if (!!result && !color_validity(player.color, result.colors)) {
			game[(playerIndex===0?"p1":"p2")+"_color"] = "color1"
		}
		game.save()
			.then((result) => {
				logger.debug('Game saved to db');
				requestGameServerUpdate(chosen_server, g_id);
			})
			.catch((error) => {
				logger.error(error);
			});
	}) 
	return {
		g_id: g_id,
		meta: botinfo.id,
		server: chosen_server
	}
}

function muffin_bot_game(data){
	return bot_game(data, {
		id: 'muffin-bot',
		session_id: 'bot',
		rating: 500,
		color: 'color2'
	});
}

function cleo_bot_game(data){
	return bot_game(data, {
		id: 'cleo-bot',
		session_id: 'bot',
		rating: 700,
		color: 'color2'
	});
}

function friend_challenge(data){
	
	const chosen_server = pick_server('real');
	const color_code = get_color(data.user_color);
		
	let init_status = 0.5;
	let g_id = new_game(data.user_id, 0, init_status, chosen_server);
		
	const game = new Game({
		game_id: g_id,
		server: chosen_server,
		player1: data.user_id,
		player2: '',
		p1_session_id: data.session_id,
		p2_session_id: '',
		p1_color: color_code,
		//p1_color: req.body.user_color,
		p2_color: 'color2',
		p1_rating: 0,
		p2_rating: 0,
		winner: '',
		ranked: 0,
		active: 0.5,
		game_duration: 0,
		observers: 0,
		game_file: '',
		last_update: (+new Date())
	});

	game.save()
		.then((result) => {
			logger.debug('Game saved to db');
		})
		.catch((error) => {
			logger.error(error);
		});

	return {
		g_id: g_id,
		meta: 'waiting for p2'
  }
	//redirect and wait for both players to connect
}


function automatch(req, res){
	
}

function discord_postmessage(hook, msg){
	try {
		fetch(hook, {
	        method: "POST",
	        headers: {
	          Accept: "application/json",
	          "Content-Type": "application/json"
	        },
	        body: JSON.stringify({
		        content: msg
		    })
		}).then(response => response.json())
	      .then(response => {
			  // logger.debug(response);
		  })
	      .catch(err => {
			  logger.error(err);
		  });
	} catch (e) {
		logger.error(e);
	}
	
}


async function discord_automatch_bot(usr){
  let matchingusers = await User.find({user_id: usr})
  if (matchingusers.length === 0) return;
	discord_postmessage(config.hooks.queue, usr + ' is waiting in the queue');
}


// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.use(mongoSanitize());

app.post('/check-status/:game_id', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	let game_id_url = req.params.game_id;
	if (active_games[game_id_url][0] == 0.5){
		res.status(200).send({
			player1: active_games[game_id_url][1],
			player2: '',
			server: active_games[game_id_url][3],
			data: 'not yet'
        });
	} else if (active_games[game_id_url][0] == 1){
		res.status(200).send({
			player1: active_games[game_id_url][1],
			player2: active_games[game_id_url][2],
			server: active_games[game_id_url][3],
			data: 'ready'
        });
	} else {
		data: 'game cancelled'
	}
});


app.get('/active-games/:user_id', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	
	let user_id = req.params.user_id;	
	let active_g = [];
	
	for (let key in active_games) {
	    if (!active_games.hasOwnProperty(key)) continue;
	    let game_l = active_games[key];
		let ret = key;
		if(req.query.v == '2') {
			ret = {id: key, server: game_l[3], pl1: game_l[1], pl2: game_l[2]};
		}

		if (game_l[1] == user_id) active_g.push(ret);
		if (game_l[2] == user_id) active_g.push(ret);
	}
	
	if (active_g.length > 0){
		res.status(200).send({
			data: active_g
        });
	} else {
		res.status(200).send({
			data: 'no active games'
        });
	}
	
	
});


app.post('/' + this_server + '/tutorial-signup', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}

	Game.find({game_id: req.body.game_id})
		.then((result) => {
			//res.send(result);
			// logger.debug('dbdb result');
			// logger.debug(result);
			if (result.length == 0){
				res.status(200).send({
		        	data: "no game found"
		        });
			} else if (result[0]['active'] == 1 && result[0]['player1'] == 'anonymous'){
				Game.updateOne({game_id: req.body.game_id}, {player1: req.body.user_id}, {upsert: true})
					.then((qq) => {
						logger.debug('anonymous changed to ' + req.body.user_id);
						res.status(200).send({
				        	data: "updated"
				        });
					});	
					workers[req.body.game_id].postMessage({data: "update anonymous", player1: req.body.user_id});
			} else {
				res.status(404).send({
		        	data: "something went wrong"
		        });
			}
		})
		.catch((error) => {
			logger.error(error);
		})

});

app.get('/game/:game_id', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	
	let game_id_url = req.params.game_id; // eslint-disable-line no-unused-vars
	res.sendFile(__dirname + '/public/game.html');
});



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
	      .then(response => {
					// logger.debug(response);
		  })
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
	      .then(response => {
					// logger.debug(response);
		  })
	      .catch(err => {
					logger.error(err);
		  });
	} catch (error) {
		logger.error(error);
	}
}

function deactivate_game(game_id){
	try {
		if(game_id in active_games){
			const serv_id = active_games[game_id][3];
			server_count[serv_id]--;
			delete active_games[game_id];
		}
		delete tutorial_finishings[game_id];
	} catch (error) {
	  logger.error(error);
	}
}

setInterval(function(){
	const updates = [];

	const game_ids = Object.keys(active_games);
	if(game_ids.length == 0) {
		return;
	}
	Game.find({game_id: {$in: game_ids}}).then((games) => {
		// logger.debug("active games: " + games.map(g => g.game_id).join(','));
		for(let game of games) {
			// logger.debug(game.last_update);
			if(!game.last_update || game.last_update < (+new Date()) - (1000 * 60)) {
				logger.debug("Deactivating game " + game.game_id);
				deactivate_game(game.game_id);
				updates.push(game.game_id);
			}
		}
		if(updates.length > 0) {
			Game.updateMany({game_id: {$in: updates}}, {active: 0}).catch(err => {
				logger.error(err)
			});
		}
	}).catch((error) => {
		logger.error(error);
	});

}, 60000);

app.post('/gameinfo', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}

	Game.find({game_id: req.body.game_id})
		.then((result) => {
			//res.send(result);
			// logger.debug('getting game info');
			//logger.debug(result);
			//logger.debug(result[0]['active']);
			if (result.length == 0){
				res.status(200).send({
		        	data: "no game found"
		        });
			} else if (result[0]['active'] == 1){
				res.status(200).send({
		        	data: "corrupted",
				server: result[0]['server'],
				ranked: result[0]['ranked'],
				p1: result[0]['player1'],
				p1_color: result[0]['p1_color'],
				p1_rating: result[0]['p1_rating'],
				p2: result[0]['player2'],
				p2_color: result[0]['p2_color'],
				p2_rating: result[0]['p2_rating'],
				c_day: result[0]['createdAt']
		        });
			} else if (result[0]['active'] == 0){
				res.status(200).send({
		        	data: "finished",
				server: result[0]['server'],
				ranked: result[0]['ranked'],
				winner: result[0]['winner'],
				p1: result[0]['player1'],
				p1_color: result[0]['p1_color'],
				p1_rating: result[0]['p1_rating'],
				p2: result[0]['player2'],
				p2_color: result[0]['p2_color'],
				p2_rating: result[0]['p2_rating'],
				c_day: result[0]['createdAt']
		        });
			} else {
				res.status(200).send({
		        	data: "something went wrong"
		        });
			}
		})
		.catch((error) => {
			logger.error(error);
		})

});

const AWS = require('aws-sdk');
let compress = require('./compress/compress.js');
AWS.config.setPromisesDependency(null);

const s3client = new AWS.S3({
	accessKeyId: config.s3.key,
	secretAccessKey: config.s3.secret,
	endpoint: config.s3.endpoint,
	s3ForcePathStyle: !config.s3.bucketEndpoint,
	s3BucketEndpoint: config.s3.bucketEndpoint
});

if(!config.s3.bucketEndpoint) {
	s3client.createBucket({
		ACL: 'public-read',
		Bucket: config.s3.bucket,
	}).promise().catch(err => {
		if (err.code === 'BucketAlreadyOwnedByYou') {
			logger.info('S3 bucket already exists, skipping creation');
		} else {
			logger.error(err);
		}
	});
}

const deps = { logger, check_limiter, config, s3client };
app.use(require('./routes/auth')(deps));
app.use(require('./routes/modules')({ ...deps, s3client }));
app.use(require('./routes/misc')(deps));

app.post('/get_replay', async (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	
	try {
		let data = await s3client.getObject({
			Bucket: config.s3.bucket,
			Key: 'replays/' + req.body.game_id + '.json.comp',
		}).promise();
		// logger.debug(data);
		res.status(200).send(compress.decompress(data.Body));
		return;
	} catch (err) {
		logger.error(err);
	}

	try {
		let data = await s3client.getObject({
			Bucket: config.s3.bucket,
			Key: req.body.game_id + '.json',
		}).promise();
		// logger.debug(data);
		res.status(200).send(data.Body);
		return;
	} catch (err) {
		res.status(404).send({
			meta: "no replay found"
		});
	}
});



app.get('/set-muffin', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	
	User.updateMany({}, {"$set":{"goodenough": 0}}, {upsert: true})
		.then((result) => {
			//res.send(result);
			logger.debug('set muffin bot beaten?');
			
			res.status(200).send({
	        	data: "done muffin?"
	        });
			
		})
		.catch((error) => {
			logger.error(error);
		})
});

app.get('/set-email', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	
	User.updateMany({}, {"$set":{"email": ""}}, {upsert: true})
		.then((result) => {
			//res.send(result);
			logger.debug('set email?');
			
			res.status(200).send({
	        	data: "done email?"
	        });
			
		})
		.catch((error) => {
			logger.error(error);
		})
});



app.post('/deactivate', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	// logger.debug('deactivating');
	// logger.debug(req.body.game_id);
	deactivate_game(req.body.game_id);
	
	res.status(200).send({
		data: 'done'
    });
	
});


app.post('/get-qualified', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	// logger.debug('retreiving qualified players');
	
	User.find({qualified: {$ne: "", $exists: true}})
		.then((result) => {
			//res.send(result);
			logger.debug('getting qualified players');
			// logger.debug(result);
			if (result.length == 0){
				res.status(200).send({
		        	data: "no players"
		        });
			} else {
				// logger.debug(result);
				let qual_arr = [];
				for (let i = 0; i < result.length; i++){
					qual_arr.push([result[i].user_id]);
				}
				// logger.debug(qual_arr);
				res.status(200).send({
		        	data: "all good",
					players: qual_arr
		        });
			}
		})
		.catch((error) => {
			logger.error(error);
		})
	
});


app.get('/t2f/est', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	// logger.debug('triggerring');
	trigger_deactivation();	
});
// ------
// ------
app.get('/challenge/:game_id', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	
	let active_game = active_games[req.params.game_id];
	if(active_game == undefined){
		res.sendStatus(404);
		return;
	}
	if (active_game[0] == 1){
		res.sendFile(__dirname + '/public/game.html');
	} else if (active_game[0] == 0.5){
		//pending – waiting for p2 to connect
		res.sendFile(__dirname + '/public/challenge.html');
		//active_games[g_id] = 1;
	} else {
		res.send(404);
	}
});

app.post('/validate-challenge/:game_id', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	
	let g_id = req.params.game_id;
	//find via mongoose, check if player1 != player2
	// logger.debug('finding game via mongoooooooooooooooooooose');
	Game.find({game_id: g_id})
		.then((result) => {
			//res.send(result);
			// logger.debug('db result');
			if (result.length == 0){
				res.status(404).send({
		        	data: "no game found"
		        });
			} else if (result[0]['player1'] == req.body.user_id){
				//challenge creator = acceptor :(
				res.status(404).send({
		        	data: "own challenge"
		        });
			
			} else {
				Game.updateOne({game_id: g_id}, {player2: req.body.user_id, p2_session_id: req.body.session_id}, {upsert: true})
					.then((qq) => {
						let active_game = active_games[g_id];
						if(active_game != undefined){
							active_game[2] = req.body.user_id;
							// logger.debug('p2_session_id updated');
							//start_world(g_id);
						} else{
							logger.debug('WTF game ' + g_id + ' probably canceled in the meantime? race condition?');
						}
					});
				
				//create_worker(g_id, 'nonranked');
				res.status(200).send({
		        	data: "challenge connected"
		        });
				//active_games[g_id] = 1;
			}
		})
		.catch((error) => {
			logger.error(error);
			res.status(404).send({
				data: "no game found"
			});
		})
});
app.post('/confirm-challenge/:game_id', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	
	let g_id = req.params.game_id;
	let active_game = active_games[g_id];
	if(active_game == undefined){
		res.status(404).send({ data: "no game found" });
		return;
	}
	//find via mongoose, check if player1 != player2
	if (active_game[0] == 0.5){
		//access mongoose and update game document
		active_game[2] = req.body.user_id;
		active_game[0] = 1;
		
		Game.find({game_id: g_id})
			.then((result) => {
				//res.send(result);
				// logger.debug('updating p2 in db');
				if (result.length == 0){
					res.status(404).send({
			        	data: "no game found"
			        });
				} else {
					Game.updateOne({game_id: g_id}, {player2: req.body.user_id, p2_session_id: req.body.session_id, p2_color: get_color(req.body.user_color)}, {upsert: true})
						.then((qq) => {
							let active_game = active_games[g_id];
							if(active_game != undefined){
								active_game[2] = req.body.user_id;
								// logger.debug('p2_details updated');
							} else
							logger.debug('WTF 2 game ' + g_id + ' probably canceled in the meantime? race condition?');
							//start_world(g_id);
						});
					Game.findOne({game_id: g_id}).then(result=>{
						requestGameServerUpdate(active_game[3], g_id);
						res.status(200).send({
							data: "accepted",
							server: active_game[3]
						});
						userSocketMap[result.player1].send(JSON.stringify({
							type: "match-found",
							data: {
								server: active_game[3],
								game_id: g_id
							}
						}))
					})
				
					//create_worker(g_id, 'nonranked');
					
				}
			})
			.catch((error) => {
				logger.error(error);
			})
		
	} else if (active_game[0] == 1){
		//if player1 confirming, redirect to game and start it (allow code change)
		Game.find({game_id: g_id})
			.then((result) => {
				//res.send(result);
				// logger.debug('db result');
				if (result.length == 0){
					res.status(404).send({
			        	data: "no game found"
			        });
				} else if (result[0]['player1'] == req.body.user_id){
					//start the game
					res.status(200).send({
			        	data: "start",
						server: result[0]['server']
			        });
			
				} else {
					res.status(200).send({
			        	data: "not owner"
			        });
				}
			})
			.catch((error) => {
				logger.error(error);
			})
	} else {
		logger.error('something went wrong here');
	}
	
})
app.post('/resume-game', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	
	// logger.debug(req.body);
	// logger.debug(req.body.user_name);
  //   logger.debug(req.body.password);
	
	Game.find({game_id: req.body.game_id})
		.then((result) => {
			//res.send(result);
			// logger.debug('db result');
			if (result.length == 0){
				res.status(404).send({
		        	data: "game not found"
		        });
			} else if (result[0].active == 1){
				res.status(200).send({
		        	data: "game found",
					p1: result[0].player1,
					p2: result[0].player2,
					duration: result[0].game_duration,
					server: result[0].server,
					game_id: result[0].game_id
		        });
			} else if (result[0].active == 0){
				res.status(200).send({
		        	data: "game not active"
		        });
			} else {
				res.status(200).send({
		        	data: "this should not happen"
		        });
			}
		})
		.catch((error) => {
			logger.error(error);
		})
});
app.post('/monitor', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	// logger.debug(req.body);
	tutorial_finishings[req.body.game_id] = req.body.phase;
	
	res.status(200).send({
    	data: 'monitoring data saved'
    });
});
app.post('/qqmonitoring', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	// logger.debug(req.body);
	
	res.status(200).send({
		data: 'basic',
    	active_games: active_games,
		tutorials: tutorial_finishings
    });
});
//global
let player1_id = 'ab1';
let player2_id = 'zx2';
let player1_code;
let player1_session = 'abc';
let player2_code;
let player2_session = 'xyz';
let player1_code_temp;
let player2_code_temp;
//var code_temps = {};
let tutorial = {};
let processTime1 = 0;
let processTime2 = 0;
let processTimeRes = 0;
//var render_data = [[],[],[],[],[]];
app.get('/d1n/:game_id', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	
	let g_id = req.params.game_id;
	//if (active_games[g_id][0] == 1){
	//	res.redirect('/' + d1 + '/' + g_id);
	//} else {
	res.sendFile(__dirname + '/public/wait.html');
	//}
	
});
app.get('/replay/:game_id', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	
	let g_id = req.params.game_id;
	//if (active_games[g_id][0] == 1){
	//	res.redirect('/' + d1 + '/' + g_id);
	//} else {
	res.sendFile(__dirname + '/public/replay.html');
	//}
	
});
app.post("/launchtut", (req,res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	
	tutorial_game(req,res,req.body.user_id)
})
function findAgain(req, res, g_id){
	Game.find({game_id: g_id})
		.then((result) => {
			//res.send(result);
			// logger.debug('db result');
			//logger.debug(result);
			if (result.length == 0){
				res.status(200).send({
		        	data: "no game found"
		        });
			} else if (result[0]['active'] == 0.5 && result[0]['server'] == 'd1'){
				init_game(g_id, result[0]['player1'], result[0]['player2'], 1, result[0]['server'], result[0]['p1_color'], result[0]['p2_color'], 'real'); // eslint-disable-line no-undef
				Game.updateOne({game_id: g_id}, {active: 1}, {upsert: true})
					.then((qq) => {
						// logger.debug('game is ready');
						res.status(200).send({
				        	data: "game ready",
							server: 'd1'
				        });
					});			
			} else if (result[0]['active'] == 1 && result[0]['server'] == 'd1'){
				// logger.debug('game already active, redirect');
				res.status(200).send({
		        	data: "game already active",
					server: 'd1'
		        });				
			} else {
				res.status(404).send({
		        	data: "something went wrongg"
		        });
			}
		})
		.catch((error) => {
			logger.error(error);
		})
}

// This is a pretty bad way of doing it, should be changed
const adminpassword = process.env.ADMINPANEL_PASSWORD || "yareyareyareyare4444"

app.get('/server-weight/:server_id/:weight', (req, res) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	
	if(req.query.password != adminpassword) {
		res.send(404);
		return;
	}
	Server.updateOne({server: req.params.server_id}, {weight: req.params.weight}).then((result) => {
		updateServers();	
		res.send(200)
	})
	.catch((error) => {
		logger.error(error)
	});
});

app.get("/admin-panel/dash", async (req,res,next) => {
	if (check_limiter(req.ip)){
		res.status(200).send({
			data: 'no!'
        });
		return;
	}
	
	if (req.query.password != adminpassword) {
	return res.status(400).redirect("/admin-panel/login")
	}

	let dashPath = "./public/admin-panel/dash/index.ejs"

	// Renturns rendered html
	let rendered = await ejs.renderFile(dashPath, {
		sysinfo: {
			arch: os.arch(),
			os: process.platform,
			mem: {
				total: os.totalmem(),
				free: os.freemem(),
				used: os.totalmem() - os.freemem()
			},
			hostUptime: os.uptime(),
			uptime: process.uptime(),
		},
		gameinfo: {
			userAccounts: (await User.count({})),
			userSessions: (await Session.count({})),
			gameServers: servers,
			games: active_games,
			usersInQueue: matchmaking_queue
		},
		serverinfo: {
			logs: fs.readFileSync("/tmp/logs", "utf8").split("\n").reverse().slice(0, 100).reverse().join("\n")
		}
	})
	res.status(200).send(rendered)
})

app.get("/admin-panel", (req,res,next)=>{res.redirect("/admin-panel/login")})

app.use(express.static('public', {extensions: ["html"]}));

function wssBroadcast(data){
	wss.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});
}

function automatchStatusContent(){
	return JSON.stringify({
		type: "automatch-status",
		data: {
			peopleAutomatching: matchmaking_queue.length,
		}
	})
}

function sendAutomatchStatus(){
	wssBroadcast(automatchStatusContent())
}

async function newGame(data, socket){
	// NOTE: bot game cases below share similar logic and could be consolidated into a single handler
	let response = {}
	switch(data.type) {
		case "heartbeat":
			logger.debug('heartbeat received')
			response = {
				meta: "ok",
			}
			break;
		case "muffin-bot":
			response = muffin_bot_game(data)
			socket.send(JSON.stringify({
				type: "match-found",
				data: {
					server: response.server,
					game_id: response.g_id
				}
			}))
			break;
		case "cleo-bot":
			response = cleo_bot_game(data)
			socket.send(JSON.stringify({
				type: "match-found",
				data: {
					server: response.server,
					game_id: response.g_id
				}
			}))
			break;
		case "challenge":
			response = friend_challenge(data);
			socket.send(JSON.stringify({
				type: "challenge-wait",
				data: {
					game_id: response.g_id
				}
			}))
			break
		case "ranked":
			const user = await User.findOne({user_id: data.user_id})
			if (user == null) {
				logger.error("User not found")
				return;
			}
			if (matchmaking_queue.findIndex(x => x.id == user.user_id) != -1) {
				response = {
					meta: "already-in-queue",
				}
				return;
			}
			discord_automatch_bot(data.user_id);
			let play_color = get_color(data.user_color)

			if (!color_validity(play_color, user.colors)) {
				play_color = 'color1';
			} 

		let toAdd = {
			id: user.user_id,
			rating: user.rating,
			time_in_queue: 0, // in milliseconds
			color: play_color,
			lives: Infinity, // how many seconds user has to be inactive to be removed from queue
			socket
		}
			
			matchmaking_queue.push(toAdd)
			matchmake()
			sendAutomatchStatus()
			response = {
				meta: 'automatching'
			}
			socket.on("close", ()=>{
				matchmaking_queue = matchmaking_queue.filter(e => e.id != toAdd.id)
				sendAutomatchStatus()
			})
			break;
		default:
			response = {
				meta: "something went wrong (df)",
			}
			break;
	}
}

// Automatch socket system
wss.on("connection", (ws)=>{
	ws.send(automatchStatusContent())
	ws.on("message", async (msg) => {
	let message;
	try { message = JSON.parse(msg); } catch (e) { return; }
	switch(message.type){
			case "join":
				//if (message.data.user_id == 'anonymous') return;
			let session = await Session.find({session_id: message.data.session_id})
			if (session.length === 0 && message.data.user_id != 'anonymous') return;
				userSocketMap[message.data.user_id] = ws;
				ws._yare_user_id = message.data.user_id;
				newGame(message.data, ws)
				ws.send(JSON.stringify({
					type: "joining",
					data: {
						message: "OK"
					}
				}))
				break;
		}
	})
	ws.on("close", () => {
		if (ws._yare_user_id) {
			if (userSocketMap[ws._yare_user_id] === ws) {
				delete userSocketMap[ws._yare_user_id];
			}
			delete users_joining_match[ws._yare_user_id];
		}
	})
})

// Route not found (404)
app.use((req,res,next)=>{
  return res.status(404).send("404: Not Found");
});

// Internal server error (500)
app.use((err,req,res,next)=>{
	logger.error(err)
	res.status(500).send("Something blew up, sorry!")
})

server.listen(5000, () => logger.info('Listening on port :5000'))
automatch();
