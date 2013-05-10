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
			//console.log(message[0][0]);
			console.log(message.length);

			//create chatroom
			var div = document.getElementById('left');
                div.innerHTML = "";
                div.appendChild(chatroom.createChatroom(handlers, wsClient));
		}
		
		
		
		
		
	

	//Listen to Server Broadcast
	//handlers["Gameroom_Updaate"] = function(data, wsClient){
	//}
	
	//The Back Button
	var button = document.getElementById("goback");
	button.addEventListener("click",function(e){
	goBack(handlers, wsClient);
	}	,false);
	
	//The Logout Button
	button = document.getElementById("logout");
	button.addEventListener("click",logout,false);
	
	//The Map Back and Next Button
	document.getElementById("map_back").addEventListener("click", map_change, false);
	document.getElementById("map_next").addEventListener("click", map_change, false);

}

