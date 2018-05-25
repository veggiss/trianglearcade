const port = process.env.PORT || 3000;
const path = require('path');
const express = require('express');
const http = require('http');
const colyseus = require("colyseus");
const game = require("./rooms/game");
const app = express();

app.enable('trust proxy');
app.set('port', (port));
app.use(express.static('./static'));

const server = http.createServer(app);
const gameServer = new colyseus.Server({
	timout: 35000,
    server: server
});

gameServer.server.options.server.timeout = 35000;

gameServer.register("game", game);

server.listen(port, () => {
  console.log(`-> Server started on port ${port}<-`);
});