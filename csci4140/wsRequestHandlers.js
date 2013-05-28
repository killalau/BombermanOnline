var fs = require("fs");
var exec = require('child_process').exec;
var requestHandlers = require("./requestHandlers");
var BMM = require("./game_core/BMM");

/* Handler for 'setName' message
 *
 * data : data of message
 * server : game server object
 * client : game client object
 */
function setName(data, server, client){
	console.log("[wsHandler] Request for 'setName'");

	// Define authentication callback function
	function callback(result){
		console.log("[wsHandler] Request for 'setName' -> callback(" + result + ")");
		client.username = data.username;
		client.sendData('setNameACK', result);	// Tell user the result

		if(result){
			// Search for client list, check if re-connection or not
			for(var i = 0, c; c = server.clientList[i]; i++){
				if(c.username == client.username && !c.connection){
					console.log("[wsHandler] Reconnection of user: " + c.username);
					//c.connection = client.connection;
					clearTimeout(c.disconnectFunction);
					c.disconnectFunction = false;
					//disconnectFully(server, client);
					//client = c;
					client.reconnectCopy(c);
					disconnectFully(server, c);
					
					server.roomList[0].removeClient(server, client);
					server.roomList[client.room].addClient(server, client);
					
					break;
				}
			}
			// Broadcast new client list
			var response = [];
			for(var i = 0, c; c = server.roomList[client.room].clientList[i]; i++){
				response.push(c.username);
			}
			client.broadcastData('updateUserList', response);
		}else{
			if(client.connection){
				client.connection.close();
			}
			disconnectFully(server, client);
		}
	}
	
	requestHandlers.auth(data.username, data.session, callback);
}

/* Handler for 'ping' message
 *
 * data : data of message
 * server : game server object
 * client : game client object
 */
function ping(data, server, client){
	console.log("[wsHandler] Request for 'ping'");
	client.sendData('pong', data);
}

/* Handler for 'disconnect' message
 *
 * data : data of message
 * server : game server object
 * client : game client object
 */
function disconnect(data, server, client){
	console.log("[wsHandler] Request for 'disconnect'");

	var timeoutFunction = setTimeout(disconnectFully, 5000, server, client);
	client.disconnectFunction = timeoutFunction;
	client.connection = false;
}

/* Fully kick out the game client from game server
 *
 * data : data of message
 * server : game server object
 * client : game client object
 */
function disconnectFully(server, client){
	console.log("[wsHandler] Request for 'disconectFully'");
	if(!isNaN(client.room)){
		var room = server.roomList[client.room];
		if(room){
			for(var i = 0, c; c = room.clientList[i]; i++){
				if(c === client){
					room.clientList.splice(i,1);
					client.room = null;
					break;
				}
			}
		}
	}
	for(var i = 0, c; c = server.clientList[i]; i++){
		if(c === client){
			server.clientList.splice(i,1);
			break;
		}
	}
}

/* Handler for 'payloadTestStart' message
 *
 * data : data of message
 * server : game server object
 * client : game client object
 */
function payloadTestStart(data, server, client){
	console.log("[wsHandler] Request for 'payloadTestStart'");
	client.broadcastData('payloadTestStartACK', data);
}

/* Handler for 'payloadTest' message
 *
 * data : data of message
 * server : game server object
 * client : game client object
 */
function payloadTest(data, server, client){
	console.log("[wsHandler] Request for 'payloadTest'");

	client.sendData('payloadTestACK', data.count);

	var response = {
		username: client.username,
		data:	data.data
	};
	client.broadcastData('payloadTestUpdate', response);
}

function chat_updateClientList(data, server, client){
	var room = server.roomList[client.room];
	var json = [];
	if(room){
		for(var i = 0, c; c = room.clientList[i]; i++){
			json.push(c.username);
		}
	}
	client.sendData('chat_updateClientListACK', true);
	client.broadcastData('chat_updateClientList', json);
}

function chat_say(data, server, client){
	var message = data.message;
	var receiver = data.receiver;
	var json = {
		sender : client.username,
		message : message,
		private : false
	};

	client.sendData('chat_sayACK', true);
	if(!message || message.replace(/&nbsp;/g, " ").replace(/<br>/g, "").replace(/\s/g, "").length == 0){
		return;
	}else if(!receiver){
		client.broadcastData('chat_say', json);
	}else if(receiver == client.username){
		return;
	}else{
		json.private = true;
		json.receiver = receiver;
		for(var i = 0, c; c = server.clientList[i]; i++){
			if(c.username == receiver){
				c.sendData('chat_say', json);
				client.sendData('chat_say', json);
				break;
			}
		}
	}
}


/* Handler for 'playerStat' message
 *
 * data : data of message
 * gServer : game server object
 * gClient : game client object
 */
function playerStat(data,gServer,gClient){
	/*
		output message json format
		[
			[playerName} : "name'
			[playerLevel]:"Integer"
			[win]:"Integer"
			[lose]:"Integer"
		]
	*/
	
	//Query from DBMS

	try{
		var mysqlConnection = require('./node-mysql').createConnection();	
		var _name = gClient.username;	
		var query = 'SELECT id, level, win, loss FROM bbm_account WHERE id=' + mysqlConnection.escape(_name);
		mysqlConnection.query(query, function(err, rows){
			if (rows.length > 0){
				//case: player exist
				var id = rows[0].id;
				var level = rows[0].level;
				var win = rows[0].win;
				var lose = rows[0].loss;				
				
				var _out = {
					playerName: id,
					playerLevel: level,
					win: win,
					lose: lose
				};
				gClient.sendData('statACK', JSON.stringify(_out));					
			}
		
			if (err){
				console.log('[wsRequestHandler] MySQL mysqlConnection error code:' + err.code);
			}
		});
		
	//--------------------------------------
	}catch(e){console.error("Lobby.playerState:err=",e);}
}
/* Handler for 'rmList' message
 *
 * data : data of message
 * gServer : game server object
 * gClient : game client object
 */
function rmList(data,gServer,gClient){
		/*
			input message data json format
			data{//remember Franky rid define 0 as Lobby 1-n as Room While mine define 0 is Room
				rid: room id
				name: room name
				np: num of player
				ping: average ping of all player
			}
			PS. if (data == null) return rmList in json
					else update gServer
			output message json format
			[// input message == null
				[0]:[isLobby,rid,name,np,ping]
						....
				[n]:....
			]
		*/
		//console.log("[rmList]");
		//console.log(gServer);

		var reply = [];
		for(var i=0;i<gServer.roomList.length;i++){
			reply[i] = [];
			reply[i].push(gServer.roomList[i].isLobby);
			reply[i].push(gServer.roomList[i].rid);
			reply[i].push(gServer.roomList[i].name);
			reply[i].push(gServer.roomList[i].np());
			reply[i].push(gServer.roomList[i].ping());
		}

		if( !data )	gClient.sendData("rmListACK",JSON.stringify(reply));
		else{
			try{
					var obj = JSON.parse(data);
					//for (var i in obj) if( !((i === "ping") || (i==="np")) ) gServer.roomList[obj.rid][i] = obj[i]; 
					//console.log(gServer.roomList[obj.rid].np());
					var _broadcastData = [];
					_broadcastData.push(reply[obj.rid+1]);//reply[*] follow franky definition
					gServer.roomList[0].broadcastData("rmListACK",JSON.stringify(_broadcastData),gClient.username);
			}catch(e){
					console.log("[rmList]e=",e);
					console.log("[rmList]data=",data);
			};
		}
}


/* Handler for 'joinRoom' message
 *
 * data : data of message
 * gServer : game server object
 * gClient : game client object
 */
function joinRoom(data,gServer,gClient){
	/*
		input message json format
		[//remember rid start from 0 while franky definition client.room == 0 is Lobby
			[rid]:rid
		]
		output message json format
		[
			[result]:true or false
		]
	*/

	try{	
		var message = JSON.parse(data);
		var bufRm = gClient.room;
		var _result = gServer.roomList[message.rid+1].addClient(gServer,gClient);
		var target_room = gServer.roomList[message.rid+1];
		var json = {
			result : _result
		};
		//console.log("bufRm="+bufRm);
					
		if (_result){
			//console.log(gServer.roomList[bufRm].clientList);
			
			//Anthony's Code
			//determine the host of gameroom
			if(!target_room.isLobby)
			{
				for(var i = 0;i<4; i++)
				{
					if(!target_room.seatList[i])
					{
						gClient.seat = i;
						target_room.seatList[i] = true;
						break;
					}
				}
			}
			//console.log(target_room.seatList);
			
			if(!target_room.isLobby && target_room.clientList.length == 1){		//the target room is not lobby and the user is the first one enter the room
				target_room.host = target_room.clientList[0];
				target_room.clientList[0].isHost = true;
				target_room.clientList[0].isReady = true;
			}
			//host client want to go back Lobby
			if(message.rid == -1 && gClient.isHost){		
				
				gServer.roomList[bufRm].host = false;
				gServer.roomList[bufRm].seatList[gClient.seat] = false;
				
				gClient.seat = -1;
				gClient.isHost = false;
				gClient.isReady = false;

				if(gServer.roomList[bufRm].clientList.length > 1){
					gServer.roomList[bufRm].host = gServer.roomList[bufRm].clientList[1];
					gServer.roomList[bufRm].clientList[1].isHost = true;
					gServer.roomList[bufRm].clientList[1].isReady = true;
				}
				//console.log(gServer.roomList[bufRm].clientList);
				var host = gServer.roomList[bufRm].host;
	
				var _data = {
				host_seat: host.seat
				};
				
				//broadcast new host and remove client from gameroom
				gServer.roomList[bufRm].broadcastData('host_update_ACK', JSON.stringify(_data));
				gServer.roomList[bufRm].removeClient(gServer,gClient);
				
				//console.log("hihi");
				seat_maintain(gServer, gClient, bufRm);
				//console.log("hihi2");
				
			}
			//normal client want to go back Lobby
			if(message.rid == -1 && !gClient.isHost){
				gServer.roomList[bufRm].seatList[gClient.seat] = false;
				gClient.seat = -1;
				gClient.isReady = false;
				
				//remove client from gameroom and maintain seat
				gServer.roomList[bufRm].removeClient(gServer,gClient);
			
				seat_maintain(gServer,gClient,bufRm);
			}
			
			
			
			//Anthony's Code End
			
			if(gServer.roomList[bufRm].isLobby)
			{
				gServer.roomList[bufRm].removeClient(gServer,gClient);
			}

			var tmproom = gServer.roomList[bufRm];
		        var tmpjson = [];
		        if(tmproom){
               			 for(var i = 0, c; c = tmproom.clientList[i]; i++){
                	       	 	tmpjson.push(c.username);
               		 	}
        		}
			gServer.roomList[bufRm].broadcastData("chat_updateClientList",tmpjson,gClient.username);

			if(message.rid == -1){
				var _data = {
					rid: gServer.roomList[bufRm].rid,
					name : gServer.roomList[bufRm].name,
					np : gServer.roomList[bufRm].np(),
					ping : gServer.roomList[bufRm].ping()
				};
			rmList(JSON.stringify(_data),gServer,gClient);
			}
			else{
				var _data = {
					rid : gServer.roomList[message.rid+1].rid,
					name : gServer.roomList[message.rid+1].name,
					np : gServer.roomList[message.rid+1].np(),
					ping : gServer.roomList[message.rid+1].ping()
				};
			rmList(JSON.stringify(_data),gServer,gClient);
			}
			
			
			//console.log(gServer.roomList[bufRm].clientList);
			
		}
		gClient.sendData("joinRoomACK",JSON.stringify(json));
	}catch(e){
		gClient.sendData("joinRoomACK",JSON.stringify({result : false}));
		console.log("[joinRoom]"+e);
	}
	
};


/* Handler for 'icon' message
 *
 * data : data of message
 * gServer : game server object
 * gClient : game client object
 */
function lobbyIcon(data,gServer,gClient){
	/*
		input json format
		[
			name : file.name,
			size : e.total,
			type : file.type,
			data : e.target.result.split(',')[1];
		]
		output json format
		[
			result:boolean
			reason:String
			img:base64_encoded string
			height:integer
			width:integer
		]
		event "iconACK'
	*/
	var json = {
			result : false,
			reason : "",
			img : "",
			height : -1,
			width : -1
	};
	console.log(data);
	var msg = JSON.parse(data);
	if ( msg.data === false){//Fetch default profile
		try{
			//console.log("user: "+msg.name+" fetch profile");
			fs.readFile("./icon/"+msg.name,"base64",function(err,img_data){
				json.result = true;
				if ( err ){
					gClient.sendData('iconACK',JSON.stringify(json));
					return;
				}else{
					var child =  exec("/usr/bin/file -b --mime-type ./icon/"+msg.name,
						function(err,stdout,stderr){
							var tmp = stdout.substr(0,stdout.length-1);//trim the last \n
							json.img = "data:"+tmp+";base64,"+img_data;
							//console.log("json.img="+json.img);
							json.width = 246;
							json.height = 246;
							gClient.sendData('iconACK',JSON.stringify(json));
							return ;
					});
				}
			});
		}catch(e){
			console.log("fetch profile error:"+e);
		}
	}else{//upload profile
		try{
			var pass = true;
			var acceptTypes = {
				'image/png' : true,
				'image/jpeg' : true,
				'image/gif' : true
			}
			if ( msg.size >= 100*1024){//filesize checking
				json.reason = "File Size too large";
				pass = false;
			}else if ( !(acceptTypes[msg.type] === true)){//type checking 
				json.reason = "File extension must be .jpg or .png or .gif";	
				pass = false;
			}
			if ( pass){
				var buf = Buffer(msg.data,'base64');
				fs.writeFileSync("./"+msg.name,buf,null);
				var child =  exec("/usr/bin/file -b --mime-type ./"+msg.name,
					function(err,stdout,stderr){
						var tmp = stdout.substr(0,stdout.length-1);//trim the last \n
						//console.log("stdout: |"+tmp+"|");
						if (err !== null){
							console.log('exec err: '+err);
							pass = false;
							json.reason = "cannot identify your image";
							exec('rm -f ./'+msg.name,function(err,stdout,stderr){});
							gClient.sendData('iconACK',JSON.stringify(json));	
							return;
						}
						var re = /^image\/(jpeg|png|(gif)*)$/i;
						if (!(re.test(tmp))){
							console.log('This is not an image file');
							pass = false;
							json.reason = "Please upload a png or gif or jpeg";
							gClient.sendData('iconACK',JSON.stringify(json));	
							return;
						}
						fs.renameSync("./"+msg.name,"./icon/"+msg.name);
						json.result = pass;
						json.width = 246;
						json.height = 246;
						json.img = "data:"+msg.type+";base64,"+msg.data;
						gClient.sendData('iconACK',JSON.stringify(json));	
					}
				);
			}else{
						gClient.sendData('iconACK',JSON.stringify(json));	
						console.log("Not an image file");
			}
		}catch(e){
			console.log("upload profile error:"+e);
		}
	}

};

//function host_Notify(data, gServer, gClient) {


function host_update(data, gServer, gClient){
	try{
	//console.log("hihi");
	var clientRm = gClient.room;
	var host = gServer.roomList[clientRm].host;
	
	
	
	var _data = {
				//seat : gClient.seat,
				//isHost : gClient.isHost,
				host_seat: host.seat
			};
	gServer.roomList[clientRm].broadcastData('host_update_ACK', JSON.stringify(_data));
	//gClient.sendData('gameroom_Update', JSON.stringify(_data));
	}
	catch(e){
		console.log("host_update error: " + e);
	}
};

function seat_update(data, gServer, gClient){
	try{
	var message = JSON.parse(data); 
	var clientRm = gClient.room;
	//console.log(gServer.roomList[clientRm].clientList[0]);
	seat_maintain(gServer, gClient, clientRm);
	}
	catch(e){
		console.log("seat_update error" + e);
	}
}

function seat_maintain(gServer, gClient, rmnum){
	var reply = [];
	for(var i=0;i<gServer.roomList[rmnum].clientList.length;i++){
		var username = gServer.roomList[rmnum].clientList[i].username;
		var filepath = "icon/" + username;
		var havepic = true;
		try{fs.statSync(filepath).isFile();}
		catch(e){
			havepic = false;
		}
		//console.log("dfdfdf"+gServer.roomList[rmnum].clientList[i].ping);
		reply[i] = [];
		reply[i].push(username);
		reply[i].push(gServer.roomList[rmnum].clientList[i].seat);	
		reply[i].push(havepic);		//this is to tell client the user have profile or not
		reply[i].push(gServer.roomList[rmnum].name);
		//reply[i].push(gServer.roomList[rmnum].clientList[i].ping);
	}
	//console.log(reply);
	var room = gServer.roomList[rmnum];
	ready_refresh(gServer, rmnum);
	for(var i=0;i<room.clientList.length;i++){	
	if(room.clientList[i].isHost)
		room.sendData('H_seat_update_ACK', JSON.stringify(reply), room.clientList[i]);
	else
		room.sendData('seat_update_ACK', JSON.stringify(reply), room.clientList[i]);		
	}
	


}

function kick_your_ass(data, gServer, gClient){
	var message = JSON.parse(data);
	var bufRm = gClient.room;
	var k_client;


	for(var i =0;i<gServer.roomList[bufRm].clientList.length;i++) {
		if(gServer.roomList[bufRm].clientList[i].username == message.username)
		{
			k_client = gServer.roomList[bufRm].clientList[i];
		}
	}
	gServer.roomList[bufRm].seatList[k_client.seat] = false;
	
	//add client to lobby and remove from gameroom
	var _result = gServer.roomList[0].addClient(gServer,k_client);		
	gServer.roomList[bufRm].removeClient(gServer,k_client);

	//first kick then maintain
	k_client.sendData("kick_ACK", true);
	seat_maintain(gServer,gClient,bufRm);
	
	
	//console.log(gServer.roomList[bufRm]);
}

function state_change(data, gServer, gClient) {
try{
	gClient.isReady = gClient.isReady ? false : true;	//change state of Ready
	
	var room = gServer.roomList[gClient.room];
	
	ready_refresh(gServer, gClient.room); //tell client to refresh player_div border


	gClient.sendData("state_change_ACK" , gClient.isReady);
	
	
	var host = room.host;
	
	//var seatnum = host.seat;
	//console.log(room);
	
	
	if(room.clientList.length > 1) {
		var flag = true;
		for(var i = 0; i<room.clientList.length;i++)
		{
			if(!room.clientList[i].isReady)
			{
				flag = false;
				break;
			}	
		}
		
		if(flag){
			host.sendData("All_ready_ACK", true);
		}
		else
			host.sendData("All_ready_ACK", false);
	}
	else
		//room.sendData("All_ready", false, host);
		host.sendData("All_ready_ACK", false);
		}
		
		
catch(e){
	console.log(e);
}
}

function GameClickStart(data, gServer, gClient) {
	try{
		var room = gServer.roomList[gClient.room];
		var flag = true;

		
		for(var i = 0;i<room.clientList.length;i++){
			if(!room.clientList[i].isReady){
				flag = false;
				break;
			}
		}
		
		if(flag){
		//console.log(room);
			room.broadcastData("GameClickStart_ACK", flag);
		}

	}
	catch(e){
		console.log(e);
	}
}

function rename(data, gServer, gClient){
	try{
		var message = JSON.parse(data);
		var gameroom = gServer.roomList[gClient.room];	
		gameroom.name = message;
		console.log("new gameroom name = " + gameroom.name);
		
		//refresh gameroom
		gameroom.broadcastData("rmname_update", JSON.stringify(gameroom.name));
		
		//refresh lobby
		gameroom = gServer.roomList[gClient.room];
		var _data = {
				rid : gServer.roomList[gameroom.rid+1].rid,
				name : gServer.roomList[gameroom.rid+1].name,
				np : gServer.roomList[gameroom.rid+1].np(),
				ping : gServer.roomList[gameroom.rid+1].ping()
			};
			
			rmList(JSON.stringify(_data),gServer,gClient);
		
	}
	catch(e){	
		console.log("room rename error:" +e)
	}
}

function ready_refresh(gServer, rmnum){
	var room = gServer.roomList[rmnum];
	var reply = [];
	try{
		for(var i=0;i<room.clientList.length;i++){
			reply[i] = [];
			reply[i].push(room.clientList[i].username);
			reply[i].push(room.clientList[i].seat);
			reply[i].push(room.clientList[i].isReady);
		}		
		room.broadcastData("Ready_Notify",  JSON.stringify(reply));	
	}
	catch(e){
		console.log("ready_refresh error: " + e);
	}
}

function gameroom_logout(data, gServer, gClient){
	var room = gServer.roomList[gClient.room];
	var rmnum = room.rid;
	
	room.seatList[gClient.seat] = false;
	gClient.seat = -1;
	gClient.isReady = false;

	if(gClient.isHost){
		room.host = false;
		gClient.isHost = false;
		if(room.clientList.length > 1){
			room.host = room.clientList[1];
			room.clientList[1].isHost = true
			room.clientList[1].isReady = true;
		}
		var host = room.host;
		var _data = {
		host_seat: host.seat
		};

		room.broadcastData('host_update_ACK', JSON.stringify(_data));
		room.removeClient(gServer,gClient);
		
		seat_maintain(gServer, gClient, rmnum);
	}
	
	if(!gClient.isHost){		
		//remove client from gameroom and maintain seat
		room.removeClient(gServer,gClient);
		seat_maintain(gServer,gClient,rmnum);
	}

			
	var _data = {
		rid: room.rid,
		name : room.name,
		np : room.np(),
		ping : room.ping()
	};
	rmList(JSON.stringify(_data),gServer,gClient);

}


/* Handler for 'game_jsonList' message
 *
 * data : null
 * gServer : game server object
 * gClient : game client object
 */
function game_jsonList(data, gServer, gClient){
	try{
		var jsonList = [];
		var basePath = "scripts/playGame/json/";
		var bmm = gServer.roomList[gClient.room].bmm;
		
		if(bmm == null){
			//need checking here when lobby is finished
			/*
			gClient.sendData("game_jsonListACK", false);
			return;
			*/
			//now is for testing
			var fileList = ["pixi-MAP1","fire","item","bomb2"];
			for(var i=0;i<fileList.length;i++)
				jsonList.push("scripts/playGame/json/"+fileList[i]+".json");
			for(var i =1;i<5;i++)
				jsonList.push("scripts/playGame/json/hamster_"+i+".json");
			gClient.sendData("game_jsonListACK",JSON.stringify(jsonList));
			return;
		}
		
		
		//get all PIXI json path from map config file
		var pixi = bmm.mapConfig.PIXI;
		for(var key in pixi){
			if(typeof pixi[key] === 'string'){
				jsonList.push(basePath + pixi[key]);
			}else if(typeof pixi[key] === 'object'){
				for(var inkey in pixi[key]){
					jsonList.push(basePath + pixi[key][inkey]);
				}
			}
		}
		
		gClient.sendData("game_jsonListACK", JSON.stringify(jsonList));
	}catch(e){console.log("game_jsonList:err="+e);};
}

/* Handler for 'game_init' message
 *
 * data : null
 * gServer : game server object
 * gClient : game client object
 */
function game_init(data, gServer, gClient){
	//Some game room / status validation
	try{
	var valid = true;
	if(gServer.roomList[gClient.room].isLobby){
		valid = false;
	}
	
	if(!valid){
		gClient.sendData("game_initACK", false);
		return;
	}
	
	var bmm = gServer.roomList[gClient.room].bmm;
	//when lobby is finish, this part would remove, and treat as invalid
	if(bmm == null){
		var json = {
				width : 17,
				height : 11,
				players : []
		};
		
		for(var i = 0, c; c = gServer.roomList[gClient.room].clientList[i]; i++){
			var px = py = 1;
			if(c.seat == 1 || c.seat == 2){
				px = json.width - 2;
			}
			if(c.seat == 1 || c.seat == 3){
				py = json.height - 2;
			}
			json.players.push({
				username : c.username,
				seat : c.seat,
				viewPrefix : "hamster_" + (c.seat+1) + "_",
				pos : { x : px, y : py}
			});
		}
	}else{
		var json = {
			gameState : bmm.gameState,
			width : bmm.width,
			height : bmm.height,
			timer: bmm.timer,
			players : [],
			elements : [],
			walls: [],
			buffs: [],
			boxes: []
			
		};
		for(var i = 0, c; c = gServer.roomList[gClient.room].clientList[i]; i++){
			var bm = bmm.getElementById(c.username);
			if ( bm.alive){
				json.players.push({
					username : c.username,
					seat : c.seat,
					viewPrefix : bmm.mapConfig.PIXI.avatar[c.seat].replace(/.json$/, "") + "_",
					alive: bm.alive, 
					pos : bm.grid.position,
					bombNum : bm.bombNum,
					bombCurrentMax : bm.bombCurrentMax,
					bombMax : bm.bombMax,
					power : bm.power,
					powerMax : bm.powerMax,
					speed : bm.speed,
					speedMax : bm.speedMax				
				});
			}else{
				json.players.push({
					username : c.username,
					seat : c.seat,
					viewPrefix : bmm.mapConfig.PIXI.avatar[c.seat].replace(/.json$/, "") + "_",
					alive: bm.alive});
			}
			
		}
		for(var i = 0, row; row = bmm.gridList[i]; i++){
			for(var j = 0, gird; grid = row[j]; j++){
				for(var k = 0, e; e = grid.elementList[k]; k++){
					if(e.classname == 'BM'){
						continue;
					}
					var obj = {
						classname : e.classname,
						pos : grid.position
					};
					var bufftest = /Plus$/;
					var boxtest = /^Box$/;
					var walltest = /^Wall$/;
					if ( bufftest.test(e.classname) ){
						json.buffs.push(obj);
					}else if (boxtest.test(e.classname)){
						json.boxes.push(obj);
					}else if (walltest.test(e.classname)){
						json.walls.push(obj);
					}else{
						json.elements.push(obj);
					}
				}
			}
		}
	}
	
	gClient.sendData("game_initACK", JSON.stringify(json));
	}catch(e){console.log("game_init err=",e)};
}

function game_playerMove(data, gServer, gClient){
	if(data != 'U' && data != 'D' && data != 'L' && data != 'R'){
		gClient.sendData("game_playerMoveACK", false);
	}else{		
		var bmm = gServer.roomList[gClient.room].bmm;
		var bm = bmm.getElementById(gClient.username);
		if ( bm.alive ){
			gClient.sendData("game_playerMoveACK", true);
			bm.direction = data;
			bm.moveStart();
			
			var json = {
				classname : "BM",
				id: gClient.username,
				payload: {
					dir : data,
					grid : bm.grid.position,
					pos : bm.position
				}
			};
			gClient.broadcastData("game_broadcastPlayerMove", json);
		}else{
			gClient.sendData("game_playerMoveACK", false);
		}
	}
}

function game_playerStopMove(data, gServer, gClient){
	gClient.sendData("game_playerStopMoveACK", true);
	
	var bmm = gServer.roomList[gClient.room].bmm;
	var bm = bmm.getElementById(gClient.username);
	if ( bm.alive ){
		bm.moveStop();
		
		var json = {
			classname : "BM",
			id: gClient.username,
			payload: {
				grid : bm.grid.position,
				pos : bm.position
			}
		};
		gClient.broadcastData("game_broadcastPlayerStopMove", json);
	}
}

/* Handler for 'game_playerPlantBomb' message
 *
 * data : data of message
 * gServer : game server object
 * gClient : game client object
 */
function game_playerPlantBomb(data, gServer, gClient){
	//"game_broadcastPlantBomb"
	/*
	Input message
	@param data: {
		x: this.grid.X,
		y: this.grid.Y,
		bombNum: gClient.??.bombNum
	};
	Output message
	@param out: {
		classname : "BM",
		id: "username",
		payload: {x: target.grid.X,y:target.grid.Y,bombNum:BMO.BM.bombNum}
	}
	**/	
	try{
	var _in = JSON.parse(data);
	var out = {
		classname : "BM",
		id: gClient.username,
		payload: {'x':-1,'y':-1,'bombNum':_in.bombNum}
	};
	//plantBomb validation....
	var pass = gServer.roomList[gClient.room].bmm.plantBombValidation(_in.x,_in.y,
					gClient.username,function(_out){ game_explodeBomb(_out,gServer,gClient.room); });
	//End of validation.......

	//console.log("plantBomb:in=",_in,"out="+out);

	if ( pass !== null){
		if (pass.result){
			out.payload = {'x': _in.x ,'y': _in.y,'bombNum':(pass.bombNum)};
			//var _data = { id:{x:_in.x ,y:_in.y},bm:gClient.username};
			//setTimeout(function(){game_explodeBomb(_data, gServer, gClient)},3000);
		}else out.payload.bombNum = pass.bombNum;
	}
	//console.log("plantBomb:in=",_in,"out=",out,"pass=",pass);
	gClient.broadcastData("game_broadcastPlantBomb", JSON.stringify(out));
	}catch(e){console.log("planBombErr,e=",e);};
}

/* callback 'game_explodeBomb' 
 *
 * out : {
			classname: 'Bomb'
			id:data.id
			payload:{
					U:[],
					D:[],
					L:[],
					R:[],
					C:[]
			}
		}
 * gServer : game server object
 * rm : rm num franky definition
 */
function game_explodeBomb(out, gServer, rm){
	try{
	//console.log("wsRequestHandler.game_explodeBomb:out=\n",out);	
	gServer.roomList[rm].broadcastData('game_broadcastExplodeBomb',JSON.stringify(out));
	
	}catch(e){console.log(e);throw e;};
}

/* Handler for 'game_vanishBuff' message
 *
 * data : {id:{x:x,y:y}, classname:<buffClassName>}
 * gServer : game server object
 * gClient : game client object
 */
function game_vanishBuff(data, gServer, gClient){//Andy
	var _in = JSON.parse(data);
	var requestBM = gClient.username;
	var bmm = gServer.roomList[gClient.room].bmm;
	
	bmm.vanishBuffValidation(_in.id.x, _in.id.y, _in.classname, requestBM,
		function(_out){
			//make use of the gClient whose request reaches the server first
			//to broadcast
			game_broadcastVanishBuff(_out, gServer, gClient);
		});	
}

/*
 *	callback: game_broadcastVanishBuff
 *
 *	var out = {
 *		classname: 'BombPlusPlus', //classname: _in.classname, //AndyQ - to be changed		
 *		id:	_in.id, //identify the buff by posiiton (x,y)		
 *		payload: gClient.username //payload indicates which BM get the buff
 *	} 
 */
function game_broadcastVanishBuff(_out, gServer, gClient){
	try{
		if (_out !== null)
			gClient.broadcastData('game_broadcastVanishBuff',JSON.stringify(_out));
	}catch(e){console.log(e);throw e;};
}

/* Handler for 'room_newGame' message, called by Host when count down finish
 *
 * data : 
 * gServer : game server object
 * gClient : game client object
 */
function room_newGame(data, gServer, gClient){
	console.log("[wsHandler] Request for 'room_newGame'");
	
	//check if gClient is host, the room status is ok to start game, etc.
	var valid = true;
	if(!valid){
		gClient.sendData('room_newGameACK', false);
		return;
	}
	gClient.sendData('room_newGameACK', true);
	
	// The map config file
	mapFile = "maps/map1.json";
	
	fs.readFile(mapFile, "utf-8", function(error, file){
		if(error){
			console.log(error.toString());
		}else{
			//console.log(file);
			var mapObj = JSON.parse(file);
			var room = gServer.roomList[gClient.room];
			var bmm = new BMM.BMM(gServer, room, mapObj,120);
			bmm.initialize();
			room.bmm = bmm;
			
			//tell all room client, the game is ready, redirect to playGame.html
			gClient.broadcastData('room_newGame', '/playGame.html');
		}
	});
	
}

/* Handler for 'removeSession' message, called by Host when count down finish
 *
 * data : {
		session : <player's session key>
 *	}
 * gServer : game server object
 * gClient : game client object
 */
function removeSession(data, gServer, gClient){
	try{		
		var mysqlConnection = require('./node-mysql').createConnection();

		var _in = JSON.parse(data);

		if (_in !== null){
			var session = _in.session;
			console.log('[wsRequestHandler] removeSession: '+session);
			var query = 'DELETE FROM bbm_session WHERE session=' + mysqlConnection.escape(session);
			mysqlConnection.query(query, function(err){
				if (err){
					console.log('[wsRequestHandler] MySQL mysqlConnection error code:' + err.code);
				}
			});
		}
	}catch(e){console.log(e);throw e;};
}

/* Handler for 'getPlayerStat' message, called by Host when count down finish
 *
 * data : {
		playerId : <player's ID>
 *	}
 * gServer : game server object
 * gClient : game client object
 * 
 * RESPONSE 'getPlayerStatACK' to client
	var _out = {
			level: level,
			win: win,
			loss: lose
		};
 */
 //***player stat API
function getPlayerStat(data, gServer, gClient){
	try{		

	}catch(e){console.log(e);throw e;};
}

/* Handler for 'game_sync' message, called by Host when count down finish
 *
 * data : {
		id : <player's id>
		gameState: player.gameState
 *	}
 * gServer : game server object
 * gClient : game client object
 */
function game_sync(data, gServer, gClient){
	var bmm = gServer.roomList[gClient.room].bmm;
	
	var _in = JSON.parse(data);
	
	//core/BMM is not ready
	if(bmm == null || bmm.gameState[0] < 3){
		gClient.sendData('game_syncACK', false);
		return;
	}
	
	//increase player.gameState
	for(var i = 0, e; e = bmm.elementList[i]; i++){
		if(e.id == gClient.username){
			bmm.gameState[i+1] = _in.gameState;
			break;
		}
	}
	gClient.sendData('game_syncACK', bmm.gameState);
	
	//check all player ready
	var valid = true;
	for(var i = 0, e; e = bmm.elementList[i]; i++){
		//when all player ready, player.gameState == 5
		if(bmm.gameState[i+1] != 5){
			valid = false;
			break;
		}
	}
	if(valid){
		gClient.broadcastData('game_gameStart', bmm.gameState);
		bmm.gameState[0] = 4;
	}
}




// Public function
exports.setName = setName;
exports.ping = ping;
exports.disconnect = disconnect;

exports.payloadTestStart = payloadTestStart;
exports.payloadTest = payloadTest;
exports.chat_updateClientList = chat_updateClientList;
exports.chat_say = chat_say;

exports.rmList = rmList;
exports.playerStat = playerStat;
exports.joinRoom = joinRoom;
exports.lobbyIcon = lobbyIcon;

//Anthony function
exports.host_update = host_update;
exports.seat_update = seat_update;
exports.kick_your_ass = kick_your_ass;
exports.state_change = state_change;
exports.GameClickStart = GameClickStart;
exports.rename = rename;
exports.gameroom_logout = gameroom_logout;
//end

exports.room_newGame = room_newGame;

exports.game_jsonList = game_jsonList;
exports.game_init = game_init;
exports.game_playerMove = game_playerMove;
exports.game_playerStopMove = game_playerStopMove;
exports.game_sync = game_sync;
exports.game_playerPlantBomb = game_playerPlantBomb;
exports.game_vanishBuff = game_vanishBuff;
exports.removeSession = removeSession;
exports.getPlayerStat = getPlayerStat;
