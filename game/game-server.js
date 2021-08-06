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

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const {Worker} = require('worker_threads');
const config = require('../config');
const path = require('path');
const fetch = require('node-fetch');
require('isolated-vm'); // require to avoid glitch locally

var this_server = process.env.SERVER || 'd1';
var this_server_type = process.env.SERVER_TYPE || 'real'; //'real'

const mongoose = require('mongoose');
const Game = require('../models/newgame.js');
const dbURI = config.mongo;
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
	.then((result) => console.log('connected to dbb'))
	.catch((error) => console.log(error));

var workers = {};
//active_games[game_id] = 0.5 means game is pending (e.g. waiting for p2 to connect)
//active games[game_id] = [status, player1_id, player2_id, server];
var active_games = {};

var connections = {};

var base = path.dirname(__dirname);

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

function create_worker (game_id, game_type) {
    const worker = new Worker(base + '/game/game.js', { workerData: [game_id, game_type] })
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

  function init_game(game_id, pla1, pla2, init_status = 1, server_id = this_server, pla1_shape = 0, pla2_shape = 0, pla1_color = 'color1', pla2_color = 'color2', game_type = 'tutorial'){
	create_worker(game_id, game_type);
	active_games[game_id] = [0, 0, 0, 0];
	active_games[game_id][0] = 1;
	active_games[game_id][1] = pla1;
	active_games[game_id][2] = pla2;
	active_games[game_id][3] = server_id;
	//0=circle, 1=square, 2=triangle
	active_games[game_id][4] = pla1_shape;
	active_games[game_id][5] = pla2_shape;
	active_games[game_id][6] = pla1_color;
	active_games[game_id][7] = pla2_color;

	if(game_type == "real" && pla2 != "dumb-bot" && pla2 != "medium-bot" && pla2 != "will-bot") {
		discord_postmessage(config.hooks.new_match, "" + pla1 + " vs. " + pla2 + " : https://yare.io/" + server_id + "/" + game_id);
	}

	start_world(game_id);
}

function findAgain(req, res, g_id){
	Game.find({game_id: g_id})
		.then((result) => {
			//res.send(result);
			console.log('db result');
			console.log(result);
			if (result.length == 0){
				res.status(200).send({
		        	data: "no game found"
		        });
			} else if (result[0]['active'] == 0.5 && result[0]['server'] == this_server){
				init_game(g_id, result[0]['player1'], result[0]['player2'], 1, result[0]['server'], result[0]['p1_shape'], result[0]['p2_shape'], result[0]['p1_color'], result[0]['p2_color'], this_server_type);
				Game.updateOne({game_id: g_id}, {active: 1}, {upsert: true})
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
}

function start_world(game_id){
	//starts the game
	try {
		workers[game_id].postMessage({data: "start world", player1: active_games[game_id][1], player2: active_games[game_id][2], p1_shape: active_games[game_id][4], p2_shape: active_games[game_id][5], p1_color: active_games[game_id][6], p2_color: active_games[game_id][7]});
	} catch (error) {
	  console.error(error);
	}
}



function initiate_world(ws, game_id){
	//sends current state of the world to the client
	try {
		workers[game_id].postMessage({client: ws, data: "initiate world"});
	} catch (error) {
	  console.error(error);
	}
}

function send_code(ws, pl_num, pl_id, pl_code, game_id, session_id, resign_state){
	workers[game_id].postMessage({client: ws, data: "player code", pl_num: pl_num, pl_id: pl_id, pl_code: pl_code, session_id: session_id, resigning: resign_state});
}

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
	var resigning1 = 0;
	var resigning2 = 0;
	console.log(g_id); 
	ws.game_id = g_id;
	//cookie session?
	ws.client_id = generateUniqueString();
	connections[ws.client_id] = ws;
	//console.log(url);
	//ws.send('welcome!');
	//console.log(connections);
	initiate_world(ws.client_id, g_id);
	
	ws.on('message', function incoming(message) {
		d1 = process.hrtime();
		let active_game = active_games[g_id];
		if(active_game == undefined){
			// TODO VILEM CHECK - is this proper handling?
			// or do we return something else?
			return;
		}

		if (message == 'reinitiate'){
			console.log('reinitiating the world for g_id = ' + g_id);
			initiate_world(ws.client_id, g_id);
		} else {
			message = JSON.parse(message);
			if (message.meta == "resign"){
				console.log(message.u_id + ' is resigning');
				if (message['u_id'] == active_game[1]) resigning1 = 1;
				if (message['u_id'] == active_game[2]) resigning2 = 1;
			} else {
				resigning1 = 0;
				resigning2 = 0;
			}
		}

		connections[ws.client_id] = ws;
		//player1_code = message;
		try {
			if (message['u_id'].length > 1){
				//console.log('code sent by');
				//console.log(message['u_id']);
				//console.log(active_game[1])
			}
			if (message['u_id'] == active_game[1] || active_game[1] == 'anonymous'){
				//code_temps['player1'] = message['u_code'];
				player1_code = message['u_code'];

				send_code(ws.client_id, 'player1', message['u_id'], player1_code, g_id, message['session_id'], resigning1);
			} else if (message['u_id'] == active_game[2]){
				//code_temps['player2'] = message['u_code'];
				player2_code = message['u_code'];

				send_code(ws.client_id, 'player2', message['u_id'], player2_code, g_id, message['session_id'], resigning2);
			}
		} catch (error) {
		  //console.error(error);
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


app.get('/' + this_server + 'n/:game_id', (req, res) => {
	let g_id = req.params.game_id;
	// JM if uncomment, fix the active_games[g_id] == undefined possibility
	//if (active_games[g_id][0] == 1){
	//	res.redirect('/' + this_server + '/' + g_id);
	//} else {
	res.sendFile(base + '/public/wait.html');
	//}
	
});

app.post('/' + this_server + 'ns/:game_id', (req, res) => {
	let g_id = req.params.game_id;
	
	console.log('finding game via mongoooooooooooooooooooose');
	Game.find({game_id: g_id})
		.then((result) => {
			//res.send(result);
			console.log('db result');
			console.log(result);
			if (result.length == 0){
				findAgain(req, res, g_id);
			} else if (result[0]['active'] == 0.5 && result[0]['server'] == this_server){
				init_game(g_id, result[0]['player1'], result[0]['player2'], 1, result[0]['server'], result[0]['p1_shape'], result[0]['p2_shape'], result[0]['p1_color'], result[0]['p2_color'], this_server_type);
				Game.updateOne({game_id: g_id}, {active: 1}, {upsert: true})
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
	let g_id = req.params.game_id;
	let active_game = active_games[g_id];
	if (active_game == undefined){
		//add a simple page stating the result and stats of a game
		console.log('game ended or does not exist');
		Game.find({game_id: g_id})
			.then((result) => {
				//res.send(result);
				console.log('dbdb result');
				//console.log(result);
				if (result.length == 0){
					res.sendFile(base + '/public/nope.html');
				} else if (result.length == 1){
					res.sendFile(base + '/public/game-status.html');
				} else {
					console.log('something went wrong');
					res.sendFile(base + '/public/nope.html');
				}
			})
			.catch((error) => {
				console.log(error);
			})
	} else if (active_game[0] == 1){
		res.sendFile(base + '/public/game.html');
	} else {
		if (this_server_type == "tutorial" && active_game[0] == 0){
			console.log('game is being saved into db?? maybe??????????????????????????????????????');
		} else {
			console.log('not sure what happened here');
			res.send(404);
		}
	}
});



app.use('/' + this_server + '/a/', express.static(base + '/public', {extensions: ["html"]}));

server.listen(5000, () => console.log('Listening on port :5000'));