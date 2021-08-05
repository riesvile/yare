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

// ----- automatching -----


var game_pairs = [];
var automatch_looking = [];
var paired_and_waiting = {};

//checking if user is knocking on the server (didn't close browser window)
var actively_waiting = {};

//rewrite this entire stupidity later, you fucking moron. What were you even doing, the fuck?

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
		game_file: ''
	});

	game.save()
		.then((result) => {
			console.log('am game saved to db');
			console.log(result);
			try {
				fetch('https://yare.io/' + srvr + 'ns/' + gid, {
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
		})
		.catch((error) => {
			console.log(error);
		})
	
}

function games_paired(){
	
	
	//players are matched, check server loads, redirect to the right server and start a game worker there
	
	for (j = 0; j < game_pairs.length; j++){
		
		var chosen_server = pick_server('tutorial');
		var p1p1 = game_pairs[j][0];
		var p2p2 = game_pairs[j][1];
	
		g_id = new_game(p1p1[0], p2p2[0], init_status = 0.5, chosen_server);
		
		//add server
		paired_and_waiting[p1p1[0]] = [g_id, chosen_server];
		paired_and_waiting[p2p2[0]] = [g_id, chosen_server];
		
		update_game_db(g_id, chosen_server, p1p1[0], p2p2[0], p1p1[2], p2p2[2], p1p1[3], p2p2[3], p1p1[1], p2p2[1]);
				
	}
	
	game_pairs = [];
	console.log('paired and waiting');
	console.log(paired_and_waiting);
	
	//check if this works by extending the automatch tick time and trying matching multiple people
	
}


	setInterval(function(){
		if(automatch_looking.length > 0){
			for (i = 0; i < automatch_looking.length; i++){
				//[user_id, rating, shape, color, time_spent_in_queue, matched?]
				console.log(automatch_looking[i]);
				if (actively_waiting[automatch_looking[i][0]] == undefined){
					console.log('undefined');
					continue;
				} else if (actively_waiting[automatch_looking[i][0]] == 0){
					console.log(automatch_looking[i][0] + ' is not in the queue anymore');
					paired_and_waiting[automatch_looking[i][0]] = 'interrupted';
					automatch_looking[i][5] = 1;
					delete actively_waiting[automatch_looking[i][0]]
					continue;
				} else if (actively_waiting[automatch_looking[i][0]] == 1){
					console.log(automatch_looking[i][0] + ' is in queue');
					actively_waiting[automatch_looking[i][0]] = 0;
					//continue;
				}
				
				
				var looker1 = automatch_looking[i];
				var topCandidate = '';
				
				if (looker1[5] == 1) continue;
				
				for (j = i+1; j < automatch_looking.length; j++){
					var looker2 = automatch_looking[j];
					
					console.log('lookers');
					console.log(looker1);
					console.log(looker2);
					console.log(Math.abs(looker1[1] - looker2[1]));
					
					var rating_difference = Math.abs(looker1[1] - looker2[1])
					
					if (looker1[0] == looker2[0]){
						console.log('it is the same person!!!!!');
						looker1[5] = 1;
						continue;
					}
					
					if (looker1[4] < 4100){
						if (rating_difference < 100){
							game_pairs.push([looker1, looker2]);
							looker1[5] = 1;
							looker2[5] = 1;
						}
					} else if (looker1[4] < 8100){
						if (rating_difference < 200){
							game_pairs.push([looker1, looker2]);
							looker1[5] = 1;
							looker2[5] = 1;
						}
					} else if (looker1[4] < 12100){
						if (rating_difference < 300){
							game_pairs.push([looker1, looker2]);
							looker1[5] = 1;
							looker2[5] = 1;
						}
					} else {
						if (rating_difference < 500){
							game_pairs.push([looker1, looker2]);
							looker1[5] = 1;
							looker2[5] = 1;
						}
					}
				}
			}
			
			//clearing out matched items from the automatch queue
			for (i = automatch_looking.length - 1; i >= 0; i--){
				if (automatch_looking[i][5] == 1){
					automatch_looking.splice(i, 1);
				}
			}
			
			if (game_pairs.length > 0) {
				console.log('paired players');
				console.log(game_pairs);
				games_paired();
			}
			
			//add time_spent_in_queue
			for (q = 0; q < automatch_looking.length; q++){
				automatch_looking[q][4] += 4000;
			}
			
		}
		
		console.log('automatch tick');
		
	}, 4000)
	

// -----
// --------------__---_-___




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
const bcrypt = require('bcrypt');
var hashRounds = 10;

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
		default:
			return 'color1';
	}
}

function bot_game(req, res, pl_id){
	
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
		game_file: ''
	});
	
	game.save()
		.then((result) => {
			console.log('game saved to db');
			console.log(result);
		})
		.catch((error) => {
			console.log(error);
		})
}


function will_bot_game(req, res, pl_id){
	
	// REMOVE FROM AUTO-MATCH QUEUE
	actively_waiting[req.body.user_id] = 0;
	
	var chosen_server = pick_server('real');
	var color_code = get_color(req.body.user_color);
	
	g_id = new_game(pl_id, 'will-bot', 1, chosen_server);
	

	res.status(200).send({
		g_id: g_id,
		meta: 'will-bot',
		server: chosen_server
    });
	
	const game = new Game({
		game_id: g_id,
		server: chosen_server,
		player1: req.body.user_id,
		player2: 'will-bot',
		p1_session_id: req.body.session_id,
		p2_session_id: 'bot',
		p1_shape: req.body.user_shape,
		p2_shape: 'squares',
		p1_color: color_code,
		p2_color: 'color5',
		p1_rating: 1000,
		p2_rating: 100,
		winner: '',
		ranked: 0,
		active: 0.5,
		game_duration: 0,
		observers: 0,
		game_file: ''
	});
	
	game.save()
		.then((result) => {
			console.log('game saved to db');
			console.log(result);
		})
		.catch((error) => {
			console.log(error);
		})
}



function medium_bot_game(req, res, pl_id){
	
	// REMOVE FROM AUTO-MATCH QUEUE
	actively_waiting[req.body.user_id] = 0;
	
	var chosen_server = pick_server('real');
	var color_code = get_color(req.body.user_color);
	
	g_id = new_game(pl_id, 'medium-bot', 1, chosen_server);
	

	res.status(200).send({
		g_id: g_id,
		meta: 'medium-bot',
		server: chosen_server
    });
	
	const game = new Game({
		game_id: g_id,
		server: chosen_server,
		player1: req.body.user_id,
		player2: 'medium-bot',
		p1_session_id: req.body.session_id,
		p2_session_id: 'bot',
		p1_shape: req.body.user_shape,
		p2_shape: 'circles',
		p1_color: color_code,
		p2_color: 'color2',
		p1_rating: 1000,
		p2_rating: 100,
		winner: '',
		ranked: 0,
		active: 0.5,
		game_duration: 0,
		observers: 0,
		game_file: ''
	});
	
	game.save()
		.then((result) => {
			console.log('game saved to db');
			console.log(result);
		})
		.catch((error) => {
			console.log(error);
		})
}


function dumb_bot_game(req, res, pl_id){
	
	// REMOVE FROM AUTO-MATCH QUEUE
	actively_waiting[req.body.user_id] = 0;
	
	var chosen_server = pick_server('real');
	var color_code = get_color(req.body.user_color);
	
	g_id = new_game(pl_id, 'dumb-bot', 1, chosen_server);
	

	res.status(200).send({
		g_id: g_id,
		meta: 'dumb-bot',
		server: chosen_server
    });
	
	const game = new Game({
		game_id: g_id,
		server: chosen_server,
		player1: req.body.user_id,
		player2: 'dumb-bot',
		p1_session_id: req.body.session_id,
		p2_session_id: 'bot',
		p1_shape: req.body.user_shape,
		p2_shape: 'circles',
		p1_color: color_code,
		p2_color: 'color2',
		p1_rating: 1000,
		p2_rating: 100,
		winner: '',
		ranked: 0,
		active: 0.5,
		game_duration: 0,
		observers: 0,
		game_file: ''
	});
	
	game.save()
		.then((result) => {
			console.log('game saved to db');
			console.log(result);
		})
		.catch((error) => {
			console.log(error);
		})
}

function friend_challenge(req, res){
	
	var chosen_server = pick_server('real');
	var color_code = get_color(req.body.user_color);
		
	g_id = new_game(req.body.user_id, 0, init_status = 0.5, chosen_server);
	res.status(200).send({
		g_id: g_id,
		meta: 'waiting for p2'
    });
		
	const game = new Game({
		game_id: g_id,
		server: chosen_server,
		player1: req.body.user_id,
		player2: '',
		p1_session_id: req.body.session_id,
		p2_session_id: '',
		p1_shape: req.body.user_shape,
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
		game_file: ''
	});

	game.save()
		.then((result) => {
			console.log('game saved to db');
			console.log(result);
		})
		.catch((error) => {
			console.log(error);
		})
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


function discord_automatch_bot(usr){
	discord_postmessage(config.hooks.queue, usr + ' is waiting in the queue');
}


// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Client requests new game
app.post('/new-game', (req, res) => {
	console.log('creating new game');
	console.log(req.body);
	if (req.body.user_id == 'anonymous'){
		bot_game(req, res, 'anonymous');
	} else {
		if (req.body.type == 'easy-bot'){
			bot_game(req, res, req.body.user_id);
		} else if (req.body.type == 'will-bot'){
			will_bot_game(req, res, req.body.user_id);
		} else if (req.body.type == 'medium-bot'){
			medium_bot_game(req, res, req.body.user_id);
		} else if (req.body.type == 'dumb-bot'){
			dumb_bot_game(req, res, req.body.user_id);
		} else if (req.body.type == 'challenge'){
			friend_challenge(req, res);
		} else if (req.body.type == 'automatch'){
			console.log('automatching...');
			User.find({user_id: req.body.user_id})
				.then((result) => {
					console.log(result);
					console.log('...auto match added');
					//[user_id, rating, shape, color, time_spent_in_queue, matched?]
					
					discord_automatch_bot(req.body.user_id);
					
					if (req.body.user_id == 'anonymous'){
						res.status(200).send({
							//g_id: g_id,
							meta: 'anonymous'
					    });
					} else {
						automatch_looking.push([result[0].user_id, result[0].rating, req.body.user_shape, get_color(req.body.user_color), 0, 0]);
						res.status(200).send({
							//g_id: g_id,
							meta: 'automatching'
					    });
					}
					
				})
				.catch((error) => {
					console.log(error);
				})
			
			
				
		}
	}
});

app.post('/automatch-status', (req, res) => {
	
	console.log('automatch knock from ' + req.body.user_id);
	
	actively_waiting[req.body.user_id] = 1;
	
	if (paired_and_waiting[req.body.user_id] == undefined){
		res.status(200).send({
			data: 'am-not-yet'
        });
	} else if (paired_and_waiting[req.body.user_id] == 'interrupted'){
		res.status(200).send({
			data: 'interrupted'
        });
	} else {
		if (active_games[paired_and_waiting[req.body.user_id][0]][0] == 1){
			res.status(200).send({
				game_id: paired_and_waiting[req.body.user_id][0],
				server: paired_and_waiting[req.body.user_id][1],
				data: 'am-ready'
	        });
			delete paired_and_waiting[req.body.user_id];
		} else {
			res.status(200).send({
				data: 'am-not-yet'
	        });
		}
		
	}
	
});

app.post('/automatch-anyone', (req, res) => {

	if (automatch_looking.length > 0){
		res.status(200).send({
			data: 'yes-waiting'
        });
	} else {
		res.status(200).send({
			data: 'no-noone'
        });
	}
});

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
		if (game_l[1] == user_id) active_g.push(key);
		if (game_l[2] == user_id) active_g.push(key);
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
					var session_id = generateUniqueString(3);
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
					session_id = generateUniqueString(3);
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

app.post('/add-user', (req, res) => {
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
	} else {
		var session_id = generateUniqueString(3);
	    var session_expire = new Date();
	    session_expire = (session_expire.getTime() + (7*24*60*60*1000));
	
		const user = new User({
			user_id: req.body.user_name,
			passwrd: bcrypt.hashSync(req.body.password, hashRounds),
			rating: 1500,
			rating_stability: 5,
			games_count: 0,
			games_history: '',
			colors: [1, 2, 3, 4]
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
})

app.get('/game/:game_id', (req, res) => {
	game_id_url = req.params.game_id;
	res.sendFile(__dirname + '/public/game.html');
});


//game servers (change t1 to server's responsibility (d1, d2 ...))
// ------
// ------



function trigger_deactivation(game_id){
	try {
		fetch('https://yare.io/deactivate', {
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
		fetch('https://yare.io/monitor', {
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
		var serv_id = active_games[game_id][3];
		server_count[serv_id]--;
		delete active_games[game_id];
	} catch (error) {
	  console.error(error);
	}
	
	
}



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

app.post('/get_replay', (req, res) => {

	Game.find({game_id: req.body.game_id})
		.then((result) => {
			//res.send(result);
			console.log('getting game info for replay');
			if (result.length == 0){
				console.log('no game');
				res.status(200).send({
		        	meta: "no game found"
		        });
			} else if (result[0]['game_file'] != ''){
				var decompressed_file = zlib.inflateSync(Buffer.from(result[0].game_file, 'base64')).toString();
				console.log('replay file sent');
				//console.log(decompressed_file);
				
				res.status(200).send({
		        	meta: "gotit",
					data: decompressed_file
		        });
			} else {
				console.log('somthinwrong');
				res.status(200).send({
		        	meta: "something went wrong"
		        });
			}
		})
		.catch((error) => {
			console.log(error);
		})

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

app.get('/set-color', (req, res) => {
	User.updateMany({}, {"$set":{"colors": [1, 2, 3, 4, 5]}}, {upsert: true})
		.then((result) => {
			//res.send(result);
			console.log('colors maybe updated?');
			
			res.status(200).send({
	        	data: "done colors?"
	        });
			
		})
		.catch((error) => {
			console.log(error);
		})
});


app.post('/deactivate', (req, res) => {
	console.log('deactivating');
	console.log(req.body.game_id);
	deactivate_game(req.body.game_id);
	
	res.status(200).send({
		data: 'done'
    });
	
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
				
					//create_worker(g_id, 'nonranked');
					res.status(200).send({
			        	data: "waiting for p1 to start",
						server: active_game[3]
			        });
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

app.post('/d1ns/:game_id', (req, res) => {
	let g_id = req.params.game_id;
		
	console.log('finding game via mongoooooooooooooooooooose');
	Game.find({game_id: g_id})
		.then((result) => {
			//res.send(result);
			console.log('db result');
			//console.log(result);
			if (result.length == 0){
				findAgain(req, res);
			} else if (result[0]['active'] == 0.5 && result[0]['server'] == 'd1'){
				init_game(g_id, result[0]['player1'], result[0]['player2'], 1, result[0]['server'], result[0]['p1_shape'], result[0]['p2_shape'], result[0]['p1_color'], result[0]['p2_color'], 'real');
				Game.updateOne({game_id: g_id}, {active: 1}, {upsert: true})
					.then((qq) => {
						console.log('game is reeeady');
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
});




app.get('/d1/:game_id', (req, res) => {
	let g_id = req.params.game_id;
	let active_game = active_games[g_id];
	if (active_game == undefined){
		//add a simple page stating the result and stats of a game
		console.log('game ended or does not exist');
		Game.find({game_id: g_id})
			.then((result) => {
				//res.send(result);
				console.log('dbdb result');
				console.log(result);
				if (result.length == 0){
					res.sendFile(__dirname + '/public/nope.html');
				} else if (result.length == 1){
					res.sendFile(__dirname + '/public/game-status.html');
				} else {
					console.log('something went wrong');
					res.sendFile(__dirname + '/public/nope.html');
				}
			})
			.catch((error) => {
				console.log(error);
			})
		return;
	}

	if (active_game[0] == 1){
		res.sendFile(__dirname + '/public/game.html');
	} else {
		if (this_server_type == "tutorial" && active_game[0] == 0){
			console.log('game is being saved into db?? maybe??????????????????????????????????????');
		} else {
			console.log('not sure what happened here');
			res.send(404);
		}
		
	}
});


app.use(express.static('public', {extensions: ["html"]}));

server.listen(5000, () => console.log('Listening on port :5000'))
automatch();
