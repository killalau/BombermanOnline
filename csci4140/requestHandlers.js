// Include node.js library
var fs = require("fs");
var exec = require("child_process").exec;
var mysqlConnection = require('./node-mysql').createConnection();

/* Authentication for username session
 *
 * username : user login name
 * session : session ID / login token
 * callback : function callback(bool)
 */
function auth(username, session, callback){
	console.log("[wsHandler] Request for 'auth'");

	//TO-DO checking
	//var result = true;
	
	function result(valid, session, callback){
		if (valid){
			callback(true);
		}else{
			var query = 'DELETE FROM bbm_session WHERE session=' + mysqlConnection.escape(session);			
			mysqlConnection.query(query, function(err, rows){
				console.log('[wsHandler] Delete session');
				if (err){
					console.log('[wsHandler] MySQL mysqlConnection error code:' + err.code);
				}
			});
			callback(false);
		}
	}
		
	var query = 'SELECT id FROM bbm_session WHERE session=' + mysqlConnection.escape(session);
	mysqlConnection.query(query, function(err, rows){
		var s = session;

		if (rows.length > 0){
			//case: session exist
			console.log(rows);
			if (rows[0].id.length > 0){
				//case: id field not empty
				console.log('[wsHandler] user:'+rows[0].id+' logged in');
				result(true, s, callback);
			}else{
				console.log('[wsHandler] Empty MySQL query result');
				result(false, s, callback);
			}			
		}else{
			console.log('[wsHandler] Session does not exist');
			result(false, s, callback);
		}
			
		if (err){
			console.log('[wsHandler] MySQL mysqlConnection error code:' + err.code);
			result(false, s, callback);
		}
	});
	//callback(result());
}


// Get Cookies from request header
function getCookies(request){
	var cookies = {};
	request.headers.cookie && request.headers.cookie.split(';').forEach(function( cookie ) {
		var parts = cookie.split('=');
		cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
	});
	return cookies;
}

// Sample: explicity define response content
function index(response, request){
	console.log("[Handler] Request for 'index'");
	readHTML("index.html", response, request);
}

/* Read a HTML file as HTTP response
 *
 * path:     the URL pathname of HTTP request
 * response: the HTTP response object
 * request:  the HTTP request object
 */
function readHTML(path, response, request){
	if(path[0] == "/"){
		path = "/web" + path;
	}else{
		path = "/web/" + path;
	}
	readFromFS(path, false, "text/html", response, request);
}

/* Read a JS file as HTTP response
 *
 * path:     the URL pathname of HTTP request
 * response: the HTTP response object
 * request:  the HTTP request object
 */
function readJS(path, response, request){
	readFromFS(path, false, "application/javascript", response, request);
}

/* Read a CSS file as HTTP response
 *
 * path:     the URL pathname of HTTP request
 * response: the HTTP response object
 * request:  the HTTP request object
 */
function readCSS(path, response, request){
	readFromFS(path, false, "text/css", response, request);
}

/* Read a image file as HTTP response
 *
 * path:     the URL pathname of HTTP request
 * response: the HTTP response object
 * request:  the HTTP request object
 */
function readImage(path, response, request){
	readFromFS(path, true, "image", response, request);
}

/* Read a file as HTTP response
 *
 * path:     the URL pathname of HTTP request
 * isBinary: true/false read as binary or utf-8
 * type:     for non-binary response, the Content-type would be this
 * response: the HTTP response object
 * request:  the HTTP request object
 */
function readFromFS(path, isBinary, type, response, request){
	console.log("[Handler] Request for 'readFromFS' to read " + path);

	isBinary = isBinary === true ? "binary" : "utf-8";
	path = path[0] == "/" ? path.substr(1) : path; // Make it as a relative path

	fs.readFile(path, isBinary, function(error, file){
		console.log("[fs] Read for " + path);

		if(error){
			// Read file error
			if(error.toString().match(/^Error: ENOENT, no such file or directory/)){
				error404(response, request);
			}else{
				error500(error, response, request);
			}
		}else{
			// Read file success
			// Check file type (linux command)
			var cmd = "file --mime-type " + path;
			exec(cmd, function(error, stdout, stderr){
				if(error){
					error500(error, response, request);
				}else{
					stdout = stdout.split("\n")[0];
					console.log("[fs] " + stdout);

					if(isBinary == "binary"){
						// Update filetype for binary
						type = stdout.split(" ")[1];
					}else{
						// Double check filetype for text file
						if(! stdout.split(" ")[1].match(/^text\//)){
							error404(response, request);
							return;
						}
					}
					response.writeHead(200, {"Content-Type" : type});
					response.write(file, isBinary);
					response.end();
				}
			});
		}
	});
}

/* Standard 302 Redirect response
 *
 * url:      redirect URL
 * response: HTTP response object
 * request:  HTTP request object
 */
function error302(url, response, request){
	console.log("[Handler] Request for 'error302': " + url);

	response.writeHead(302, {
		'Location': url
	});
	response.end();
}

/* Standard 404 Not Found error response
 *
 * response: HTTP response object
 * request:  HTTP request object
 */
function error404(response, request){
	console.log("[Handler] Request for 'error404'");

	response.writeHead(404, {"Content-Type": "text/plain"});
	response.write("404 Not found");
	response.end();
}

/* Standard 500 Internal Server Error response
 *
 * response: HTTP response object
 * request:  HTTP request object
 */
function error500(error, response, request){
	console.log("[Handler] Request for 'error500'");
	console.log("[Error] " + error);

	response.writeHead(500, {"Content-Type": "text/plain"});
	response.write("500 Internal Server Error\n" + error);
	response.end();
}

// Public function
exports.getCookies = getCookies;

exports.index = index;

exports.readHTML = readHTML;
exports.readJS = readJS;
exports.readCSS = readCSS;
exports.readImage = readImage;
exports.error302 = error302;
exports.error404 = error404;
exports.error500 = error500;
exports.auth = auth;