function goBack(handlers, wsClient){
	var value = window.confirm("Are you sure to go back to Lobby?");
	var oldroom = wsClient.rm;
	if (value){
		rid = -1;	
		var json = {
				rid : rid
		};
		wsClient.sendData("joinRoom", JSON.stringify(json));
		

		handlers["joinRoomACK"] = function(data,wsClient){
		var message = JSON.parse(data);	
				if ( message.result === false){
					alert("Return Lobby Fail");
					return null;
				}
				else{
					document.location.pathname = "/Lobby.html";
				}
		}				
	}
}

function logout(handlers, wsClient){
	var value = window.confirm("Are your sure to logout?");
	
	if(value){
	
	//clear server session
		var clientSession = function (name){
							name += '=';
							var parts = document.cookie.split(/;\s*/);
							var cookieValue = null;
							for (var i = 0; i < parts.length; i++){
								var part = parts[i];
								if (part.indexOf(name) == 0){
									cookieValue =  part.substring(name.length);									
									return (cookieValue.split(/\:/))[1];
								}
							}
							return cookieValue;
						};
		var json = {
			session : clientSession('BomberManCookie')
		};
		console.log(json.session);
		wsClient.sendData("removeSession", JSON.stringify(json));
	}
	document.cookie = "BomberManCookie=logout;expires=Thu, 01 Jan 1970 00:00:01 GMT";
	document.location.href = "http://137.189.89.214:18028/index/index.php";
}

function map_change(e){
    e.stopPropagation();
    e.preventDefault();
	var action = e.currentTarget.getAttribute("id");
	
	var map_div = document.getElementById("map_choose");
	map_div.innerHTML = '';
	var new_img = document.createElement("img");
	if(action == "map_back")
	{
		//need xhr, later add		
		setAttributes(new_img, {"id": "map_img", "class": "map_img", "src": "../images/map1.jpg"});
		map_div.appendChild(new_img);
		
	}
	else if(action == "map_next")
	{
		setAttributes(new_img, {"id": "map_img", "class": "map_img", "src": "../images/map2.jpg"});
		map_div.appendChild(new_img);
	}
}

function state_change(handlers, wsClient){
	wsClient.sendData("state_change", null);
	
	handlers["state_change_ACK"] = function(data,wsClient){
		var message = JSON.parse(data);
		var state_button = document.getElementById("State");
		
		if(message){
			state_button.style.backgroundColor = "rgb(0,243,0)";
		}
		else 
			state_button.style.backgroundColor = "rgb(243,0,0)";
		
	
	}
	
}

function change_name(handlers, wsClient){
	var rmname_div = document.getElementById("room_name");
	rmname_div.addEventListener("click",function(e) {
		e.stopPropagation();
		e.preventDefault();
		var new_name = window.prompt("Please give a new name", "");
		if(new_name){
		wsClient.sendData("rename", JSON.stringify(new_name));
		}									
	} ,false);
	flag = true;
}




