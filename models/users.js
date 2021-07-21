const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user_schema = new Schema({
	user_id: {
		type: String,
		index: true,
		required: true
	},
	passwrd: {
		type: String,
		required: true,
	},
	rating: Number,
	rating_stability: Number,
	games_count: Number,
	games_history: Array,
	session_id: String,
	session_expire: Number
}, {timestamps: true});


const User = mongoose.model('User', user_schema);
module.exports = User;