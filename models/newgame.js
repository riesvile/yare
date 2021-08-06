const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const game_schema = new Schema({
	game_id: {
		type: String,
		index: true,
		required: true
	},
	player1: {
		type: String,
		index: true,
		required: true
	},
	player2: {
		type: String,
		index: true
	},
	server: String,
	p1_session_id: String,
	p2_session_id: String,
	p1_shape: String,
	p2_shape: String,
	p1_color: String,
	p2_color: String,
	p1_rating: Number,
	p2_rating: Number,
	winner: String,
	ranked: Number,
	active: Number,
	game_duration: Number,
	observers: Number,
	game_file: String,
	last_update: Number,
}, {timestamps: true});


const Game = mongoose.model('Game', game_schema);
module.exports = Game;