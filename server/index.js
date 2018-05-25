const port = process.env.PORT || 3000;
const path = require('path');
const express = require('express');
const http = require('http');
const colyseus = require("colyseus");
const game = require("./rooms/game");
const uws = require('uws');
const app = express();

//app.enable('trust proxy');
app.set('port', (port));
app.use(express.static('./static'));

const gameServer = new colyseus.Server({
	engine: uws.Server,
	server: http.createServer(app)
});

gameServer.register("game", game);

gameServer.listen(port);