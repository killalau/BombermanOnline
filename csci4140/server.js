// Include node.js library
var http = require("http");
var url = require("url");

/* Create and start HTTP Server
 *
 * route:    route function, base on request pathname to call different handler
 * handlers: a list of handlers
 */
function start(route, handlers, port){
	// The core request response function in HTTP server
	function onRequest(request, response){
		var pathname = url.parse(request.url).pathname;
		console.log("[Server] Request for " + pathname);
		
		route(handlers, pathname, response, request);
	}

	port = port ? port : 8080;

	var server = http.createServer(onRequest);
	server.listen(port);
	console.log("[Server] Start on port: " + port);
	return server;
}

// Public function
exports.start = start;
