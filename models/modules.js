const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const module_schema = new Schema({
	module_id: {
		type: String,
		index: true,
		required: true
	},
    type: String,
	name: String,
	description: String,
	public: Number,
	subscribers: Array,
	client_script_location: String,
	server_script_location: String,
	author: String,
	alive: Number
}, {timestamps: true});


const Module = mongoose.model('Module', module_schema);
module.exports = Module;