/* Create room object
 *
 * isLobby: (bool)
 * rid:     room ID
 * name:    room name
 * np():      number of players
 * ping():    average player ping (default: 0)
 */
function create(isLobby, name){
	isLobby = isLobby ? true : false;
	name = name ? name : "Room";

	var room = {
		isLobby : isLobby,	// lobby flag
		rid: -1,		// room ID
		name : name,		// room name
		clientList : [],	// client list in that room
		seatList: [false, false, false, false],
		host: false,
		np: function(){ return room.clientList.length; },
		ping: function(){
			var n = 0, sum = 0;
			for(var i = 0, c; c = room.clientList[i]; i++){
				if(c.ping && c.ping.avgping > 0){
					n++;
					sum += c.ping.avgping;
				}
			}
			if(n == 0) return n;
			return Math.round(sum/n);
		},
		addClient : function(server, client){	// add a client to the room

			
			// check exceed the room capacity
			var valid = room.isLobby || room.clientList.length < 4 ? true : false;
			if(valid){
				// find the room number
				for(var i = 0, r; r = server.roomList[i]; i++){
					if(r === room){
						client.room = i;
					}
				}
				// add to room
				room.clientList.push(client);
			}
			


			return valid;
		},
		removeClient : function(gServer, gClient){
			for(var i = 0, c; c = room.clientList[i]; i++){
				if(gClient === room.clientList[i]){
					room.clientList.splice(i,1);
					break;
				}
			}
		},
		broadcastData : function(eventType, data, srcName){
			var stime = new Date();
			var msg = {
				username: srcName,
				serverTimestamp : stime,
				type: eventType,
				data: data
			};
			for(var i = 0, c; c = room.clientList[i]; i++){
				if(c.connection)
					c.connection.sendUTF(JSON.stringify(msg));
				console.log("[gameRoom.broadcastData] src="+srcName+" target="+c.username);
				console.log("[gameRoom.broadcastData] data="+data);
			}
		}

		

	};

	return room;
}

exports.create = create;
