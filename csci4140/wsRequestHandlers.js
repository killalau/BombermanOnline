var fs = require("fs");
var exec = require('child_process').exec;
var requestHandlers = require("./requestHandlers");

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
	var _name = gClient.username;
	var _lv = -1;
	var _win = 0;
	var _lose = 0;
	//--------------------------------------

	var json = {
		playerName : _name,
		playerLevel : _lv,
		win : _win,
		lose : _lose
	};
	//console.log(JSON.stringify(json));
	gClient.sendData("statACK",JSON.stringify(json));
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
					//var _broadcastData = [];
					//_broadcastData.push(reply[obj.rid+1]);//reply[*] follow franky definition
					gServer.roomList[0].broadcastData("rmListACK",JSON.stringify(reply[obj.rid+1]),gClient.username);
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

			var _data = {
				rid : gServer.roomList[message.rid+1].rid,
				name : gServer.roomList[message.rid+1].name,
				np : gServer.roomList[message.rid+1].np(),
				ping : gServer.roomList[message.rid+1].ping()
			};
			
			rmList(JSON.stringify(_data),gServer,gClient);
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
};

function seat_update(data, gServer, gClient){
	var clientRm = gClient.room;
	//console.log(gServer.roomList[clientRm].clientList[0]);
	var reply = [];

	for(var i=0;i<gServer.roomList[clientRm].clientList.length;i++){
		var username = gServer.roomList[clientRm].clientList[i].username;
		var filepath = "icon/" + username;
		var havepic = true;
		try{fs.statSync(filepath).isFile();}
		catch(e){
			havepic = false;
		}
		
		reply[i] = [];
		reply[i].push(username);
		reply[i].push(gServer.roomList[clientRm].clientList[i].seat);
		reply[i].push(havepic);
	}
	//console.log(reply);
	var room = gServer.roomList[clientRm];
	for(var i=0;i<room.clientList.length;i++){	
	if(room.clientList[i].isHost)
		room.sendData('H_seat_update_ACK', JSON.stringify(reply), room.clientList[i]);
	else
		room.sendData('seat_update_ACK', JSON.stringify(reply), room.clientList[i]);		
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
		
		reply[i] = [];
		reply[i].push(username);
		reply[i].push(gServer.roomList[rmnum].clientList[i].seat);	
		reply[i].push(havepic);		//this is to tell client the user have profile or not
	}
	//console.log(reply);
	var room = gServer.roomList[rmnum];
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
	gClient.sendData("state_change_ACK" , gClient.isReady);
	
	var room = gServer.roomList[gClient.room];
	var host = room.host;
	
	//var seatnum = host.seat;
	//console.log(room);
	
	
	if(room.clientList.length == 4) {
		var flag = true;
		for(var i = 0; i<4;i++)
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
		console.log("here");
		
		for(var i = 0;i<room.clientList.length;i++){
			if(!room.clientList[i].isReady){
				flag = false;
				break;
			}
		}
		
		if(flag){
		console.log(room);
			room.broadcastData("GameClickStart_ACK", flag);
		}

	}
	catch(e){
		console.log(e);
	}

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
		var fileList = ["pixi-MAP1","fire","item","bomb2"];
		for(var i=0;i<fileList.length;i++)
			jsonList.push("scripts/playGame/json/"+fileList[i]+".json");
        for(var i =1;i<5;i++)
            jsonList.push("scripts/playGame/json/hamster_"+i+".json");
        gClient.sendData("game_jsonListACK",JSON.stringify(jsonList));
        }catch(e){console.log("game_jsonList:err=",e)};
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
	
	var json = {
			width : 17,
			height : 11,
			players : []
	};
	
	for(var i = 0, c; c = gServer.roomList[gClient.room].clientList[i]; i++){
		var px = py = 1;
		if(c.seat == 1 || c.seat == 2){
			px = json.mapsize.width - 2;
		}
		if(c.seat == 1 || c.seat == 3){
			py = json.mapsize.height - 2;
		}
		json.players.push({
			username : c.username,
			seat : c.seat,
			viewPrefix : "hamster" + (c.seat+1) + "_",
			pos : { x : px, y : py}
		});
	}
	
	gClient.sendData("game_initACK", JSON.stringify(json));
	}catch(e){console.log("game_init err=",e)};
}

function game_playerMove(data, gServer, gClient){
	if(data != 'U' && data != 'D' && data != 'L' && data != 'R'){
		gClient.sendData("game_playerMoveACK", false);
	}else{
		gClient.sendData("game_playerMoveACK", true);
		var json = {
			classname : "BM",
			id: gClient.username,
			payload: data
		};
		gClient.broadcastData("game_broadcastPlayerMove", json);
	}
}

function game_playerStopMove(data, gServer, gClient){
	gClient.sendData("game_playerStopMoveACK", true);
	var json = {
		classname : "BM",
		id: gClient.username,
		payload: data
	};
	gClient.broadcastData("game_broadcastPlayerStopMove", json);
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
	var pass = true;
	//End of validation.......

	//console.log("plantBomb:in=",_in,"out="+out);

	if ( pass ){
		out.payload = {'x': _in.x ,'y': _in.y,'bombNum':(--_in.bombNum)};
		var _data = { id:{x:_in.x ,y:_in.y}};
		setTimeout(function(){game_explodeBomb(_data, gServer, gClient)},3000);
	}
	//console.log("plantBomb:in=",_in,"out=",out);
	gClient.broadcastData("game_broadcastPlantBomb", JSON.stringify(out));
	}catch(e){console.log("planBombErr,e=",e);};
}

/* Handler for 'game_explodeBomb' 
 *
 * data : {id:{x:x,y:y}
 * gServer : game server object
 * gClient : game client object
 */
function game_explodeBomb(data, gServer, gClient){
/*
        var out = {
                classname: 'Bomb'
                id:data.id
                payload:{
                        U:[],
                        D:[],
                        L:[],
                        R:[]
                }
        }
**/
	try{
	var out = {
			classname: 'Bomb',
			id:data.id,
			payload:{
					U:[],
					D:[],
					L:[],
					R:[]
			}
	}
	//game Rule calculation....
	out.payload.U.push(null);
	out.payload.U.push(null);
	out.payload.D.push(null);
	out.payload.D.push(null);
	out.payload.L.push(null);
	out.payload.L.push(null);
	out.payload.R.push(null);
	out.payload.R.push(null);
	//End of game RUle calculation
	gClient.sendData('game_broadcastExplodeBomb',JSON.stringify(out));
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
	var targetBM = gClient.username;
	
	/*waiting for server side gameModel
	var targerBM = gameModel.applyBuff(targetBM);
	*/
	
	//if (targetBM !=
	try{
	var out = {
			classname: 'fireplusplus', //classname: _in.classname,				
			//identify the buff by posiiton (x,y)
			id: data.id,
			payload: gClient.username
			
	}
	gClient.sendData('game_broadcastvanishBuff',JSON.stringify(out));
	}catch(e){console.log(e);throw e;};
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
//end

exports.game_jsonList = game_jsonList;
exports.game_init = game_init;
exports.game_playerMove = game_playerMove;
exports.game_playerStopMove = game_playerStopMove;

exports.game_playerPlantBomb = game_playerPlantBomb;
exports.game_vanishBuff = game_vanishBuff;//Andy
