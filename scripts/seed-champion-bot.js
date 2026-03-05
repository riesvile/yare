const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const config = require('../config');
const ChampionBot = require('../models/champion-bot');

const cleoCode = fs.readFileSync(path.join(__dirname, '../bots/cleo-bot.js'), 'utf8');

mongoose.connect(config.mongo, {useNewUrlParser: true, useUnifiedTopology: true})
	.then(async () => {
		console.log('Connected to MongoDB');
		await ChampionBot.deleteMany({});
		const champ = new ChampionBot({
			author: 'champion',
			bot_name: 'champion-bot',
			code: cleoCode,
			game_id: 'seed'
		});
		await champ.save();
		console.log('Seeded champion bot: champion-bot (using cleo-bot code)');
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
