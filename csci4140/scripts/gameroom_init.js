var wsClient = null;
var flag = false;
var mapID = 0;

function init(e){
	//Fetch from cookies
	var re = /;?BomberManCookie=(.*):(.*);?/i;
	re.exec(document.cookie);
	var username = RegExp.$1;
	var session = RegExp.$2;
	//============================================
	
	var url = document.location.hostname +":18128";
	var handlers = webSocket.createHandlers();
	
	handlers["setNameACK"]=function(data,wsClient){
		if(data === true){
			console.log("Login success in websocket");
			
			//check correct procedure
			if(!document.referrer){
				wsClient.sendData("gameroom_validate", null);
				handlers["gameroom_validate_ACK"] = function(data, wsClient) {
					var message = JSON.parse(data);
					if(!message){
						alert("invalid Acition");
						document.location.pathname = "/Lobby.html";
					}
				}
			}
			/*
							window.onunload  = function(){
								wsClient.sendData("hihi",JSON.stringify(null));
							}
							*/
			
			//Start to add event
			AddEventListenter(handlers, wsClient);
		}	
	};
		//no onclose
		wsClient = webSocket.createConnection(url,handlers, username, session);

}

function AddEventListenter(handlers, wsClient) {
	wsClient.sendData("host_update",JSON.stringify(null));
	wsClient.sendData("seat_update", JSON.stringify(null));
	
	//Listen to host Notification
	
	handlers["host_update_ACK"] = function(data,wsClient){
		var message = JSON.parse(data);
		var host_div = document.getElementById("host_div");
		host_div.innerHTML = "";
		
		var inner_div = document.createElement('div');
		inner_div.setAttribute("id", "host_");
		inner_div.setAttribute("class", "host_"+message.host_seat);
		host_div.appendChild(inner_div);
		var inner_img = document.createElement('img');
		inner_img.setAttribute("id", "host"+message.host_seat);
		inner_img.setAttribute("class", "hostimage");
		inner_img.setAttribute("src", "../images/star.png");
		inner_div.appendChild(inner_img);
		inner_div.innerHTML = inner_div.innerHTML + 'Host';
		
		//edit room name function

		}
		
		handlers["seat_update_ACK"] = function(data, wsClient) {
			var message = JSON.parse(data);
			web_update(message);
		}
		
		//Only Host receive this message
		handlers["H_seat_update_ACK"] = function(data, wsClient) {
			try{
				var message = JSON.parse(data);
				web_update(message);

			
					//create the cross
					for(var i=0;i<message.length;i++){
						var playernum = message[i][1] + 1;
						var player_div = document.getElementById("player"+ playernum);
						if(!(message[i][0] == wsClient.username)) {
							var span_tag = document.createElement('span');
							span_tag.setAttribute("class", "span1");
							player_div.appendChild(span_tag);
							var cross_img = document.createElement('img');
							//console.log(wsClient.username);
							cross_img.setAttribute("id", "cross_"+message[i][0]);
							cross_img.setAttribute("class", "cross");
							cross_img.setAttribute("src", "../images/cross.png");
							//setAttributes(cross_img, {"id": "cross" + playernumm, "class": "cross", "src": "../images/cross.png"});
							span_tag.appendChild(cross_img);
							cross_img.addEventListener("click",function(e) {
								e.stopPropagation();
								e.preventDefault();
								var string = e.currentTarget.getAttribute("id").substring(6);
								console.log("kick: " + string);
								var json = {
									username : string,
								};
		
								wsClient.sendData("kick_your_ass", JSON.stringify(json));
							} ,false);
						}	
					}					
				
				//modify state button event
				var inner_div = document.getElementById("second_div");
				var state_button = document.getElementById("State");
				inner_div.removeChild(state_button);
				var new_state_button = document.createElement('div');
				new_state_button.setAttribute("id", "State");
				new_state_button.setAttribute("class", "State");
				new_state_button.innerHTML = "Start";
				inner_div.appendChild(new_state_button);
				if(!flag){
				change_name(data, wsClient);
				//The Map Back and Next Button
				document.getElementById("map_back").style.display= "block";
				document.getElementById("map_next").style.display = "block";
				document.getElementById("map_back").addEventListener("click", map_change, false);
				document.getElementById("map_next").addEventListener("click", map_change, false);
				}
			}
			catch(e){
					alert("H_seat_update_ACK_error: " + e);
			};
	
		}
		
		handlers["kick_ACK"] = function(data, wsClient) {
			document.location.pathname = "/Lobby.html";
		}
		
		handlers["All_ready_ACK"] = function(data, wsClient) {
		try{
			var message = JSON.parse(data);
			//console.log("All_ready: " + message);
			var state_button = document.getElementById("State");
			if(message){
				state_button.style.backgroundColor = "rgb(0,243,0)";
				state_button.addEventListener("click", function(e) {
				wsClient.sendData("GameClickStart", true);
				},false);
			}
			else{
				state_button.style.backgroundColor = "rgb(243,0,0)";
			}
			}
		catch(e){
			console.log("All_ready_ACK:" + e);
		}
		}
		
		handlers["GameClickStart_ACK"] = function(data,wsClient){
			try{
				var message = JSON.parse(data);
				if(!message){
					alert("Someone left or unknow problem");	
				}
				else{
					wsClient.sendData("room_newGame", true);
				}
			}
			catch(e){
				console.log("GameClickStart_ACK: " + e);
			}
		}
		
		handlers["rmname_update"] = function(data, wsClient) {
			try{
				var message = JSON.parse(data);
				document.getElementById("room_name").innerHTML = message;
				
			}
			catch(e){
				console.log("rename error, " + e);
			}
		}
		
		handlers["Ready_Notify"] = function(data, wsClient) {
			try{
				//to deal with player left and donesn't change back to black
				for(var i=1;i<=4;i++){
					document.getElementById("player"+i).style.border = "2px solid black";
				}
				
				var message = JSON.parse(data);
				for(var i = 0;i<message.length;i++){
					var num = message[i][1] +1;	//get the seat number
					if(message[i][2]){
						document.getElementById("player"+num).style.border = "2px solid rgb(0,243,0)";
					}
					else
						document.getElementById("player"+num).style.border = "2px solid black";
					
					
			
				}
			}
			catch(e){
				console.log("Ready_Notify error" + e);	
			}
		
		}
		
		handlers["room_newGameACK"] = function(data, wsClient){};
		handlers["room_newGame"] = function(data, wsClient){
			if(data){
				document.location.pathname = data;
			}
		};
		
		handlers["room_setMapACK"] = function(data, wsClient){};
		handlers["room_getMapACK"] = function(data, wsClient){};
		handlers["room_getMap"] = function(data, wsClient){
			if(!data) return;
			mapID = data.id
			
			var map_div = document.getElementById("map_choose");
			map_div.innerHTML = '';
			var new_img = document.createElement("img");
			setAttributes(new_img, {"id": data.id, "class": "map_img", "src": data.src});
			map_div.appendChild(new_img);
		};
		get_map();
		
		
		//create chatroom
		var div = document.getElementById('left');
        div.innerHTML = "";
        div.appendChild(chatroom.createChatroom(handlers, wsClient));
		
		
		
	

	//Listen to Server Broadcast
	//handlers["Gameroom_Updaate"] = function(data, wsClient){
	//}
	
	//The Back Button
	var button = document.getElementById("goback");
	button.addEventListener("click",function(e){
	goBack(handlers, wsClient);
	}, false);
	
	//The Logout Button
	button = document.getElementById("logout");
	button.addEventListener("click", function(e){
		logout(handlers, wsClient);
	},false);
	

	
	//The State button
	document.getElementById("State").addEventListener("click", function(e){
	e.stopPropagation();
	e.preventDefault();
	state_change(handlers, wsClient);
	}, false);

}


//update icon and player
function web_update(message, host){	
	for(var i=1;i<=4;i++){
		var player_div = document.getElementById("player" +i);
		var ping_div = document.getElementById("ping_" + i);
		player_div.innerHTML = "";
		ping_div.innerHTML = "ping: 888";
	}
	for(var i=0;i<message.length;i++){
		var playernum = message[i][1] + 1;
		var player_div = document.getElementById("player"+ playernum);
		
		var inner_img = document.createElement('img');
		inner_img.setAttribute("id", "img_" + message[i][0]);
		inner_img.setAttribute("class", "player_img");
		inner_img.setAttribute("title", message[i][0]);
		
		
		if(message[i][2]) {
			var img_path = "../icon/" + message[i][0];
		}
		else{
			var img_path = "../images/default.jpg";
		}
		
		inner_img.setAttribute("src", img_path);
		player_div.appendChild(inner_img);
		
		//modify ping
		var ping_div = document.getElementById("ping_" + playernum);
		if(message[i][4]){
			if(message[i][4] <= -1)
				ping_div.innerHTML = "ping: " + Math.floor(Math.random()*(23) + 8); 
			else
				ping_div.innerHTML = "ping: " + Math.ceil(message[i][4]);
		}
	}
	
	//set the rename
	document.getElementById("room_name").innerHTML = message[0][3];
}

function pageUnloaded()
{
	alert("you are leaving");
}
