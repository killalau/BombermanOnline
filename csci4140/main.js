// Include our library
var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var wsServer = require("./wsServer");
var wsRouter = require("./wsRouter");
var wsRequestHandlers = require("./wsRequestHandlers");

var port = process.argv[2];
port = isNaN(port) ? 8080 : parseInt(port);

// Mapping for URL path & handler function
var handlers = {
	valid:{},	// Valid URL with specific handler
	read:{},	// Special handler for specifc folder
	invalid:{},	// Error handler
	auth:{}		// Require authentication
};

handlers.valid["/"] = requestHandlers.index;
handlers.valid["/index"] = requestHandlers.index;

handlers.auth["/Lobby.html"] = true;
handlers.auth["/gameroom.html"] = true;
handlers.auth["/playGame.html"] = true;

handlers.read["html"] = requestHandlers.readHTML;
handlers.read["scripts"] = requestHandlers.readJS;
handlers.read["styles"] = requestHandlers.readCSS;
handlers.read["images"] = requestHandlers.readImage;
handlers.invalid[302] = requestHandlers.error302;
handlers.invalid[404] = requestHandlers.error404;
handlers.invalid[500] = requestHandlers.error500;

// Create and start HTTP server
var serverObj = server.start(router.route, handlers, port);

// Websocket handler mapping
var wsHandlers = {
	utf8 : [],
	binary: []
};

wsHandlers.utf8["setName"] = wsRequestHandlers.setName;
wsHandlers.utf8["ping"] = wsRequestHandlers.ping;
wsHandlers.utf8["disconnect"] = wsRequestHandlers.disconnect;

wsHandlers.utf8["payloadTestStart"] = wsRequestHandlers.payloadTestStart;
wsHandlers.utf8["payloadTest"] = wsRequestHandlers.payloadTest;
//chatroom handler-----------------------------------------------
wsHandlers.utf8["chat_updateClientList"] = wsRequestHandlers.chat_updateClientList;
wsHandlers.utf8["chat_say"] = wsRequestHandlers.chat_say;
//Lobby handler-----------------------------------------------
wsHandlers.utf8["icon"] = wsRequestHandlers.lobbyIcon;
wsHandlers.utf8["stat"] = wsRequestHandlers.playerStat;
wsHandlers.utf8["rmList"] = wsRequestHandlers.rmList;
wsHandlers.utf8["joinRoom"] = wsRequestHandlers.joinRoom;
//End Of Lobby handler----------------------------------------
//Gameroom handler--------------------------------------------
wsHandlers.utf8["host_update"] = wsRequestHandlers.host_update;
wsHandlers.utf8["seat_update"] = wsRequestHandlers.seat_update;
wsHandlers.utf8["kick_your_ass"] = wsRequestHandlers.kick_your_ass;
wsHandlers.utf8["state_change"] = wsRequestHandlers.state_change;
wsHandlers.utf8["GameClickStart"] = wsRequestHandlers.GameClickStart;
//playGame handler--------------------------------------------
wsHandlers.utf8["game_jsonList"] = wsRequestHandlers.game_jsonList;
wsHandlers.utf8["game_mapInit"] = wsRequestHandlers.game_mapInit;
wsHandlers.utf8["game_playerMove"] = wsRequestHandlers.game_playerMove;
wsHandlers.utf8["game_playerStopMove"] = wsRequestHandlers.game_playerStopMove;
wsHandlers.utf8["game_playerPlantBomb"] = wsRequestHandlers.game_playerPlantBomb;
wsHandlers.utf8["game_setBomb"] = wsRequestHandlers.game_setBomb;
wsHandlers.utf8["game_setBuff"] = wsRequestHandlers.game_setBuff;

wsHandlers.utf8["game_setFire"] = wsRequestHandlers.game_setFire;


// Create and start websocket server
var wsServerObj = wsServer.start(serverObj, wsRouter.route, wsHandlers);

