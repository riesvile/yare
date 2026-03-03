const express = require('express');
const {User} = require('../models/users.js');
const Game = require('../models/newgame.js');

module.exports = function createMiscRoutes({ logger, check_limiter }) {
	const router = express.Router();

	router.post('/playerinfo', (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		let p111_rating = 0;
		let p222_rating = 0;

		User.find({user_id: req.body.pla1})
			.then((result) => {
				if (result.length == 0){
					res.status(200).send({ data: "no user found" });
				} else if (result[0]['rating'] != undefined && result[0]['rating'] != ''){
					p111_rating = result[0]['rating'];
					if (req.body.pla2){
						User.find({user_id: req.body.pla2})
							.then((result2) => {
								if (result2.length == 0){
									res.status(200).send({ data: "no user found" });
								} else if (result2[0]['rating'] != undefined && result2[0]['rating'] != ''){
									p222_rating = result2[0]['rating'];
									res.status(200).send({
										pla1_rating: p111_rating,
										pla2_rating: p222_rating
									});
								} else {
									res.status(200).send({ data: "something went wrong" });
								}
							})
							.catch((error) => {
								logger.error(error);
							})
					} else {
						res.status(200).send({ pla1_rating: p111_rating });
					}
				} else {
					res.status(200).send({ data: "something went wrong" });
				}
			})
			.catch((error) => {
				logger.error(error);
			})
	});

	router.post('/get-player-rating', (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		User.find({user_id: req.body.user_name})
			.then((result) => {
				if (result.length == 0){
					res.status(200).send({ data: "no user found" });
				} else if (result[0]['rating'] != undefined && result[0]['rating'] != ''){
					let player_rating = result[0]['rating'];
					res.status(200).send({ rating: player_rating, data: 'all good' });
				} else {
					res.status(200).send({ data: "something went wrong" });
				}
			})
			.catch((error) => {
				logger.error(error);
			})
	});

	router.post('/get_colors', (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		User.find({user_id: req.body.user_id})
			.then((result) => {
				if (result.length == 0){
					res.status(200).send({ data: "no user found" });
				} else if (result[0]['colors'] != undefined && result[0]['colors'] != ''){
					res.status(200).send({ data: result[0]['colors'] });
				} else {
					res.status(200).send({ data: "something went wrong" });
				}
			})
			.catch((error) => {
				logger.error(error);
			})
	});

	router.post('/populate-hub', (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		Game.find({$or:[{player1: req.body.user_id},{player2: req.body.user_id}]})
			.sort({updatedAt:'desc'})
			.limit(10)
			.exec()
			.then((result) => {
				if (result.length == 0){
					res.status(200).send({ data: "no results" });
				} else {
					for (let i = 0; i < result.length; i++){
						result[i]['passwrd'] = '0';
						result[i]['session_id'] = '0';
						result[i]['p1_session_id'] = '0';
						result[i]['p2_session_id'] = '0';
						result[i]['game_file'] = '';
					}
					res.status(200).send({ data: "populate", stream: result });
				}
			})
			.catch((error) => {
				logger.error(error);
			})
	});

	router.post('/populate-leaderboard', (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		User.find({})
			.sort({rating:'desc'})
			.limit(100)
			.exec()
			.then((result) => {
				if (result.length == 0){
					res.status(200).send({ data: "no results" });
				} else {
					for (let i = 0; i < result.length; i++){
						result[i]['passwrd'] = '0';
						result[i]['session_id'] = '0';
						result[i]['p1_session_id'] = '0';
						result[i]['p2_session_id'] = '0';
					}
					res.status(200).send({ data: "populate", stream: result });
				}
			})
			.catch((error) => {
				logger.error(error);
			})
	});

	router.get('/api/user-profile/:username', (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		const username = req.params.username;
		User.findOne({user_id: username})
			.then((user) => {
				if (!user) {
					return res.status(404).send({ data: "no user found" });
				}
				Game.find({$or:[{player1: username},{player2: username}], active: 0})
					.sort({updatedAt:'desc'})
					.limit(20)
					.exec()
					.then((games) => {
						const sanitized = games.map(g => ({
							game_id: g.game_id,
							player1: g.player1,
							player2: g.player2,
							p1_color: g.p1_color,
							p2_color: g.p2_color,
							p1_rating: g.p1_rating,
							p2_rating: g.p2_rating,
							winner: g.winner,
							ranked: g.ranked,
							updatedAt: g.updatedAt,
						}));
						res.status(200).send({
							data: "ok",
							user: { user_id: user.user_id, rating: user.rating },
							games: sanitized
						});
					})
					.catch((error) => {
						logger.error(error);
						res.status(500).send({ data: "error" });
					});
			})
			.catch((error) => {
				logger.error(error);
				res.status(500).send({ data: "error" });
			});
	});

	router.post('/stripe-payment', (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		logger.debug('stripe pay');
		logger.debug(req.body);

		res.status(200).send({ data: 'done' });
	});

	return router;
};
