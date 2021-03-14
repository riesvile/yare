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

function games_paired(){
	//players are matched, check server loads, redirect to the right server and start a game worker there
}


var game_pairs = [];
var automatch_looking = [];

//rewrite this entire stupidity later, you fucking moron. What were you even doing, the fuck?

	setInterval(function(){
		if(automatch_looking.length > 1){
			for (i = 0; i < automatch_looking.length; i++){
				//[user_id, rating, time_spent_in_queue, matched?]
				var looker1 = automatch_looking[i];
				var topCandidate = '';
				
				if (looker1[3] == 1) continue;
				
				for (j = i+1; j < automatch_looking.length; j++){
					var looker2 = automatch_looking[j];
					
					console.log('lookers');
					console.log(looker1);
					console.log(looker2);
					console.log(Math.abs(looker1[1] - looker2[1]));
					
					var rating_difference = Math.abs(looker1[1] - looker2[1])
					
					if (looker1[2] < 4100){
						if (rating_difference < 100){
							game_pairs.push([looker1[0], looker2[0]]);
							looker1[3] = 1;
							looker2[3] = 1;
						}
					} else if (looker1[2] < 8100){
						if (rating_difference < 200){
							game_pairs.push([looker1[0], looker2[0]]);
							looker1[3] = 1;
							looker2[3] = 1;
						}
					} else if (looker1[3] < 12100){
						if (rating_difference < 300){
							game_pairs.push([looker1[0], looker2[0]]);
							looker1[3] = 1;
							looker2[3] = 1;
						}
					} else {
						if (rating_difference < 500){
							game_pairs.push([looker1[0], looker2[0]]);
							looker1[3] = 1;
							looker2[3] = 1;
						}
					}
				}
			}
			
			//clearing out matched items from the automatch queue
			for (i = automatch_looking.length - 1; i >= 0; i--){
				if (automatch_looking[i][3] == 1){
					automatch_looking.splice(i, 1);
				}
			}
			
			if (game_pairs.length > 0) {
				console.log('paired players');
				console.log(game_pairs);
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
var workers = {};
//active_games[game_id] = 0.5 means game is pending (e.g. waiting for p2 to connect)
//active games[game_id] = [status, player1_id, player2_id, server];
var active_games = {};
var server_occupancy_tutorial = {
	t1: 50,
	t2: 50,
	t3: 50
}
var server_occupancy = {
	d1: 50,
	d2: 50,
	d3: 50,
	d4: 50
};
var connections = {};
var this_server = 't1';
var this_server_type = 'tutorial';


//connect to mongodb
const mongoose = require('mongoose');
const User = require('./models/users.js');
const Game = require('./models/newgame.js');
const dbURI = 'mongodb+srv://levmiseri:02468a13579A@cluster0.us90f.mongodb.net/yare-io?retryWrites=true&w=majority'
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
	.then((result) => console.log('connected to dbb'))
	.catch((error) => console.log(error));

function new_game(pl1_id, pl2_id, init_status = 1, server_id = 'd1') {
	var g_id = generateUniqueString(3);
	active_games[g_id] = [0, 0, 0, 0];
	active_games[g_id][0] = init_status;
	active_games[g_id][1] = pl1_id;
	active_games[g_id][2] = pl2_id;
	active_games[g_id][3] = server_id;
	return g_id;
}


function create_worker (game_id, game_type) {
  const worker = new Worker('./game.js', { workerData: [game_id, game_type] })
  worker.on('error', (err) => { throw err })
  worker.on('message', (render_data) => {
	  if (render_data.meta == 'initiate'){
		  console.log('initiate world');
		  connections[render_data.client].send(render_data.data);
		  connections[render_data.client].send(JSON.stringify(code_temps));
		  console.log("code_temps['player1']");
		  console.log(JSON.stringify(code_temps));
		  delete connections[render_data.client];
	  } else if (render_data.meta == 'test'){
		  console.log('testing');
		  console.log(render_data.data);
	  } else {
		  console.log('processing render data');
		  console.log(render_data.game_id);
		  wss.broadcast(render_data.data, render_data.game_id);
	  }
	  
  })
  worker.on('exit', (code) => {
	  delete active_games[game_id];
  });
  
  
  workers[game_id] = worker;
}

//create_worker('aatest');
//createWorker('bbbtrs');

function load_balancer(){
	//logic for redirects to the right server????
}

function bot_game(req, res, pl_id){
	//instead redirect to a game-server???
	
	//TODO: first assign a server to this game
	var tut_servers = Object.keys(server_occupancy_tutorial);
	var load_threshold = 40;
	var chosen_server = 't3';
	
	for (i = 0; i < tut_servers.length; i++){
		if (server_occupancy_tutorial[tut_servers[i]] > load_threshold){
			chosen_server = tut_servers[i];
			server_occupancy_tutorial[chosen_server]--;
			console.log(server_occupancy_tutorial);
			console.log('chosen server = ' + chosen_server);
			break;
		}
		if (i == (tut_servers.length - 1)){
			console.log('all servers busy, increasing load');
			load_threshold -= 10; 
			i = -1;
		}
		
	}
	
	
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
		observers: 0
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
	g_id = new_game(req.body.user_id, 0, init_status = 0.5);
	res.status(200).send({
		g_id: g_id,
		meta: 'waiting for p2'
    });
	const game = new Game({
		game_id: g_id,
		player1: req.body.user_id,
		player2: '',
		p1_session_id: req.body.session_id,
		p2_session_id: '',
		p1_shape: 'circles',
		p2_shape: 'circles',
		p1_color: 'color1',
		p2_color: 'color2',
		p1_rating: 0,
		p2_rating: 0,
		winner: '',
		ranked: 0,
		active: 1,
		game_duration: 0,
		observers: 0
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

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Client requests new game
app.post('/new-game', (req, res) => {
	console.log('creating new game');
	if (req.body.user_id == 'anonymous'){
		bot_game(req, res, 'anonymous');
	} else {
		if (req.body.type == 'easy-bot'){
			bot_game(req, res, req.body.user_id);
		} else if (req.body.type == 'challenge'){
			friend_challenge(req, res);
		} else if (req.body.type == 'automatch'){
			console.log('automatching...');
			User.find({user_id: req.body.user_id})
				.then((result) => {
					console.log(result);
					console.log('...auto match added');
					automatch_looking.push([result[0].user_id, result[0].rating, 0, 0]);
				})
				.catch((error) => {
					console.log(error);
				})
			
			
				
		}
	}
});

app.post('/check-status/:game_id', (req, res) => {
	game_id_url = req.params.game_id;
	if (active_games[game_id_url][0] == 0.5){
		res.status(200).send({
			player2: '',
			data: 'not yet'
        });
	} else if (active_games[game_id_url][0] == 1){
		res.status(200).send({
			player2: active_games[game_id_url][2],
			data: 'ready'
        });
	} else {
		data: 'game cancelled'
	}
});


app.post('/validate', (req, res) => {
	console.log(req.body);
    console.log(req.body.user_name);
    console.log(req.body.password);
	
	User.find({user_id: req.body.user_name})
		.then((result) => {
			//res.send(result);
			console.log('db result');
			if (result.length == 0){
				res.status(404).send({
		        	data: "no such user"
		        });
			} else if (result[0]['passwrd'] == sha256(req.body.password)){
				//all good, update session id and prolong expiration date
				session_id = generateUniqueString(3);
		        var session_expire = new Date();
		        session_expire = (session_expire.getTime() + (7*24*60*60*1000));
				console.log('date');
				console.log(session_expire);
				User.updateOne({user_id: req.body.user_name}, {session_id: session_id, session_expire: session_expire}, {upsert: true})
					.then((qq) => {
						res.status(200).send({
							user_id: result[0]['user_id'],
				        	data: session_id
				        });
					});
				
			} else {
				res.status(404).send({
		        	data: "wrong password"
		        });
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
	
	User.find({user_id: req.body.user_id})
		.then((result) => {
			//res.send(result);
			console.log('db result');
			if (result.length == 0){
				res.status(404).send({
		        	data: "something went wrong"
		        });
			} else if (result[0]['session_id'] == req.body.session_id){
				//all good, update session id and prolong expiration date
				session_id = generateUniqueString(3);
		        var session_expire = new Date();
		        session_expire = (session_expire.getTime() + (7*24*60*60*1000));
				console.log('date');
				console.log(session_expire);
				User.updateOne({user_id: req.body.user_id}, {session_id: session_id, session_expire: session_expire}, {upsert: true})
					.then((qq) => {
						res.status(200).send({
							username: result[0]['user_id'],
				        	data: session_id
				        });
					});
				
			} else {
				console.log('session ids:::');
				console.log(result[0]['session_id']);
				console.log(req.body.session_id);
				res.status(404).send({
		        	data: "expired session"
		        });
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
			passwrd: sha256(req.body.password),
			rating: 1500,
			rating_stability: 5,
			games_count: 0,
			session_id: session_id,
			session_expire: session_expire
		});
	
		User.find({user_id: req.body.user_name})
			.then((result) => {
				//res.send(result);
				console.log('db result');
				if (result.length == 0){
					res.status(200).send({
			        	data: "user created",
						user_id: req.body.user_name,
						session_id: session_id
			        });
					user.save()
						.then((result) => {
							console.log('user created');
						})
						.catch((error) => {
							console.log(error);
						})
				
				} else {
					res.status(200).send({
			        	data: "exists"
			        });
				}
			})
			.catch((error) => {
				console.log(error);
			})
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
	res.sendFile(__dirname + '/game.html');
});


//game servers (change t1 to server's responsibility (d1, d2 ...))
// ------
// ------

function init_game(game_id, pla1, pla2, init_status = 1, server_id = this_server){
	create_worker(game_id, 'tutorial');
	active_games[game_id] = [0, 0, 0, 0];
	active_games[game_id][0] = 1;
	active_games[game_id][1] = pla1;
	active_games[game_id][2] = pla2;
	active_games[game_id][3] = server_id;
	start_world(game_id);
}

function trigger_deactivation(){
	fetch('/deactivate', {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
	        game_id: 'testing_this_will_be_game_id'
	    })
	}).then(response => response.json())
      .then(response => {
		  console.log(response);
	  })
      .catch(err => {
		  console.log(err);
	  });
}

function deactivate_game(game_id){
	console.log('here is deactivating happening');
}

app.get('/' + this_server + 'n/:game_id', (req, res) => {
	game_id_url = req.params.game_id;
	//if (active_games[game_id_url][0] == 1){
	//	res.redirect('/' + this_server + '/' + game_id_url);
	//} else {
	res.sendFile(__dirname + '/wait.html');
	//}
	
});

app.post('/' + this_server + 'ns/:game_id', (req, res) => {
	game_id_url = req.params.game_id;
	
	
	
	console.log('finding game via mongoooooooooooooooooooose');
	Game.find({game_id: game_id_url})
		.then((result) => {
			//res.send(result);
			console.log('db result');
			console.log(result);
			if (result.length == 0){
				res.status(200).send({
		        	data: "no game found"
		        });
			} else if (result[0]['active'] == 0.5 && result[0]['server'] == this_server){
				init_game(game_id_url, result[0]['player1'], result[0]['player2']);
				Game.updateOne({game_id: game_id_url}, {active: 1}, {upsert: true})
					.then((qq) => {
						console.log('game is ready');
						res.status(200).send({
				        	data: "game ready",
							server: this_server
				        });
					});			
			} else if (result[0]['active'] == 1 && result[0]['server'] == this_server){
				console.log('game already active, redirect');
				res.status(200).send({
		        	data: "game already active",
					server: this_server
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


app.get('/' + this_server + '/:game_id', (req, res) => {
	game_id_url = req.params.game_id;
	if (active_games[game_id_url] == undefined){
		//add a simple page stating the result and stats of a game
		console.log('game ended or does not exist');
	} else if (active_games[game_id_url][0] == 1){
		res.sendFile(__dirname + '/game.html');
	} else {
		if (this_server_type == "tutorial" && active_games[game_id_url][0] == 0){
			console.log('game is being saved into db?? maybe??????????????????????????????????????');
		} else {
			console.log('not sure what happened here');
			res.send(404);
		}
		
		
		
		
	}
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
	console.log('triggerting');
	trigger_deactivation();	
});


// ------
// ------


app.get('/challenge/:game_id', (req, res) => {
	game_id_url = req.params.game_id;
	if (active_games[game_id_url][0] == 1){
		res.sendFile(__dirname + '/game.html');
	} else if (active_games[game_id_url][0] == 0.5){
		//pending – waiting for p2 to connect
		res.sendFile(__dirname + '/challenge.html');
		//active_games[game_id_url] = 1;
	} else {
		res.send(404);
	}
});

app.post('/validate-challenge/:game_id', (req, res) => {
	game_id_url = req.params.game_id;
	//find via mongoose, check if player1 != player2
	console.log('finding game via mongoooooooooooooooooooose');
	Game.find({game_id: game_id_url})
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
				Game.updateOne({game_id: game_id_url}, {player2: req.body.user_id, p2_session_id: req.body.session_id}, {upsert: true})
					.then((qq) => {
						active_games[game_id_url][2] = req.body.user_id;
						console.log('p2_session_id updated');
						start_world(game_id_url);
					});
				
				create_worker(game_id_url, 'nonranked');
				res.status(200).send({
		        	data: "challenge connected"
		        });
				//active_games[game_id_url] = 1;
			}
		})
		.catch((error) => {
			console.log(error);
		})
});

app.post('/confirm-challenge/:game_id', (req, res) => {
	game_id_url = req.params.game_id;
	//find via mongoose, check if player1 != player2
	if (active_games[game_id_url][0] == 0.5){
		//access mongoose and update game document
		active_games[game_id_url][2] = req.body.user_id;
		active_games[game_id_url][0] = 1;
	} else if (active_games[game_id_url][0] == 1){
		//if player1 confirming, redirect to game and start it (allow code change)
		Game.find({game_id: game_id_url})
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
			        	data: "start"
			        });
			
				} else {
					res.status(200).send({
			        	data: "not owner"
			        });
					//active_games[game_id_url] = 1;
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



//global

var player1_id = 'ab1';
var player2_id = 'zx2';
var player1_code;
var player1_session = 'abc';
var player2_code;
var player2_session = 'xyz';

var player1_code_temp;
var player2_code_temp;
var code_temps = {};

var tutorial = {};


var processTime1 = 0;
var processTime2 = 0;
var processTimeRes = 0;


//var render_data = [[],[],[],[],[]];




function initiate_world(ws, game_id){
	//sends current state of the world to the client
	try {
		workers[game_id].postMessage({client: ws, data: "initiate world"});
	} catch (error) {
	  console.error(error);
	}
}

function start_world(game_id){
	//starts the game
	try {
		workers[game_id].postMessage({data: "start world", player1: active_games[game_id][1], player2: active_games[game_id][2]});
	} catch (error) {
	  console.error(error);
	}
}

function send_code(ws, pl_num, pl_id, pl_code, game_id, session_id){
	console.log('sending code');
	console.log('session_id = ' + session_id);
	workers[game_id].postMessage({client: ws, data: "player code", pl_num: pl_num, pl_id: pl_id, pl_code: pl_code, session_id: session_id});
}


wss.broadcast = function broadcast(data, game_id) {
    wss.clients.forEach(function each(client) {
		console.log(client.game_id);
        if (client.readyState === WebSocket.OPEN) {
			if (client.game_id == game_id){
				client.send(data);
			}            
        }
    });
};


wss.on('connection', function connection(ws, req) {
	console.log('new client connected');
	var g_id = /[^/]*$/.exec(req.url)[0];
	console.log(g_id); 
	ws.game_id = g_id;
	//cookie session?
	ws.client_id = 'zzz';
	connections[ws.client_id] = ws;
	//console.log(url);
	//ws.send('welcome!');
	initiate_world(ws.client_id, g_id);
	
	ws.on('message', function incoming(message) {
		d1 = process.hrtime();
		message = JSON.parse(message);
		console.log('message');
    	console.log('received: %s', message);
		connections[ws.client_id] = ws;
		//player1_code = message;
		try {
			if (message['u_id'].length > 1){
				console.log('code sent by');
				console.log(message['u_id']);
				console.log(active_games[g_id][1])
			}
			if (message['u_id'] == active_games[g_id][1] || active_games[g_id][1] == 'anonymous'){
				code_temps['player1'] = message['u_code'];
				code_temps['player1_session'] = message['session_id'];
				player1_code = `
				//all = spirits.length;
				//for (s = 0; s < all; s++){
				//	global['s' + s] = spirits[s];
				//}
				
				var this_player_id = players['p1'];
				
				var my_spirits = [];
				
				for (q = 0; q < (Object.keys(spirits)).length; q++){
					if(spirits[Object.keys(spirits)[q]].hp > 0 && this_player_id == spirits[Object.keys(spirits)[q]].player_id){
						my_spirits.push(spirits[Object.keys(spirits)[q]]);
						global['s' + (q+1)] = spirits[Object.keys(spirits)[q]];
					}
				}
				
				global['base'] = Object.values(bases)[0];
				global['enemy_base'] = Object.values(bases)[1];
				global['star_zxq'] = stars['star_zxq'];
				global['star_a1c'] = stars['star_a1c'];
				
				` + message['u_code'];
				send_code(ws.client_id, 'player1', message['u_id'], player1_code, g_id, message['session_id']);
			} else if (message['u_id'] == active_games[g_id][2]){
				code_temps['player2'] = message['u_code'];
				code_temps['player2_session'] = message['session_id'];
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
				
				` + message['u_code'];
				send_code(ws.client_id, 'player2', message['u_id'], player2_code, g_id, message['session_id']);
			}
		} catch (error) {
		  console.error(error);
		}
		/*if (message['session_id'] == player1_session){
			player1_code = `all = spirits.length;
			for (s = 0; s < all; s++){
				global['s' + s] = spirits[s];
			}` + message['u_code'];
			send_code(ws.client_id, 'player1', player1_code, g_id, session_id);
		}
		if (message['session_id'] == player2_session){
			player2_code = `all = spirits.length;
			for (s = 0; s < all; s++){
				global['s' + s] = spirits[s];
			}` + message['u_code'];
			send_code(ws.client_id, 'player2', player1_code, g_id);
		}
		*/
  });

});




app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
app.get('/hub', (req, res) => res.sendFile(__dirname + '/hub.html'));
app.get('/game', (req, res) => res.sendFile(__dirname + '/game.html'));
app.get('/newgame', (req, res) => res.sendFile(__dirname + '/newgame.html'));
app.get('/animations.js', (req, res) => res.sendFile(__dirname + '/animations.js'));
app.get('/rendering.js', (req, res) => res.sendFile(__dirname + '/rendering.js'));
app.get('/basics.js', (req, res) => res.sendFile(__dirname + '/basics.js'));
app.get('/challenge.js', (req, res) => res.sendFile(__dirname + '/challenge.js'));
app.get('/loggedin.js', (req, res) => res.sendFile(__dirname + '/loggedin.js'));
app.get('/tutorial_texts.js', (req, res) => res.sendFile(__dirname + '/tutorial_texts.js'));
app.get('/style.css', (req, res) => res.sendFile(__dirname + '/style.css'));
app.get('/style-mobile.css', (req, res) => res.sendFile(__dirname + '/style-mobile.css'));
app.get('/colors.css', (req, res) => res.sendFile(__dirname + '/colors.css'));
app.get('/src-min-noconflict/ace.js', (req, res) => res.sendFile(__dirname + '/src-min-noconflict/ace.js'));
app.get('/src-min-noconflict/theme-clouds_midnight.js', (req, res) => res.sendFile(__dirname + '/src-min-noconflict/theme-clouds_midnight.js'));
app.get('/src-min-noconflict/mode-javascript.js', (req, res) => res.sendFile(__dirname + '/src-min-noconflict/mode-javascript.js'));
app.get('/src-min-noconflict/worker-javascript.js', (req, res) => res.sendFile(__dirname + '/src-min-noconflict/worker-javascript.js'));
app.get('/anime.min.js', (req, res) => res.sendFile(__dirname + '/anime.min.js'));


app.get('/assets/loader.gif', (req, res) => res.sendFile(__dirname + '/assets/loader.gif'));
app.get('/assets/game/innerSh1x.png', (req, res) => res.sendFile(__dirname + '/assets/game/innerSh1x.png'));

app.get('/est', (req, res) => res.sendFile(__dirname + '/est.html'));







server.listen(5000, () => console.log('Listening on port :5000'))
automatch();

