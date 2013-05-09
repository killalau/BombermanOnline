var WebSocketServer = require("websocket").server;
var GameServer = require("./gameServer");
var GameClient = require("./gameClient");

var gameServer = GameServer.create();

function start(httpServer, route, handlers){
	var wsServer = new WebSocketServer({
		httpServer: httpServer
	});

	wsServer.on('request', function(request){
		console.log("[wsServer] Connection: " + request.origin);

		//var connection = request.accept('echo-protocol', request.origin);
		var connection = request.accept(null, request.origin);
		var client = GameClient.create(connection, gameServer, 0);
		gameServer.clientList.push(client);

		connection.on('message', function(message){
			route(handlers, message, gameServer, client);
		});

		connection.on('close', function(reasonCode, description){
			console.log("[wsServer] Disconnect: " + connection.remoteAddress + " user: " + client.username);
			var json = {
				type: "disconnect",
				data: false
				
			};
			var msg = {
				type : "utf8",
				utf8Data : JSON.stringify(json)
			};

			route(handlers, msg, gameServer, client);
		});
	});
	
	console.log("[wsServer] Start");
	return wsServer;
}

exports.start = start;
