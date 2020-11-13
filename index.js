
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');


const wss = new WebSocket.Server({ server });

x = 0;


wss.on('connection', function connection(ws) {
	console.log('new client connected');
	ws.send('welcome!');
	ws.on('message', function incoming(message) {
    console.log('received: %s', message);
	for (i = 0; i < 100000000; i++){
		x = i ** 2;
	}
	ws.send('x is ' + x + ' and your message: ' + message);
	
  });

  ws.send('something');
});








app.get('/', (req, res) => res.sendFile('index.html'));


server.listen(3000, () => console.log('Listening on port :3000'))
