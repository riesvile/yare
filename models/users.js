const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user_schema = new Schema({
	user_id: {
		type: String,
		required: true
	},
	passwrd: {
		type: String,
		required: true,
	},
	session_id: String,
	session_expire: Number
}, {timestamps: true});


const User = mongoose.model('User', user_schema);
module.exports = User;