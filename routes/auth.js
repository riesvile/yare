const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sha256 = hash_string => crypto.createHash('sha256').update(hash_string, 'utf8').digest('hex');
const {User, Session} = require('../models/users.js');
const { generateSecureString, isValid } = require('../utils/helpers');

const hashRounds = 10;

module.exports = function createAuthRoutes({ logger, check_limiter }) {
	const router = express.Router();

	router.post('/validate', (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		User.find({user_id: req.body.user_name})
			.then((result) => {
				if (result.length == 0){
					res.status(404).send({ data: "no such user" });
				} else {
					var good = false;
					var newHash = null;
					if(bcrypt.compareSync(req.body.password, result[0]['passwrd'])){
						good = true;
					} else if (result[0]['passwrd'] == sha256(req.body.password)) {
						good = true;
						newHash = bcrypt.hashSync(req.body.password, hashRounds);
						logger.debug("Upgrading sha256 to bcrypt");
					}

					if(good) {
						var user_id = result[0]['user_id'];
						var session_id = generateSecureString(64);
						var session_expire = new Date();
						session_expire = (session_expire.getTime() + (7*24*60*60*1000));
						var updatePromise = Promise.resolve(true);
						if(newHash) {
							updatePromise = User.updateOne({user_id: req.body.user_name}, {passwrd: newHash}, {upsert: true});
						}

						var sessionCreatePromise = Session.create({user_id: user_id, session_id: session_id, session_expire: session_expire});

						Promise.all([updatePromise, sessionCreatePromise])
							.then(() => {
								res.status(200).send({
									user_id: user_id,
									data: session_id
								});
							});
					} else {
						res.status(404).send({ data: "wrong password" });
					}
				}
			})
			.catch((error) => {
				logger.error(error);
			})
	});

	router.post('/session', (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		if (typeof req.body.session_id !== 'string'){
			return res.status(200).send({ data: 'invalid request' });
		}

		logger.debug('session was called !!!!!!!');

		Session.find({session_id: req.body.session_id})
			.then((result) => {
				if (result.length == 0){
					res.status(404).send({ data: "no such session" });
				} else {
					var session = result[0];
					var session_id = session['session_id'];
					var user_id = session['user_id'];
					var session_expire = session['session_expire'];
					if ((new Date()).getTime() + (6*24*60*60*1000) > session_expire){
						session_id = generateSecureString(64);
						session_expire = ((new Date()).getTime() + (7*24*60*60*1000));
						logger.debug('creating new session');
						Session.create({user_id: user_id, session_id: session_id, session_expire: session_expire})
							.then((qq) => {
								res.status(200).send({
									username: user_id,
									data: session_id
								});
							});
					} else {
						res.status(200).send({
							username: user_id,
							data: session_id
						});
					}
				}
			})
			.catch((error) => {
				logger.error(error);
			})
	});

	router.post('/add-user', async (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		if (req.body.user_name.length > 20){
			res.status(200).send({ data: "toolong", data2: req.body.user_name.length });
		} else if (req.body.user_name.length < 3){
			res.status(200).send({ data: "tooshort" });
		} else if (isValid(req.body.user_name) != true){
			res.status(200).send({ data: "special" });
		} else if (req.body.password.length < 1){
			logger.debug('password too short');
			res.status(200).send({ data: "pass_empty" });
		} else if ((await User.find({user_id: req.body.user_name})).length !== 0){
			logger.debug('user with name already exists');
			res.status(200).send({ data: "exists" });
		} else {
			var session_id = generateSecureString(64);
			var session_expire = new Date();
			session_expire = (session_expire.getTime() + (7*24*60*60*1000));

			const user = new User({
				user_id: req.body.user_name,
				passwrd: bcrypt.hashSync(req.body.password, hashRounds),
				rating: 1500,
				rating_stability: 5,
				games_count: 0,
				games_history: '',
				colors: [1, 2, 3, 4],
				qualified: "",
				goodenough: 0,
				email: "",
				marker: 0,
				visible_modules: [],
				active_modules: [],
				lang_preference: 'javascript',
				audio_preference: [50, 60]
			});

			user.save()
				.then((user) => {
					Session.create({user_id: user.user_id, session_id: session_id, session_expire: session_expire})
					.then((qq) => {
						res.status(200).send({
							user_id: user.user_id,
							data: "user created",
							session_id: session_id
						});
					});
				})
				.catch((error) => {
					logger.error(error);
					res.status(200).send({ data: "exists" });
				});
		}
	});

	router.post('/get-pref-lang', async (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		User.find({user_id: req.body.user_name})
			.then((result) => {
				if (result.length == 0){
					res.status(200).send({ data: "no user found" });
				} else if (result[0]['lang_preference'] != undefined){
					res.status(200).send({ data: "lang incoming", lang: result[0]['lang_preference'] });
				} else {
					res.status(200).send({ data: "somethiinnng went wrong -" });
				}
			})
			.catch((error) => {
				logger.error(error);
			})
	});

	router.post('/set-pref-lang', async (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}
		if (typeof req.body.session_id !== 'string' || typeof req.body.user_name !== 'string') {
			res.status(400).send({ data: 'invalid request' });
			return;
		}

		Session.find({session_id: req.body.session_id})
			.then((result) => {
				if (result.length == 0 || result[0]['user_id'] != req.body.user_name) {
					res.status(403).send({ data: "session mismatch" });
					return;
				}
				User.find({user_id: req.body.user_name})
					.then((userResult) => {
						if (userResult.length == 0){
							res.status(404).send({ data: "no user found" });
						} else if (userResult[0]['lang_preference'] != undefined){
							User.updateOne({user_id: req.body.user_name}, {lang_preference: req.body.pref_lang})
								.then(() => {
									res.status(200).send({ data: "lang updated" });
								});
						} else {
							res.status(500).send({ data: "could not update language preference" });
						}
					})
			})
			.catch((error) => {
				logger.error(error, '/set-pref-lang error');
			})
	});

	return router;
};
