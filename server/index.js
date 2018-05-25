const port = process.env.PORT || 3000;
const path = require('path');
const express = require('express');
const http = require('http');
const colyseus = require("colyseus");
const game = require("./rooms/game");
const uws = require('uws');
const app = express();

//app.enable('trust proxy');
app.set('port', port);
app.use(express.static('./static'));

const server = http.createServer(app);
const wss = new uws.Server({port: 1337});
const gameServer = new colyseus.Server();

gameServer.attach({ws: wss});
gameServer.attach({server: server});

console.log(wss);

gameServer.register("game", game);

server.listen(port, () => {
  console.log(`-> Server started on port ${port}<-`);
});