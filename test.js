var testSpirit1 = {
	'id': 'tsp1',
	'x': 100,
	'y': 150
}

var testSpirit2 = {
	'id': 'tsp2',
	'x': 200,
	'y': 350
}








const express = require('express');
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');


const wss = new WebSocket.Server({ server });

var testSpirit1 = {
	'id': 'tsp1',
	'x': 100,
	'y': 150
}

var testSpirit2 = {
	'id': 'tsp2',
	'x': 200,
	'y': 350
}

x = 1;
d1 = 0;
d2 = 0;


wss.on('connection', function connection(ws) {
	console.log('new client connected');
	ws.send('welcome!');
	ws.on('message', function incoming(message) {
		d1 = process.hrtime();
    console.log('received: %s', message);
	for (i = 0; i < 10000000; i++){
		x = Math.cos(x + i)
	}
	d2 = process.hrtime(d1);
	taskDuration = (d2[0] * 1000000000 + d2[1]) / 1000000;
	ws.send('x is ' + x + ' and your message: ' + message + 'and it took ' + taskDuration);	
  });

  ws.send('something');
});








app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
app.get('/space.js', (req, res) => res.sendFile(__dirname + '/space.js'));


server.listen(5000, () => console.log('Listening on port :5000'))
