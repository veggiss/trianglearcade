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
    server: server,
    pingInterval: 15000,
    pingTimeout: 30000
});

gameServer.register("game", game);

server.listen(port, () => {
  console.log(`-> Server started on port ${port}<-`);
});