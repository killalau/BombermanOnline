/* Create a client object
 *
 * connection: websocket connection of client
 * server:     gameServer object
 * room:       room number in 'gameServer.roomList[]'
 */
function create(connection, server, room){
	if(!connection || isNaN(room))
		return null;

	// Create client object
	var client = {
		connection : connection,	// websocket connection
		room : room,			// room number
		username: false,		// username
		ping: false,			// ping value
		seat: -1,				// cleint seat number
		isHost: false,			
		requestTimestamp: false,	// prevous request timestamp, for client side ping calculation
		disconnectFunction: false,	// timeout function when connection break, or change page
		sendData : function(type, data){	// send data to client
			console.log("[Client] Send data: " + type + "  to user: " + client.username);

			var stime = new Date();
			var msg = {
				username: client.username,
				requestTimestamp : client.requestTimestamp,
				serverTimestamp : stime,
				type: type,
				data: data
			};
			if(client.connection)
				client.connection.sendUTF(JSON.stringify(msg));
		},
		boardcastData : function(type, data){	// boardcast data to the room which the client is stay in
			console.log("[Client] Boardcast data: " + type + " from user: " + client.username + " to room :" + server.roomList[client.room].name);

			var stime = new Date();
			var msg = {
				username: client.username,
				serverTimestamp : stime,
				type: type,
				data: data
			};
			
			for(var i = 0, c; c = server.roomList[client.room].clientList[i]; i++){
				if(c.connection)
					c.connection.sendUTF(JSON.stringify(msg));
			}
		},
		reconnectCopy : function(oldClient){	// copy value from another client object, used in reconnection handling
			client.room = oldClient.room;
			client.ping = oldClient.ping;
			client.seat = oldClient.seat;
			client.isHost = oldClient.isHost;
		}
	}

	// Add client to room
	server.roomList[client.room].addClient(server, client);
	return client;
}

exports.create = create;
