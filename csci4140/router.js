/* Route function, base on request pathname to call different handler
 *
 * handlers: a list for handler function
 * pahtname: the request pathname
 * response: the HTTP response object
 * request:  the HTTP request object
 */
function route(handlers, pathname, response, request){
	console.log("[Router] Request for " + pathname);

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

// Public function
exports.route = route;
