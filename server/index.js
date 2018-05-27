const port = process.env.PORT || 3000;
const path = require('path');
const express = require('express');
const http = require('http');
const colyseus = require("colyseus");
const game = require("./rooms/game");
const app = express();

const gameServer = new colyseus.Server({
	server: http.createServer(app)
});

gameServer.register("game", game);

app.use(express.static('./static'));

gameServer.listen(port);
console.log(`--> Server started on port: ${port} <--`);

setInterval(() => {
	gameServer.server.clients.forEach((client, i) => {
		if (i > 0) client.send('');
	});
}, 10000);