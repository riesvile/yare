//setup
const express = require('express');
const app = express();
const crypto = require("crypto");
const fetch = require('node-fetch');
const sha256 = hash_string => crypto.createHash('sha256').update(hash_string, 'utf8').digest('hex');
const server = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const {Worker} = require('worker_threads');
const config = require('./config');
const zlib = require('zlib');
const ejs = require('ejs');
const os = require('os');
const bcrypt = require('bcrypt');
var hashRounds = 10;

function randomString(length) {
	return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

function generateUniqueString(prefix) {
	var timeStampo = String(new Date().getTime()),
			i = 0,
			out = '';

	for (i = 0; i < timeStampo.length; i += 2) {
			out += Number(timeStampo.substr(i, 2)).toString(36);
	}

	return (randomString(prefix) + out);
}

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
					console.log(active_games[gid]);
					console.log(response);
				})
					.catch(err => {
					console.log(err);
				});
		} catch (error) {
			console.log(error);
		}
}

function update_game_db(gid, srvr, p1id, p2id, p1shape, p2shape, p1color, p2color, p1rating, p2rating){
	const game = new Game({
		game_id: gid,
		server: srvr,
		player1: p1id,
		player2: p2id,
		p1_session_id: '',
		p2_session_id: '',
		p1_shape: p1shape,
		p2_shape: p2shape,
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
			console.log('am game saved to db');
			console.log(result);
			return requestGameServerUpdate(srvr, gid);
		})
		.catch((error) => {
			console.log(error);
		})
}

// new matchmaking system

let matchmaking_queue = [];

// let matchmaking_user_example = {
// 	id: 'test',
// 	rating: 1500,
// 	time_in_queue: 0, // in milliseconds
// 	shape: 'circles',
// 	color: '???',
// 	lives: 3, // if this number touches 0, the user is removed from the queue
// }

let users_joining_match = {};

// add time to users in queue
setInterval(()=>{
	for (i = 0; i < matchmaking_queue.length; i++){
		matchmaking_queue[i].lives -= 1; // knocking on the /automatch-status endpoint adds a life
		matchmaking_queue[i].time_in_queue += 1000;
	}
	matchmaking_queue = matchmaking_queue.filter(user => user.lives > 0);
}, 1000)

function matchmake(){
	// if theres 1 or fewer users in the queue, you can't pair them up...
	if (matchmaking_queue.length < 2) return;
	console.log("Matchmaking...");

	// people that has been in the queue for the longest time should be prioritized
	let prioritized_queue = matchmaking_queue.sort((a,b)=>
		a.time_in_queue - b.time_in_queue
	);

	let matched_pairs = []

	// Find pairs and add them to matched_pairs
	for (let user of prioritized_queue) {
		let closest_rated_user = prioritized_queue
			.filter((user2) => user2.id !== user.id)
			.sort(
				(a, b) =>
					Math.abs(user.rating - a.rating) - Math.abs(user.rating - b.rating)
			)[0];
		matchmaking_queue = matchmaking_queue.filter(u =>
			u.id !== closest_rated_user.id &&
			u.id !== user.id
		);
		prioritized_queue = prioritized_queue.filter(u =>
			u.id !== closest_rated_user.id &&
			u.id !== user.id
		);
		if (user != null && closest_rated_user != null)
			matched_pairs.push([user, closest_rated_user]);
	}

	console.log("Matchmaking matched pairs:", matched_pairs);

	// Start games with the matched pairs
	for (let pair of matched_pairs) {
		let chosen_server = pick_server('real');

		let user1 = pair[0];
		let user2 = pair[1];

		let game_id = new_game(user1.id, user2.id, init_status = 0.5, chosen_server);
		
		//add server
		users_joining_match[user1.id] = {game_id, server: chosen_server};
		users_joining_match[user2.id] = {game_id, server: chosen_server};
		
		update_game_db(game_id, chosen_server, user1.id, user2.id, user1.shape, user2.shape, user1.color, user2.color, user1.rating, user2.rating);
	}

	for (let x of Object.entries(users_joining_match)) {
		let userid = x[0];
		let game = x[1];
		let user = matched_pairs.flat().find(u => u.id == userid);
		if (game == null || user.socket == null) {console.log(user);continue};
		user.socket.send(JSON.stringify({
			type: "match-found",
			data: {
				game_id: game.game_id,
				server: game.server
			}
		}))
		users_joining_match[userid] = null;
	}
}

function generateSecureString(length) {
	return crypto.randomBytes(length/2).toString('hex');
}

var workers = {};
//active_games[game_id] = 0.5 means game is pending (e.g. waiting for p2 to connect)
//active games[game_id] = [status, player1_id, player2_id, server];
var active_games = {};
var tutorial_finishings = {};

var servers = {};
var server_count = {};

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

var this_server = process.env.SERVER || 'd1';
var this_server_type = process.env.SERVER_TYPE || 'real'; //'real'

var user_sessions = {};

//connect to mongodb
const mongoose = require('mongoose');
const {User, Session} = require('./models/users.js');
const Game = require('./models/newgame.js');
const Server = require('./models/servers.js');
const Module = require('./models/modules.js');
const dbURI = config.mongo;
mongoose.set('useCreateIndex', true);
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
	.then((result) => console.log('connected to dbb'))
	.catch((error) => console.log(error));

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
			console.log(db_servers);
			for(let db_server of db_servers) {
				servers[db_server.type] = servers[db_server.type] || {};
				servers[db_server.type][db_server.server] = db_server.weight;
			}
		}
		console.log(servers);
	})
	.catch((error) => console.error(error));
}

updateServers();
setInterval(updateServers, 30000);

function new_game(pl1_id, pl2_id, init_status = 1, server_id = 'd4', pla1_shape = 0, pla2_shape = 0) {
	var g_id = generateUniqueString(3);
	active_games[g_id] = [0, 0, 0, 0, 0, 0];
	active_games[g_id][0] = init_status;
	active_games[g_id][1] = pl1_id;
	active_games[g_id][2] = pl2_id;
	active_games[g_id][3] = server_id;
	//0=circle, 1=square, 2=triangle
	active_games[g_id][4] = pla1_shape;
	active_games[g_id][5] = pla2_shape;
	return g_id;
}

/*
function create_worker (game_id, game_type) {
  const worker = new Worker('./game.js', { workerData: [game_id, game_type] })
  worker.on('error', (err) => { throw err })
  worker.on('message', (render_data) => {
	  if (render_data.meta == 'initiate'){
		  console.log('initiate world');
		  try {
			  connections[render_data.client].send(render_data.data);
			  delete connections[render_data.client];
		  } catch (e){
			  console.log(e);
		  }
	  } else if (render_data.meta == 'test'){
		  console.log('testing');
		  console.log(render_data.data);
	  } else if (render_data.meta == 'monitoring'){
		  console.log('monitoring!!!!!!!!!');
		  trigger_monitoring(render_data.game_id, render_data.data);
	  } else {
		  console.log('processing render data');
		  console.log(render_data.game_id);
		  wss.broadcast(render_data.data, render_data.game_id);
	  }
	  
  })
  worker.on('exit', (code) => {
	  trigger_deactivation(game_id);
	  delete active_games[game_id];
  });
  
  
  workers[game_id] = worker;
}
*/
//create_worker('aatest');
//createWorker('bbbtrs');

function load_balancer(){
	//logic for redirects to the right server????
}

function get_color(color_name){
	switch(color_name){
		case 'gblue':
			return 'color3';
			break;
		case 'purply':
			return 'color1';
			break;
		case 'redish':
			return 'color2';
			break;
		case 'yerange':
			return 'color4';
			break;
		case 'wirple':
			return 'color5';
			break;
		case 'pistagre':
			return 'color6';
			break;
		case 'magion':
			return 'color7';
			break;
		case 'brigenta':
			return 'color8';
			break;
		case 'greson':
			return 'color9';
			break;
		case 'mmmsalmon':
			return 'color10';
			break;
		case 'skyblue':
			return 'color11';
			break;
		case 'toored':
			return 'color12';
			break;
		case 'rozblue':
			return 'color13';
			break;
		default:
			return 'color1';
	}
}

function get_color_num(color_name){
	switch(color_name){
		case 'gblue':
			return 3;
			break;
		case 'purply':
			return 1;
			break;
		case 'redish':
			return 2;
			break;
		case 'yerange':
			return 4;
			break;
		case 'wirple':
			return 5;
			break;
		case 'pistagre':
			return 6;
			break;
		case 'magion':
			return 7;
			break;
		case 'brigenta':
			return 8;
			break;
		case 'greson':
			return 9;
			break;
		case 'mmmsalmon':
			return 10;
			break;
		case 'skyblue':
			return 11;
			break;
		case 'toored':
			return 12;
			break;
		case 'rozblue':
			return 13;
			break;
		default:
			return 'color1';
	}
}

function handleCheckout(checkout){
	console.log('checkout reference id');
	console.log(checkout.client_reference_id);
	
	let arr = checkout.client_reference_id.split(',');
	console.log(arr[0]);
	console.log(arr[1]);
	
	let c_code = get_color_num(arr[0]);
	
	add_color_to_user(arr[1], c_code)
}

function add_color_to_user(userid, color_code){
	//User.find({user_id: userid})
	//	.then((result) => {
	//		//res.send(result);
	//		if (result.length == 0){
	//			console.log('user does not exist')
	//		} else {
	//			console.log('updating color ' + color_code);
	//			User.updateOne({user_id: userid}, { $push: { colors: color_code } }, {upsert: true});
	//		}
	//	})
	//	.catch((error) => {
	//		console.log(error);
	//	})
	//	
		
		
		User.findOneAndUpdate({user_id: userid},{"$push": {"colors": color_code}},{new: true, safe: true, upsert: true }).then((result) => {
					console.log('updating color ' + color_code);
		        }).catch((error) => {
					console.log('some error');
		        });
		
		
}



app.post('/stripe', express.json({type: 'application/json'}), (request, response) => {
	console.log('stripe pay works');
	const event = request.body;
	
  // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
		console.log('payment intent succeeded');
		console.log(paymentIntent);
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case 'checkout.session.completed':
        const checkoutSession = event.data.object;
	    console.log('checkout done');
	    console.log(checkoutSession);
		handleCheckout(checkoutSession);
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        console.log('payment method')
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
	
	response.json({received: true});
	
});



function color_validity(color, clr_array){
	
	let user_color = color.replace("color", "")
	if (user_color == 6) user_color = 5;
	if (user_color == 5) user_color = 6;
	
	if (clr_array.includes(user_color)) return true;
	return false;
	
}

function tutorial_game(req, res, pl_id){
	
	var chosen_server = pick_server('tutorial');
	
	
	g_id = new_game(pl_id, 'easy-bot', 1, chosen_server);
	

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
		p1_shape: 'circles',
		p2_shape: 'circles',
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
			console.log('game saved to db');
			console.log(result);
			requestGameServerUpdate(chosen_server, g_id);
		})
		.catch((error) => {
			console.log(error);
		})
}

function bot_game(data, botinfo){

	// REMOVE FROM AUTO-MATCH QUEUE
	// actively_waiting[req.body.user_id] = 0;
	let basic_colors = ['color1', 'color2', 'color3', 'color4'];
	
	var chosen_server = pick_server('real');

	if(data.force_server != undefined){
		chosen_server = data.force_server;
	}

	var pl1 = {
		id: data.user_id,
		session_id: data.session_id,
		rating: 1000,
		color: get_color(data.user_color),
		shape: data.user_shape,
	}
	var pl2 = botinfo;

	if(Math.random() > 0.5) {
		[pl1, pl2] = [pl2, pl1];
	}
	
	g_id = new_game(pl1.id, pl2.id, 0.5, chosen_server);
	
	const game = new Game({
		game_id: g_id,
		server: chosen_server,
		player1: pl1.id,
		player2: pl2.id,
		p1_session_id: pl1.session_id,
		p2_session_id: pl2.session_id,
		p1_shape: pl1.shape,
		p2_shape: pl2.shape,
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
		if (!color_validity(player.color, result.colors)) {
			game[(playerIndex===0?"p1":"p2")+"_color"] = "color1"
		}
		game.save()
			.then((result) => {
				console.log('game saved to db');
				requestGameServerUpdate(chosen_server, g_id);
			})
			.catch((error) => {
				console.log(error);
			});
	}) 
	return {
		g_id: g_id,
		meta: botinfo.id,
		server: chosen_server
	}
}

function boom_bot_game(data){
	return bot_game(data, {
		id: 'boom-bot',
		session_id: 'bot',
		rating: 2000,
		shape: 'triangles',
		color: 'color11'
	});
}

function will_bot_game(data){
	return bot_game(data, {
		id: 'will-bot',
		session_id: 'bot',
		rating: 1700,
		shape: 'squares',
		color: 'color5'
	});
}

function medium_bot_game(data){
	return bot_game(data, {
		id: 'medium-bot',
		session_id: 'bot',
		rating: 1000,
		shape: 'circles',
		color: 'color2'
	});
}


function dumb_bot_game(data){
	return bot_game(data, {
		id: 'dumb-bot',
		session_id: 'bot',
		rating: 500,
		shape: 'circles',
		color: 'color2'
	});
}

function friend_challenge(data){
	
	var chosen_server = pick_server('real');
	var color_code = get_color(data.user_color);
		
	g_id = new_game(data.user_id, 0, init_status = 0.5, chosen_server);
		
	const game = new Game({
		game_id: g_id,
		server: chosen_server,
		player1: data.user_id,
		player2: '',
		p1_session_id: data.session_id,
		p2_session_id: '',
		p1_shape: data.user_shape,
		p2_shape: 'circles',
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
			console.log('game saved to db');
		})
		.catch((error) => {
			console.log(error);
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
			  console.log(response);
		  })
	      .catch(err => {
			  console.log(err);
		  });
	} catch (e) {
		console.log(e);
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


app.post('/check-status/:game_id', (req, res) => {
	game_id_url = req.params.game_id;
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


app.post('/validate', (req, res) => {
    console.log(req.body.user_name);
	
	User.find({user_id: req.body.user_name})
		.then((result) => {
			//res.send(result);
			console.log('db result');
			if (result.length == 0){
				res.status(404).send({
		        	data: "no such user"
		        });
			} else {
				var good = false;
				var newHash = null;
				if(bcrypt.compareSync(req.body.password, result[0]['passwrd'])){
					good = true;
				} else if (result[0]['passwrd'] == sha256(req.body.password)) {
					//all good, update session id and prolong expiration date
					good = true;
					newHash = bcrypt.hashSync(req.body.password, hashRounds);
					console.log("Upgrading sha256 to bcrypt");
				}

				if(good) {
					var user_id = result[0]['user_id'];
					var session_id = generateSecureString(64);
					var session_expire = new Date();
					session_expire = (session_expire.getTime() + (7*24*60*60*1000));
					console.log('date');
					console.log(session_expire);
					var updatePromise = Promise.resolve(true);
					if(newHash) {
						updatePromise = User.updateOne({user_id: req.body.user_name}, {passwrd: newHash}, {upsert: true});
					}
					
					var sessionCreatePromise = Session.create({user_id: user_id, session_id: session_id, session_expire: session_expire});

					Promise.all([updatePromise, sessionCreatePromise])
						.then(() => {
							res.status(200).send({
								user_id: user_id,
								data: session_id
							});
						});
				} else {
					res.status(404).send({
						data: "wrong password"
					});
				}
			}
		})
		.catch((error) => {
			console.log(error);
		})
});

app.post('/session', (req, res) => {
	console.log(req.body);
    console.log(req.body.user_name);
    console.log(req.body.password);
	
	console.log('session was called !!!!!!!');
	
	Session.find({session_id: req.body.session_id})
		.then((result) => {
			console.log('db result');
			if (result.length == 0){
				res.status(404).send({
					data: "no such session"
				});
			} else {
				var session = result[0];
				var session_id = session['session_id'];
				var user_id = session['user_id'];
				var session_expire = session['session_expire'];
				// if session expire in less then 6 days
				if ((new Date()).getTime() + (6*24*60*60*1000) > session_expire){
					// update session_expire
					session_id = generateSecureString(64);
					session_expire = ((new Date()).getTime() + (7*24*60*60*1000));
					console.log('creating new session');
					Session.create({user_id: user_id, session_id: session_id, session_expire: session_expire})
						.then((qq) => {
							res.status(200).send({
								username: user_id,
								data: session_id
							});
						});
				} else {
					res.status(200).send({
						username: user_id,
						data: session_id
					});
				}
			}
		})
		.catch((error) => {
			console.log(error);
		})
});

function isValid(str) {
	return /^\w+$/.test(str);
}

app.post('/add-user', async (req, res) => {
	console.log(req.body);
    console.log(req.body.user_name);
    console.log(req.body.password);
	console.log(req.body.password.length);
	
	if (req.body.user_name.length > 20){
		res.status(200).send({
        	data: "toolong",
			data2: req.body.user_name.length
        });
	} else if (req.body.user_name.length < 3){
		res.status(200).send({
        	data: "tooshort"
        });
	} else if (isValid(req.body.user_name) != true){
		res.status(200).send({
        	data: "special"
        });
	} else if (req.body.password.length < 1){
		console.log('password too short');
		res.status(200).send({
        	data: "pass_empty"
        });
	} else if ((await User.find({user_id: req.body.user_name})).length !== 0){
		console.log('user with name already exists');
		res.status(200).send({
        	data: "exists"
        });
	} else {
		var session_id = generateSecureString(64);
	    var session_expire = new Date();
	    session_expire = (session_expire.getTime() + (7*24*60*60*1000));
	
		const user = new User({
			user_id: req.body.user_name,
			passwrd: bcrypt.hashSync(req.body.password, hashRounds),
			rating: 1500,
			rating_stability: 5,
			games_count: 0,
			games_history: '',
			colors: [1, 2, 3, 4],
			qualified: "",
			qualified_shape: "",
			goodenough: 0,
			email: "",
			marker: 0,
			visible_modules: [],
			active_modules: [],
			audio_preference: [50, 60] 
		});

		user.save()
			.then((user) => {
				Session.create({user_id: user.user_id, session_id: session_id, session_expire: session_expire})
				.then((qq) => {
					res.status(200).send({
						user_id: user.user_id,
						data: "user created",
						session_id: session_id
					});
				});
			})
			.catch((error) => {
				console.log(error);
				res.status(200).send({
					data: "exists"
				});
			});
	}
	
});

app.post('/upload-script', async (req, res) => {
	
	let file_type = req.body.script_type == "client";
	
	console.log('module_id = ' + req.body.module_id);
	console.log('fold = ' + req.body.script_type);
	
	store_script(req.body.script_file, req.body.module_id, file_type);
	
});

app.post('/download-script', async (req, res) => {
	
	let module_id = req.body.module_id;
	let script_type = req.body.script_type + '/';
	console.log("downloading " + script_type + " script of module " + module_id);
	
	try {
		let data = await s3client.getObject({
			Bucket: config.s3.bucket,
			Key: 'modules/' + script_type + module_id + '.js',
		}).promise();
		console.log(data);
		res.status(200).send({
			data: data.Body,
			meta: 'script_retreived'
		});
		return;
	} catch (err) {
		console.log(err);
	}
	
});

app.post('/update-module-info', async (req, res) => {
	
	//later on description and other stuff
	console.log('updating a module');
	
	let isalive = 1;
	if (req.body.delete_module == 1) isalive = 0;
	
	Module.find({module_id: req.body.module_id})
		.then((result) => {
			//res.send(result);
			if (result.length == 0){
				res.status(200).send({
		        	data: "no module found"
		        });
			} else if (result[0]['author'] == req.body.user_name){
				//this is so stupid, rewrite later! Lev! Wtf!
				let new_name = result[0]['name'];
				if (req.body.module_name != '') new_name = req.body.module_name
				Module.updateOne({module_id: req.body.module_id}, {name: new_name, alive: isalive})
					.then((qq) => {
						console.log('name changed to ' + req.body.module_name);
						res.status(200).send({
				        	data: "module updated"
				        });
					});	
			} else {
				res.status(200).send({
		        	data: "somethiinnng went wrong - probably not the author of the module"
		        });
			}
		})
		.catch((error) => {
			console.log(error);
		})
});

function store_script(script_file, module_id, client = 1){
	let fold = 'client/';
	if (client == 0) fold = 'server/'; 
	
	let temp_help = script_file.split(',')[1];
	
	let deco = Buffer.from(temp_help, 'base64');

	console.log('script_file = ');
	console.log(script_file);
	
	console.log('decoded.toString() = ');
	console.log(deco.toString());
	
	s3client.putObject({
		Body: deco.toString(),
		Bucket: config.s3.bucket,
		ACL: 'public-read',
		Key: 'modules/' + fold + module_id + '.js',
	}).promise()
}


app.post('/new-module', async (req, res) => {
	console.log(req.body);
	
	let module_id = generateUniqueString("mod");
	
	//store_script(req.body.module_content_client, module_id);

	const module = new Module({
		module_id: module_id,
		type: "",
		name: req.body.module_name,
		description: "",
		public: 0,
		subscribers: ['test', req.body.user_name],
		client_script_location: "modules/client",
		server_script_location: "modules/server",
		author: req.body.user_name,
		alive: 1
	});

	module.save()
		.then((qq) => {
			res.status(200).send({
				module_id: module_id,
				data: "module created"
			});
		})
		.catch((error) => {
			console.log(error);
			res.status(400).send({
				data: "something went wrong :/"
			});
		});
});

app.post('/get-available-modules', async (req, res) => {
	console.log(req.body);
	
	Module.find({
		
		$and: [
			{alive: 1},
			{$or:[{public: 1},{subscribers: req.body.user_id}]}
		]
		
		})
		.then((result) => {
			//res.send(result);
			console.log('getting available modules');
			if (result.length == 0){
				res.status(200).send({
		        	data: "no module found"
		        });
			} else {
				let result_array = [];
				for (i = 0; i < result.length; i++){
					let temp_obj = {
						module_id: result[i].module_id,
						author: result[i].author,
						description: result[i].description,
						name: result[i].name,
						subscribers: result[i].subscribers,
						type: result[i].type,
						client_script_location: result[i].client_script_location,
						server_script_location: result[i].server_script_location
					}
					result_array.push(temp_obj);
				}
				res.status(200).send({
		        	data: "modules retreived",
					stream: result_array
		        });
			}
		})
		.catch((error) => {
			console.log(error);
		})

   //
   //User.find({user_id: req.body.user_name})
   //	.then((result) => {
   //		//res.send(result);
   //		console.log('getting available modules');
   //		if (result.length == 0){
   //			res.status(200).send({
   //	        	data: "no module found"
   //	        });
   //		} else if (result[0]['rating'] != undefined){
   //			
   //			let module_locations = [];
   //			//loop through active modules and put source (url?) into active_locations? sounds stupid :/
   //			
   //			res.status(200).send({
   //	        	data: "modules retreived",
   //				visible_modules: result[0]['visible_modules'],
   //				active_modules: result[0]['active_modules'],
   //				active_locations: "" // can this be inferred from the active_modules id?
   //	        });
   //		} else {
   //			res.status(200).send({
   //	        	data: "something went wrong"
   //	        });
   //		}
   //	})
   //	.catch((error) => {
   //		console.log(error);
   //	})
});

app.post('/get-active-modules', async (req, res) => {
	console.log(req.body);
	
    User.find({user_id: req.body.user_name})
    	.then((result) => {
    		//res.send(result);
    		console.log('getting active modules');
    		if (result.length == 0){
    			res.status(200).send({
    	        	data: "no module found"
    	        });
    		} else if (result[0]['rating'] != undefined){
				console.log('rrrr');
				console.log(result[0]);    			
    			res.status(200).send({
    	        	data: "modules retreived",
    				visible_modules: result[0]['visible_modules'],
    				active_modules: result[0]['active_modules']
    	        });
    		} else {
    			res.status(200).send({
    	        	data: "something went wrong"
    	        });
    		}
    	})
    	.catch((error) => {
    		console.log(error);
    	})
});

app.post('/set-active-modules', async (req, res) => {
	console.log(req.body);
	
    User.find({user_id: req.body.user_name})
    	.then((result) => {
    		//res.send(result);
    		console.log('setting active modules');
    		if (result.length == 0){
    			res.status(200).send({
    	        	data: "no module found"
    	        });
    		} else if (result[0]['rating'] != undefined){
				User.updateOne({user_id: req.body.user_name}, {active_modules: req.body.active_modules}, {upsert: true})
				.then((qq) => {
					console.log('activated modules: ' + req.body.active_modules);
					res.status(200).send({
			        	data: "updated"
			        });
				});
    		} else {
    			res.status(200).send({
    	        	data: "something went wrong"
    	        });
    		}
    	})
    	.catch((error) => {
    		console.log(error);
    	})
});

app.post('/get-module-info', async (req, res) => {
	console.log(req.body);

	Module.find({module_id: req.body.module_id})
		.then((result) => {
			//res.send(result);
			console.log('getting modules info');
			if (result.length == 0){
				res.status(200).send({
		        	data: "no module found"
		        });
			} else if (result[0]['name'] != undefined){
				res.status(200).send({
		        	data: "module info retreived",
					m_type: result[0]['type'],
					m_name: result[0]['name'],
					m_description: result[0]['description']
		        });
			} else {
				res.status(200).send({
		        	data: "somethinnnng went wrong"
		        });
			}
		})
		.catch((error) => {
			console.log(error);
		})
});




app.post('/' + this_server + '/tutorial-signup', (req, res) => {

	Game.find({game_id: req.body.game_id})
		.then((result) => {
			//res.send(result);
			console.log('dbdb result');
			console.log(result);
			if (result.length == 0){
				res.status(200).send({
		        	data: "no game found"
		        });
			} else if (result[0]['active'] == 1 && result[0]['player1'] == 'anonymous'){
				Game.updateOne({game_id: req.body.game_id}, {player1: req.body.user_id}, {upsert: true})
					.then((qq) => {
						console.log('anonymous changed to ' + req.body.user_id);
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
			console.log(error);
		})

});

/*
uhhh... what?

app.get('/all', (req, res) => {
	User.find({session_expire: {"$gte": 2}})
		.then((result) => {
			res.send(result);
			console.log('db result');
			console.log(result);
		})
		.catch((error) => {
			console.log(error);
		})
})*/

app.get('/game/:game_id', (req, res) => {
	game_id_url = req.params.game_id;
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
			  console.log(response);
		  })
	      .catch(err => {
			  console.log(err);
		  });
	} catch (error) {
		console.log(error);
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
			  console.log(response);
		  })
	      .catch(err => {
			  console.log(err);
		  });
	} catch (error) {
		console.log(error);
	}
}

function deactivate_game(game_id){
	console.log('here is deactivating happening');
	try {
		if(game_id in active_games){
			var serv_id = active_games[game_id][3];
			server_count[serv_id]--;
			delete active_games[game_id];
		}
	} catch (error) {
	  console.error(error);
	}
}

setInterval(function(){
	var updates = [];

	var game_ids = Object.keys(active_games);
	if(game_ids.length == 0) {
		return;
	}
	Game.find({game_id: {$in: game_ids}}).then((games) => {
		console.log("active games: " + games.map(g => g.game_id).join(','));
		for(let game of games) {
			console.log(game.last_update);
			if(!game.last_update || game.last_update < (+new Date()) - (1000 * 60)) {
				console.log("Deactivating game " + game.game_id);
				deactivate_game(game.game_id);
				updates.push(game.game_id);
			}
		}
		if(updates.length > 0) {
			Game.updateMany({game_id: {$in: updates}}, {active: 0}).catch(err => {
				console.log(err)
			});
		}
	}).catch((error) => {
		console.log(error);
	});

}, 60000);

app.post('/gameinfo', (req, res) => {

	Game.find({game_id: req.body.game_id})
		.then((result) => {
			//res.send(result);
			console.log('getting game info');
			//console.log(result);
			//console.log(result[0]['active']);
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
					p1_shape: result[0]['p1_shape'],
					p1_color: result[0]['p1_color'],
					p1_rating: result[0]['p1_rating'],
					p2: result[0]['player2'],
					p2_shape: result[0]['p2_shape'],
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
					p1_shape: result[0]['p1_shape'],
					p1_color: result[0]['p1_color'],
					p1_rating: result[0]['p1_rating'],
					p2: result[0]['player2'],
					p2_shape: result[0]['p2_shape'],
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
			console.log(error);
		})

});

const AWS = require('aws-sdk');
let compress = require('./compress/compress.js');
AWS.config.setPromisesDependency(null);

s3client = new AWS.S3({
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
	}).promise().catch(err => console.log(err));
}

app.post('/get_replay', async (req, res) => {
	
	try {
		let data = await s3client.getObject({
			Bucket: config.s3.bucket,
			Key: 'replays/' + req.body.game_id + '.json.comp',
		}).promise();
		console.log(data);
		res.status(200).send(compress.decompress(data.Body));
		return;
	} catch (err) {
		console.log(err);
	}

	try {
		let data = await s3client.getObject({
			Bucket: config.s3.bucket,
			Key: req.body.game_id + '.json',
		}).promise();
		console.log(data);
		res.status(200).send(data.Body);
		return;
	} catch (err) {
		res.status(404).send({
			meta: "no replay found"
		});
	}
});



app.post('/playerinfo', (req, res) => {
	var p111_rating = 0;
	var p222_rating = 0;

	User.find({user_id: req.body.pla1})
		.then((result) => {
			//res.send(result);
			console.log('getting player info');
			console.log(result);
			console.log(result[0]['active']);
			if (result.length == 0){
				res.status(200).send({
		        	data: "no user found"
		        });
			} else if (result[0]['rating'] != undefined && result[0]['rating'] != ''){
				p111_rating = result[0]['rating'];
				if (req.body.pla2){
					User.find({user_id: req.body.pla2})
						.then((result2) => {
							//res.send(result);
							console.log('getting player info');
							console.log(result2);
							if (result2.length == 0){
								res.status(200).send({
						        	data: "no user found"
						        });
							} else if (result2[0]['rating'] != undefined && result2[0]['rating'] != ''){
								p222_rating = result2[0]['rating'];
								
								res.status(200).send({
									pla1_rating: p111_rating,
									pla2_rating: p222_rating
						        });
				
				
							} else {
								res.status(200).send({
						        	data: "something went wrong"
						        });
							}
						})
						.catch((error) => {
							console.log(error);
						})
				} else {
					res.status(200).send({
						pla1_rating: p111_rating
			        });
				}
			} else {
				res.status(200).send({
		        	data: "something went wrong"
		        });
			}
		})
		.catch((error) => {
			console.log(error);
		})

});


app.post('/get_colors', (req, res) => {
	User.find({user_id: req.body.user_id})
		.then((result) => {
			//res.send(result);
			console.log('getting user colors');
			console.log(result);
			if (result.length == 0){
				res.status(200).send({
		        	data: "no user found"
		        });
			} else if (result[0]['colors'] != undefined && result[0]['colors'] != ''){
				res.status(200).send({
					data: result[0]['colors']
		        });
			} else {
				res.status(200).send({
		        	data: "something went wrong"
		        });
			}
		})
		.catch((error) => {
			console.log(error);
		})
});

app.post('/populate-hub', (req, res) => {
	Game.find({$or:[{player1: req.body.user_id},{player2: req.body.user_id}]})
		.sort({updatedAt:'desc'})
		.limit(10)
		.exec()
		.then((result) => {
			//res.send(result);
			console.log('dbdbdb result');
			//console.log(result);
			//console.log(result[0]);
			if (result.length == 0){
				res.status(200).send({
		        	data: "no results"
		        });
			} else {
				for (i = 0; i < result.length; i++){
					result[i]['passwrd'] = '0';
					result[i]['session_id'] = '0';
					result[i]['p1_session_id'] = '0';
					result[i]['p2_session_id'] = '0';
					result[i]['game_file'] = '';
				}
				res.status(200).send({
		        	data: "populate",
					stream: result
		        });
			}
		})
		.catch((error) => {
			console.log(error);
		})
});
app.post('/populate-leaderboard', (req, res) => {
	User.find({})
		.sort({rating:'desc'})
		.limit(100)
		.exec()
		.then((result) => {
			//res.send(result);
			console.log('dbdbdb result');
			console.log(result);
			console.log(result[0]);
			if (result.length == 0){
				res.status(200).send({
		        	data: "no results"
		        });
			} else {
				for (i = 0; i < result.length; i++){
					result[i]['passwrd'] = '0';
					result[i]['session_id'] = '0';
					result[i]['p1_session_id'] = '0';
					result[i]['p2_session_id'] = '0';
				}
				res.status(200).send({
		        	data: "populate",
					stream: result
		        });
			}
		})
		.catch((error) => {
			console.log(error);
		})
});
//app.get('/reset-ratings', (req, res) => {
//	User.updateMany({}, {"$set":{"rating": 1500}})
//		.then((result) => {
//			//res.send(result);
//			console.log('ratings maybe updated?');
//			
//			res.status(200).send({
//	        	data: "done?"
//	        });
//			
//		})
//		.catch((error) => {
//			console.log(error);
//		})
//});
//app.get('/set-color', (req, res) => {
//	User.updateMany({}, {"$set":{"colors": [1, 2, 3, 4, 5]}}, {upsert: true})
//		.then((result) => {
//			//res.send(result);
//			console.log('colors maybe updated?');
//			
//			res.status(200).send({
//	        	data: "done colors?"
//	        });
//			
//		})
//		.catch((error) => {
//			console.log(error);
//		})
//});



//app.get('/set-qual', (req, res) => {
//	User.updateMany({}, {"$set":{"qualified": "", "qualified_shape": ""}}, {upsert: true})
//		.then((result) => {
//			//res.send(result);
//			console.log('qual maybe updated?');
//			
//			res.status(200).send({
//	        	data: "done qual?"
//	        });
//			
//		})
//		.catch((error) => {
//			console.log(error);
//		})
//});

app.get('/set-dumb', (req, res) => {
	User.updateMany({}, {"$set":{"goodenough": 0}}, {upsert: true})
		.then((result) => {
			//res.send(result);
			console.log('set dumb bot beaten?');
			
			res.status(200).send({
	        	data: "done dumb?"
	        });
			
		})
		.catch((error) => {
			console.log(error);
		})
});

app.get('/set-email', (req, res) => {
	User.updateMany({}, {"$set":{"email": ""}}, {upsert: true})
		.then((result) => {
			//res.send(result);
			console.log('set email?');
			
			res.status(200).send({
	        	data: "done email?"
	        });
			
		})
		.catch((error) => {
			console.log(error);
		})
});



app.post('/stripe-payment', (req, res) => {
	console.log('stripe pay');
	console.log(req.body);
	
	res.status(200).send({
		data: 'done'
    });
	
});


app.post('/deactivate', (req, res) => {
	console.log('deactivating');
	console.log(req.body.game_id);
	deactivate_game(req.body.game_id);
	
	res.status(200).send({
		data: 'done'
    });
	
});


app.post('/get-qualified', (req, res) => {
	console.log('retreiving qualified players');
	
	User.find({qualified: {$ne: "", $exists: true}})
		.then((result) => {
			//res.send(result);
			console.log('getting qualified players');
			console.log(result);
			if (result.length == 0){
				res.status(200).send({
		        	data: "no players"
		        });
			} else {
				console.log(result);
				let qual_arr = [];
				for (let i = 0; i < result.length; i++){
					qual_arr.push([result[i].user_id, result[i].qualified_shape]);
				}
				console.log(qual_arr);
				res.status(200).send({
		        	data: "all good",
					players: qual_arr
		        });
			}
		})
		.catch((error) => {
			console.log(error);
		})
	
});


app.get('/t2f/est', (req, res) => {
	console.log('triggerring');
	trigger_deactivation();	
});
// ------
// ------
app.get('/challenge/:game_id', (req, res) => {
	let active_game = active_games[req.params.game_id];
	if(active_game == undefined){
		// TODO VILEM CHECK - is this proper handling?
		// or do we return something else?
		res.send(404);
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
	let g_id = req.params.game_id;
	//find via mongoose, check if player1 != player2
	console.log('finding game via mongoooooooooooooooooooose');
	Game.find({game_id: g_id})
		.then((result) => {
			//res.send(result);
			console.log('db result');
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
							console.log('p2_session_id updated');
							//start_world(g_id);
						} else{
							console.log('WTF game ' + g_id + ' probably canceled in the meantime? race condition?');
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
			console.log(error);
			res.status(404).send({
				data: "no game found"
			});
		})
});
app.post('/confirm-challenge/:game_id', (req, res) => {
	let g_id = req.params.game_id;
	let active_game = active_games[g_id];
	if(active_game == undefined){
		// TODO VILEM CHECK - is this proper handling?
		// or do we return something else?
		res.status(404).send({
			data: "no game found"
		});
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
				console.log('updating p2 in db');
				if (result.length == 0){
					res.status(404).send({
			        	data: "no game found"
			        });
				} else {
					Game.updateOne({game_id: g_id}, {player2: req.body.user_id, p2_session_id: req.body.session_id, p2_shape: req.body.user_shape, p2_color: get_color(req.body.user_color)}, {upsert: true})
						.then((qq) => {
							let active_game = active_games[g_id];
							if(active_game != undefined){
								active_game[2] = req.body.user_id;
								console.log('p2_details updated');
							} else
								console.log('WTF 2 game ' + g_id + ' probably canceled in the meantime? race condition?');
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
				console.log(error);
			})
		
	} else if (active_game[0] == 1){
		//if player1 confirming, redirect to game and start it (allow code change)
		Game.find({game_id: g_id})
			.then((result) => {
				//res.send(result);
				console.log('db result');
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
				console.log(error);
			})
	} else {
		console.log('something went wrong here');
	}
	
})
app.post('/resume-game', (req, res) => {
	console.log(req.body);
    console.log(req.body.user_name);
    console.log(req.body.password);
	
	Game.find({game_id: req.body.game_id})
		.then((result) => {
			//res.send(result);
			console.log('db result');
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
			console.log(error);
		})
});
app.post('/monitor', (req, res) => {
	console.log(req.body);
	tutorial_finishings[req.body.game_id] = req.body.phase;
	
	res.status(200).send({
    	data: 'monitoring data saved'
    });
});
app.post('/qqmonitoring', (req, res) => {
	console.log(req.body);
	
	res.status(200).send({
		data: 'basic',
    	active_games: active_games,
		tutorials: tutorial_finishings
    });
});
//global
var player1_id = 'ab1';
var player2_id = 'zx2';
var player1_code;
var player1_session = 'abc';
var player2_code;
var player2_session = 'xyz';
var player1_code_temp;
var player2_code_temp;
//var code_temps = {};
var tutorial = {};
var processTime1 = 0;
var processTime2 = 0;
var processTimeRes = 0;
//var render_data = [[],[],[],[],[]];
app.get('/d1n/:game_id', (req, res) => {
	let g_id = req.params.game_id;
	//if (active_games[g_id][0] == 1){
	//	res.redirect('/' + d1 + '/' + g_id);
	//} else {
	res.sendFile(__dirname + '/public/wait.html');
	//}
	
});
app.get('/replay/:game_id', (req, res) => {
	let g_id = req.params.game_id;
	//if (active_games[g_id][0] == 1){
	//	res.redirect('/' + d1 + '/' + g_id);
	//} else {
	res.sendFile(__dirname + '/public/replay.html');
	//}
	
});
app.post("/launchtut", (req,res) => {
	tutorial_game(req,res,req.body.user_id)
})
function findAgain(req, res, g_id){
	Game.find({game_id: g_id})
		.then((result) => {
			//res.send(result);
			console.log('db result');
			//console.log(result);
			if (result.length == 0){
				res.status(200).send({
		        	data: "no game found"
		        });
			} else if (result[0]['active'] == 0.5 && result[0]['server'] == 'd1'){
				init_game(g_id, result[0]['player1'], result[0]['player2'], 1, result[0]['server'], result[0]['p1_shape'], result[0]['p2_shape'], result[0]['p1_color'], result[0]['p2_color'], 'real');
				Game.updateOne({game_id: g_id}, {active: 1}, {upsert: true})
					.then((qq) => {
						console.log('game is ready');
						res.status(200).send({
				        	data: "game ready",
							server: 'd1'
				        });
					});			
			} else if (result[0]['active'] == 1 && result[0]['server'] == 'd1'){
				console.log('game already active, redirect');
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
			console.log(error);
		})
}

// This is a pretty bad way of doing it, should be changed
const adminpassword = "swordfish"

app.get('/server-weight/:server_id/:weight', (req, res) => {
	if(req.query.password != adminpassword) {
		res.send(404);
		return;
	}
	Server.updateOne({server: req.params.server_id}, {weight: req.params.weight}).then((result) => {
		updateServers();	
		res.send(200)
	})
	.catch((error) => {
		console.log(error)
	});
});

app.get("/admin-panel/dash", async (req,res,next) => {
	if (req.query.password != adminpassword) {
		res.status(400).redirect("/admin-panel/login")
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
	let response = {}
	switch(data.type) {
		case "boom-bot":
			response = boom_bot_game(data)
			socket.send(JSON.stringify({
				type: "match-found",
				data: {
					server: response.server,
					game_id: response.g_id
				}
			}))
			break;
		case "will-bot":
			response = will_bot_game(data)
			socket.send(JSON.stringify({
				type: "match-found",
				data: {
					server: response.server,
					game_id: response.g_id
				}
			}))
			break;
		case "medium-bot":
			response = medium_bot_game(data)
			socket.send(JSON.stringify({
				type: "match-found",
				data: {
					server: response.server,
					game_id: response.g_id
				}
			}))
			break;
		case "dumb-bot":
			response = dumb_bot_game(data)
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
		case "automatch":
			const user = await User.findOne({user_id: data.user_id})
			if (user == null) {
				console.error("User not found")
				return;
			}
			if (matchmaking_queue.findIndex(x => x.user_id == user.user_id) != -1) {
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
				shape: data.user_shape,
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
	}
}

// Automatch socket system
wss.on("connection", (ws)=>{
	ws.send(automatchStatusContent())
	ws.on("message", async (msg) => {
		let message = JSON.parse(msg);
		switch(message.type){
			case "join":
				if (message.data.user_id == 'anonymous') return;
				let session = await Session.find({session_id: message.data.session_id})
				if (session == null) return;
				userSocketMap[message.data.user_id] = ws;
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
})

server.listen(5000, () => console.log('Listening on port :5000'))
automatch();
