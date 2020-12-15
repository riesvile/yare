const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const game_schema = new Schema({
	game_id: {
		type: String,
		required: true
	},
	player1: {
		type: String,
		required: true
	},
	player2: {
		type: String
	},
	p1_session_id: String,
	p2_session_id: String,
	p1_shape: String,
	p2_shape: String,
	p1_color: String,
	p2_color: String,
	winner: String,
	ranked: Number,
	active: Number,
	game_duration: Number,
	observers: Number
}, {timestamps: true});


const Game = mongoose.model('Game', game_schema);
module.exports = Game;