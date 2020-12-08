const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const opts = {
  // Make Mongoose use Unix time (seconds since Jan 1, 1970)
  timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
};

const blog_schema = new Schema({
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
}, opts);


const Blog = mongoose.model('Blog', blog_schema);
module.exports = Blog;