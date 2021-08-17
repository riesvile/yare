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
		required: true
	},
	colors: Array,
	rating: Number,
	rating_stability: Number,
	games_count: Number,
	games_history: Array,
	qualified: {
		type: String,
		index: true
	},
	qualified_shape: String, 
	goodenough: Number
}, {timestamps: true});

const session_schema = new Schema({
	user_id: {
		type: String,
		index: true,
		required: true
	},
	session_id: {
		type: String,
		index: true,
		required: true
	},
	session_expire: Number
}, {timestamps: true});


const User = mongoose.model('User', user_schema);
const Session = mongoose.model('Session', session_schema);
module.exports = {
	User: User,
	Session: Session
};