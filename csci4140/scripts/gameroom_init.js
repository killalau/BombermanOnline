var wsClient = null;

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
						if(!(message[i][0] == wsClient.username)) {
							var cross_img = document.createElement('img');
							//console.log(wsClient.username);
							cross_img.setAttribute("id", "cross"+playernum);
							cross_img.setAttribute("class", "cross");
							cross_img.setAttribute("src", "../images/cross.png");
							//setAttributes(cross_img, {"id": "cross" + playernumm, "class": "cross", "src": "../images/cross.png"});
							player_div.appendChild(cross_img);
							cross_img.addEventListener("click",function(e) {
								e.stopPropagation();
								e.preventDefault();
								var string = e.currentTarget.getAttribute("id").substring(5);
								var i = string - 1;
								var k_user = message[i][0];
								var json = {
									username : k_user,
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
		
		handlers["room_newGameACK"] = function(data, wsClient){};
		handlers["room_newGame"] = function(data, wsClient){
			if(data){
				document.location.pathname = data;
			}
		};
		
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
	button.addEventListener("click",logout,false);
	
	//The Map Back and Next Button
	document.getElementById("map_back").addEventListener("click", map_change, false);
	document.getElementById("map_next").addEventListener("click", map_change, false);
	
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
		player_div.innerHTML = "";
	}
	for(var i=0;i<message.length;i++){
		var playernum = message[i][1] + 1;
		var player_div = document.getElementById("player"+ playernum);
		
		var inner_img = document.createElement('img');
		inner_img.setAttribute("id", "p1_img");
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
	}
}

