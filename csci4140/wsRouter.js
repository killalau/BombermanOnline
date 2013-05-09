function route(handlers, message, server, client){
	if(message.type === 'utf8'){
		console.log("[wsRouter] Receive UTF8 message");
		try{						
			var json = JSON.parse(message.utf8Data);
			if(typeof handlers.utf8[json.type] === 'function'){
				client.ping = json.ping;
				client.requestTimestamp = json.requestTimestamp;
				handlers.utf8[json.type](json.data, server, client);

			}else{
				console.log("[wsRouter] No request handler for " + json.type);
			}
		}catch(e){
			console.log("[wsRouter] Execption catch: " + e.message);
		}
	}else{
		console.log("[wsRouter] Receive binary message");
		console.log("[wsRouter] No request handler for binary message");
	}
}

exports.route = route;
