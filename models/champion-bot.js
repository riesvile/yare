const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const champion_bot_schema = new Schema({
	author: {
		type: String,
		required: true
	},
	bot_name: {
		type: String,
		required: true
	},
	code: {
		type: String,
		required: true
	},
	game_id: {
		type: String,
		default: ''
	},
}, {timestamps: true});

const ChampionBot = mongoose.model('ChampionBot', champion_bot_schema);
module.exports = ChampionBot;
