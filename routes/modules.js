const express = require('express');
const {Session} = require('../models/users.js');
const {User} = require('../models/users.js');
const Module = require('../models/modules.js');
const { generateUniqueString } = require('../utils/helpers');

module.exports = function createModuleRoutes({ logger, check_limiter, s3client, config }) {
	const router = express.Router();

	function store_script(script_file, module_id, client = 1) {
		let fold = 'client/';
		if (client == 0) fold = 'server/';

		let temp_help = script_file.split(',')[1];
		let deco = Buffer.from(temp_help, 'base64');

		s3client.putObject({
			Body: deco.toString(),
			Bucket: config.s3.bucket,
			ACL: 'public-read',
			Key: 'modules/' + fold + module_id + '.js',
		}).promise()
	}

	router.post('/upload-script', async (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		let file_type = req.body.script_type == "client";

		if (typeof req.body.module_id !== 'string' || req.body.module_id.length > 20 || typeof req.body.session_id !== 'string'){
			res.status(200).send({ data: 'invalid request' });
			return;
		}

		logger.debug('module_id = ' + req.body.module_id);
		logger.debug('fold = ' + req.body.script_type);

		Session.find({session_id: req.body.session_id})
			.then((result) => {
				if (result.length == 0){
					res.status(404).send({ data: "no such session" });
				} else {
					if (result[0]['user_id'] == req.body.user_id){
						store_script(req.body.script_file, req.body.module_id, file_type);
						res.status(200).send({ data: 'script uploaded' });
					} else {
						logger.warn('invalid session in /upload-script');
						res.status(403).send({ data: 'session mismatch' });
					}
				}
			})
			.catch((error) => {
				logger.error(error, '/upload-script error');
				res.status(500).send({ data: 'upload failed' });
			})
	});

	router.post('/download-script', async (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		let module_id = req.body.module_id;
		let script_type = req.body.script_type + '/';
		logger.debug("downloading " + script_type + " script of module " + module_id);

		try {
			let data = await s3client.getObject({
				Bucket: config.s3.bucket,
				Key: 'modules/' + script_type + module_id + '.js',
			}).promise();
			res.status(200).send({
				data: data.Body.toString('utf8'),
				meta: 'script retreived'
			});
			return;
		} catch (err) {
			logger.error(err);
		}
	});

	router.post('/update-module-info', async (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		logger.debug('updating a module');

		if (typeof req.body.session_id !== 'string'){
			res.status(200).send({ data: 'invalid request' });
			return;
		}

		let isalive = 1;
		if (req.body.delete_module == 1) isalive = 0;

		Session.find({session_id: req.body.session_id})
			.then((result) => {
				if (result.length == 0){
					res.status(404).send({ data: "no such session" });
				} else {
					if (result[0]['user_id'] != req.body.user_name){
						res.status(404).send({ data: "session mismatch" });
						return;
					}
				}
			})
			.catch((error) => {
				logger.error(error, '/download-script error');
			})

		Module.find({module_id: req.body.module_id})
			.then((result) => {
				if (result.length == 0){
					res.status(200).send({ data: "no module found" });
				} else if (result[0]['author'] == req.body.user_name && result[0]['public'] != 1){
					let new_name = result[0]['name'];
					if (req.body.module_name != '') new_name = req.body.module_name
					Module.updateOne({module_id: req.body.module_id}, {name: new_name, alive: isalive})
						.then((qq) => {
							res.status(200).send({ data: "module updated" });
						});
				} else {
					res.status(200).send({ data: "somethiinnng went wrong - probably not the author of the module" });
				}
			})
			.catch((error) => {
				logger.error(error);
			})
	});

	router.post('/new-module', async (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		if (req.body.module_name.length > 30){
			res.status(200).send({ data: 'module name too long' });
			return;
		}

		let module_id = generateUniqueString("mod");

		const module = new Module({
			module_id: module_id,
			type: "",
			name: req.body.module_name,
			description: "",
			public: 0,
			subscribers: ['test', req.body.user_name],
			client_script_location: "modules/client",
			server_script_location: "modules/server",
			author: req.body.user_name,
			illustration: 'link',
			alive: 1
		});

		module.save()
			.then((qq) => {
				res.status(200).send({ module_id: module_id, data: "module created" });
			})
			.catch((error) => {
				logger.error(error);
				res.status(400).send({ data: "something went wrong :/" });
			});
	});

	router.post('/edit-module', async (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		let module_id = req.body.module_id;

		Module.find({module_id: module_id})
			.then((result) => {
				logger.debug('updating module');
				if (result.length == 0){
					res.status(200).send({ data: "no module found" });
				} else if (result[0]['author'] != req.body.user_name){
					res.status(200).send({ data: "not an author" });
				} else if (result[0]['public'] == 1){
					res.status(200).send({ data: "cannot edit" });
				} else {
					Module.updateOne({module_id: req.body.module_id}, {name: req.body.module_name}, {upsert: true})
					.then((qq) => {
						res.status(200).send({ data: "updated" });
					});
				}
			})
			.catch((error) => {
				logger.error(error);
			})
	});

	router.post('/get-available-modules', async (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		if (typeof req.body.session_id !== 'string'){
			res.status(200).send({ data: 'invalid request' });
			return;
		}

		Session.find({session_id: req.body.session_id})
			.then((result) => {
				if (result.length == 0){
					res.status(400).send({ data: "no such session" });
				} else {
					if (result[0]['user_id'] != req.body.user_name){
						res.status(200).send({ data: "session mismatch" });
						return;
					}
				}
			})
			.catch((error) => {
				logger.error(error, '/get-available-modules error');
			})

		Module.find({
			$and: [
				{alive: 1},
				{$or:[{public: 1},{subscribers: req.body.user_id}]}
			]
			})
			.then((result) => {
				logger.debug('getting available modules');
				if (result.length == 0){
					res.status(200).send({ data: "no module found" });
				} else {
					let result_array = [];
					for (let i = 0; i < result.length; i++){
						let temp_obj = {
							module_id: result[i].module_id,
							author: result[i].author,
							description: result[i].description,
							name: result[i].name,
							subscribers: result[i].subscribers,
							type: result[i].type,
							public: result[i].public,
							client_script_location: result[i].client_script_location,
							server_script_location: result[i].server_script_location
						}
						result_array.push(temp_obj);
					}
					res.status(200).send({ data: "modules retreived", stream: result_array });
				}
			})
			.catch((error) => {
				logger.error(error);
			})
	});

	router.post('/get-active-modules', async (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		User.find({user_id: req.body.user_name})
			.then((result) => {
				logger.debug('getting active modules');
				if (result.length == 0){
					res.status(200).send({ data: "no module found" });
				} else if (result[0]['rating'] != undefined){
					res.status(200).send({
						data: "modules retreived",
						visible_modules: result[0]['visible_modules'],
						active_modules: result[0]['active_modules']
					});
				} else {
					res.status(200).send({ data: "something went wrong" });
				}
			})
			.catch((error) => {
				logger.error(error);
			})
	});

	router.post('/set-active-modules', async (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		User.find({user_id: req.body.user_name})
			.then((result) => {
				logger.debug('setting active modules');
				if (result.length == 0){
					res.status(200).send({ data: "no module found" });
				} else if (result[0]['rating'] != undefined){
					User.updateOne({user_id: req.body.user_name}, {active_modules: req.body.active_modules}, {upsert: true})
					.then((qq) => {
						res.status(200).send({ data: "updated" });
					});
				} else {
					res.status(200).send({ data: "something went wrong" });
				}
			})
			.catch((error) => {
				logger.error(error);
			})
	});

	router.post('/get-module-info', async (req, res) => {
		if (check_limiter(req.ip)){
			res.status(200).send({ data: 'no!' });
			return;
		}

		Module.find({module_id: req.body.module_id})
			.then((result) => {
				logger.debug('getting modules info');
				if (result.length == 0){
					res.status(200).send({ data: "no module found" });
				} else if (result[0]['name'] != undefined){
					res.status(200).send({
						data: "module info retreived",
						m_type: result[0]['type'],
						m_name: result[0]['name'],
						m_description: result[0]['description']
					});
				} else {
					res.status(200).send({ data: "somethinnnng went wrong" });
				}
			})
			.catch((error) => {
				logger.error(error);
			})
	});

	return router;
};
