var webSocket = window.webSocket = window.webSocket ? window.webSocket : {};

/* The mainly function to create connection
 * and which is encapsulated in a client object
 *
 * url:      websocket server domain, with port
 * handlers: the handlers of different websocket message
 * username: the login username
 * session:  the login session
 */
webSocket.createConnection = function(url, handlers, username, session){
	// Check support of websocket
	if(!("WebSocket" in window)){
		alert("WebSocket is not supported");
		return null;
	}
	
	// Create websocket connection & client object
	var ws = new WebSocket("ws://" + url);
	var client = webSocket.createClient(username, ws);

	// Auto login when websocket is opened
	ws.onopen = function(){
		var json = {
			username : username,
			session : session
		};
		client.sendData('setName', json);
	};

	// Alert websocket error
	ws.onerror = function(error){
		alert(error);
	};

	// Response to websocket message
	ws.onmessage = function(message){
		try{
			var obj = JSON.parse(message.data);
			var ACK = obj.type.substr(obj.type.length - 3);

			// Confirm of connection
			if(obj.type == 'setNameACK'){
				if(obj.data){
					client.connected = true;
					client.ping = webSocket.createPing();
					client.pingServer();
				}
			}

			// Update client's ping
			if(obj.username == client.username && (ACK == "ACK" || obj.type == "pong") && obj.type != 'setNameACK'){
				client.updatePing(new Date() - new Date(obj.requestTimestamp));
			}

			// Execute message handlers
			if(typeof handlers[obj.type] === 'function'){
				handlers[obj.type](obj.data, client);
				// Clear timeout re-send function
				if(obj.type == "pong" || ACK == "ACK"){
					clearTimeout(client.timeoutFunction);
				}
			}
		}catch(e){
			console.log("WebSocket: invalid message from server.");
			console.log(message.data);
		}
	};

	// Respone on connection close
	ws.onclose = function(){
		// Execute user defined handler
		if(typeof handlers['onclose'] === 'function'){
			handlers['onclose']();
		}
		client.connection = null;
		client.connected = false;
	};

	return client;
}

/* Used by create connection, to create client object
 *
 * username:   username of client, useful for distinguish the sender of message
 * connection: websocket connetion
 */
webSocket.createClient = function(username, connection){
	var ping = webSocket.createPing();
	var client = {
		username : username,		// username, same as login
		connection : connection,	// websocket connetion
		connected : false,		// just a flag
		ping : ping,			// ping value object
		timeoutFunction : null,		// timeout re-send function
		sendData : function(type, data){	// send data to server
			clearTimeout(client.timeoutFunction);
			var ctime = new Date();
			var json = {
				username : client.username,
				requestTimestamp : ctime,
				ping : client.ping,
				type : type,
				data : data
			};
			// Send data
			if(client.connection){
				client.connection.send(JSON.stringify(json));
			}
			// Setup timeout re-send function
			if(client.ping && client.ping.avgping != -1){
				client.timeoutFunction = setTimeout(function(){
					client.pingServer();
					console.log("Packet blocked");
				}, client.ping.avgping * 1.5);
			}
		},
		pingServer : function(data){	// Ping server
			data = data ? data : false;
			client.sendData('ping', data);
		},
		updatePing : function(newping){	// update user ping value
			var ping = client.ping;
			ping.ping = newping;
			ping.cping += newping;
			ping.pingCount++;
			ping.avgping = ping.cping / ping.pingCount;
			ping.maxping = newping > ping.maxping ? newping : ping.maxping;
			ping.minping = newping < ping.minping ? newping : ping.minping;
		}
	};

	return client;
}

// create a ping object
webSocket.createPing = function(){
	var ping = {
		ping : -1,
		avgping : -1,
		maxping : -1,
		minping : 1000000,
		cping : 0,
		pingCount : 0
	};
	return ping;
}

// create defalut handlers
webSocket.createHandlers = function(){
	var handlers = {};
	handlers["pong"] = function(data, client){};

	return handlers;
}
