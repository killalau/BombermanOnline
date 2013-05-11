var requestHandlers = require("./requestHandlers");

/* Route function, base on request pathname to call different handler
 *
 * handlers: a list for handler function
 * pahtname: the request pathname
 * response: the HTTP response object
 * request:  the HTTP request object
 */
function route(handlers, pathname, response, request){
	console.log("[Router] Request for " + pathname);

	if(handlers.auth[pathname]){
		console.log("[Router] Request require Auth");
		
		var redirectURL = 'http://137.189.89.214:18028/index';
		var cookies = requestHandlers.getCookies(request);
		console.log(JSON.stringify(cookies));
		if(!cookies["BomberManCookie"]){
			console.log("[Router] Session cookies is null");
			handlers.invalid[302](redirectURL, response, request);
			return;
		}
		
		var username = cookies["BomberManCookie"].split(":")[0];
		var session = cookies["BomberManCookie"].split(":")[1];
		
		requestHandlers.auth(username, session, function(result){
			if(result){
				routeCore();
			}else{
				handlers.invalid[302](redirectURL, response, request);
				return;
			}
		});
	}else{
		routeCore();
	}
	
	function routeCore(){
		// Case: the pathname is explicitly defined how to handle
		if(typeof handlers.valid[pathname] === 'function'){
			handlers.valid[pathname](response, request);

		}else{
			var pathSplit = pathname.split("/");
			var type = pathSplit[1];

			// Case: start with '/images', '/scripts', '/styles', etc
			if(typeof handlers.read[type] === 'function' && pathSplit[2] && pathSplit[2].length > 0){
				handlers.read[type](pathname, response, request);

			// Case: end with '.html'
			}else if(pathname.match(/\.html$/)){
				handlers.read["html"](pathname, response, request);

			// Case: error
			}else{
				console.log("[Router] No request handler for " + pathname);
				handlers.invalid[404](response, request);
			}
		}
	}
}

// Public function
exports.route = route;
