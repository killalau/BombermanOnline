var GameRoom = require("./gameRoom");

/* Create the gameServer object
 *
 * numOfRoom: number of room needed
 */
function create(numOfRoom){
	var server = {
		clientList : [],
		roomList: []
	};
	
	numOfRoom = numOfRoom ? numOfRoom : 11;
	for(var i = 0; i < numOfRoom; i++){
		var roomName = i == 0 ? "Lobby" : "Room " + i;
		var room = GameRoom.create(i==0, roomName);
		room.rid = i-1;
		server.roomList.push(room);
		
	}

	return server;
}

exports.create = create;
