const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const server_schema = new Schema({
	server: {
		type: String,
		index: true,
		required: true
	},
    type: {
        type: String,
        index: true,
        required: true
    },
	weight: {
		type: Number,
		required: true
	}
}, {timestamps: true});


const Server = mongoose.model('Server', server_schema);
module.exports = Server;